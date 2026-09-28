# Data Layer — Types, Interfaces, Prisma Implementations & Multi-tenancy

## Table of contents

1. [Domain folder structure](#1-domain-folder-structure)
2. [Types file (`*.types.ts`)](#2-types-file-typests)
3. [Repository interface & DI symbol (`*.repository.ts`)](#3-repository-interface--di-symbol-repositoryts)
4. [Prisma implementation (`prisma-*.repository.ts`)](#4-prisma-implementation-prisma-repositoryts)
5. [Data module (`*-data.module.ts`)](#5-data-module--data-modulets)
6. [Barrel export (`index.ts`)](#6-barrel-export-indexts)
7. [Multi-tenancy rules](#7-multi-tenancy-rules)
8. [TimescaleDB / hypertable caveats](#8-timescaledb--hypertable-caveats)

---

## 1. Domain folder structure

Every domain in `@app/layer-data` gets its own folder with exactly **4 files + 1 index**:

```
libs/layer-data/src/<domain>/
├── <domain>.types.ts           # Row/Input/Filter/Result types — no NestJS imports
├── <domain>.repository.ts      # DI Symbol + IXxxRepository interface
├── prisma-<domain>.repository.ts  # Prisma implementation, extends BaseRepository
├── <domain>-data.module.ts     # NestJS module — exports DI token only
└── index.ts                    # Re-exports everything; consumers import only from here
```

After creating the folder, add a barrel export in `libs/layer-data/src/index.ts`:

```typescript
export * from './<domain>';
```

---

## 2. Types file (`*.types.ts`)

Contains pure TypeScript types. **No NestJS, no Prisma client imports, no decorators.**

```typescript
// libs/layer-data/src/devices/devices.types.ts

// Row type — shape of a row as returned from the DB
export type DeviceRow = {
  id: string;
  tenantId: string;
  imei: string;
  name: string;
  protocol: string;           // DeviceProtocol enum value
  registrationStatus: string; // DeviceRegistrationStatus enum value
  simCardNumber: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Input types — what callers pass in
export type CreateDeviceInput = {
  tenantId: string;
  imei: string;
  name: string;
  protocol: string;
  simCardNumber?: string | null;
  notes?: string | null;
};

export type UpdateDeviceInput = {
  name?: string;
  simCardNumber?: string | null;
  notes?: string | null;
  registrationStatus?: string;
};

// Filter for list queries — always includes tenantId for tenant-scoped reads
export type DevicesListFilter = {
  tenantId: string;
  keyword?: string;
  page: number;
  pageSize: number;
};

// Result type for paginated list
export type DevicesListResult = import('@app/core').PaginatedResult<DeviceRow>;
```

---

## 3. Repository interface & DI symbol (`*.repository.ts`)

Defines the **contract** that services depend on, and the **DI Symbol** used for injection.

```typescript
// libs/layer-data/src/devices/devices.repository.ts
import type { DeviceRow, CreateDeviceInput, UpdateDeviceInput, DevicesListFilter, DevicesListResult } from './devices.types';

/** DI injection token for the devices repository. */
export const DEVICES_REPOSITORY = Symbol('DEVICES_REPOSITORY');

/**
 * Repository contract for the Device domain.
 * All implementations must enforce tenantId at the query level.
 */
export interface IDevicesRepository {
  /** Returns paginated device list scoped to tenantId. */
  findMany(filter: DevicesListFilter): Promise<DevicesListResult>;

  /** Returns a single device by id, scoped to tenantId. Returns null if not found or wrong tenant. */
  findById(id: string, tenantId: string): Promise<DeviceRow | null>;

  /** Returns a device by IMEI (cross-tenant — used by TCP server for protocol matching). */
  findByImei(imei: string): Promise<DeviceRow | null>;

  /** Creates a new device record. */
  create(input: CreateDeviceInput): Promise<DeviceRow>;

  /** Updates a device. Returns null if not found or wrong tenant. */
  update(id: string, tenantId: string, input: UpdateDeviceInput): Promise<DeviceRow | null>;

  /** Hard-deletes a device. Throws NotFoundException if not found or wrong tenant. */
  delete(id: string, tenantId: string): Promise<void>;

  /** Returns true if an IMEI already exists (any tenant). */
  existsByImei(imei: string): Promise<boolean>;
}
```

**Rules:**
- Every method that touches tenant data MUST have `tenantId` as a parameter (either directly
  or within a filter/input object).
- Cross-tenant methods (e.g. `findByImei` used by TCP server) must be documented as such.
- Do NOT add business logic to the interface — method signatures only.

---

## 4. Prisma implementation (`prisma-*.repository.ts`)

Extends `BaseRepository<TDelegate>` from `@app/third-party`. The constructor injects
`PrismaService` and passes the delegate to `super()`.

```typescript
// libs/layer-data/src/devices/prisma-devices.repository.ts
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@app/third-party';
import { PrismaService } from '@app/third-party';
import type { Prisma } from '@prisma/client';

import type {
  DeviceRow,
  CreateDeviceInput,
  UpdateDeviceInput,
  DevicesListFilter,
  DevicesListResult,
} from './devices.types';
import type { IDevicesRepository } from './devices.repository';

@Injectable()
export class PrismaDevicesRepository
  extends BaseRepository<Prisma.DeviceDelegate>
  implements IDevicesRepository
{
  constructor(prisma: PrismaService) {
    super(prisma.device);
  }

  // Non-async: body is a single return — no await inside
  findById(id: string, tenantId: string) {
    return this.findUnique({ where: { id, tenantId } });
  }

  findByImei(imei: string) {
    return this.findFirst({ where: { imei } });
  }

  existsByImei(imei: string) {
    return this.exists({ imei });
  }

  create(input: CreateDeviceInput) {
    return this.create({ data: input });
  }

  // Async: contains logic before the DB call
  async update(
    id: string,
    tenantId: string,
    input: UpdateDeviceInput,
  ): Promise<DeviceRow | null> {
    const exists = await this.exists({ id, tenantId });
    if (!exists) return null;
    return this.update({ where: { id, tenantId }, data: input });
  }

  async delete(id: string, tenantId: string): Promise<void> {
    // enforce both id AND tenantId — atomic tenant isolation
    await this.delete({ where: { id, tenantId } });
  }

  findMany(filter: DevicesListFilter): Promise<DevicesListResult> {
    const { tenantId, keyword, page, pageSize } = filter;
    const where: Prisma.DeviceWhereInput = {
      tenantId,
      ...(keyword
        ? { OR: [{ name: { contains: keyword, mode: 'insensitive' } }, { imei: { contains: keyword } }] }
        : {}),
    };
    return this.findPagination(
      { where, orderBy: { createdAt: 'desc' } },
      { page, pageSize },
    );
  }
}
```

**Rules:**
- `delete` / `update` / `updateMany` / `deleteMany` write operations MUST include both
  `id` AND `tenantId` in the `where` clause — never update by `id` alone.
- Only `return` a Promise directly (no `async`) when the method body has no `await`.
- Import types from `@prisma/client` (e.g. `Prisma.DeviceWhereInput`), not from app modules.

---

## 5. Data module (`*-data.module.ts`)

The NestJS module that wires the Symbol token to the Prisma implementation.

```typescript
// libs/layer-data/src/devices/devices-data.module.ts
import { Module } from '@nestjs/common';
import { PrismaDevicesRepository } from './prisma-devices.repository';
import { DEVICES_REPOSITORY } from './devices.repository';

@Module({
  providers: [
    PrismaDevicesRepository,
    { provide: DEVICES_REPOSITORY, useExisting: PrismaDevicesRepository },
  ],
  exports: [DEVICES_REPOSITORY],  // ONLY export the token — never the implementation class
})
export class DevicesDataModule {}
```

**Why `useExisting` and not `useClass`?**
`useExisting` avoids creating two separate instances when the implementation class is also
registered as a provider. Both the class provider and the token provider share the same singleton.

---

## 6. Barrel export (`index.ts`)

```typescript
// libs/layer-data/src/devices/index.ts
export * from './devices.types';
export * from './devices.repository';
export * from './prisma-devices.repository';
export * from './devices-data.module';
```

Consumer feature modules import everything from the barrel:

```typescript
import { DEVICES_REPOSITORY, IDevicesRepository, DevicesDataModule } from '@app/layer-data';
```

---

## 7. Multi-tenancy rules

These rules are **absolute** and apply to every repository method touching tenant-scoped data:

### Rule 1 — tenantId in every query

Every `findMany`, `findFirst`, `findUnique`, `count`, `update`, `delete` on a tenant-owned
table MUST include `tenantId` in the `where` clause:

```typescript
// ✅ Correct
findMany(filter: DevicesListFilter) {
  return this.findPagination(
    { where: { tenantId: filter.tenantId, ...otherFilters } },
    { page: filter.page, pageSize: filter.pageSize },
  );
}

// ❌ Wrong — missing tenantId; any tenant can read any device
findMany(filter: { page: number; pageSize: number }) {
  return this.findPagination({ where: {} }, { page: filter.page, pageSize: filter.pageSize });
}
```

### Rule 2 — SUPER_ADMIN cross-tenant queries

When a repository method needs to support SUPER_ADMIN fetching all-tenant data, use an
**optional tenantId** in the filter and document this explicitly:

```typescript
// analytics.types.ts
export type IngestionMetricsFilter = {
  tenantId?: string;  // undefined = all tenants (SUPER_ADMIN only)
  from: Date;
  to: Date;
};
```

The **service** (not the repository) is responsible for deciding whether to pass `tenantId`:

```typescript
// analytics.service.ts
async getIngestionMetrics(user: AuthUser, query: IngestionQueryDto) {
  const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;
  return this.analyticsRepo.findMetrics({
    tenantId: isSuperAdmin ? query.tenantId : user.tenantId,
    from: query.from,
    to: query.to,
  });
}
```

### Rule 3 — not-found = treat as forbidden

When a read/update/delete returns null because `tenantId` doesn't match, the service MUST
treat it as NotFoundException — never expose cross-tenant existence via error messages:

```typescript
// devices.service.ts
async getDevice(id: string, tenantId: string): Promise<DeviceRow> {
  const device = await this.devicesRepo.findById(id, tenantId);
  if (!device) throw new Api404HttpError(DEVICE_ERROR_CODES.NOT_FOUND);
  return device;
}
```

---

## 8. TimescaleDB / hypertable caveats

For hypertable models (`pt_positions`, `pt_events`, `pt_device_command_logs`):

- **Composite primary key**: `(id, partition_col)` — required by TimescaleDB. Prisma uses
  `@@id([id, deviceTime])`.
- **No FK enforcement at DB level**: `pt_events.position_id` and
  `pt_geofence_states.last_position_id` have no FK constraint. Application layer must
  maintain integrity.
- **`geom` column**: auto-populated by trigger `trg_pt_positions_geom` on INSERT/UPDATE.
  Never compute `geom` manually — just pass `latitude` and `longitude`.
- **Migrations**: never use `prisma migrate dev`. Use `pnpm prisma:migrate:new` (generates SQL
  only) then `pnpm prisma:migrate:deploy`. See [CONVENTIONS.md](./CONVENTIONS.md) for naming.
- **`create_hypertable()`**: must be added manually at the bottom of the migration SQL file
  after the `CREATE TABLE` statement. Not generated by Prisma.

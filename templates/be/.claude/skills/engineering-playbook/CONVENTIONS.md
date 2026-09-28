# Conventions — Naming, File Structure, Biome & Migrations

## Table of contents

1. [Monorepo directory layout](#1-monorepo-directory-layout)
2. [File naming](#2-file-naming)
3. [Class & symbol naming](#3-class--symbol-naming)
4. [Variable and property naming](#4-variable-and-property-naming)
5. [Barrel exports (`index.ts`)](#5-barrel-exports-indexts)
6. [Import order](#6-import-order)
7. [Biome rules & async convention](#7-biome-rules--async-convention)
8. [Database migration naming](#8-database-migration-naming)
9. [Git & commit conventions](#9-git--commit-conventions)

---

## 1. Monorepo directory layout

### `@app/layer-data` domain (one folder per domain)

```
libs/layer-data/src/<domain>/
├── <domain>.types.ts              # pure TS types — no NestJS/Prisma
├── <domain>.repository.ts         # DI Symbol + IXxxRepository interface
├── prisma-<domain>.repository.ts  # Prisma implementation, extends BaseRepository
├── <domain>-data.module.ts        # NestJS module; exports DI token only
└── index.ts                       # re-exports all 4 files above
```

### App feature module (one folder per domain)

```
apps/{{sanitizedProjectName}}/src/modules/<feature>/
├── <feature>.module.ts            # imports XxxDataModule
├── <feature>.controller.ts        # controller — zero business logic
├── <feature>.service.ts           # service — business logic + repo calls
├── constants/
│   └── <feature>.error-codes.ts  # error code constants (DOMAIN_SNAKE_CASE)
├── dto/
│   ├── create-<feature>.dto.ts
│   ├── update-<feature>.dto.ts
│   ├── list-<feature>.dto.ts
│   └── index.ts
└── responses/
    ├── <feature>.response.ts      # single-item response DTO
    ├── <feature>-list.response.ts # paginated response DTO
    └── index.ts
```

### Prisma schema

```
prisma/
├── schema.prisma        # imports only — no model definitions here
├── models/
│   └── <domain>.prisma  # one file per domain
└── migrations/
    └── <timestamp>_<description>/
        └── migration.sql
```

---

## 2. File naming

All file names use **kebab-case**.

### `@app/layer-data`

| File                              | Contains                                         |
| --------------------------------- | ------------------------------------------------ |
| `<domain>.types.ts`               | Row / Input / Filter / Result types              |
| `<domain>.repository.ts`          | `XXX_REPOSITORY` Symbol + `IXxxRepository` interface |
| `prisma-<domain>.repository.ts`   | `PrismaXxxRepository` class (extends BaseRepository) |
| `<domain>-data.module.ts`         | `XxxDataModule` NestJS module                    |

### App feature module

| File                                  | Contains                                              |
| ------------------------------------- | ----------------------------------------------------- |
| `<feature>.module.ts`                 | `XxxModule` NestJS module                             |
| `<feature>.controller.ts`             | `XxxController` REST controller                       |
| `<feature>.service.ts`                | `XxxService` business logic                           |
| `constants/<feature>.error-codes.ts`  | `XXX_ERROR_CODES` error code constants                |
| `dto/create-<feature>.dto.ts`         | `CreateXxxDto` input DTO                              |
| `dto/update-<feature>.dto.ts`         | `UpdateXxxDto` input DTO                              |
| `dto/list-<feature>.dto.ts`           | `ListXxxDto` extends `PagingDto`                      |
| `responses/<feature>.response.ts`     | `XxxResponse` serialization DTO                       |
| `responses/<feature>-list.response.ts`| `XxxListResponse` extends `PaginationResponse(XxxResponse)` |

---

## 3. Class & symbol naming

All class names use **PascalCase**. All DI symbols use **SCREAMING_SNAKE_CASE**.

| Construct                    | Pattern                        | Example                         |
| ---------------------------- | ------------------------------ | ------------------------------- |
| DI Symbol                    | `XXX_REPOSITORY`               | `DEVICES_REPOSITORY`            |
| Error code object            | `XXX_ERROR_CODES`              | `DEVICE_ERROR_CODES`            |
| Error code value             | `DOMAIN_SNAKE_CASE`            | `'DEVICE_NOT_FOUND'`            |
| Shared guard error codes     | `COMMON_ERROR_CODES`           | `COMMON_ERROR_CODES.FORBIDDEN`  |
| Repository interface         | `IXxxRepository`               | `IDevicesRepository`            |
| Prisma implementation        | `PrismaXxxRepository`          | `PrismaDevicesRepository`       |
| Data module                  | `XxxDataModule`                | `DevicesDataModule`             |
| Feature module               | `XxxModule`                    | `DevicesModule`                 |
| Controller                   | `XxxController`                | `DevicesController`             |
| Service                      | `XxxService`                   | `DevicesService`                |
| Create input DTO             | `CreateXxxDto`                 | `CreateDeviceDto`               |
| Update input DTO             | `UpdateXxxDto`                 | `UpdateDeviceDto`               |
| List input DTO               | `ListXxxDto`                   | `ListDevicesDto`                |
| Single item response         | `XxxResponse`                  | `DeviceResponse`                |
| Paginated list response      | `XxxListResponse`              | `DeviceListResponse`            |
| Row type                     | `XxxRow`                       | `DeviceRow`                     |
| Create input type            | `CreateXxxInput`               | `CreateDeviceInput`             |
| Update input type            | `UpdateXxxInput`               | `UpdateDeviceInput`             |
| List filter type             | `XxxListFilter`                | `DevicesListFilter`             |
| List result type             | `XxxListResult`                | `DevicesListResult`             |

---

## 4. Variable and property naming

- **Variables and parameters**: `camelCase`
- **DI Symbol constants**: `SCREAMING_SNAKE_CASE`
- **Enum members**: `SCREAMING_SNAKE_CASE`
- **Private class properties**: `camelCase` with descriptive suffix:

```typescript
// Repository injection
private readonly devicesRepo: IDevicesRepository   // Repo suffix
private readonly cacheService: CacheService        // Service suffix
private readonly jwtService: JwtService

// Config injection
private readonly appConfig: ReturnType<typeof appConfiguration>
```

---

## 5. Barrel exports (`index.ts`)

Every directory with module files MUST have an `index.ts` re-exporting everything consumers need.

```typescript
// libs/layer-data/src/devices/index.ts
export * from './devices.types';
export * from './devices.repository';
export * from './prisma-devices.repository';
export * from './devices-data.module';
```

```typescript
// libs/layer-data/src/index.ts
export * from './devices';
export * from './positions';
export * from './events';
// one line per domain
```

```typescript
// apps/.../modules/devices/dto/index.ts
export * from './create-device.dto';
export * from './update-device.dto';
export * from './list-devices.dto';
```

```typescript
// apps/.../modules/index.ts  (feature module barrel)
export * from './auth/auth.module';
export * from './devices/devices.module';
export * from './positions/positions.module';
// one line per feature module
```

---

## 6. Import order

Biome enforces a specific import order. All package imports (`@app/*`, `@nestjs/*`,
third-party) are sorted **alphabetically together** with no blank line between them.
A single blank line separates package imports from relative imports (`../`, `./`).

```typescript
// ✅ Correct Biome order
import { randomUUID } from 'node:crypto';

import { Api401HttpError, appConfiguration } from '@app/core';
import { USERS_REPOSITORY } from '@app/layer-data';
import { CacheService } from '@app/third-party';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AUTH_ERROR_CODES } from './constants/auth.error-codes';
import { LoginDto } from './dto';
```

Groups (separated by blank lines):
1. Node built-ins (`node:crypto`, `node:path`)
2. All package imports — `@app/*`, `@nestjs/*`, third-party — sorted alphabetically, **no blank lines between them**
3. Relative imports (`../`, `./`)

---

## 7. Biome rules & async convention

Run `pnpm check` before every commit (the pre-commit hook does this automatically for staged files).

### Key Biome settings (from `biome.json`)

| Rule                          | Setting | Notes                                                     |
| ----------------------------- | ------- | --------------------------------------------------------- |
| `noExplicitAny`               | off     | NestJS patterns require `any` in places                   |
| `noEmptyBlockStatements`      | off     | NestJS lifecycle methods often have empty bodies           |
| `noCommonJs`                  | off     | Project uses CommonJS module format                        |
| `unsafeParameterDecoratorsEnabled` | true | Required for `@Body()`, `@Param()`, `@Inject()` etc.  |
| `noUnusedImports`             | error + auto-fix | Imports must be used                             |
| `noUnusedVariables`           | warn    | Prefix with `_` to suppress (e.g. `_unused`)             |

### `async` / non-async convention (Biome `useAwait`)

```typescript
// ✅ Non-async — body is a single return, no await inside
findById(id: string, tenantId: string) {
  return this.findUnique({ where: { id, tenantId } });
}

// ✅ Async — body contains await
async update(id: string, tenantId: string, input: UpdateDeviceInput): Promise<DeviceRow | null> {
  const exists = await this.exists({ id, tenantId });
  if (!exists) return null;
  return this.update({ where: { id, tenantId }, data: input });
}

// ❌ Wrong — async with no await inside body (Biome error)
async findById(id: string, tenantId: string): Promise<DeviceRow | null> {
  return this.findUnique({ where: { id, tenantId } });
}
```

---

## 8. Database migration naming

Convention: `YYYYMMDDHHMMSS_<snake_case_description>`

### Workflow (never use `prisma migrate dev`)

```bash
# 1. Edit prisma/models/*.prisma
# 2. Generate migration SQL (no apply)
pnpm prisma:migrate:new

# 3. Edit the generated migration.sql if needed:
#    - create_hypertable for new hypertable
#    - GiST index for PostGIS geometry
#    - Partial unique index (Prisma cannot generate)
#    - Trigger for geom auto-populate

# 4. Apply
pnpm prisma:migrate:deploy

# 5. Regenerate Prisma client
pnpm prisma:generate
```

### Common manual SQL additions

```sql
-- Hypertable (time-series table)
SELECT create_hypertable('pt_events', 'device_time', chunk_time_interval => INTERVAL '7 days');

-- GiST spatial index
CREATE INDEX "idx_pt_geofences_geom" ON "pt_geofences" USING GIST ("geom");

-- Partial unique index (settings pattern)
CREATE UNIQUE INDEX "uq_pt_settings_global_key"
  ON "pt_settings"("key")
  WHERE "tenant_id" IS NULL;

CREATE UNIQUE INDEX "uq_pt_settings_tenant_key"
  ON "pt_settings"("tenant_id", "key")
  WHERE "tenant_id" IS NOT NULL;
```

---

## 9. Git & commit conventions

### Conventional Commits format

```
<type>(<scope>): <subject>

feat(devices): add bulk import endpoint
fix(auth): handle token rotation race condition
chore(db): add geofences migration
refactor(layer-data): extract base filter builder
```

Types: `feat` | `fix` | `chore` | `docs` | `refactor` | `test` | `perf` | `ci` | `revert`

Scopes match module names: `auth`, `devices`, `positions`, `events`, `geofences`,
`analytics`, `tenants`, `settings`, `tcp-server`, `layer-data`, `db`.

### Husky hooks

| Hook         | Command                            | Effect                                        |
| ------------ | ---------------------------------- | --------------------------------------------- |
| `pre-commit` | `biome check --staged --write`     | Auto-fix lint + format on staged files        |
| `commit-msg` | `commitlint`                       | Enforce conventional commit format            |

If a pre-commit hook fails: fix the issue, re-stage, then commit again.
**Never use `--no-verify`** unless explicitly instructed.

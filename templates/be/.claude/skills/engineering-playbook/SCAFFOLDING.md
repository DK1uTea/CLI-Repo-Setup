# Scaffolding a New Domain + Feature Module

Step-by-step checklist for creating a new domain end-to-end.
Follow the steps in order. Each step references the relevant playbook file for details.

## Table of contents

1. [Before you start](#1-before-you-start)
2. [Step 1 — Create the domain in `@app/layer-data`](#step-1--create-the-domain-in-applayer-data)
3. [Step 2 — Write the Prisma schema model](#step-2--write-the-prisma-schema-model)
4. [Step 3 — Generate and apply the migration](#step-3--generate-and-apply-the-migration)
5. [Step 4 — Create the feature module in `apps/`](#step-4--create-the-feature-module-in-apps)
6. [Step 5 — Register the module in AppModule](#step-5--register-the-module-in-appmodule)
7. [Step 6 — Final checklist](#step-6--final-checklist)

---

## 1. Before you start

- Read [ARCHITECTURE.md](./ARCHITECTURE.md), [DATA-LAYER.md](./DATA-LAYER.md), and
  [API-DESIGN.md](./API-DESIGN.md) first.
- Decide the domain name (e.g. `geofences`).
- List every endpoint the feature needs and map each to a service method.
- Identify which queries are tenant-scoped and which are cross-tenant (SUPER_ADMIN).
- Check whether you need a hypertable (time-series) — if so, read
  [DATA-LAYER.md §8](./DATA-LAYER.md#8-timescaledb--hypertable-caveats).
- Identify the reference domain to mirror (usually `devices`).

---

## Step 1 — Create the domain in `@app/layer-data`

Create the folder:

```
libs/layer-data/src/<domain>/
├── <domain>.types.ts
├── <domain>.repository.ts
├── prisma-<domain>.repository.ts
├── <domain>-data.module.ts
└── index.ts
```

### 1a. `<domain>.types.ts`

Define `XxxRow`, `CreateXxxInput`, `UpdateXxxInput`, `XxxListFilter`, `XxxListResult`.
No NestJS or Prisma client imports — pure TypeScript types only.

See [DATA-LAYER.md §2](./DATA-LAYER.md#2-types-file-typests) for the full pattern.

### 1b. `<domain>.repository.ts`

```typescript
export const XXX_REPOSITORY = Symbol('XXX_REPOSITORY');

export interface IXxxRepository {
  findMany(filter: XxxListFilter): Promise<XxxListResult>;
  findById(id: string, tenantId: string): Promise<XxxRow | null>;
  create(input: CreateXxxInput): Promise<XxxRow>;
  update(id: string, tenantId: string, input: UpdateXxxInput): Promise<XxxRow | null>;
  delete(id: string, tenantId: string): Promise<void>;
}
```

Every method with tenant-owned data MUST have `tenantId` in its signature.

See [DATA-LAYER.md §3](./DATA-LAYER.md#3-repository-interface--di-symbol-repositoryts).

### 1c. `prisma-<domain>.repository.ts`

```typescript
@Injectable()
export class PrismaXxxRepository
  extends BaseRepository<Prisma.XxxDelegate>
  implements IXxxRepository
{
  constructor(prisma: PrismaService) {
    super(prisma.xxx);
  }
  // implement all interface methods
}
```

- Non-async if body is a single `return` with no `await`.
- Write operations (`update`, `delete`) MUST include both `id` AND `tenantId` in `where`.

See [DATA-LAYER.md §4](./DATA-LAYER.md#4-prisma-implementation-prisma-repositoryts).

### 1d. `<domain>-data.module.ts`

```typescript
@Module({
  providers: [
    PrismaXxxRepository,
    { provide: XXX_REPOSITORY, useExisting: PrismaXxxRepository },
  ],
  exports: [XXX_REPOSITORY],
})
export class XxxDataModule {}
```

### 1e. `index.ts`

```typescript
export * from './<domain>.types';
export * from './<domain>.repository';
export * from './prisma-<domain>.repository';
export * from './<domain>-data.module';
```

### 1f. Add to `libs/layer-data/src/index.ts`

```typescript
export * from './<domain>';
```

---

## Step 2 — Write the Prisma schema model

Create or edit the Prisma model file in `prisma/models/<domain>.prisma`.

```prisma
// prisma/models/geofence.prisma
model Geofence {
  id         String   @id @default(cuid())
  tenantId   String
  name       String
  type       String   // GeofenceType enum value
  radius     Float?
  geom       Unsupported("geography(Geometry,4326)")?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  tenant     Tenant   @relation(fields: [tenantId], references: [id])

  @@map("pt_geofences")
}
```

Notes:
- PostGIS columns use `Unsupported("geography(...)")` — never a native Prisma type.
- Hypertable models use composite `@@id([id, partitionCol])`.
- Run `pnpm prisma:generate` after editing the schema to regenerate the client.

---

## Step 3 — Generate and apply the migration

> **Never use `prisma migrate dev`** — not compatible with TimescaleDB.

```bash
# 1. Generate the SQL only (no apply)
pnpm prisma:migrate:new

# 2. Inspect the generated SQL in prisma/migrations/<timestamp>_<name>/migration.sql
#    Add manual steps if needed:
#    - create_hypertable(...) for time-series tables
#    - GiST index for PostGIS geometry columns
#    - partial unique indexes (Prisma cannot generate these)
#    - triggers if needed

# 3. Apply
pnpm prisma:migrate:deploy
```

Migration naming convention: `YYYYMMDDHHMMSS_<snake_case_description>`

Example custom additions for a hypertable:
```sql
-- After CREATE TABLE pt_positions ...
SELECT create_hypertable('pt_positions', 'device_time', chunk_time_interval => INTERVAL '7 days');

-- GiST index for PostGIS
CREATE INDEX "idx_pt_positions_geom" ON "pt_positions" USING GIST ("geom");

-- Partial unique index (Prisma cannot generate)
CREATE UNIQUE INDEX "uq_pt_settings_global_key" ON "pt_settings"("key") WHERE "tenant_id" IS NULL;
```

---

## Step 4 — Create the feature module in `apps/`

Create the folder:

```
apps/protrack-backend-api/src/modules/<feature>/
├── <feature>.module.ts
├── <feature>.controller.ts
├── <feature>.service.ts
├── constants/
│   └── <feature>.error-codes.ts   # error code constants for this domain
├── dto/
│   ├── create-<feature>.dto.ts
│   ├── update-<feature>.dto.ts
│   ├── list-<feature>.dto.ts
│   └── index.ts
└── responses/
    ├── <feature>.response.ts
    ├── <feature>-list.response.ts
    └── index.ts
```

### 4a. `<feature>.module.ts`

```typescript
import { XxxDataModule } from '@app/layer-data';
import { Module } from '@nestjs/common';

import { XxxController } from './<feature>.controller';
import { XxxService } from './<feature>.service';

@Module({
  imports: [XxxDataModule],
  controllers: [XxxController],
  providers: [XxxService],
})
export class XxxModule {}
```

### 4b. `constants/<feature>.error-codes.ts`

Define all error codes for this domain **before** writing the service.
Error code strings follow `DOMAIN_SNAKE_CASE_DESCRIPTION` in SCREAMING_SNAKE_CASE.

```typescript
// modules/xxx/constants/xxx.error-codes.ts
export const XXX_ERROR_CODES = {
  NOT_FOUND: 'XXX_NOT_FOUND',
  ALREADY_EXISTS: 'XXX_ALREADY_EXISTS',
  // add domain-specific codes here
} as const;
```

See [API-DESIGN.md §8](./API-DESIGN.md#8-error-handling) for the full error codes pattern.

### 4c. `<feature>.service.ts`

```typescript
import { Api404HttpError } from '@app/core';
import { XXX_REPOSITORY, IXxxRepository } from '@app/layer-data';
import { Inject, Injectable } from '@nestjs/common';

import { XXX_ERROR_CODES } from './constants/xxx.error-codes';

@Injectable()
export class XxxService {
  constructor(
    @Inject(XXX_REPOSITORY)
    private readonly xxxRepo: IXxxRepository,
  ) {}

  async list(tenantId: string, query: ListXxxDto) {
    return this.xxxRepo.findMany({ tenantId, ...query });
  }

  async findOne(id: string, tenantId: string) {
    const item = await this.xxxRepo.findById(id, tenantId);
    if (!item) throw new Api404HttpError(XXX_ERROR_CODES.NOT_FOUND);
    return item;
  }

  create(tenantId: string, dto: CreateXxxDto) {
    return this.xxxRepo.create({ tenantId, ...dto });
  }

  async update(id: string, tenantId: string, dto: UpdateXxxDto) {
    const updated = await this.xxxRepo.update(id, tenantId, dto);
    if (!updated) throw new Api404HttpError(XXX_ERROR_CODES.NOT_FOUND);
    return updated;
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId); // verify existence + ownership
    return this.xxxRepo.delete(id, tenantId);
  }
}
```

### 4d. `<feature>.controller.ts`

Follow the pattern in [API-DESIGN.md §1](./API-DESIGN.md#1-controller-structure).

- `@Serialize(XxxResponse)` on every method.
- `@ApiSuccessResponse(XxxResponse, 'message')` on every method.
- `@User('tenantId') tenantId: string` to extract tenant from JWT.
- `@RequireRoles(...)` where access should be restricted.
- `@Public()` for public endpoints (rare).

### 4e. DTOs

Input DTOs use `class-validator`. List DTOs extend `PagingDto` from `@app/core`.
Response DTOs use `@Expose()` / `@Exclude()`.

See [API-DESIGN.md §6](./API-DESIGN.md#6-input-dtos) and
[API-DESIGN.md §7](./API-DESIGN.md#7-response-dtos-serialization).

---

## Step 5 — Register the module in AppModule

Add the new module to:

1. `apps/protrack-backend-api/src/modules/index.ts` (barrel export):
   ```typescript
   export * from './<feature>/<feature>.module';
   ```

2. `apps/protrack-backend-api/src/app.module.ts` (imports array):
   ```typescript
   import { XxxModule } from './modules';

   @Module({
     imports: [
       // ... existing modules
       XxxModule,
     ],
   })
   export class AppModule {}
   ```

---

## Step 6 — Final checklist

Before committing:

- [ ] `<domain>.types.ts` — pure TS types, no NestJS or Prisma client imports.
- [ ] `<domain>.repository.ts` — DI Symbol exported, every tenant-scoped method has `tenantId` in signature.
- [ ] `prisma-<domain>.repository.ts` — write operations enforce both `id` AND `tenantId` in `where`; non-async methods have no `async` keyword.
- [ ] `<domain>-data.module.ts` — only `XXX_REPOSITORY` token is exported, not the implementation class.
- [ ] `libs/layer-data/src/index.ts` — new barrel export added.
- [ ] Prisma schema model created/updated; `pnpm prisma:generate` run.
- [ ] Migration SQL reviewed — manual `create_hypertable`, GiST index, partial unique indexes added where needed.
- [ ] `constants/<feature>.error-codes.ts` — all error codes defined as `DOMAIN_SNAKE_CASE` constants; no raw strings in `throw` statements.
- [ ] `<feature>.service.ts` — all reads/writes pass `tenantId` from JWT to repository; all `throw new Api*HttpError(...)` use error code constants.
- [ ] `<feature>.controller.ts` — zero business logic; every method has `@Serialize()` and `@ApiSuccessResponse()`.
- [ ] Response DTOs use `@Exclude()` on class + `@Expose()` on each field.
- [ ] `XxxModule` imports `XxxDataModule`; registered in `AppModule`.
- [ ] `pnpm check` passes (Biome lint + format).

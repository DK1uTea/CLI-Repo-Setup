# Architecture — Layers, DI, BaseRepository & Config

## Table of contents

1. [Three-layer flow](#1-three-layer-flow)
2. [Monorepo lib roles](#2-monorepo-lib-roles)
3. [Dependency injection wiring](#3-dependency-injection-wiring)
4. [BaseRepository — available methods](#4-baserepository--available-methods)
5. [Config injection](#5-config-injection)
6. [Global providers](#6-global-providers)

---

## 1. Three-layer flow

```
Controller  →  Service  →  IRepository  →  PrismaXxxRepository  →  PrismaService
   ↑               ↑              ↑                  ↑
@app/core     app module     @app/layer-data    @app/layer-data      @app/third-party
(decorators)  (feature)      (interface+Symbol) (Prisma impl)         (global DB conn)
```

- **Controller**: receives HTTP request, extracts validated input + `tenantId` from JWT,
  calls service, returns serialized response via `@Serialize()`.
- **Service**: holds all business logic — reads/writes via repository interface, throws
  `Api*HttpError` subtypes with error code constants on errors, orchestrates multiple repo
  calls when needed.
- **Repository interface** (`IXxxRepository`): the contract. Defined in `@app/layer-data`.
  Contains only the method signatures, no implementation detail.
- **Prisma implementation** (`PrismaXxxRepository`): extends `BaseRepository<TDelegate>`,
  injects `PrismaService`, implements `IXxxRepository`. Lives in `@app/layer-data`.
- **PrismaService**: global singleton in `@app/third-party`. Never inject it in `app/` modules.

---

## 2. Monorepo lib roles

### `@app/core` — shared NestJS building blocks

| Sub-path              | Exports                                                              |
| --------------------- | -------------------------------------------------------------------- |
| `configs/`            | `appConfiguration`, `redisConfiguration` (Joi-validated)            |
| `constants/`          | HTTP status codes, Swagger tags, app-level constants, `COMMON_ERROR_CODES` |
| `decorators/`         | `@Public`, `@User`, `@RequireRoles`, `@Serialize`, `@ApiSuccessResponse`, `@IsAdmin` |
| `dtos/`               | `PagingDto`                                                          |
| `enums/`              | `EnvironmentEnum`                                                    |
| `filters/`            | `HttpExceptionFilter`                                                |
| `guards/`             | `RolesGuard`                                                         |
| `interceptors/`       | `ResponseInterceptor`, `SerializerInterceptor`                       |
| `responses/`          | `ErrorResponse`, `PaginationResponse`, `Api*HttpError` classes       |
| `types/`              | `AuthUser`, `PagingQuery`, `KeywordPagingQuery`, `PaginationMeta`, `PaginatedResult<T>` |
| `utils/`              | `swagger.util`, `tenant-scope.util`, `time.util`                     |

### `@app/layer-data` — data access layer

Every domain has its own folder. The folder exports:
- Row/Input/Filter/Result types (`*.types.ts`)
- DI Symbol + `IXxxRepository` interface (`*.repository.ts`)
- Prisma implementation (`prisma-*.repository.ts`)
- NestJS data module (`*-data.module.ts`)
- Barrel `index.ts`

### `@app/third-party` — third-party wrappers

| Module        | Provides                                     |
| ------------- | -------------------------------------------- |
| `PrismaModule`| `PrismaService` (global, registered once)    |
| `CacheModule` | `CacheService` (Redis via ioredis, global)   |

---

## 3. Dependency injection wiring

### layer-data side

```typescript
// devices.repository.ts
export const DEVICES_REPOSITORY = Symbol('DEVICES_REPOSITORY');

export interface IDevicesRepository {
  findMany(filter: DevicesListFilter): Promise<DevicesListResult>;
  findById(id: string, tenantId: string): Promise<DeviceRow | null>;
  create(input: CreateDeviceInput): Promise<DeviceRow>;
  update(id: string, tenantId: string, input: UpdateDeviceInput): Promise<DeviceRow | null>;
  delete(id: string, tenantId: string): Promise<void>;
  // ...
}
```

```typescript
// devices-data.module.ts
@Module({
  providers: [
    PrismaDevicesRepository,
    { provide: DEVICES_REPOSITORY, useExisting: PrismaDevicesRepository },
  ],
  exports: [DEVICES_REPOSITORY],  // export ONLY the token — never the class
})
export class DevicesDataModule {}
```

### app side

```typescript
// devices.module.ts
@Module({
  imports: [DevicesDataModule],
  controllers: [DevicesController],
  providers: [DevicesService],
})
export class DevicesModule {}
```

```typescript
// devices.service.ts
@Injectable()
export class DevicesService {
  constructor(
    @Inject(DEVICES_REPOSITORY)
    private readonly devicesRepo: IDevicesRepository,
  ) {}
}
```

**Rules:**
- Always `@Inject(DEVICES_REPOSITORY)` — never inject `PrismaDevicesRepository` directly.
- `DevicesDataModule` is the only module that knows about the Prisma implementation.
- The app `DevicesModule` only knows about the `IDevicesRepository` interface and token.

---

## 4. BaseRepository — available methods

`BaseRepository<TDelegate>` lives in `libs/third-party/src/prisma/base.repository.ts`.
All Prisma repositories extend it.

```typescript
// Signatures (TDelegate = Prisma model delegate, e.g. prisma.device)
findUnique(args: Parameters<TDelegate['findUnique']>[0]): Promise<...>
findFirst(args: Parameters<TDelegate['findFirst']>[0]): Promise<...>
findMany(args: Parameters<TDelegate['findMany']>[0]): Promise<...>
create(args: Parameters<TDelegate['create']>[0]): Promise<...>
update(args: Parameters<TDelegate['update']>[0]): Promise<...>
delete(args: Parameters<TDelegate['delete']>[0]): Promise<...>
upsert(args: Parameters<TDelegate['upsert']>[0]): Promise<...>
count(args: Parameters<TDelegate['count']>[0]): Promise<...>
exists(where: Parameters<TDelegate['findFirst']>[0]['where']): Promise<boolean>

findPagination(
  findManyArgs: Parameters<TDelegate['findMany']>[0],
  options: { page: number; pageSize: number; countArgs?: Parameters<TDelegate['count']>[0] }
): Promise<PaginatedResult<T>>
```

Usage pattern in a Prisma repository:

```typescript
// Non-async — just returning the promise (no await inside)
findById(id: string, tenantId: string) {
  return this.findUnique({ where: { id, tenantId } });
}

// Async — when logic requires await internally
async listWithFilter(filter: DevicesListFilter): Promise<DevicesListResult> {
  const result = await this.findPagination(
    { where: { tenantId: filter.tenantId }, orderBy: { createdAt: 'desc' } },
    { page: filter.page, pageSize: filter.pageSize },
  );
  return result;
}
```

> **Biome rule**: if a method has no `await` inside its body, do NOT mark it `async`.
> The method body should just `return this.findXxx(...)` — no `async` keyword.

---

## 5. Config injection

**Never** call `getAppConfig()` inside a class (service, guard, strategy, module factory).
Use `@Inject(appConfiguration.KEY)` with the inferred type.

```typescript
import { appConfiguration } from '@app/core';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    @Inject(appConfiguration.KEY)
    private readonly appConfig: ReturnType<typeof appConfiguration>,
  ) {}

  someMethod() {
    const secret = this.appConfig.jwtSecret;
  }
}
```

For module-level factory (e.g. `JwtModule.registerAsync`):

```typescript
JwtModule.registerAsync({
  useFactory: (cfg: ReturnType<typeof appConfiguration>) => ({
    secret: cfg.jwtSecret,
    signOptions: { expiresIn: cfg.jwtExpiresIn as any },
  }),
  inject: [appConfiguration.KEY],
})
```

**Why**: `getAppConfig()` runs at Node.js module import time — before `ConfigModule` loads
`.env` and runs Joi validation. This silently uses fallback values without any warning.

---

## 6. Global providers

These are registered globally in `AppModule` / `PrismaModule` / `CacheModule`.
Do NOT re-provide or re-import them in feature modules.

| Provider          | Registered in        | Access via                        |
| ----------------- | -------------------- | --------------------------------- |
| `PrismaService`   | `PrismaModule` (global) | Inject in `PrismaXxxRepository` only |
| `CacheService`    | `CacheModule` (global)  | `@Inject(CacheService)` anywhere  |
| `JwtAuthGuard`    | `AppModule` (global guard) | Applied to all routes by default |
| `RolesGuard`      | `AppModule` (global guard) | Applied to all routes            |
| `ResponseInterceptor` | `AppModule` (global) | Wraps all responses              |
| `HttpExceptionFilter` | `AppModule` (global) | Catches all HTTP exceptions      |

# CLAUDE.md — Backend API Starter (NestJS Monorepo)

Đọc toàn bộ file này trước khi thực hiện bất kỳ thay đổi nào.

---

## Tổng quan dự án

Template Backend REST API chuẩn doanh nghiệp, xây dựng theo kiến trúc **NestJS Monorepo** với **Service/Repository Pattern**, hỗ trợ **Multi-tenancy**, **Prisma ORM**, **PostgreSQL/TimescaleDB**, và **Redis Cache**.

- Toàn bộ truy cập database phải thông qua repository interface trong `@app/layer-data`.
- Controllers chỉ làm nhiệm vụ dispatch và serialize, không chứa business logic.
- Services xử lý nghiệp vụ, gọi qua Repositories.
- Tuân thủ quy ước DTO validation, HTTP response format chuẩn và mã lỗi Api*HttpError.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js + TypeScript | TS ^5.7 |
| Framework | NestJS | ^11 |
| ORM | Prisma (adapter-pg) | ^7.5 |
| Database | PostgreSQL + TimescaleDB + PostGIS | pg16 |
| Cache | Redis (ioredis) | 7 |
| Auth | JWT + Passport.js (HS256) | — |
| Validation | class-validator + class-transformer + Joi | — |
| API Docs | Swagger (@nestjs/swagger) | ^11 |
| Linter / Formatter | Biome | ^2.4 |
| Package Manager | pnpm | — |

---

## Cấu trúc thư mục (Monorepo)

Project dùng **NestJS Monorepo** với 2 apps và 3 libs chia sẻ:

```
{{sanitizedProjectName}}/
├── apps/
│   ├── {{sanitizedProjectName}}/          # REST API app (main)
│   │   ├── src/
│   │   │   ├── main.ts                # Bootstrap: Swagger, global pipes, CORS
│   │   │   ├── app.module.ts          # Root module, global guards/interceptors/filters
│   │   │   └── modules/              # Feature modules (mỗi domain = 1 module)
│   │   │       ├── auth/             # Login, refresh token, logout
│   │   │       ├── users/            # Users, admin user management
│   │   │       ├── tenants/          # Tenant management (SUPER_ADMIN)
│   │   │       └── index.ts          # Re-export all modules
│   │   └── tsconfig.app.json
├── libs/
│   ├── core/                         # Shared NestJS building blocks (alias: @app/core)
│   │   └── src/
│   │       ├── configs/              # app.config.ts, redis.config.ts (Joi validation)
│   │       ├── constants/            # app, status-codes, swagger constants
│   │       ├── decorators/           # @Public, @User, @RequireRoles, @Serialize, @ApiSuccessResponse, @IsAdmin
│   │       ├── dtos/                 # PagingDto, TenantDto
│   │       ├── enums/                # EnvironmentEnum
│   │       ├── filters/              # HttpExceptionFilter
│   │       ├── guards/               # RolesGuard
│   │       ├── interceptors/         # ResponseInterceptor, SerializerInterceptor
│   │       ├── responses/            # ErrorResponse, PaginationResponse
│   │       ├── types/                # AuthUser, Pagination types
│   │       └── utils/                # swagger.util.ts, tenant-scope.util.ts, time.util.ts
│   ├── layer-data/                   # Data access layer (alias: @app/layer-data)
│   │   └── src/
│   │       └── devices/              # Mỗi domain = 1 folder
│   │           ├── devices.types.ts          # Row/Input/Filter/Result types
│   │           ├── devices.repository.ts     # IDevicesRepository interface + Symbol
│   │           ├── prisma-devices.repository.ts  # Prisma implementation
│   │           ├── devices-data.module.ts    # NestJS module export DEVICES_REPOSITORY
│   │           └── index.ts
│   └── third-party/                  # Third-party integrations (alias: @app/third-party)
│       └── src/
│           ├── cache/                # Redis CacheModule, CacheService (global)
│           └── prisma/               # PrismaService, PrismaModule, BaseRepository
├── prisma/
│   ├── schema.prisma                 # Chỉ import, không chứa model
│   ├── models/                       # Mỗi domain = 1 file .prisma riêng
│   │   ├── tenant.prisma
│   │   ├── user.prisma
│   │   ├── device.prisma
│   │   ├── position.prisma
│   │   ├── event.prisma
│   │   ├── geofence.prisma
│   │   ├── command.prisma
│   │   └── setting.prisma
│   ├── migrations/
│   │   ├── 20260319035758_init/migration.sql              # Full schema + TimescaleDB setup
│   │   └── 20260319040000_add_settings_.../migration.sql  # pt_settings, registrationStatus
│   └── seed.ts                       # Seed default tenant + SUPER_ADMIN
├── nest-cli.json                     # Monorepo config: apps + libs
└── docker-compose.yml                # TimescaleDB + Redis
```

### Path aliases

| Alias | Trỏ đến | Vai trò |
|---|---|---|
| `@app/core` | `libs/core/src` | NestJS building blocks, shared types, decorators |
| `@app/layer-data` | `libs/layer-data/src` | Data access layer — interface + Prisma implementation |
| `@app/third-party` | `libs/third-party/src` | PrismaService, CacheService |

---

## Database Schema

### Bảng thường (PostgreSQL)

| Table | Model | Mục đích |
|---|---|---|
| `pt_tenants` | `Tenant` | Multi-tenant root |
| `pt_users` | `User` | Accounts với role-based access |
| `pt_devices` | `Device` | Device registry (IMEI, protocol, registrationStatus) |
| `pt_device_status` | `DeviceStatus` | 1:1 với device — battery, gsmSignal, lastSeenAt |
| `pt_device_commands` | `DeviceCommand` | Command queue với retry logic |
| `pt_geofences` | `Geofence` | Circle/Polygon zones (PostGIS geometry) |
| `pt_geofence_assignments` | `GeofenceAssignment` | Gắn geofence vào device hoặc cả tenant |
| `pt_geofence_states` | `GeofenceState` | Trạng thái inside/outside hiện tại per device/geofence |
| `pt_settings` | `Setting` | Key-value config (global hoặc per-tenant) |

### Hypertables (TimescaleDB) — time-series

| Table | Model | Partition key | Chunk | Compression | Retention |
|---|---|---|---|---|---|
| `pt_positions` | `Position` | `device_time` | 7 ngày | sau 7 ngày | 3 tháng |
| `pt_events` | `Event` | `device_time` | 7 ngày | — | 3 tháng |
| `pt_device_command_logs` | `DeviceCommandLog` | `created_at` | 7 ngày | sau 30 ngày | — |

Cả 3 hypertable dùng **composite primary key** `(id, partition_col)` — đây là yêu cầu của TimescaleDB để unique index bao gồm partition column.

### Quan trọng — FK không hỗ trợ bởi TimescaleDB

TimescaleDB không hỗ trợ FK trỏ vào hypertable. Hai FK này **không được tạo** trong migration:
- `pt_events.position_id → pt_positions.id`
- `pt_geofence_states.last_position_id → pt_positions.id`

Đây là constraint không thể enforce ở DB level. Application layer phải tự đảm bảo tính toàn vẹn.

### Geom trigger

`pt_positions.geom` được **tự động populate** qua trigger `trg_pt_positions_geom` (BEFORE INSERT OR UPDATE).
Khi insert vào `pt_positions`, **không cần tự tính `geom`** — chỉ cần truyền `latitude` và `longitude`.

### `pt_settings` — partial unique indexes

```sql
-- Global settings (tenant_id IS NULL)
CREATE UNIQUE INDEX "uq_pt_settings_global_key" ON "pt_settings"("key") WHERE "tenant_id" IS NULL;
-- Tenant settings (tenant_id IS NOT NULL)
CREATE UNIQUE INDEX "uq_pt_settings_tenant_key" ON "pt_settings"("tenant_id", "key") WHERE "tenant_id" IS NOT NULL;
```

---

## Các Enum quan trọng

```typescript
UserRole:                 SUPER_ADMIN | ADMIN | USER
AuthProvider:             LOCAL | ENTRA
UserApprovalStatus:       PENDING | APPROVED | REJECTED
GeofenceAssignmentTargetType: DEVICE | TENANT_ALL
```

---

## Luồng Authentication

```
POST /auth/login (email + password)
  → AuthService validates bcrypt hash
  → Sign JWT access token + refresh token
  → Return { accessToken, refreshToken }

POST /auth/refresh (refreshToken)
  → Validate refresh token (stored in Redis)
  → Issue new access token + refresh token (rotation)
  → Return { accessToken, refreshToken }

POST /auth/logout (refreshToken)
  → Invalidate refresh token in Redis
  → Return success

Mọi request protected:
  Authorization: Bearer <accessToken>
  → JwtAuthGuard → JwtStrategy → gắn vào request.user (AuthUser type)
  → RolesGuard kiểm tra @RequireRoles decorator
```

`AuthUser` type:
```typescript
type AuthUser = {
  sub: string;
  email: string;
  role: string;
  tenantId: string;
  iat?: number;
  exp?: number;
};
```

Endpoints public dùng `@Public()` decorator — bỏ qua JWT guard.
`SUPER_ADMIN` tự động bypass mọi role check trong `RolesGuard`.

**Refresh token** được lưu trong Redis (`@app/third-party` CacheService), hỗ trợ rotation — mỗi lần refresh sẽ invalidate token cũ và issue token mới.

---

## Chuẩn Response API

**Success:**
```json
{ "message": "Success", "status": 200, "data": { ... } }
```

**Paginated:**
```json
{
  "message": "Success",
  "status": 200,
  "data": {
    "items": [...],
    "pagination": { "page": 1, "pageSize": 10, "total": 100, "totalPages": 10 }
  }
}
```

**Error:**
```json
{ "message": "Error description", "status": 400, "data": { "errors": [...] } }
```

---

## Patterns & Conventions

### Kiến trúc Data Layer (`@app/layer-data`)

Toàn bộ logic truy cập database nằm trong `libs/layer-data`, **không** nằm trong app module. App module chỉ import `*DataModule` và inject qua interface.

```
app/DevicesService
    │  @Inject(DEVICES_REPOSITORY)
    ▼
IDevicesRepository              ← interface (@app/layer-data)
    │  implements
    ▼
PrismaDevicesRepository         ← Prisma implementation (@app/layer-data)
    │  extends
    ▼
BaseRepository<TDelegate>       ← generic helper (@app/third-party)
    │  uses
    ▼
PrismaService                   ← DB connection (@app/third-party, global)
```

**Mỗi domain trong `layer-data` gồm 4 file:**

| File | Vai trò |
|---|---|
| `*.types.ts` | Row/Input/Filter/Result types — không phụ thuộc NestJS |
| `*.repository.ts` | `IRepository` interface + DI Symbol |
| `prisma-*.repository.ts` | Prisma implementation, extends `BaseRepository` |
| `*-data.module.ts` | NestJS module, chỉ export DI token |

### Tạo domain mới trong `layer-data`

```
libs/layer-data/src/my-domain/
├── my-domain.types.ts           # MyDomainRow, CreateInput, UpdateInput, ListFilter, ListResult
├── my-domain.repository.ts      # MY_DOMAIN_REPOSITORY symbol + IMyDomainRepository interface
├── prisma-my-domain.repository.ts
├── my-domain-data.module.ts
└── index.ts                     # export tất cả — consumer chỉ import từ đây
```

Sau đó export từ `libs/layer-data/src/index.ts`.

### Tạo feature module mới trong app

Feature module **không còn chứa** `interfaces/` hay `repositories/`. Cấu trúc gọn hơn:

```
apps/{{sanitizedProjectName}}/src/modules/my-feature/
├── my-feature.module.ts         # imports [MyDomainDataModule]
├── my-feature.controller.ts
├── my-feature.service.ts        # @Inject(MY_DOMAIN_REPOSITORY)
├── dto/
│   ├── create-my-feature.dto.ts
│   ├── update-my-feature.dto.ts
│   ├── list-my-feature.dto.ts
│   └── index.ts
└── responses/
    └── index.ts
```

Sau đó export từ `apps/{{sanitizedProjectName}}/src/modules/index.ts` và import vào `app.module.ts`.

### Dependency Injection pattern

```typescript
// --- layer-data ---

// my-domain.repository.ts
export const MY_DOMAIN_REPOSITORY = Symbol('MY_DOMAIN_REPOSITORY');
export interface IMyDomainRepository { ... }

// my-domain-data.module.ts
@Module({
  providers: [
    PrismaMyDomainRepository,
    { provide: MY_DOMAIN_REPOSITORY, useExisting: PrismaMyDomainRepository },
  ],
  exports: [MY_DOMAIN_REPOSITORY],  // chỉ export token, không export class
})
export class MyDomainDataModule {}

// --- app ---

// my-feature.module.ts
@Module({
  imports: [MyDomainDataModule],
  controllers: [MyFeatureController],
  providers: [MyFeatureService],
})

// my-feature.service.ts
constructor(
  @Inject(MY_DOMAIN_REPOSITORY)
  private readonly myDomainRepo: IMyDomainRepository,
) {}
```

### BaseRepository — methods có sẵn

`BaseRepository<TDelegate>` trong `libs/third-party/src/prisma/base.repository.ts` cung cấp:
- `findUnique(args)`, `findFirst(args)`, `findMany(args)`
- `create(args)`, `update(args)`, `delete(args)`, `upsert(args)`, `count(args)`
- `findPagination(findManyArgs, { page, pageSize, countArgs? })` — trả về `{ items, pagination }`
- `exists(where)` — trả về boolean

**Lưu ý khi implement repository:**
- Method chỉ `return` Promise trực tiếp → **không dùng `async`** (tránh Biome `useAwait` warning)
- Method có `await` bên trong → dùng `async` bình thường
- Write operations (`deleteMany`, `updateMany`) cần enforce **cả `id` lẫn `tenantId`** trong `where` để đảm bảo atomic tenant isolation
- Không gọi `prisma.*` trực tiếp trong service — mọi DB access phải qua repository interface

### Config injection convention

**Không dùng `getAppConfig()` bên trong class** (service, guard, strategy, v.v.) — chỉ dùng ở `main.ts` (trước khi DI container sẵn sàng).

Bên trong class, inject config bằng `appConfiguration.KEY` + `ReturnType<typeof appConfiguration>`:

```typescript
// ✅ Đúng — config được đọc sau khi ConfigModule validate xong
import { appConfiguration } from '@app/core';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class MyService {
  constructor(
    @Inject(appConfiguration.KEY)
    private readonly appConfig: ReturnType<typeof appConfiguration>,
  ) {}
}

// Trong module:
JwtModule.registerAsync({
  useFactory: (appConfig: ReturnType<typeof appConfiguration>) => ({
    secret: appConfig.jwtSecret,
    signOptions: { expiresIn: appConfig.jwtExpiresIn as any },
  }),
  inject: [appConfiguration.KEY],
})
```

**Lý do:**
- `getAppConfig()` ở module scope chạy trong phase `import` của Node.js — trước khi `ConfigModule` load `.env` và chạy Joi validation.
- Nếu `.env` chưa được đọc, app vẫn start bình thường với fallback hardcode mà không có warning.
- `ReturnType<typeof appConfiguration>` tránh lỗi `emitDecoratorMetadata` khi dùng `ConfigType<typeof appConfiguration>` trong decorated constructor parameter.

**Không dùng:**
```typescript
// ❌ Sai — chạy trước ConfigModule, Joi validation chưa đảm bảo
const { jwtSecret } = getAppConfig(); // module scope

// ❌ Sai — magic string, không type-safe, dễ typo
configService.get<string>('app.jwtSecret')
```

### AI code generation convention

- Code được generate bởi Claude/Copilot **phải ưu tiên follow code hiện có** trong project trước khi tạo pattern mới.
- Khi thêm feature mới, luôn mirror cấu trúc module đang dùng (`controller`/`service`/`dto`/`interfaces`/`repositories`/`responses`) thay vì tự đổi kiến trúc.
- Naming, cách inject dependency, response shape, error handling phải bám theo module tương tự đã tồn tại (ưu tiên tham chiếu `devices` module).
- Import shared code từ `@app/core` (decorators, guards, filters, types, configs), `@app/layer-data` (repository interfaces, DI tokens, DataModules), và `@app/third-party` (PrismaModule, CacheModule); không copy code từ lib vào app.
- Với repository method public liên quan dữ liệu tenant, `tenantId` phải xuất hiện trong interface signature (tham số trực tiếp hoặc nằm trong query object).
- Với mọi query/read/write liên quan dữ liệu tenant, code generate phải enforce điều kiện `tenantId` ngay tại tầng repository query; không được dựa vào filter ở client/controller.
- Chỉ introduce pattern mới khi có lý do kỹ thuật rõ ràng; nếu có, phải giữ backward compatibility cho API hiện tại.

### DTO pattern

- **Request DTOs**: dùng `class-validator` decorators
- **Response DTOs**: dùng `@Expose()` + `@Exclude()` (class-transformer)
- `@Serialize(ResponseDto)` decorator trên controller method để transform response
- `@ApiSuccessResponse(ResponseDto, 'message')` decorator cho Swagger docs
- Không expose password hash, internal fields không cần thiết

### Multi-tenancy

- Mọi query **phải** filter theo `tenantId` từ JWT: `@User('tenantId') tenantId: string`
- `SUPER_ADMIN` có thể access cross-tenant — handle ở application layer, schema không enforce
- Không bao giờ query thiếu tenant filter trừ SUPER_ADMIN endpoint
- Dữ liệu trả về phải thuộc đúng tenant của JWT; nếu không match `tenantId` thì xử lý như not found/forbidden, tuyệt đối không trả chéo tenant.
- Khi support `SUPER_ADMIN` lấy all-tenant data, repository query phải dùng điều kiện có kiểm soát: non-super-admin luôn ép `tenantId` từ JWT; super-admin chỉ được bỏ `tenantId` filter khi endpoint cho phép rõ ràng.
- Với endpoint cho `SUPER_ADMIN`, ưu tiên nhận thêm `tenantId` optional trong query để hỗ trợ cả 2 mode: lọc theo 1 tenant hoặc lấy toàn bộ tenants; tuyệt đối không cho user thường truyền `tenantId` để override JWT.

### Shared types

`libs/core/src/types/`:
```typescript
PagingQuery           // { page, pageSize }
KeywordPagingQuery    // extends PagingQuery, thêm keyword?
PaginationMeta        // { page, pageSize, total, totalPages }
PaginatedResult<T>    // { items: T[], pagination: PaginationMeta }
AuthUser              // { sub, email, role, tenantId, iat?, exp? }
```

---

## Quy trình Database Migration

> **Không dùng `prisma migrate dev`** — shadow DB không tương thích với TimescaleDB.

### Tạo migration mới:

```bash
# 1. Sửa file trong prisma/models/*.prisma
# 2. Generate SQL (không apply)
pnpm prisma:migrate:new

# 3. Kiểm tra và chỉnh sửa SQL nếu cần (xem lưu ý bên dưới)
# 4. Apply
pnpm prisma:migrate:deploy
```

### Naming convention:
`YYYYMMDDHHMMSS_<snake_case_description>/migration.sql`

### Lưu ý khi viết migration:

- **TimescaleDB — hypertable mới**: thêm `create_hypertable(...)` cuối file migration, dùng composite PK `(id, partition_col)` thay vì PK đơn
- **FK vào hypertable**: không tạo — TimescaleDB không hỗ trợ
- **Partial unique indexes** (như `pt_settings`): viết thủ công trong SQL, Prisma không generate được
- **PostGIS geometry columns**: khai báo `Unsupported("geography(...)")` trong Prisma model, thêm index GiST thủ công trong SQL
- **Geom trigger**: đã có sẵn cho `pt_positions`. Nếu thêm bảng mới có `geom`, cần tạo trigger tương tự

---

## Các lệnh thường dùng

```bash
# Dev — chạy từng app riêng lẻ
pnpm dev:api             # REST API app (hot reload)
pnpm dev:tcp-server      # TCP ingestion server (hot reload)

# Hoặc chạy toàn bộ
pnpm start:dev           # Build và chạy app mặc định ({{sanitizedProjectName}})

# Database
docker-compose up -d     # Start TimescaleDB + Redis
pnpm prisma:seed         # Seed default tenant + super admin
pnpm prisma:studio       # Prisma GUI
pnpm prisma:generate     # Re-generate Prisma client

# Build
pnpm build               # Build tất cả apps/libs
# Prod entry point: dist/apps/{{sanitizedProjectName}}/main.js

# Test
pnpm test
pnpm test:cov

# Code quality (Biome)
pnpm check               # lint + format check + fix (dùng hằng ngày)
pnpm lint                # chỉ lint --write
pnpm format              # chỉ format --write
```

---

## Environment Variables

```bash
NODE_ENV=dev
API_PORT=3000
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/{{projectNameDb}}
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRES_IN=1d

REDIS_HOST=localhost
REDIS_PORT=6379
# REDIS_PASSWORD=

# Seeding (optional)
SEED_TENANT_NAME=Default Tenant
SEED_SUPER_ADMIN_EMAIL=admin@example.com
SEED_SUPER_ADMIN_NAME=Super Admin
SEED_SUPER_ADMIN_PASSWORD=<password>
```

Docker compose mặc định: `POSTGRES_USER=postgres`, `POSTGRES_DB={{projectNameDb}}`, port `5432`; Redis port `6379`.

---

## Git Workflow

### Husky hooks

| Hook | Lệnh | Tác dụng |
|---|---|---|
| `pre-commit` | `biome check --staged --write` | Auto-fix lint + format trên staged files |
| `commit-msg` | `commitlint` | Enforce conventional commit format |

### Conventional Commits

```
<type>(<scope>): <subject>

feat(devices): add list positions endpoint
fix(auth): handle expired token edge case
chore(db): update migration
refactor(shared): extract base repository
```

Types: `feat` | `fix` | `chore` | `docs` | `refactor` | `test` | `perf` | `ci` | `revert`

### Biome config

- Config: `biome.json`
- `noExplicitAny`: off — NestJS pattern dùng nhiều `any`
- `noEmptyBlockStatements`: off — NestJS lifecycle methods thường rỗng
- `noCommonJs`: off — project dùng CommonJS
- `unsafeParameterDecoratorsEnabled`: true — NestJS parameter decorators (`@Body()`, `@Param()`, `@Inject()`)
- `noUnusedImports`: error + auto-fix
- `noUnusedVariables`: warn, prefix `_` để suppress

---

## API Endpoints hiện tại

| Method | Path | Auth | Role | Mô tả |
|---|---|---|---|---|
| POST | `/auth/login` | Public | — | Đăng nhập, trả JWT |
| POST | `/auth/refresh` | Public | — | Refresh access token |
| POST | `/auth/logout` | JWT | any | Đăng xuất, invalidate refresh token |
| GET | `/auth/me` | JWT | any | Thông tin user hiện tại |
| GET | `/devices` | JWT | any | Danh sách devices (paginated) |
| GET | `/devices/:id` | JWT | any | Chi tiết device |
| POST | `/devices` | JWT | ADMIN+ | Tạo device mới |
| PATCH | `/devices/:id` | JWT | ADMIN+ | Cập nhật device |
| DELETE | `/devices/:id` | JWT | ADMIN+ | Xoá device |
| GET | `/positions/latest` | JWT | any | Vị trí mới nhất của mỗi device |
| GET | `/positions/live-map` | JWT | any | Vị trí tối ưu cho live map (bulk) |
| GET | `/positions/live-map/:id` | JWT | any | Vị trí mới nhất của 1 device |
| GET | `/positions/history` | JWT | any | Lịch sử vị trí GPS của device |
| GET | `/events` | JWT | any | Danh sách events (paginated) |
| PUT | `/settings/unknown-device-policy/whitelisted` | JWT | ADMIN+ | Cấu hình policy thiết bị lạ |
| GET | `/tenants` | JWT | SUPER_ADMIN | Danh sách tất cả tenants |
| GET | `/analytics/ingestion` | JWT | SUPER_ADMIN | Metrics ingestion pipeline |

Swagger: `http://localhost:3000/docs`

---

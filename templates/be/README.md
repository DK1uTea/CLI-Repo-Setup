# Protrack Backend API

REST API backend for **Protrack** — a multi-tenant GPS Asset Tracking platform built for B2B logistics.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript 5.7 |
| Framework | NestJS 11 (Monorepo) |
| ORM | Prisma 7 (adapter-pg) |
| Database | PostgreSQL 16 + TimescaleDB + PostGIS |
| Cache | Redis 7 (ioredis) |
| Auth | JWT + Passport.js (HS256) |
| Validation | class-validator + class-transformer + Joi |
| API Docs | Swagger (@nestjs/swagger) |
| Linter / Formatter | Biome 2 |
| Package Manager | pnpm |

## Prerequisites

- Node.js >= 20
- pnpm
- Docker + Docker Compose

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start infrastructure

```bash
docker-compose up -d
```

Starts:
- **TimescaleDB** (PostgreSQL 16 + TimescaleDB + PostGIS) → `localhost:5432`
- **Redis 7** → `localhost:6379`

### 3. Configure environment

Create a `.env` file at the project root:

```env
NODE_ENV=dev
API_PORT=3000

DATABASE_URL=postgresql://postgres:postgres123456@localhost:5432/protrack

JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1d

REDIS_HOST=localhost
REDIS_PORT=6379
# REDIS_PASSWORD=

# Seeding (optional)
SEED_TENANT_NAME=Default Tenant
SEED_SUPER_ADMIN_EMAIL=superadmin@protrack.local
SEED_SUPER_ADMIN_NAME=Super Admin
SEED_SUPER_ADMIN_PASSWORD=your_password_here
```

### 4. Run migrations

```bash
pnpm prisma:migrate:deploy
```

### 5. Seed initial data

```bash
pnpm prisma:seed
```

Creates a default tenant and a `SUPER_ADMIN` account using the credentials in `.env`.

### 6. Start the server

```bash
# REST API only
pnpm dev:api

# TCP ingestion server only
pnpm dev:tcp-server

# Or run the default app
pnpm start:dev
```

API available at `http://localhost:3000`.
Swagger docs at `http://localhost:3000/docs`.

## Project Structure

NestJS Monorepo with 3 apps and 3 shared libs:

```
protrack-backend-api/
├── apps/
│   ├── protrack-backend-api/   # REST API — feature modules, controllers, services
│   ├── tcp-server/             # TCP ingestion server (GT06 / CANTRACK protocols)
│   └── worker/                 # Background worker — GPS data processing pipeline
├── libs/
│   ├── core/                   # Shared building blocks: decorators, guards, filters, types (@app/core)
│   ├── layer-data/             # Data access layer: repository interfaces + Prisma implementations (@app/layer-data)
│   └── third-party/            # Infrastructure integrations: PrismaService, CacheService (@app/third-party)
├── prisma/
│   ├── models/                 # One .prisma file per domain
│   └── migrations/             # SQL migration files
└── docker-compose.yml
```

## Response Format

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

## Database

### Regular tables

| Table | Description |
|---|---|
| `pt_tenants` | Multi-tenant root |
| `pt_users` | User accounts with role-based access |
| `pt_devices` | Device registry (IMEI, protocol, registration status) |
| `pt_device_status` | Latest telemetry per device (battery, GSM signal, last position) |
| `pt_device_commands` | Command queue with retry logic |
| `pt_geofences` | Circle/Polygon zones (PostGIS) |
| `pt_geofence_assignments` | Geofence → device or tenant-wide assignment |
| `pt_geofence_states` | Current inside/outside state per device/geofence |
| `pt_settings` | Key-value config (global or per-tenant) |

### TimescaleDB hypertables

| Table | Partition key | Retention |
|---|---|---|
| `pt_positions` | `device_time` | 3 months |
| `pt_events` | `device_time` | 3 months |
| `pt_device_command_logs` | `created_at` | — |

### Migrations

> **Do not use `prisma migrate dev`** — shadow DB is incompatible with TimescaleDB.

```bash
# 1. Edit prisma/models/*.prisma
# 2. Generate SQL without applying
pnpm prisma:migrate:new

# 3. Review and edit the generated SQL if needed
# 4. Apply
pnpm prisma:migrate:deploy
```

Migration naming: `YYYYMMDDHHMMSS_<snake_case_description>/migration.sql`

## Development

```bash
pnpm dev:api            # REST API hot reload
pnpm dev:tcp-server     # TCP server hot reload
pnpm start:dev          # Default app hot reload
pnpm start:debug        # Debug mode (port 9229)
pnpm build              # Production build (output: dist/apps/...)

pnpm check              # Biome lint + format (auto-fix)
pnpm lint               # Biome lint only
pnpm format             # Biome format only

pnpm test               # Unit tests
pnpm test:cov           # Coverage report

pnpm prisma:generate    # Regenerate Prisma client
pnpm prisma:studio      # Prisma GUI
```

## Git Workflow

Commits follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

feat(devices): add list positions endpoint
fix(auth): handle expired token edge case
chore(db): update migration
```

Types: `feat` | `fix` | `chore` | `docs` | `refactor` | `test` | `perf` | `ci` | `revert`

Husky hooks:
- `pre-commit` — runs Biome check + auto-fix on staged files
- `commit-msg` — enforces conventional commit format via commitlint

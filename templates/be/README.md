# {{projectNameTitle}} API

Enterprise REST API backend built with **NestJS Monorepo**, **Prisma ORM**, **PostgreSQL / TimescaleDB**, and **Redis**.

## Features

- **NestJS Monorepo Architecture**: Clean separation between application entrypoints (`apps/`) and shared core/data libraries (`libs/`).
- **Prisma ORM**: Type-safe database client and migrations.
- **Multi-Tenancy**: Built-in tenant separation and role-based access control (`SUPER_ADMIN`, `ADMIN`, `USER`).
- **Authentication**: JWT access & refresh tokens, password hashing with bcrypt, Microsoft Entra SSO integration.
- **Docker Compose**: Pre-configured database and Redis cache environment.

## Getting Started

### 1. Environment Setup

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 2. Start Services

```bash
docker compose up -d
```

### 3. Generate Prisma Client & Migrate

```bash
pnpm prisma:generate
pnpm prisma:migrate:dev
pnpm prisma:seed
```

### 4. Run Development Server

```bash
pnpm dev:api
```

API Swagger Documentation: [http://localhost:3000/docs](http://localhost:3000/docs)

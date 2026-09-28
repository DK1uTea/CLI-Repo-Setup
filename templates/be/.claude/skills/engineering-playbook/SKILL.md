---
name: engineering-playbook
version: 1.0.0
description: >
  Mandatory engineering playbook for the App Backend API — a NestJS monorepo with
  Service/Repository pattern, multi-tenancy, and Prisma ORM. Every agent MUST read and
  strictly follow the conventions in this playbook before writing any line of code —
  including controllers, services, repositories, DTOs, data modules, and Prisma migrations.
  This playbook is the single source of truth for code structure, patterns, and style
  across all App modules. All DB access MUST go through the @app/layer-data repository
  interface — never call Prisma directly from a service or controller. Every query that
  touches tenant-owned data MUST enforce tenantId at the repository layer. Errors MUST be
  thrown using Api*HttpError classes with ERROR_CODE constants — never raw string literals.
---

# Engineering Playbook

Mandatory conventions guide for the App Backend API NestJS monorepo.
**Read every relevant section before writing any code.**

## Reference files

| Topic                                           | File                                       |
| ----------------------------------------------- | ------------------------------------------ |
| Architecture — layers, DI, BaseRepository       | [ARCHITECTURE.md](./ARCHITECTURE.md)       |
| Data layer — types, interfaces, Prisma impl     | [DATA-LAYER.md](./DATA-LAYER.md)           |
| API design — controllers, DTOs, responses, auth | [API-DESIGN.md](./API-DESIGN.md)           |
| Scaffolding a new domain + feature module       | [SCAFFOLDING.md](./SCAFFOLDING.md)         |
| Naming, file structure, Biome, import order     | [CONVENTIONS.md](./CONVENTIONS.md)         |

---

## Architecture overview

App uses a **NestJS Monorepo** with a strict three-layer architecture:

```
HTTP Request
    └─► Controller         (dispatch + serialize — no business logic)
            └─► Service    (business logic, orchestration)
                    └─► IRepository   (@app/layer-data interface)
                                └─► PrismaXxxRepository   (Prisma implementation)
                                            └─► PrismaService   (@app/third-party, global)
```

The monorepo has the main API app and three shared libs:

| Package            | Alias              | Role                                                     |
| ------------------ | ------------------ | -------------------------------------------------------- |
| `apps/{{sanitizedProjectName}}` | —         | REST API (controllers, services, feature modules)        |
| `libs/core`        | `@app/core`        | Shared decorators, guards, interceptors, filters, types  |
| `libs/layer-data`  | `@app/layer-data`  | Data access layer — interfaces + Prisma implementations  |
| `libs/third-party` | `@app/third-party` | PrismaService, CacheService (Redis)                      |

---

## Non-negotiable rules — violating any of these is a bug

1. **Controllers** contain zero business logic. They validate input, call the service, and
   return a serialized response. Never inject a repository into a controller.
2. **Services** orchestrate business logic. They inject repositories via DI token
   `@Inject(XXX_REPOSITORY)` and call repository interface methods only.
3. **Repositories** communicate with the database only. No HTTP calls, no business logic.
4. **All DB access** goes through the `@app/layer-data` repository interface — never call
   `PrismaService` directly from a service.
5. **Every query touching tenant-owned data** MUST enforce `tenantId` at the repository
   query level. Never rely on the controller or service to post-filter by tenant.
6. **SUPER_ADMIN bypass**: only bỏ `tenantId` filter khi repository method được thiết kế
   rõ ràng cho cross-tenant query. Non-super-admin phải luôn có `tenantId` trong where clause.
7. **Config injection**: never call `getAppConfig()` inside a class. Inject config using
   `@Inject(appConfiguration.KEY)` with `ReturnType<typeof appConfiguration>`.
8. **Repository methods** that only `return` a Promise directly must NOT use `async`
   (Biome `useAwait` rule). Methods that `await` internally must use `async`.
9. **DI token**: always inject the Symbol token, never inject the concrete class directly.
   Export only the token from `*-data.module.ts`, not the implementation class.
10. **Response shape**: success responses MUST use `ResponseInterceptor` shape via
    `@Serialize()` + `@ApiSuccessResponse()`. Never manually construct `{ message, status, data }`.
11. **Error throwing**: always throw `Api*HttpError` with an error code constant from
    `constants/<feature>.error-codes.ts` — never pass a raw string literal to `Api*HttpError`.

---

## Quick decision guide

| Situation                                           | Go to                                                       |
| --------------------------------------------------- | ----------------------------------------------------------- |
| Understanding the 3-layer DI wiring                 | [ARCHITECTURE.md](./ARCHITECTURE.md)                        |
| Creating a new domain in `@app/layer-data`          | [DATA-LAYER.md](./DATA-LAYER.md)                            |
| Writing repository types / interface / Prisma impl  | [DATA-LAYER.md](./DATA-LAYER.md)                            |
| Enforcing multi-tenancy in a repository query       | [DATA-LAYER.md — Multi-tenancy rules](./DATA-LAYER.md)      |
| Writing a controller or DTO                         | [API-DESIGN.md](./API-DESIGN.md)                            |
| Using auth decorators (@Public, @User, @RequireRoles) | [API-DESIGN.md — Auth decorators](./API-DESIGN.md)        |
| Serializing response DTOs                           | [API-DESIGN.md — Response & serialization](./API-DESIGN.md) |
| Throwing an error                                   | [API-DESIGN.md — Error handling](./API-DESIGN.md)           |
| Creating a new feature module end-to-end            | [SCAFFOLDING.md](./SCAFFOLDING.md)                          |
| Naming a file, class, or variable                   | [CONVENTIONS.md](./CONVENTIONS.md)                          |
| Writing a Prisma migration                          | [CONVENTIONS.md — Migrations](./CONVENTIONS.md)             |

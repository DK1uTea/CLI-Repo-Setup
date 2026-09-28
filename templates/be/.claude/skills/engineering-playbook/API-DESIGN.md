# API Design — Controllers, DTOs, Responses, Auth & Error Handling

## Table of contents

1. [Controller structure](#1-controller-structure)
2. [Auth decorators](#2-auth-decorators)
3. [Extracting tenant & user from JWT](#3-extracting-tenant--user-from-jwt)
4. [Response & serialization](#4-response--serialization)
5. [Response shape reference](#5-response-shape-reference)
6. [Input DTOs](#6-input-dtos)
7. [Response DTOs (serialization)](#7-response-dtos-serialization)
8. [Error handling](#8-error-handling)
9. [Swagger documentation](#9-swagger-documentation)
10. [Role-based access control](#10-role-based-access-control)

---

## 1. Controller structure

Controllers live in `apps/protrack-backend-api/src/modules/<feature>/<feature>.controller.ts`.
They contain **zero business logic** — only input extraction, service delegation, and
response shaping via decorators.

```typescript
// modules/devices/devices.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import {
  ApiSuccessResponse,
  Public,
  RequireRoles,
  Serialize,
  User,
} from '@app/core';
import { UserRole } from '@app/core';
import { AuthUser } from '@app/core';

import { CreateDeviceDto, ListDevicesDto, UpdateDeviceDto } from './dto';
import { DeviceResponse, DeviceListResponse } from './responses';
import { DevicesService } from './devices.service';

/**
 * REST controller for the Devices domain.
 * Dispatches to DevicesService — no business logic here.
 */
@Controller('devices')
@ApiTags('Devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  @Serialize(DeviceListResponse)
  @ApiSuccessResponse(DeviceListResponse, 'Devices retrieved')
  list(
    @User() user: AuthUser,
    @Query() query: ListDevicesDto,
  ) {
    return this.devicesService.list(user.tenantId, query);
  }

  @Get(':id')
  @Serialize(DeviceResponse)
  @ApiSuccessResponse(DeviceResponse, 'Device retrieved')
  findOne(
    @User('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.devicesService.findOne(id, tenantId);
  }

  @Post()
  @RequireRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Serialize(DeviceResponse)
  @ApiSuccessResponse(DeviceResponse, 'Device created', 201)
  create(
    @User('tenantId') tenantId: string,
    @Body() body: CreateDeviceDto,
  ) {
    return this.devicesService.create(tenantId, body);
  }

  @Patch(':id')
  @RequireRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Serialize(DeviceResponse)
  @ApiSuccessResponse(DeviceResponse, 'Device updated')
  update(
    @User('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateDeviceDto,
  ) {
    return this.devicesService.update(id, tenantId, body);
  }

  @Delete(':id')
  @RequireRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiSuccessResponse(null, 'Device deleted')
  remove(
    @User('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.devicesService.remove(id, tenantId);
  }
}
```

---

## 2. Auth decorators

All routes are **protected by default** via the global `JwtAuthGuard`. Use `@Public()` to
opt out.

| Decorator                     | Source      | Effect                                                       |
| ----------------------------- | ----------- | ------------------------------------------------------------ |
| _(none)_                      | global      | Route requires valid JWT                                     |
| `@Public()`                   | `@app/core` | Route is public — no JWT required                            |
| `@RequireRoles(...roles)`     | `@app/core` | Route additionally requires one of the listed roles          |
| `@IsAdmin()`                  | `@app/core` | Shorthand for `@RequireRoles(ADMIN, SUPER_ADMIN)`            |

```typescript
// Public endpoint
@Public()
@Post('login')
login(@Body() body: LoginDto) { ... }

// Any authenticated user
@Get('me')
getMe(@User() user: AuthUser) { ... }

// ADMIN or SUPER_ADMIN only
@RequireRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Post()
create(...) { ... }

// SUPER_ADMIN only
@RequireRoles(UserRole.SUPER_ADMIN)
@Get()
listAllTenants(...) { ... }
```

**SUPER_ADMIN** automatically bypasses all role checks in `RolesGuard`. You still declare
`@RequireRoles(UserRole.SUPER_ADMIN)` for clarity and Swagger docs, but it is not enforced
additionally.

---

## 3. Extracting tenant & user from JWT

The JWT payload is typed as `AuthUser`:

```typescript
type AuthUser = {
  sub: string;      // userId
  email: string;
  role: string;     // UserRole enum value
  tenantId: string;
  iat?: number;
  exp?: number;
};
```

Use the `@User()` decorator (from `@app/core`) to extract fields:

```typescript
// Full AuthUser object
@User() user: AuthUser

// Single field shortcut
@User('tenantId') tenantId: string
@User('sub') userId: string
@User('role') role: string
```

**Rule**: always pass `tenantId` (extracted from JWT) down to the service and then to the
repository. Never trust a `tenantId` from the request body or query params for non-SUPER_ADMIN
endpoints.

---

## 4. Response & serialization

The global `ResponseInterceptor` wraps every response in the standard envelope.
The `SerializerInterceptor` transforms response data using `@Expose()` / `@Exclude()`.

Decorate controller methods with:

```typescript
@Serialize(MyResponseDto)          // triggers class-transformer serialization
@ApiSuccessResponse(MyResponseDto, 'Human-readable success message')
```

Both decorators come from `@app/core`. `@Serialize` sets the response DTO class;
`@ApiSuccessResponse` adds the Swagger `@ApiResponse` annotation automatically.

For paginated responses, use `PaginationResponse` from `@app/core` and the matching
response DTO. The `PaginatedResult<T>` type is returned by `findPagination()` in
`BaseRepository` and is automatically wrapped by `ResponseInterceptor`.

---

## 5. Response shape reference

**Single item success:**
```json
{ "message": "Device retrieved", "status": 200, "data": { ... } }
```

**Paginated success:**
```json
{
  "message": "Devices retrieved",
  "status": 200,
  "data": {
    "items": [...],
    "pagination": { "page": 1, "pageSize": 10, "total": 42, "totalPages": 5 }
  }
}
```

**Error:**
```json
{ "message": "DEVICE_NOT_FOUND", "status": 404, "data": {} }
```

Never manually construct this shape in a controller. The global interceptors and filters
handle it automatically.

---

## 6. Input DTOs

Input DTOs live in `modules/<feature>/dto/`. Use `class-validator` decorators for validation.

```typescript
// modules/devices/dto/create-device.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { DeviceProtocol } from '@prisma/client';

export class CreateDeviceDto {
  @ApiProperty({ example: '356938035643809' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{15}$/, { message: 'IMEI must be exactly 15 digits' })
  imei: string;

  @ApiProperty({ example: 'Truck 01' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ enum: DeviceProtocol })
  @IsEnum(DeviceProtocol)
  protocol: DeviceProtocol;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  simCardNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
```

For paginated list DTOs, extend `PagingDto` from `@app/core`:

```typescript
// modules/devices/dto/list-devices.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PagingDto } from '@app/core';

export class ListDevicesDto extends PagingDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  keyword?: string;
}
```

`PagingDto` already provides validated `page` and `pageSize` fields with defaults.

---

## 7. Response DTOs (serialization)

Response DTOs live in `modules/<feature>/responses/`. They use `class-transformer`
decorators with `@Expose()` / `@Exclude()`.

```typescript
// modules/devices/responses/device.response.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()  // exclude all fields by default
export class DeviceResponse {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  tenantId: string;

  @Expose()
  @ApiProperty()
  imei: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  protocol: string;

  @Expose()
  @ApiPropertyOptional()
  simCardNumber: string | null;

  @Expose()
  @ApiProperty()
  registrationStatus: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}
```

For a paginated list response, wrap the item DTO:

```typescript
// modules/devices/responses/device-list.response.ts
import { PaginationResponse } from '@app/core';
import { DeviceResponse } from './device.response';

export class DeviceListResponse extends PaginationResponse(DeviceResponse) {}
```

---

## 8. Error handling

### 8a. Error code constants

Every feature module defines its own error code constants in `constants/<feature>.error-codes.ts`.
The error code string IS the error message — it is machine-readable and used by clients for
programmatic error handling (e.g. translating to localised UI text).

Error code strings follow the pattern `DOMAIN_SNAKE_CASE_DESCRIPTION` in SCREAMING_SNAKE_CASE.

```typescript
// modules/devices/constants/devices.error-codes.ts
export const DEVICE_ERROR_CODES = {
  NOT_FOUND: 'DEVICE_NOT_FOUND',
  IMEI_ALREADY_EXISTS: 'DEVICE_IMEI_ALREADY_EXISTS',
  UPDATE_EMPTY_PAYLOAD: 'DEVICE_UPDATE_EMPTY_PAYLOAD',
} as const;
```

```typescript
// modules/auth/constants/auth.error-codes.ts
export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  REFRESH_TOKEN_REVOKED: 'AUTH_REFRESH_TOKEN_REVOKED',
  USER_INACTIVE: 'AUTH_USER_INACTIVE',
  INVALID_REFRESH_TOKEN: 'AUTH_INVALID_REFRESH_TOKEN',
  INVALID_ACCESS_TOKEN: 'AUTH_INVALID_ACCESS_TOKEN',
} as const;
```

```typescript
// modules/positions/constants/positions.error-codes.ts
export const POSITION_ERROR_CODES = {
  DEVICE_NOT_FOUND_OR_NO_DATA: 'POSITION_DEVICE_NOT_FOUND_OR_NO_DATA',
} as const;
```

For errors thrown from global guards/utils inside `@app/core`, use `COMMON_ERROR_CODES`:

```typescript
// libs/core/src/constants/error-codes.constant.ts
export const COMMON_ERROR_CODES = {
  FORBIDDEN: 'FORBIDDEN',
} as const;
```

### 8b. Throwing errors

Throw project-defined `Api*HttpError` classes (from `@app/core/responses`) — always passing
an error code constant, **never a raw string literal**.

```typescript
import { Api400HttpError, Api404HttpError, Api409HttpError } from '@app/core';
import { DEVICE_ERROR_CODES } from './constants/devices.error-codes';

// ✅ Correct — error code constant
async findOne(id: string, tenantId: string): Promise<DeviceRow> {
  const device = await this.devicesRepo.findById(id, tenantId);
  if (!device) throw new Api404HttpError(DEVICE_ERROR_CODES.NOT_FOUND);
  return device;
}

// ❌ Wrong — raw string literal
if (!device) throw new Api404HttpError('Device not found');

// ❌ Wrong — never use raw Error or NestJS HttpException directly
if (!device) throw new Error('not found');
if (!device) throw new NotFoundException('Device not found');
```

Available error classes and their HTTP status:

| Class                        | Status | Use for                              |
| ---------------------------- | ------ | ------------------------------------ |
| `Api400HttpError`            | 400    | Bad request, invalid input           |
| `Api401HttpError`            | 401    | Unauthenticated                      |
| `Api403HttpError`            | 403    | Forbidden (wrong role/permission)    |
| `Api404HttpError`            | 404    | Resource not found                   |
| `Api409HttpError`            | 409    | Conflict (duplicate, state mismatch) |
| `ApiTimeoutHttpError`        | 408    | Timeout                              |
| `ApiInternalServerHttpError` | 500    | Unexpected server error              |

The global `HttpExceptionFilter` catches all `Api*HttpError` throws and formats the response:
```json
{ "message": "DEVICE_NOT_FOUND", "status": 404, "data": {} }
```

**Rules:**
- Error codes are defined **per feature module** — never hardcode strings in `throw` statements.
- `COMMON_ERROR_CODES` in `@app/core` is reserved for errors thrown by global guards/utils only.
- Never throw from a controller — only from services (and rarely from guards/utils).
- Treat "not found due to wrong tenantId" the same as "not found" — never expose
  cross-tenant existence information via error messages.

---

## 9. Swagger documentation

Use `@ApiTags`, `@ApiOperation`, `@ApiParam`, `@ApiQuery` from `@nestjs/swagger`.
Use `@ApiSuccessResponse` from `@app/core` for response documentation (wraps `@ApiResponse`).

```typescript
@Controller('devices')
@ApiTags('Devices')
export class DevicesController {

  @Get(':id')
  @ApiOperation({ summary: 'Get device by ID' })
  @ApiParam({ name: 'id', description: 'Device UUID' })
  @Serialize(DeviceResponse)
  @ApiSuccessResponse(DeviceResponse, 'Device retrieved')
  findOne(
    @User('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) { ... }
}
```

Swagger UI is served at `http://localhost:3000/docs`.

---

## 10. Role-based access control

`RolesGuard` is registered globally. It reads the metadata set by `@RequireRoles(...)`.

| Role          | Access                                                                |
| ------------- | --------------------------------------------------------------------- |
| `USER`        | Read-only endpoints for their own tenant's data                       |
| `ADMIN`       | Full CRUD on their own tenant's data                                  |
| `SUPER_ADMIN` | All endpoints — bypasses all role checks; can access cross-tenant data |

**Pattern for SUPER_ADMIN cross-tenant endpoints:**

```typescript
// controller — only SUPER_ADMIN can call this
@Get()
@RequireRoles(UserRole.SUPER_ADMIN)
@Serialize(TenantListResponse)
@ApiSuccessResponse(TenantListResponse, 'Tenants retrieved')
listTenants(@Query() query: ListTenantsDto) {
  return this.tenantsService.listAll(query);
}
```

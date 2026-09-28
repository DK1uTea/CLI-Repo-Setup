import { ApiSuccessResponse, RequireRoles, Serialize, User } from '@app/core';
import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { ListUsersDto, UpdateUserRoleDto } from './dto';
import { ListUsersResponseDto, UserAdminItemResponseDto } from './responses';
import { UsersService } from './users.service';

/**
 * Admin user management. SUPER_ADMIN only (Prowerb) — cross-tenant.
 * Approves / rejects self-registered Entra (SSO) users.
 */
@ApiTags('Users')
@RequireRoles(UserRole.SUPER_ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Serialize(ListUsersResponseDto)
  @ApiOperation({ summary: 'List users, optionally filtered by tenant/approval status' })
  @ApiSuccessResponse(ListUsersResponseDto, 'Users retrieved')
  list(@Query() query: ListUsersDto): Promise<ListUsersResponseDto> {
    return this.usersService.list(query);
  }

  @Patch(':id/approve')
  @Serialize(UserAdminItemResponseDto)
  @ApiOperation({ summary: 'Approve a pending user' })
  @ApiSuccessResponse(UserAdminItemResponseDto, 'User approved')
  approve(
    @User('sub') approverId: string,
    @Param('id') id: string,
  ): Promise<UserAdminItemResponseDto> {
    return this.usersService.approve(id, approverId);
  }

  @Patch(':id/reject')
  @Serialize(UserAdminItemResponseDto)
  @ApiOperation({ summary: 'Reject a user (revokes access)' })
  @ApiSuccessResponse(UserAdminItemResponseDto, 'User rejected')
  reject(
    @User('sub') approverId: string,
    @Param('id') id: string,
  ): Promise<UserAdminItemResponseDto> {
    return this.usersService.reject(id, approverId);
  }

  @Patch(':id/role')
  @Serialize(UserAdminItemResponseDto)
  @ApiOperation({ summary: 'Change a user role' })
  @ApiSuccessResponse(UserAdminItemResponseDto, 'User role updated')
  updateRole(
    @User('sub') approverId: string,
    @Param('id') id: string,
    @Body() body: UpdateUserRoleDto,
  ): Promise<UserAdminItemResponseDto> {
    return this.usersService.updateRole(id, approverId, body);
  }
}

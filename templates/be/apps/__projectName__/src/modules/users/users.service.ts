import { Api404HttpError, Api409HttpError, DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@app/core';
import { type IUsersRepository, USERS_REPOSITORY, type UserAdminItem } from '@app/layer-data';
import { Inject, Injectable } from '@nestjs/common';
import { UserApprovalStatus } from '@prisma/client';

import { USER_ERROR_CODES } from './constants/users.error-codes';
import type { ListUsersDto, UpdateUserRoleDto } from './dto';
import type { ListUsersResponseDto } from './responses';

/**
 * Admin user management — SUPER_ADMIN only, intentionally cross-tenant.
 * Handles the Entra self-registration approval workflow (approve / reject).
 */
@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepo: IUsersRepository,
  ) {}

  list(dto: ListUsersDto): Promise<ListUsersResponseDto> {
    return this.usersRepo.list({
      tenantId: dto.tenantId,
      approvalStatus: dto.approvalStatus,
      keyword: dto.keyword,
      page: dto.page ?? DEFAULT_PAGE,
      pageSize: dto.pageSize ?? DEFAULT_PAGE_SIZE,
    });
  }

  approve(id: string, approverId: string): Promise<UserAdminItem> {
    return this.setApprovalStatus(id, UserApprovalStatus.APPROVED, approverId);
  }

  reject(id: string, approverId: string): Promise<UserAdminItem> {
    return this.setApprovalStatus(id, UserApprovalStatus.REJECTED, approverId);
  }

  async updateRole(id: string, approverId: string, dto: UpdateUserRoleDto): Promise<UserAdminItem> {
    this.assertNotSelf(id, approverId);
    const updated = await this.usersRepo.setRole(id, dto.role);
    if (!updated) throw new Api404HttpError(USER_ERROR_CODES.NOT_FOUND);
    return updated;
  }

  private async setApprovalStatus(
    id: string,
    status: UserApprovalStatus,
    approverId: string,
  ): Promise<UserAdminItem> {
    this.assertNotSelf(id, approverId);
    const updated = await this.usersRepo.setApprovalStatus(id, status, approverId);
    if (!updated) throw new Api404HttpError(USER_ERROR_CODES.NOT_FOUND);
    return updated;
  }

  private assertNotSelf(id: string, approverId: string): void {
    if (id === approverId) throw new Api409HttpError(USER_ERROR_CODES.CANNOT_MODIFY_SELF);
  }
}

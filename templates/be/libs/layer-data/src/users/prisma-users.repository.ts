import { BaseRepository, PrismaService } from '@app/third-party';
import { Injectable } from '@nestjs/common';
import type { Prisma, UserApprovalStatus, UserRole } from '@prisma/client';
import type { IUsersRepository } from './users.repository';
import type {
  CreateEntraUserInput,
  LinkEntraIdentityInput,
  UpdateUserInput,
  UserAdminItem,
  UserCredentialRow,
  UserProfileRow,
  UsersListFilter,
  UsersListResult,
} from './users.types';

const USER_CREDENTIAL_SELECT = {
  id: true,
  email: true,
  passwordHash: true,
  role: true,
  tenantId: true,
  isActive: true,
  approvalStatus: true,
  authProvider: true,
} as const satisfies Prisma.UserSelect;

const USER_PROFILE_SELECT = {
  id: true,
  email: true,
  name: true,
  avatar: true,
  role: true,
  tenantId: true,
  isActive: true,
  approvalStatus: true,
} as const satisfies Prisma.UserSelect;

const USER_ADMIN_SELECT = {
  id: true,
  email: true,
  name: true,
  avatar: true,
  role: true,
  tenantId: true,
  isActive: true,
  authProvider: true,
  approvalStatus: true,
  createdAt: true,
} as const satisfies Prisma.UserSelect;

@Injectable()
export class PrismaUsersRepository
  extends BaseRepository<PrismaService['user']>
  implements IUsersRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected get model(): PrismaService['user'] {
    return this.prisma.user;
  }

  findByEmail(email: string): Promise<UserCredentialRow | null> {
    return this.findUnique({
      where: { email },
      select: USER_CREDENTIAL_SELECT,
    }) as Promise<UserCredentialRow | null>;
  }

  findCredentialById(userId: string): Promise<UserCredentialRow | null> {
    return this.findUnique({
      where: { id: userId },
      select: USER_CREDENTIAL_SELECT,
    }) as Promise<UserCredentialRow | null>;
  }

  findById(userId: string): Promise<UserProfileRow | null> {
    return this.findUnique({
      where: { id: userId },
      select: USER_PROFILE_SELECT,
    }) as Promise<UserProfileRow | null>;
  }

  updateById(id: string, data: UpdateUserInput): Promise<UserProfileRow | null> {
    return this.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        avatar: data.avatar,
      },
      select: USER_PROFILE_SELECT,
    }) as Promise<UserProfileRow | null>;
  }

  async updatePasswordHashById(id: string, passwordHash: string): Promise<void> {
    await this.update({
      where: { id },
      data: { passwordHash },
      select: { id: true },
    });
  }

  // -------------------------------------------------------------------------
  // Entra SSO
  // -------------------------------------------------------------------------

  findByEntraOid(entraOid: string): Promise<UserCredentialRow | null> {
    return this.findFirst({
      where: { entraOid },
      select: USER_CREDENTIAL_SELECT,
    }) as Promise<UserCredentialRow | null>;
  }

  createEntraUser(input: CreateEntraUserInput): Promise<UserCredentialRow> {
    return this.model.create({
      data: {
        email: input.email,
        name: input.name,
        entraOid: input.entraOid,
        entraTid: input.entraTid,
        tenantId: input.tenantId,
        authProvider: 'ENTRA',
        approvalStatus: input.approvalStatus ?? 'PENDING',
        isActive: true,
      },
      select: USER_CREDENTIAL_SELECT,
    }) as Promise<UserCredentialRow>;
  }

  linkEntraIdentity(userId: string, input: LinkEntraIdentityInput): Promise<UserCredentialRow> {
    return this.update({
      where: { id: userId },
      data: { entraOid: input.entraOid, entraTid: input.entraTid },
      select: USER_CREDENTIAL_SELECT,
    }) as Promise<UserCredentialRow>;
  }

  // -------------------------------------------------------------------------
  // Admin (SUPER_ADMIN, cross-tenant)
  // -------------------------------------------------------------------------

  async list(filter: UsersListFilter): Promise<UsersListResult> {
    const where = this.buildListWhere(filter);

    const { items, pagination } = await this.findPagination(
      {
        where,
        orderBy: { createdAt: 'desc' },
        select: USER_ADMIN_SELECT,
      },
      { page: filter.page, pageSize: filter.pageSize },
    );

    return { items: items as UserAdminItem[], pagination };
  }

  findAdminById(id: string): Promise<UserAdminItem | null> {
    return this.findUnique({
      where: { id },
      select: USER_ADMIN_SELECT,
    }) as Promise<UserAdminItem | null>;
  }

  async setApprovalStatus(
    id: string,
    status: UserApprovalStatus,
    approvedById: string,
  ): Promise<UserAdminItem | null> {
    const result = await this.model.updateMany({
      where: { id },
      data: {
        approvalStatus: status,
        approvedById,
        approvedAt: new Date(),
        // Rejected users lose access immediately; approved users stay active.
        isActive: status === 'APPROVED',
      },
    });
    if (result.count === 0) return null;
    return this.findAdminById(id);
  }

  async setRole(id: string, role: UserRole): Promise<UserAdminItem | null> {
    const result = await this.model.updateMany({ where: { id }, data: { role } });
    if (result.count === 0) return null;
    return this.findAdminById(id);
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private buildListWhere(filter: UsersListFilter): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};

    if (filter.tenantId !== undefined) where.tenantId = filter.tenantId;
    if (filter.approvalStatus !== undefined) where.approvalStatus = filter.approvalStatus;

    const keyword = filter.keyword;
    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { email: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}

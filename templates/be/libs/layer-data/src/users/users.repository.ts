import type { UserApprovalStatus, UserRole } from '@prisma/client';
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

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');

export interface IUsersRepository {
  findByEmail(email: string): Promise<UserCredentialRow | null>;

  findCredentialById(userId: string): Promise<UserCredentialRow | null>;

  findById(userId: string): Promise<UserProfileRow | null>;

  updateById(id: string, data: UpdateUserInput): Promise<UserProfileRow | null>;

  updatePasswordHashById(id: string, passwordHash: string): Promise<void>;

  // --- Entra SSO ---

  /** Tìm user theo Entra object id (oid). Global — không có tenantId filter. */
  findByEntraOid(entraOid: string): Promise<UserCredentialRow | null>;

  /** Tạo user mới từ Entra identity (approvalStatus = PENDING, authProvider = ENTRA). */
  createEntraUser(input: CreateEntraUserInput): Promise<UserCredentialRow>;

  /** Gắn Entra identity vào user đã tồn tại (link theo email). */
  linkEntraIdentity(userId: string, input: LinkEntraIdentityInput): Promise<UserCredentialRow>;

  // --- Admin (SUPER_ADMIN, cross-tenant) ---

  /**
   * Danh sách user phân trang cho admin.
   * Cross-tenant khi filter.tenantId = undefined (chỉ dùng cho SUPER_ADMIN endpoint).
   */
  list(filter: UsersListFilter): Promise<UsersListResult>;

  /** Lấy 1 user bất kỳ tenant theo id (SUPER_ADMIN). Trả null nếu không tồn tại. */
  findAdminById(id: string): Promise<UserAdminItem | null>;

  /**
   * Cập nhật approvalStatus (approve/reject) — SUPER_ADMIN cross-tenant.
   * Trả null nếu user không tồn tại.
   */
  setApprovalStatus(
    id: string,
    status: UserApprovalStatus,
    approvedById: string,
  ): Promise<UserAdminItem | null>;

  /** Cập nhật role — SUPER_ADMIN cross-tenant. Trả null nếu user không tồn tại. */
  setRole(id: string, role: UserRole): Promise<UserAdminItem | null>;
}

// Re-export types để consumer import từ 1 chỗ
export type {
  CreateEntraUserInput,
  LinkEntraIdentityInput,
  UserAdminItem,
  UserCredentialRow,
  UserProfileRow,
  UsersListFilter,
  UsersListResult,
};

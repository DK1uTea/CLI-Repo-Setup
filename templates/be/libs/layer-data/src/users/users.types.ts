import type { KeywordPagingQuery, PaginatedResult } from '@app/core';
import type { AuthProvider, UserApprovalStatus, UserRole } from '@prisma/client';

// ---------------------------------------------------------------------------
// Entity — shape của row DB trả về
// ---------------------------------------------------------------------------

export interface UserCredentialRow {
  id: string;
  email: string;
  passwordHash: string | null;
  role: UserRole;
  tenantId: string;
  isActive: boolean;
  approvalStatus: UserApprovalStatus;
  authProvider: AuthProvider;
}

export interface UserProfileRow {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: UserRole;
  tenantId: string;
  isActive: boolean;
  approvalStatus: UserApprovalStatus;
}

// Admin projection — dùng cho SUPER_ADMIN quản lý / duyệt user (cross-tenant)
export interface UserAdminItem {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: UserRole;
  tenantId: string;
  isActive: boolean;
  authProvider: AuthProvider;
  approvalStatus: UserApprovalStatus;
  createdAt: Date;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  avatar?: string | null;
}

export interface UpdateUserPasswordInput {
  passwordHash: string;
}

// ---------------------------------------------------------------------------
// Entra SSO — input types
// ---------------------------------------------------------------------------

export interface CreateEntraUserInput {
  email: string;
  name: string;
  entraOid: string;
  entraTid: string;
  tenantId: string;
  /** Defaults to PENDING when omitted (auto-approve domains pass APPROVED). */
  approvalStatus?: UserApprovalStatus;
}

export interface LinkEntraIdentityInput {
  entraOid: string;
  entraTid: string;
}

// ---------------------------------------------------------------------------
// Admin list — filter & result
// ---------------------------------------------------------------------------

export interface UsersListFilter extends KeywordPagingQuery {
  /** undefined = tất cả tenants (SUPER_ADMIN only) */
  tenantId?: string;
  approvalStatus?: UserApprovalStatus;
}

export type UsersListResult = PaginatedResult<UserAdminItem>;

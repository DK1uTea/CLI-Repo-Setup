import { UserRole } from '@prisma/client';

import { COMMON_ERROR_CODES } from '../constants';
import { Api403HttpError } from '../responses';

export function resolveTenantScope(params: {
  tenantId: string;
  role: UserRole;
  requestedTenantId?: string;
}): string | undefined {
  const { tenantId, role, requestedTenantId } = params;
  const isSuperAdmin = role === UserRole.SUPER_ADMIN;

  if (!isSuperAdmin && requestedTenantId) {
    throw new Api403HttpError(COMMON_ERROR_CODES.FORBIDDEN);
  }

  return isSuperAdmin ? requestedTenantId : tenantId;
}

/**
 * Cross-tenant READ visibility grants (operator-style access).
 *
 * A tenant listed here may read the data of every tenant in its array, in addition to
 * its own. This is intentionally NOT symmetric and applies to READS only — write paths
 * stay pinned to the caller's own JWT `tenantId` and never consult this map.
 *
 * Extend this map to grant multi-tenant read visibility if required by your application.
 */
export const TENANT_READ_VISIBILITY: Record<string, string[]> = {};

/**
 * Resolve the tenant scope for READ endpoints, honouring cross-tenant visibility grants.
 *
 * Return value feeds the repository `where` clause:
 * - `undefined`  → no tenant filter (SUPER_ADMIN reading all tenants)
 * - `string`     → single-tenant filter (`tenant_id = x`)
 * - `string[]`   → multi-tenant filter (`tenant_id IN (...)`) for granted operators
 *
 * A non-SUPER_ADMIN may only request a tenant that is inside its own visibility set;
 * anything else is forbidden. Never let a normal user override its JWT tenant arbitrarily.
 */
export function resolveTenantReadScope(params: {
  tenantId: string;
  role: UserRole;
  requestedTenantId?: string;
}): string | string[] | undefined {
  const { tenantId, role, requestedTenantId } = params;

  if (role === UserRole.SUPER_ADMIN) {
    // undefined = all tenants; a specific requestedTenantId narrows to that one tenant.
    return requestedTenantId;
  }

  const visibility = TENANT_READ_VISIBILITY[tenantId] ?? [tenantId];

  if (requestedTenantId) {
    if (!visibility.includes(requestedTenantId)) {
      throw new Api403HttpError(COMMON_ERROR_CODES.FORBIDDEN);
    }
    return requestedTenantId;
  }

  return visibility.length === 1 ? visibility[0] : visibility;
}

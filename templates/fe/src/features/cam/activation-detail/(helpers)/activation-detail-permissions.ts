import { PERMISSIONS, PERMISSION_ALL_WILDCARD } from '@/shared/constants/permissions';

const ACTIVITY_VIEW_PERMISSIONS = [
  PERMISSION_ALL_WILDCARD,
  PERMISSIONS.CustomerActivation.InternalAdmin,
  PERMISSIONS.CustomerActivation.PrintingAgency,
  PERMISSIONS.CustomerActivation.InstallerAgency,
] as const;

const BRIEFING_VIEW_PERMISSIONS = [
  PERMISSION_ALL_WILDCARD,
  PERMISSIONS.CustomerActivation.InternalAdmin,
  PERMISSIONS.CustomerActivation.Sale,
] as const;

export function canViewActivationActivity(permissions?: readonly string[] | null) {
  return permissions?.some((permission) => ACTIVITY_VIEW_PERMISSIONS.includes(permission as (typeof ACTIVITY_VIEW_PERMISSIONS)[number])) ?? false;
}

export function canViewActivationBriefing(permissions?: readonly string[] | null) {
  if (!permissions || permissions.length === 0) return true;
  return permissions.some((permission) =>
    BRIEFING_VIEW_PERMISSIONS.includes(permission as (typeof BRIEFING_VIEW_PERMISSIONS)[number]),
  );
}

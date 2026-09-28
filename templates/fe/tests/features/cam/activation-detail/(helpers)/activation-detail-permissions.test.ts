import { describe, expect, it } from 'vitest';

import { PERMISSIONS, PERMISSION_ALL_WILDCARD } from '@/shared/constants/permissions';
import { canViewActivationActivity } from '@/features/cam/activation-detail/(helpers)/activation-detail-permissions';

describe('canViewActivationActivity', () => {
  it.each([
    [PERMISSION_ALL_WILDCARD],
    [PERMISSIONS.CustomerActivation.InternalAdmin],
    [PERMISSIONS.CustomerActivation.PrintingAgency],
    [PERMISSIONS.CustomerActivation.InstallerAgency],
  ])('allows activity access for %s', (permission) => {
    expect(canViewActivationActivity([permission])).toBe(true);
  });

  it('denies activity access for Sale and users without a CAM role', () => {
    expect(canViewActivationActivity([PERMISSIONS.CustomerActivation.Sale])).toBe(false);
    expect(canViewActivationActivity([])).toBe(false);
  });
});

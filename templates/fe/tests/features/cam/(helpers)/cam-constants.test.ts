import { describe, expect, it } from 'vitest';

import {
  ACTIVATION_BOARD_COLUMNS,
  ACTIVATION_NEXT_STATUS,
  ACTIVATION_QUICK_ADVANCE_STATUS,
  ACTIVATION_READ_ONLY_STATUSES,
  ACTIVATION_STATUS,
  getActivationStatusTranslationKey,
  getActivationStatusVariant,
} from '@/features/cam/(helpers)/cam-constants';

describe('CAM activation status constants', () => {
  it('hides cancelled records from board columns', () => {
    expect(ACTIVATION_BOARD_COLUMNS).not.toContain(ACTIVATION_STATUS.CANCELLED);
    expect(ACTIVATION_BOARD_COLUMNS).toHaveLength(8);
  });

  it('keeps full status graph separate from dashboard quick advance graph', () => {
    expect(ACTIVATION_NEXT_STATUS.REVIEW).toBe(ACTIVATION_STATUS.APPROVED);
    expect(ACTIVATION_QUICK_ADVANCE_STATUS.REVIEW).toBeUndefined();
  });

  it('marks approved and later workflow states as scoring read-only', () => {
    expect(ACTIVATION_READ_ONLY_STATUSES).toEqual([
      'APPROVED',
      'IN_PROGRESS',
      'INSTALLATION',
      'COMPLETED',
    ]);
  });

  it('maps known and unknown statuses to translation keys and badge variants', () => {
    expect(getActivationStatusTranslationKey('READY')).toBe('status.statusReady');
    expect(getActivationStatusTranslationKey('UNKNOWN')).toBeNull();
    expect(getActivationStatusVariant('CANCELLED')).toBe('cancelled');
    expect(getActivationStatusVariant('UNKNOWN')).toBe('draft');
  });
});

import { describe, expect, it } from 'vitest';

import { isLockedGroup } from '@/features/reporting-tool/trade-fair-survey-form/(hooks)/use-group-action';
import {
  TYPES_WITH_OPTIONS,
  TYPES_WITHOUT_PLACEHOLDER,
  createCheckboxOptionValue,
} from '@/features/reporting-tool/trade-fair-survey-form/(hooks)/use-question-form';

describe('survey builder guards', () => {
  it('locks the first group of the fixed first step', () => {
    expect(isLockedGroup({ position: 0, questions: [] }, 0)).toBe(true);
  });

  it('locks any group containing a backend field key', () => {
    expect(isLockedGroup({ position: 2, questions: [{ field_key: 'email' }] }, 1)).toBe(true);
  });

  it('leaves a custom group without field keys editable', () => {
    expect(isLockedGroup({ position: 1, questions: [{ field_key: null }] }, 0)).toBe(false);
  });

  it('defines exactly which types render options and hide placeholders', () => {
    expect(TYPES_WITH_OPTIONS).toEqual([
      'SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'DROPDOWN',
      'MULTI_SELECT_DROPDOWN', 'DROPDOWN_ADD_ON',
    ]);
    expect(TYPES_WITHOUT_PLACEHOLDER).toEqual([
      'TOGGLE', 'RATING', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'CHECKBOX_GROUP', 'YES_NO',
    ]);
  });

  it('creates unique checkbox option values with the contract prefix', () => {
    const first = createCheckboxOptionValue();
    const second = createCheckboxOptionValue();
    expect(first).toMatch(/^checkbox_/);
    expect(second).toMatch(/^checkbox_/);
    expect(first).not.toBe(second);
  });
});

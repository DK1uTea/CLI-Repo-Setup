import { describe, expect, it } from 'vitest';

import {
  getCheckboxGroups,
  getQuestionOptions,
  isCheckboxGroup,
} from '@/features/reporting-tool/(helpers)/survey-question-option-helper';

const flat = { label: 'One', value: 'one' };
const grouped = { label: 'Group', options: [{ label: 'Two', value: 'two' }] };

describe('survey question option helpers', () => {
  it('identifies grouped options only when options is an array', () => {
    expect(isCheckboxGroup(grouped)).toBe(true);
    expect(isCheckboxGroup(flat)).toBe(false);
  });

  it('returns only flat question options from mixed metadata', () => {
    expect(getQuestionOptions({ options: [flat, grouped] as never })).toEqual([flat]);
  });

  it('returns only checkbox groups from mixed metadata', () => {
    expect(getCheckboxGroups({ options: [flat, grouped] as never })).toEqual([grouped]);
  });

  it('returns empty arrays when metadata or options are absent', () => {
    expect(getQuestionOptions()).toEqual([]);
    expect(getCheckboxGroups({})).toEqual([]);
  });
});

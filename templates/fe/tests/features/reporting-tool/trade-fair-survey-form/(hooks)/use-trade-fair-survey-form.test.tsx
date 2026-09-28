import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useTradeFairSurveyForm } from '@/features/reporting-tool/trade-fair-survey-form/(hooks)/use-trade-fair-survey-form';

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('nuqs', () => ({
  parseAsString: { withDefault: () => ({}) },
  useQueryState: (_key: string, parser?: unknown) => [parser ? 'survey' : null, vi.fn()],
}));

describe('useTradeFairSurveyForm', () => {
  it('restores the initialized values when reset is called without a payload', () => {
    const { result } = renderHook(() => useTradeFairSurveyForm({ name: 'Original survey' }));

    act(() => {
      result.current.methods.setValue('name', 'Edited survey', { shouldDirty: true });
      result.current.methods.reset();
    });

    expect(result.current.methods.getValues('name')).toBe('Original survey');
    expect(result.current.methods.formState.isDirty).toBe(false);
  });
});

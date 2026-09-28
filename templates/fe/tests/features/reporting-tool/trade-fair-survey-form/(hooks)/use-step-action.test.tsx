import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { TradeFairSurveyFormDto } from '@/features/reporting-tool/trade-fair-survey-form/(helpers)/trade-fair-survey-form-schema';
import { useStepAction } from '@/features/reporting-tool/trade-fair-survey-form/(hooks)/use-step-action';

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));

const initialValues: TradeFairSurveyFormDto = {
  name: '',
  steps: [{
    title: 'General Information',
    position: 0,
    groups: [{
      title: 'Contact Information',
      position: 0,
      isDisable: false,
      questions: [{
        content: 'First name',
        type: 'SHORT_TEXT',
        position: 0,
        isRequired: true,
        isDisable: false,
        metadata: null,
      }],
    }],
  }],
};

let methods: UseFormReturn<TradeFairSurveyFormDto>;

const wrapper = ({ children }: { children: ReactNode }) => {
  methods = useForm<TradeFairSurveyFormDto>({ defaultValues: initialValues });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('useStepAction', () => {
  it('creates a new step with one default group and question', () => {
    const { result } = renderHook(() => useStepAction(), { wrapper });

    act(() => result.current.addStep());

    const steps = methods.getValues('steps');
    expect(steps).toHaveLength(2);
    expect(steps[1]?.groups).toHaveLength(1);
    expect(steps[1]?.groups[0]?.questions).toHaveLength(1);
    expect(steps[1]?.groups[0]?.questions[0]).toMatchObject({
      content: 'question',
      type: 'SHORT_TEXT',
      isDisable: false,
    });
  });
});

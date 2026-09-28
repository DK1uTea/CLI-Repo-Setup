import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import type { EventFormDto } from '@/features/events/event-form/(helpers)/event-form-schema';
import { usePermanentLoanPrivacy } from '@/features/events/event-form/(hooks)/use-permanent-loan-privacy';

vi.mock('@/features/events/event-form/(hooks)/use-get-event-type', () => ({
  useGetEventType: () => ({
    eventTypes: [
      { id: 'dauerleihgabe', name: 'Dauerleihgabe' },
      { id: 'permanent-loan', name: 'Permanent Loan' },
      { id: 'conference', name: 'Conference' },
    ],
  }),
}));

function Wrapper({ children }: { children: ReactNode }) {
  const methods = useForm<EventFormDto>({
    defaultValues: { eventTypeId: '', doNotPublish: false } as EventFormDto,
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

function usePrivacyTestHarness() {
  const privacy = usePermanentLoanPrivacy();
  const form = useFormContext<EventFormDto>();
  return { ...privacy, form };
}

describe('usePermanentLoanPrivacy', () => {
  it('checks Do not publish for Dauerleihgabe but still allows it to be unchecked', async () => {
    const { result } = renderHook(usePrivacyTestHarness, { wrapper: Wrapper });

    act(() => {
      result.current.form.setValue('eventTypeId', 'dauerleihgabe');
      result.current.applyEventTypePrivacy('dauerleihgabe');
    });

    await waitFor(() => expect(result.current.form.getValues('doNotPublish')).toBe(true));
    expect(result.current.isPermanentLoan).toBe(false);

    act(() => result.current.form.setValue('doNotPublish', false));

    expect(result.current.form.getValues('doNotPublish')).toBe(false);
  });

  it('checks Do not publish and reports the checkbox as locked for Permanent Loan', async () => {
    const { result } = renderHook(usePrivacyTestHarness, { wrapper: Wrapper });

    act(() => {
      result.current.form.setValue('eventTypeId', 'permanent-loan');
      result.current.applyEventTypePrivacy('permanent-loan');
    });

    await waitFor(() => expect(result.current.form.getValues('doNotPublish')).toBe(true));
    expect(result.current.isPermanentLoan).toBe(true);
  });

  it('does not change Do not publish for other event types', () => {
    const { result } = renderHook(usePrivacyTestHarness, { wrapper: Wrapper });

    act(() => result.current.applyEventTypePrivacy('conference'));

    expect(result.current.form.getValues('doNotPublish')).toBe(false);
    expect(result.current.isPermanentLoan).toBe(false);
  });
});

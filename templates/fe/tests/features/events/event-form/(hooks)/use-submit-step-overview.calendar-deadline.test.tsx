import { act, renderHook } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { apiProxy } from '@/lib/api';
import { useSubmitStepOverview } from '@/features/events/event-form/(hooks)/use-submit-step-overview';
import type { EventFormDto } from '@/features/events/event-form/(helpers)/event-form-schema';

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('nuqs', () => ({ parseAsString: {}, useQueryState: () => [null, vi.fn()] }));
vi.mock('@/i18n/navigation', () => ({ usePathname: () => '/calendar-dashboard/new-calendar-event' }));
vi.mock('@/lib/api', () => ({ apiProxy: { post: vi.fn().mockResolvedValue({ data: { data: { id: 'event-1' } } }) } }));
const { useEventDeadlineMock } = vi.hoisted(() => ({ useEventDeadlineMock: vi.fn() }));
vi.mock('@/features/events/event-form/(hooks)/use-event-deadline', () => ({
  useEventDeadline: useEventDeadlineMock,
}));
vi.mock('@/features/events/event-form/(hooks)/use-upload-event-files', () => ({
  useUploadEventFiles: () => ({ uploadFiles: vi.fn(), isUploading: false }),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm<EventFormDto>({
    defaultValues: {
      customEventId: 'EVENT-100001',
      title: 'Calendar Event',
      mode: 'FACE_TO_FACE',
      targetAudience: ['CONSUMER'],
      eventTypeId: 'type-1',
      shortDescription: 'desc',
      participation: 'NOT_POSSIBLE',
      startDate: '2026-08-12',
      startTime: '00:00',
      endDate: '2026-08-13',
      endTime: '00:00',
      address: 'Venue',
      street: 'Street 1',
      zipCode: '80331',
      city: 'Munich',
      contactFirstName: 'Max',
      contactLastName: 'Mustermann',
      contactEmail: 'max@example.com',
      contactPhone: '+49123456',
      contacts: [],
      partnershipTypes: ['EXHIBITION'],
      productPartnerCategories: [],
      images: [{ name: 'cover.jpg', preview: 'blob:cover', isUploaded: true }],
    } as unknown as Partial<EventFormDto>,
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('useSubmitStepOverview on the calendar variant', () => {
  it('enables the deadline lookup on the calendar variant, same as the events variant', () => {
    useEventDeadlineMock.mockReturnValue({ isError: false, isLoading: false });
    renderHook(() => useSubmitStepOverview(), { wrapper: Wrapper });

    expect(useEventDeadlineMock).toHaveBeenCalledWith(true);
  });

  it('blocks submit when the deadline lookup fails, same as the events variant', async () => {
    useEventDeadlineMock.mockReturnValue({ isError: true, isLoading: false });
    const { result } = renderHook(() => useSubmitStepOverview(), { wrapper: Wrapper });

    let submitted = true;
    await act(async () => {
      submitted = await result.current.submit();
    });

    expect(submitted).toBe(false);
    expect(apiProxy.post).not.toHaveBeenCalled();
  });
});

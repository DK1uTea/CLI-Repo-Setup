import { act, renderHook } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { apiProxy } from '@/lib/api';
import { useSubmitStepOverview } from '@/features/events/event-form/(hooks)/use-submit-step-overview';
import type { EventFormDto } from '@/features/events/event-form/(helpers)/event-form-schema';

const { uploadFilesMock } = vi.hoisted(() => ({ uploadFilesMock: vi.fn() }));

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('nuqs', () => ({ parseAsString: {}, useQueryState: () => ['event-1', vi.fn()] }));
vi.mock('@/i18n/navigation', () => ({ usePathname: () => '/events/update-event' }));
vi.mock('@/lib/api', () => ({ apiProxy: { patch: vi.fn().mockResolvedValue({ data: { data: { id: 'event-1' } } }) } }));
vi.mock('@/features/events/event-form/(hooks)/use-event-deadline', () => ({
  useEventDeadline: () => ({ isError: false, isLoading: false }),
}));
vi.mock('@/features/events/event-form/(hooks)/use-upload-event-files', () => ({
  useUploadEventFiles: () => ({ uploadFiles: uploadFilesMock, isUploading: false }),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  const pendingImage = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
  const methods = useForm<EventFormDto>({
    defaultValues: {
      customEventId: 'EVENT-100001',
      title: 'Test Event',
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
      images: [{ name: 'photo.jpg', preview: '', file: pendingImage, isUploaded: false }],
    } as unknown as Partial<EventFormDto>,
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('useSubmitStepOverview uploads', () => {
  it('uploads pending overview images into the "event" presigned-url folder', async () => {
    uploadFilesMock.mockResolvedValueOnce([
      { filename: 'photo.jpg', url: 'https://cdn/photo.jpg', key: 'event/photo.jpg', mimeType: 'image/jpeg', size: 10 },
    ]);

    const { result } = renderHook(() => useSubmitStepOverview(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.submit();
    });

    expect(uploadFilesMock).toHaveBeenCalledWith(expect.any(Array), 'event');
    expect(apiProxy.patch).toHaveBeenCalled();
  });
});

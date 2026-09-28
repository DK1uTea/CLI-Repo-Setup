import { act, renderHook } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { apiProxy } from '@/lib/api';
import { useSubmitStepLogistics } from '@/features/events/event-form/(hooks)/use-submit-step-logistics';
import type { EventFormDto } from '@/features/events/event-form/(helpers)/event-form-schema';

const { uploadFilesMock } = vi.hoisted(() => ({ uploadFilesMock: vi.fn() }));

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('nuqs', () => ({ parseAsString: {}, useQueryState: () => ['event-1', vi.fn()] }));
vi.mock('@/i18n/navigation', () => ({ usePathname: () => '/events/update-event' }));
vi.mock('@/lib/api', () => ({ apiProxy: { patch: vi.fn().mockResolvedValue({ data: {} }) } }));
vi.mock('@/features/events/event-form/(hooks)/use-event-deadline', () => ({
  useEventDeadline: () => ({ isError: false, isLoading: false }),
}));
vi.mock('@/features/events/event-form/(hooks)/use-upload-event-files', () => ({
  useUploadEventFiles: () => ({ uploadFiles: uploadFilesMock, isUploading: false }),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  const pendingFile = new File(['content'], 'permit.pdf', { type: 'application/pdf' });
  const methods = useForm<EventFormDto>({
    defaultValues: {
      accessPermit: [{ name: 'permit.pdf', preview: '', file: pendingFile, isUploaded: false }],
      certifications: [],
      eventDocuments: [],
      venueLayouts: [],
      setupStartDate: '2026-08-01',
      setupStartTime: '09:00',
      setupEndDate: '2026-08-01',
      setupEndTime: '10:00',
      teardownStartDate: '2026-08-02',
      teardownStartTime: '09:00',
      teardownEndDate: '2026-08-02',
      teardownEndTime: '10:00',
    } as Partial<EventFormDto>,
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('useSubmitStepLogistics uploads', () => {
  it('uploads pending logistics files into the "event" presigned-url folder', async () => {
    uploadFilesMock.mockResolvedValueOnce([
      { filename: 'permit.pdf', url: 'https://cdn/permit.pdf', key: 'event/permit.pdf', mimeType: 'application/pdf', size: 10 },
    ]);

    const { result } = renderHook(() => useSubmitStepLogistics(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.submit();
    });

    expect(uploadFilesMock).toHaveBeenCalledWith(expect.any(Array), 'event');
    expect(apiProxy.patch).toHaveBeenCalled();
  });
});

import { act, renderHook } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { apiProxy } from '@/lib/api';
import type { EventFormDto } from '@/features/events/event-form/(helpers)/event-form-schema';
import { useSubmitStepHelpingHands } from '@/features/events/event-form/(hooks)/use-submit-step-helping-hands';

const { uploadFilesMock } = vi.hoisted(() => ({ uploadFilesMock: vi.fn() }));

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('nuqs', () => ({ parseAsString: {}, useQueryState: () => ['event-1', vi.fn()] }));
vi.mock('@/lib/api', () => ({
  apiProxy: { patch: vi.fn().mockResolvedValue({ data: { data: { id: 'event-1' } } }) },
}));
vi.mock('@/features/events/event-form/(hooks)/use-upload-event-files', () => ({
  useUploadEventFiles: () => ({ uploadFiles: uploadFilesMock, isUploading: false }),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  const pendingFile = new File(['content'], 'planogram.pdf', { type: 'application/pdf' });
  const methods = useForm<EventFormDto>({
    defaultValues: {
      helpingHandComment: '',
      assemblyPlanograms: [
        { name: 'planogram.pdf', preview: '', file: pendingFile, isUploaded: false },
      ],
    } as Partial<EventFormDto>,
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('useSubmitStepHelpingHands uploads', () => {
  it('uploads pending Helping Hands files into the "event" presigned-url folder', async () => {
    uploadFilesMock.mockResolvedValueOnce([{
      filename: 'planogram.pdf', url: 'https://cdn/planogram.pdf',
      key: 'event/planogram.pdf', mimeType: 'application/pdf', size: 10,
    }]);

    const { result } = renderHook(() => useSubmitStepHelpingHands(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.submit();
    });

    expect(uploadFilesMock).toHaveBeenCalledWith(expect.any(Array), 'event');
    expect(apiProxy.patch).toHaveBeenCalled();
  });
});

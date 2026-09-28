import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { LogisticsUploadCard } from '@/features/events/event-form/(components)/steps/event-form-step-logistics/logistics-upload-card';
import type { EventFormDto } from '@/features/events/event-form/(helpers)/event-form-schema';

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('nuqs', () => ({ parseAsString: {}, useQueryState: () => [null, vi.fn()] }));
vi.mock('@/features/events/(stores)/use-event-detail-store', () => ({
  useEventDetailStore: (selector: (state: { canEdit: boolean }) => unknown) => selector({ canEdit: true }),
}));
vi.mock('@/shared/components/ui/editor', () => ({ Editor: () => <div data-testid="editor" /> }));
vi.mock('@/shared/components/ui/upload-dropzone', () => ({
  UploadDropzone: ({ accept }: { accept?: Record<string, string[]> }) => (
    <div data-testid="dropzone" data-accept={JSON.stringify(accept ?? null)} />
  ),
}));

function LogisticsUploadCardHarness() {
  const methods = useForm<EventFormDto>({ defaultValues: {} as Partial<EventFormDto> });
  return (
    <FormProvider {...methods}>
      <LogisticsUploadCard />
    </FormProvider>
  );
}

describe('LogisticsUploadCard file-type restrictions', () => {
  it('restricts Access Permits to PDF only', () => {
    render(<LogisticsUploadCardHarness />);

    const [accessPermit] = screen.getAllByTestId('dropzone');
    expect(JSON.parse(accessPermit.getAttribute('data-accept')!)).toEqual({
      'application/pdf': ['.pdf'],
    });
  });

  it('accepts images and PDF for Certifications, Upload Document, and Venue Layouts', () => {
    render(<LogisticsUploadCardHarness />);

    const [, certifications, eventDocuments, venueLayouts] = screen.getAllByTestId('dropzone');
    const expectedAccept = {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/heif': ['.heif'],
      'image/heic': ['.heic'],
      'image/gif': ['.gif'],
      'application/pdf': ['.pdf'],
    };

    [certifications, eventDocuments, venueLayouts].forEach((el) => {
      expect(JSON.parse(el.getAttribute('data-accept')!)).toEqual(expectedAccept);
    });
  });
});

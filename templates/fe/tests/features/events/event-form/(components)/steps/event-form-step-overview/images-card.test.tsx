import { render } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ImagesCard } from '@/features/events/event-form/(components)/steps/event-form-step-overview/images-card';
import type { EventFormDto } from '@/features/events/event-form/(helpers)/event-form-schema';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

const { eventDetailState } = vi.hoisted(() => ({
  eventDetailState: { canEdit: true, isOverviewLocked: false },
}));

vi.mock('nuqs', () => ({
  parseAsString: {},
  useQueryState: () => [null, vi.fn()],
}));

vi.mock('@/features/events/(stores)/use-event-detail-store', () => ({
  useEventDetailStore: (selector: (state: typeof eventDetailState) => unknown) => selector(eventDetailState),
}));

let capturedDropzoneProps: Record<string, unknown> | undefined;
vi.mock('@/shared/components/ui/upload-dropzone', () => ({
  UploadDropzone: (props: Record<string, unknown>) => {
    capturedDropzoneProps = props;
    return <div data-testid="upload-dropzone" />;
  },
}));

function ImagesCardHarness({ defaultValues }: { defaultValues?: Partial<EventFormDto> }) {
  const methods = useForm<EventFormDto>({ defaultValues: { images: [], ...defaultValues } });
  return (
    <FormProvider {...methods}>
      <ImagesCard />
    </FormProvider>
  );
}

describe('ImagesCard', () => {
  beforeEach(() => {
    eventDetailState.canEdit = true;
    eventDetailState.isOverviewLocked = false;
    capturedDropzoneProps = undefined;
  });

  it('passes the current images field value through to the dropzone', () => {
    const images = [{ name: 'photo.png', preview: 'blob:photo' }];
    render(<ImagesCardHarness defaultValues={{ images: images as never }} />);

    expect(capturedDropzoneProps?.value).toEqual(images);
  });

  it('defaults to an empty array when the field has no value yet', () => {
    render(<ImagesCardHarness defaultValues={{ images: undefined as never }} />);

    expect(capturedDropzoneProps?.value).toEqual([]);
  });

  it('enables cropping', () => {
    render(<ImagesCardHarness />);

    expect(capturedDropzoneProps?.enableCrop).toBe(true);
  });

  it('is not disabled by default (create mode, no eventId)', () => {
    render(<ImagesCardHarness />);

    expect(capturedDropzoneProps?.disabled).toBe(false);
  });

  it('is disabled when the overview is locked', () => {
    eventDetailState.isOverviewLocked = true;
    render(<ImagesCardHarness />);

    expect(capturedDropzoneProps?.disabled).toBe(true);
  });

  it('passes invalid true and displays error message when images field has an error', () => {
    function ErrorHarness() {
      const methods = useForm<EventFormDto>({
        defaultValues: { images: [] },
        errors: { images: { type: 'required', message: 'Bitte lade mindestens ein Bild hoch' } },
      });
      return (
        <FormProvider {...methods}>
          <ImagesCard />
        </FormProvider>
      );
    }
    const { getByRole } = render(<ErrorHarness />);

    expect(capturedDropzoneProps?.invalid).toBe(true);
    const alert = getByRole('alert');
    expect(alert).toHaveTextContent('Bitte lade mindestens ein Bild hoch');
  });
});

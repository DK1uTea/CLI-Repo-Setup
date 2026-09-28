'use client';

import { useController, useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { useQueryState, parseAsString } from 'nuqs';
import { useEventDetailStore } from '@/features/events/(stores)/use-event-detail-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { UploadDropzone } from '@/shared/components/ui/upload-dropzone';
import type { EventFormDto } from '../../../(helpers)/event-form-schema';

export function ImagesCard() {
  const t = useTranslations('eventForm');
  const { control } = useFormContext<EventFormDto>();
  const { field, fieldState } = useController({ control, name: 'images' });
  const [eventIdParam] = useQueryState('eventId', parseAsString);
  const canEdit = useEventDetailStore((s) => s.canEdit);
  const isOverviewLocked = useEventDetailStore((s) => s.isOverviewLocked);
  const disabled = isOverviewLocked || (eventIdParam ? !canEdit : false);

  return (
    <Card data-field="images">
      <CardHeader>
        <CardTitle>{t('overview.imagesTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        <UploadDropzone
          value={field.value ?? []}
          onChange={field.onChange}
          label={t('overview.imagesTitle')}
          dropText={t('overview.imagesDropText')}
          browseText={t('overview.imagesBrowse')}
          hintText={t('overview.imagesHint')}
          errorTooLargeText={t('overview.imageErrorTooLarge')}
          errorInvalidTypeText={t('overview.imageErrorInvalidType')}
          disabled={disabled}
          invalid={Boolean(fieldState.error)}
          enableCrop
        />
        {fieldState.error?.message && (
          <p className="mt-2 text-sm text-destructive" role="alert">
            {fieldState.error.message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

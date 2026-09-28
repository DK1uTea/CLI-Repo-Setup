'use client';

import { useController, useFormContext, useFormState } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { UploadDropzone } from '@/shared/components/ui/upload-dropzone';
import type { TradeFairEventFormDto } from '../../../(helpers)/trade-fair-event-form-schema';

export function ImagesCard() {
  const t = useTranslations('reportingTool.tradeFairEventForm.generalInfo');
  const { control } = useFormContext<TradeFairEventFormDto>();
  const { field } = useController({ control, name: 'images' });
  const { errors } = useFormState<TradeFairEventFormDto>({ control });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t('imagesTitle')}
          <span className="text-red-500"> *</span>
        </CardTitle>
        <CardDescription>{t('imagesSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <UploadDropzone
          value={field.value ?? []}
          onChange={field.onChange}
          maxFiles={1}
          invalid={Boolean(errors.images?.message)}
          dropText={t('imagesDropText')}
          browseText={t('imagesBrowse')}
          hintText={t('imagesHint')}
          errorTooLargeText={t('imageErrorTooLarge')}
          errorInvalidTypeText={t('imageErrorInvalidType')}
        />
        {errors.images?.message && (
          <p className="mt-2 text-sm text-destructive">{errors.images.message as string}</p>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import { useFormContext, useController, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { UploadDropzone } from '@/shared/components/ui/upload-dropzone';
import { Editor } from '@/shared/components/ui/editor';
import { useQueryState, parseAsString } from 'nuqs';
import { useEventDetailStore } from '@/features/events/(stores)/use-event-detail-store';
import type { EventFormDto } from '../../../(helpers)/event-form-schema';

export function HelpingHandsUploadCard() {
  const t = useTranslations('eventForm');
  const { setValue, control } = useFormContext<EventFormDto>();
  const { field } = useController({ control, name: 'assemblyPlanograms' });
  const comment = useWatch({ control, name: 'helpingHandComment' }) ?? '';

  const [eventIdParam] = useQueryState('eventId', parseAsString);
  const canEdit = useEventDetailStore((s) => s.canEdit);
  const isDisableField = eventIdParam ? !canEdit : false;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('helpingHands.assemblyPlanTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="mt-3 space-y-6">
        <UploadDropzone
          value={field.value ?? []}
          onChange={field.onChange}
          dropText={t('helpingHands.uploadDropText')}
          browseText={t('helpingHands.uploadBrowseText')}
          hintText={t('helpingHands.uploadHint')}
          maxFiles={10}
          disabled={isDisableField}
        />

        <div className="space-y-1">
          <p className="text-base font-medium">{t('helpingHands.commentTitle')}</p>
        </div>
        <Editor
          value={comment}
          onChange={(html) => setValue('helpingHandComment', html, { shouldDirty: true })}
          placeholder={t('helpingHands.commentPlaceholder')}
          className="bg-card"
          editorClassName="h-[235px] overflow-y-auto"
          disabled={isDisableField}
        />
      </CardContent>
    </Card>
  );
}

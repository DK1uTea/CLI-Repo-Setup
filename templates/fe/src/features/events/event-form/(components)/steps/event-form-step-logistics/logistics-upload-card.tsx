'use client';

import { useFormContext, useController, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { UploadDropzone } from '@/shared/components/ui/upload-dropzone';
import { Editor } from '@/shared/components/ui/editor';
import { useQueryState, parseAsString } from 'nuqs';
import { useEventDetailStore } from '@/features/events/(stores)/use-event-detail-store';
import { PDF_UPLOAD_ACCEPT, IMAGE_AND_PDF_UPLOAD_ACCEPT } from '../../../(helpers)/event-form-constants';
import type { EventFormDto } from '../../../(helpers)/event-form-schema';

type FileFieldName = 'accessPermit' | 'certifications' | 'eventDocuments' | 'venueLayouts';

function FileField({
  name,
  label,
  hint,
  dropText,
  browseText,
  disabled,
  accept,
}: {
  name: FileFieldName;
  label: string;
  hint?: string;
  dropText?: string;
  browseText?: string;
  disabled?: boolean;
  accept: Record<string, string[]>;
}) {
  const { control } = useFormContext<EventFormDto>();
  const { field } = useController({ control, name });
  return (
    <div className="space-y-1.5">
      {label && <p className="text-sm font-medium text-foreground">{label}</p>}
      <UploadDropzone
        value={field.value ?? []}
        onChange={field.onChange}
        accept={accept}
        dropText={dropText}
        browseText={browseText}
        hintText={hint}
        maxFiles={10}
        disabled={disabled}
      />
    </div>
  );
}

export function LogisticsUploadCard() {
  const t = useTranslations('eventForm');
  const { setValue, control } = useFormContext<EventFormDto>();
  const comment = useWatch({ control, name: 'logisticComment' }) ?? '';

  const [eventIdParam] = useQueryState('eventId', parseAsString);
  const canEdit = useEventDetailStore((s) => s.canEdit);
  const isDisableField = eventIdParam ? !canEdit : false;
  const uploadDropText = t('logistics.uploadDropText');
  const uploadBrowseText = t('logistics.uploadBrowseText');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('logistics.sectionTitle')}</CardTitle>
        <CardDescription>{t('logistics.sectionSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 mt-3">
        <p className="text-base font-medium">{t('logistics.filesTitle')}:</p>

        <FileField
          name="accessPermit"
          label={t('logistics.accessPermits')}
          hint={t('logistics.accessPermitsHint')}
          dropText={uploadDropText}
          browseText={uploadBrowseText}
          disabled={isDisableField}
          accept={PDF_UPLOAD_ACCEPT}
        />
        <FileField
          name="certifications"
          label={t('logistics.certifications')}
          hint={t('logistics.certificationsHint')}
          dropText={uploadDropText}
          browseText={uploadBrowseText}
          disabled={isDisableField}
          accept={IMAGE_AND_PDF_UPLOAD_ACCEPT}
        />
        <FileField
          name="eventDocuments"
          label={t('logistics.uploadDocuments')}
          hint={t('logistics.documentsHint')}
          dropText={uploadDropText}
          browseText={uploadBrowseText}
          disabled={isDisableField}
          accept={IMAGE_AND_PDF_UPLOAD_ACCEPT}
        />

        <Separator className="my-9" />

        <p className="text-base font-medium">{t('logistics.venueLayouts')}</p>
        <FileField
          name="venueLayouts"
          label=""
          hint={t('logistics.documentsHint')}
          dropText={uploadDropText}
          browseText={uploadBrowseText}
          disabled={isDisableField}
          accept={IMAGE_AND_PDF_UPLOAD_ACCEPT}
        />

        <Separator className="my-9" />

        <div className="space-y-1">
          <p className="text-base font-medium">{t('logistics.commentTitle')}</p>
          <p className="text-sm text-muted-foreground">{t('logistics.commentSubtitle')}</p>
        </div>
        <Editor
          value={comment}
          onChange={(html) => setValue('logisticComment', html, { shouldDirty: true })}
          placeholder={t('logistics.commentPlaceholder')}
          className="bg-card"
          editorClassName="h-[235px] overflow-y-auto"
          disabled={isDisableField}
        />
      </CardContent>
    </Card>
  );
}

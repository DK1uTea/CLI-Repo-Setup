'use client';

import { parseAsString, useQueryState } from 'nuqs';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useFormContext } from 'react-hook-form';
import { getValidationMessage, translateErrorMessage } from '@/lib/field-error';
import {
  STEP_FIELDS,
  type TradeFairEventFormDto,
} from '../(helpers)/trade-fair-event-form-schema';
import { useUpdateEvent } from './use-update-event';
import { useCreateEvent } from './use-create-event';
import { useUploadAttachments } from './use-upload-attachments';

const SCROLL_REMAP: Partial<Record<keyof TradeFairEventFormDto, string>> = {
  startTime: 'startDate',
  endTime: 'endDate',
};

function scrollToField(field: keyof TradeFairEventFormDto) {
  const target = SCROLL_REMAP[field] ?? field;
  const el =
    document.querySelector<HTMLElement>(`[data-field="${target}"]`) ??
    document.querySelector<HTMLElement>(`[name="${target}"]`);
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

export function useSubmitStepGeneralInfo() {
  const methods = useFormContext<TradeFairEventFormDto>();
  const [id, setId] = useQueryState('id', parseAsString);
  const [, setEventId] = useQueryState('eventId', parseAsString);
  const t = useTranslations('reportingTool.tradeFairEventForm.generalInfo');

  const { uploadFiles, isUploading } = useUploadAttachments();
  const { mutateAsync: createEvent, isPending: isCreating } = useCreateEvent();
  const { mutateAsync: updateEvent, isPending: isUpdating } = useUpdateEvent(id || '');

  const isPending = isUploading || isUpdating || isCreating;

  const submit = async (): Promise<boolean> => {
    const existing = methods.getValues('eventId');
    if (!existing) {
      const randomId = `EVENT-${Math.floor(100000 + Math.random() * 900000)}`;
      methods.setValue('eventId', randomId, { shouldValidate: false });
    }

    const valid = await methods.trigger(STEP_FIELDS['general-info']);
    if (!valid) {
      const fieldLabels: Partial<Record<keyof TradeFairEventFormDto, string>> = {
        eventId: t('eventId'),
        title: t('eventTitle'),
        eventMode: t('eventMode'),
        targetAudience: t('targetAudience'),
        eventType: t('eventType'),
        description: t('description'),
        participation: t('participation'),
        startDate: t('eventStart'),
        startTime: t('time'),
        endDate: t('eventEnd'),
        endTime: t('time'),
        eventLocation: t('locationTitle'),
        address: t('venueName'),
        street: t('street'),
        zipCode: t('postalCode'),
        city: t('city'),
      };

      const firstErrorField = STEP_FIELDS['general-info'].find(
        (field) => methods.getFieldState(field).error,
      );
      if (firstErrorField) {
        const rawError = methods.getFieldState(firstErrorField).error;
        const message =
          rawError && typeof rawError === 'object' && 'message' in rawError && rawError.message
            ? (rawError.message as string)
            : getValidationMessage('fieldErrors.required');
        toast.error(
          `${fieldLabels[firstErrorField] ?? String(firstErrorField)}: ${translateErrorMessage(message)}`,
        );
        scrollToField(firstErrorField);
      }
      return false;
    }

    const images = methods.getValues('images') || [];
    const pendingUpload = images.filter((img) => !img.isUploaded && img.file);

    if (pendingUpload.length > 0) {
      try {
        const filesToUpload = pendingUpload.map((img) => img.file!);
        const uploaded = await uploadFiles(filesToUpload);

        const mergedImages = images.map((img) => {
          const matched = uploaded.find((att) => att.filename === img.name);
          if (!matched) return img;
          return {
            ...img,
            url: matched.url,
            preview: img.preview,
            isUploaded: true,
          };
        });

        methods.setValue('images', mergedImages, { shouldDirty: true });
      } catch (error) {
        console.error('Image upload failed:', error);
        toast.error('Failed to upload image. Please try again.');
        return false;
      }
    }

    const finalId = methods.getValues('eventId');
    await setEventId(finalId, { history: 'replace' });

    if (id) {
      try {
        await updateEvent({ data: methods.getValues() });
      } catch (error) {
        console.error('Update event failed:', error);
        return false;
      }
    } else {
      try {
        const res = await createEvent({ data: methods.getValues(), status: 'DRAFT' });
        await setId(res.id, { history: 'replace' });
      } catch (error) {
        console.error('Create event failed:', error);
        return false;
      }
    }

    return true;
  };

  return { submit, isPending };
}

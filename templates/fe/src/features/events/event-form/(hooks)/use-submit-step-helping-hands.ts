'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useQueryState, parseAsString } from 'nuqs';
import { getValidationMessage } from '@/lib/field-error';
import { STEP_FIELDS, type EventFormDto } from '../(helpers)/event-form-schema';
import { apiProxy } from '@/lib/api';
import { useUploadEventFiles } from './use-upload-event-files';

export type HelpingHandsStepPayload = ReturnType<typeof mapFormToHelpingHandsPayload>;

export const mapFormToHelpingHandsPayload = (
  formData: EventFormDto,
  options?: { asDraft?: boolean },
) => {
  return {
    ...(options?.asDraft ? { status: 'DRAFT' as const } : {}),
    helpingHandComment: formData.helpingHandComment || undefined,
    assemblyPlanograms: (formData.assemblyPlanograms || []).map((f: any) => f.key || f.url),
  };
};

export const submitHelpingHandsStep = async (
  eventId: string,
  payload: HelpingHandsStepPayload,
): Promise<{ id: string }> => {
  const response = await apiProxy.patch(`/etr/events/${eventId}/helping-hands`, payload);
  return response.data.data as { id: string };
};

export function useSubmitStepHelpingHands() {
  const methods = useFormContext<EventFormDto>();
  const [eventIdParam, setEventId] = useQueryState('eventId', parseAsString);
  const t = useTranslations('eventForm');
  const { uploadFiles, isUploading } = useUploadEventFiles();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadFieldFiles = async () => {
    const files = methods.getValues('assemblyPlanograms') || [];
    const pendingUpload = files.filter((item: any) => !item.isUploaded && item.file);

    if (pendingUpload.length > 0) {
      const filesToUpload = pendingUpload.map((item: any) => item.file!);
      const uploaded = await uploadFiles(filesToUpload, 'event');

      const merged = files.map((item: any) => {
        const matched = uploaded.find((att) => att.filename === item.name);
        if (!matched) return item;
        return {
          ...item,
          url: matched.url,
          key: matched.key,
          preview: item.preview,
          isUploaded: true,
        };
      });

      methods.setValue('assemblyPlanograms', merged, { shouldDirty: true });
    }
  };

  const submit = async (options?: { asDraft?: boolean }): Promise<boolean> => {
    const valid = await methods.trigger(STEP_FIELDS['helping_hand'] as any);
    if (!valid) {
      const rawError = methods.getFieldState('assemblyPlanograms' as any).error;
      const message =
        rawError && typeof rawError === 'object' && 'message' in rawError && rawError.message
          ? (rawError.message as string)
          : getValidationMessage('fieldErrors.required');
      toast.error(`${t('helpingHands.assemblyPlanTitle')}: ${message}`);
      return false;
    }

    try {
      await uploadFieldFiles();
    } catch (error) {
      console.error('Helping hands file upload failed:', error);
      toast.error(t('overview.imageUploadFailed' as any));
      return false;
    }

    if (!eventIdParam) {
      console.error('Cannot submit helping hands step: eventIdParam is missing');
      toast.error(t('eventIdMissing'));
      return false;
    }

    const formData = methods.getValues();
    const payload = mapFormToHelpingHandsPayload(formData, options);

    console.log('Submit step helping hands payload:', payload);

    setIsSubmitting(true);
    try {
      const result = await submitHelpingHandsStep(eventIdParam, payload);
      if (result?.id && result.id !== eventIdParam) {
        await setEventId(result.id);
      }
    } catch (error) {
      console.error('Submit helping hands step failed:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }

    return true;
  };

  return { submit, isPending: isUploading || isSubmitting };
}

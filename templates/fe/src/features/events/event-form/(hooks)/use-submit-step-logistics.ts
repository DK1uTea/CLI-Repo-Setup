'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useQueryState, parseAsString } from 'nuqs';
import { getValidationMessage } from '@/lib/field-error';
import { STEP_FIELDS, type EventFormDto } from '../(helpers)/event-form-schema';
import { dayjs } from '@/lib/date-utils';
import { apiProxy } from '@/lib/api';
import { useUploadEventFiles } from './use-upload-event-files';
import { useEventDeadline } from './use-event-deadline';

const SCROLL_REMAP: Partial<Record<keyof EventFormDto, string>> = {
  setupStartTime: 'setupStartDate',
  setupEndTime: 'setupEndDate',
  teardownStartTime: 'teardownStartDate',
  teardownEndTime: 'teardownEndDate',
};

function scrollToField(field: keyof EventFormDto) {
  const target = SCROLL_REMAP[field] ?? field;
  const el =
    document.querySelector<HTMLElement>(`[data-field="${target}"]`) ??
    document.querySelector<HTMLElement>(`[name="${target}"]`);
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

export type LogisticsStepPayload = ReturnType<typeof mapFormToLogisticsPayload>;

export const mapFormToLogisticsPayload = (
  formData: EventFormDto,
  options?: { asDraft?: boolean },
) => {
  const firstDelivery = formData.deliveryLocations?.[0];
  const delivery = formData.isDifferentDeliveryAddress && firstDelivery
    ? {
      name: firstDelivery.deliveryAddress,
      street: firstDelivery.deliveryStreet,
      city: firstDelivery.deliveryCity,
      postalCode: firstDelivery.deliveryZipCode,
    }
    : undefined;

  return {
    ...(options?.asDraft ? { status: 'DRAFT' as const } : {}),
    accessPermit: (formData.accessPermit || []).map((f: any) => f.key || f.url),
    certifications: (formData.certifications || []).map((f: any) => f.key || f.url),
    eventDocuments: (formData.eventDocuments || []).map((f: any) => f.key || f.url),
    venueLayouts: (formData.venueLayouts || []).map((f: any) => f.key || f.url),
    contact: {
      name: formData.logisticsContactName,
      email: formData.logisticsContactEmail,
      phone: formData.logisticsContactPhone,
    },
    wareHouseCode: formData.wareHouseCode,
    logisticComment: formData.logisticComment || undefined,
    setupTime: {
      startTime: dayjs.utc(`${formData.setupStartDate}T${formData.setupStartTime}`).toISOString(),
      endTime: dayjs.utc(`${formData.setupEndDate}T${formData.setupEndTime}`).toISOString(),
    },
    teardownTime: {
      startTime: dayjs.utc(`${formData.teardownStartDate}T${formData.teardownStartTime}`).toISOString(),
      endTime: dayjs.utc(`${formData.teardownEndDate}T${formData.teardownEndTime}`).toISOString(),
    },
    isSaveAddress: firstDelivery?.isGenerateAddress ?? false,
    delivery,
  };
};

export const submitLogisticsStep = async (
  eventId: string,
  payload: LogisticsStepPayload,
): Promise<void> => {
  await apiProxy.patch(`/etr/events/${eventId}/logistics`, payload);
};

export function useSubmitStepLogistics() {
  const methods = useFormContext<EventFormDto>();
  const [eventIdParam] = useQueryState('eventId', parseAsString);
  const t = useTranslations('eventForm');
  const { uploadFiles, isUploading } = useUploadEventFiles();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isError: isDeadlineError, isLoading: isDeadlineLoading } = useEventDeadline(true);

  const uploadFieldFiles = async (
    fieldName: 'accessPermit' | 'certifications' | 'eventDocuments' | 'venueLayouts'
  ) => {
    const files = methods.getValues(fieldName) || [];
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

      methods.setValue(fieldName, merged, { shouldDirty: true });
    }
  };

  const submit = async (options?: { asDraft?: boolean }): Promise<boolean> => {
    if (isDeadlineLoading || isDeadlineError) return false;

    const valid = await methods.trigger(STEP_FIELDS['logistics'] as any);
    if (!valid) {
      const fieldLabels: Partial<Record<keyof EventFormDto, string>> = {
        wareHouseCode: t('logistics.warehouse'),
        logisticsContactName: t('logistics.contactName'),
        logisticsContactEmail: t('logistics.contactEmail'),
        logisticsContactPhone: t('logistics.contactPhone'),
        setupStartDate: t('logistics.setupStart'),
        setupStartTime: t('logistics.setupStart'),
        setupEndDate: t('logistics.setupEnd'),
        setupEndTime: t('logistics.setupEnd'),
        teardownStartDate: t('logistics.teardownStart'),
        teardownStartTime: t('logistics.teardownStart'),
        teardownEndDate: t('logistics.teardownEnd'),
        teardownEndTime: t('logistics.teardownEnd'),
        deliveryLocations: t('logistics.differentDeliveryAddress'),
      };

      const firstErrorField = STEP_FIELDS['logistics'].find(
        (field) => methods.getFieldState(field as any).error,
      );

      if (firstErrorField) {
        const fieldKey = firstErrorField as keyof EventFormDto;
        const label = fieldLabels[fieldKey] ?? String(firstErrorField);
        const rawError = methods.getFieldState(fieldKey).error;
        const message =
          rawError && typeof rawError === 'object' && 'message' in rawError && rawError.message
            ? (rawError.message as string)
            : getValidationMessage('fieldErrors.required');
        toast.error(`${label}: ${message}`);
        scrollToField(fieldKey);
      }

      return false;
    }

    try {
      await uploadFieldFiles('accessPermit');
      await uploadFieldFiles('certifications');
      await uploadFieldFiles('eventDocuments');
      await uploadFieldFiles('venueLayouts');
    } catch (error) {
      console.error('Logistics file upload failed:', error);
      toast.error(t('overview.imageUploadFailed' as any));
      return false;
    }

    if (!eventIdParam) {
      console.error('Cannot submit logistics step: eventIdParam is missing');
      toast.error(t('eventIdMissing'));
      return false;
    }

    const formData = methods.getValues();
    const payload = mapFormToLogisticsPayload(formData, options);

    console.log('Submit step logistics payload:', payload);

    setIsSubmitting(true);
    try {
      await submitLogisticsStep(eventIdParam, payload);
    } catch (error) {
      console.error('Submit logistics step failed:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }

    return true;
  };

  return { submit, isPending: isUploading || isSubmitting };
}

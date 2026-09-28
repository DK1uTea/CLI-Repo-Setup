'use client';

import { useState } from 'react';
import { useQueryState, parseAsString } from 'nuqs';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useFormContext } from 'react-hook-form';
import { getValidationMessage } from '@/lib/field-error';
import { STEP_FIELDS, type EventFormDto } from '../(helpers)/event-form-schema';
import { usePathname } from '@/i18n/navigation';
import { dayjs } from '@/lib/date-utils';
import { useUploadEventFiles } from './use-upload-event-files';
import { useEventDeadline } from './use-event-deadline';
import { apiProxy } from '@/lib/api';
import { getEventImagePayload, mergeUploadedEventImages } from '../(helpers)/event-image-files';

// startTime/endTime share the same DateInputFloat container as startDate/endDate
const SCROLL_REMAP: Partial<Record<keyof EventFormDto, string>> = {
  startTime: 'startDate',
  endTime: 'endDate',
};

function scrollToField(field: keyof EventFormDto) {
  const target = SCROLL_REMAP[field] ?? field;
  const el =
    document.querySelector<HTMLElement>(`[data-field="${target}"]`) ??
    document.querySelector<HTMLElement>(`[name="${target}"]`);
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

export type OverviewStepPayload = ReturnType<typeof mapFormToOverviewPayload>;

export const mapFormToOverviewPayload = (
  formData: EventFormDto,
  eventIdParam?: string | null,
  isCalendarVariant?: boolean,
  options?: { asDraft?: boolean },
) => {
  const startTime = dayjs.utc(`${formData.startDate}T${formData.startTime}`).toISOString();
  const endTime = dayjs.utc(`${formData.endDate}T${formData.endTime}`).toISOString();

  return {
    id: eventIdParam || undefined,
    ...(options?.asDraft ? { status: 'DRAFT' as const } : {}),
    title: formData.title,
    mode: formData.mode,
    targetAudience: formData.targetAudience,
    customEventId: formData.customEventId,
    eventTypeId: formData.eventTypeId,
    shortDescription: formData.shortDescription,
    participation: formData.participation,
    link: formData.link || undefined,
    images: getEventImagePayload(formData.images || []),
    startTime,
    endTime,
    locationId: formData.locationId || undefined,
    isSaveAddress: formData.isSaveAddress,
    location: {
      name: formData.address,
      street: formData.street,
      city: formData.city,
      postalCode: formData.zipCode,
    },
    adminContact: {
      firstName: formData.contactFirstName,
      lastName: formData.contactLastName,
      email: formData.contactEmail,
      phone: formData.contactPhone,
    },
    otherContacts: (formData.contacts || []).map((c) => ({
      name: c.contactName,
      email: c.contactEmail,
      phone: c.contactPhone,
      role: c.role,
    })),
    isPrivate: formData.doNotPublish,
    isCalendarEvent: isCalendarVariant,
    partnershipTypes: formData.partnershipTypes,
    productPartnerCategories: formData.productPartnerCategories,
  };
};

export const submitOverviewStep = async (
  payload: OverviewStepPayload,
  eventId?: string | null
): Promise<{ id: string }> => {
  if (eventId) {
    const response = await apiProxy.patch(`/etr/events/${eventId}/overview`, payload);
    return response.data.data as { id: string };
  }
  const response = await apiProxy.post('/etr/events/overview', payload);
  return response.data.data as { id: string };
};

export function useSubmitStepOverview() {
  const methods = useFormContext<EventFormDto>();
  const [eventIdParam, setEventId] = useQueryState('eventId', parseAsString);
  const t = useTranslations('eventForm.overview');
  const pathname = usePathname();
  const { uploadFiles, isUploading } = useUploadEventFiles();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCalendarVariant = pathname.includes('/calendar');
  const { isError: isDeadlineError, isLoading: isDeadlineLoading } = useEventDeadline(true);

  const submit = async (options?: { asDraft?: boolean }): Promise<boolean> => {
    if (isDeadlineLoading || isDeadlineError) return false;

    if (!eventIdParam) {
      const existing = methods.getValues('customEventId');
      if (!existing) {
        const random5Digits = Math.floor(Math.random() * 100000)
          .toString()
          .padStart(5, '0');
        const id = `EVENT-10${random5Digits}`;
        methods.setValue('customEventId', id, { shouldValidate: false });
      }
    }

    const valid = await methods.trigger(STEP_FIELDS['overview']);
    if (!valid) {
      const fieldLabels: Partial<Record<keyof EventFormDto, string>> = {
        customEventId: t('eventId'),
        title: t('eventTitle'),
        mode: t('eventMode'),
        targetAudience: t('targetAudience'),
        eventTypeId: t('eventType'),
        shortDescription: t('description'),
        participation: t('participation'),
        images: t('imagesTitle'),
        startDate: t('eventStart'),
        startTime: t('time'),
        endDate: t('eventEnd'),
        endTime: t('time'),
        locationId: t('locationTitle'),
        address: t('venueName'),
        street: t('street'),
        zipCode: t('postalCode'),
        city: t('city'),
        contactFirstName: t('firstName'),
        contactLastName: t('lastName'),
        contactEmail: t('email'),
        contactPhone: t('phone'),
        partnershipTypes: t('partnershipTitle'),
        productPartnerCategories: t('partnershipSelectCategories'),
      };

      const firstErrorField = STEP_FIELDS['overview'].find(
        (field) => methods.getFieldState(field).error,
      );
      if (firstErrorField) {
        const label = fieldLabels[firstErrorField] ?? String(firstErrorField);
        // getFieldState for array fields (contacts) returns the array, not a FieldError
        const rawError = methods.getFieldState(firstErrorField).error;
        const message =
          rawError && typeof rawError === 'object' && 'message' in rawError && rawError.message
            ? (rawError.message as string)
            : getValidationMessage('fieldErrors.required');
        toast.error(`${label}: ${message}`);
        scrollToField(firstErrorField);
      }
      return false;
    }

    const images = methods.getValues('images') || [];
    const pendingUpload = images.filter((img) => !img.isUploaded && img.file);

    if (pendingUpload.length > 0) {
      try {
        const filesToUpload = pendingUpload.map((img) => img.file!);
        const uploaded = await uploadFiles(filesToUpload, 'event');

        const mergedImages = mergeUploadedEventImages(images, pendingUpload, uploaded);

        methods.setValue('images', mergedImages, { shouldDirty: true });
      } catch (error) {
        console.error('Image upload failed:', error);
        toast.error(t('imageUploadFailed'));
        return false;
      }
    }

    // Map and log the payload
    const formData = methods.getValues();
    const payload = mapFormToOverviewPayload(formData, eventIdParam, isCalendarVariant, options);

    setIsSubmitting(true);
    try {
      const resData = await submitOverviewStep(payload, eventIdParam);
      if (resData?.id) {
        await setEventId(resData.id, { history: 'replace' });
      }
    } catch (error) {
      console.error('Submit overview step failed:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }

    return true;
  };

  return { submit, isPending: isUploading || isSubmitting };
}

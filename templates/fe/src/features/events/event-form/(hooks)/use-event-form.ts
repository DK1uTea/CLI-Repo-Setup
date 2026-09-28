'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryState, parseAsString } from 'nuqs';
import { usePathname } from '@/i18n/navigation';
import { useEventDetailStore } from '@/features/events/(stores)/use-event-detail-store';
import { useEventStepDetail } from './use-event-step-detail';
import { useEventActions } from './use-event-actions';
import { useEventDeadline } from './use-event-deadline';
import { eventFormSchema, type EventFormDto } from '../(helpers)/event-form-schema';
import {
  getDefaultDates,
  getEventDatesFromDeadline,
  getEventFormDetailStep,
  getLogisticsDateDefaults,
  mapDetailToFormValues,
} from '../(helpers)/event-form-helpers';



export function useEventForm(defaultValues?: Partial<EventFormDto>) {
  const actions = useEventActions();
  const defaultDates = getDefaultDates();
  const pathname = usePathname();
  const [eventIdParam] = useQueryState('eventId', parseAsString);
  const [stepParam] = useQueryState('step', parseAsString.withDefault('overview'));
  const isCreateMode = pathname.includes('/new-event');
  const isDeadlineStep = stepParam === 'overview' || stepParam === 'logistics';
  const { data: deadline, isLoading: isDeadlineLoading } = useEventDeadline(isDeadlineStep);
  const [initializedStep, setInitializedStep] = useState<string | null>(null);

  // Product Catalog has no own detail endpoint. Fetch Helping Hands instead
  // so `general.isPrivate` (and canEdit/status) are available for the sidebar.
  const detailStep = getEventFormDetailStep(stepParam);
  const { data: resData, isFetching: isLoading, isFetched } = useEventStepDetail(
    eventIdParam || '',
    detailStep,
  );

  const methods = useForm<EventFormDto>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      mode: '',
      targetAudience: [],
      eventTypeId: '',
      doNotPublish: false,
      shortDescription: '',
      participation: '',
      link: '',
      customEventId: '',
      images: [],
      startDate: defaultDates.startDate,
      startTime: defaultDates.startTime,
      endDate: defaultDates.endDate,
      endTime: defaultDates.endTime,
      locationId: '',
      address: '',
      street: '',
      zipCode: '',
      city: '',
      isSaveAddress: false,
      contactFirstName: '',
      contactLastName: '',
      contactEmail: '',
      contactPhone: '+49',
      contacts: [],
      partnershipTypes: [],
      productPartnerCategories: [],
      wareHouseCode: '',
      logisticsContactName: '',
      logisticsContactEmail: '',
      logisticsContactPhone: '',
      isDifferentDeliveryAddress: false,
      setupStartDate: defaultDates.setupStartDate,
      setupStartTime: defaultDates.setupStartTime,
      setupEndDate: defaultDates.setupEndDate,
      setupEndTime: defaultDates.setupEndTime,
      teardownStartDate: defaultDates.teardownStartDate,
      teardownStartTime: defaultDates.teardownStartTime,
      teardownEndDate: defaultDates.teardownEndDate,
      teardownEndTime: defaultDates.teardownEndTime,
      ...defaultValues,
    },
    mode: 'onChange',
  });

  useLayoutEffect(() => {
    if (!isCreateMode || !deadline) return;

    const eventDates = getEventDatesFromDeadline(deadline.deadline);
    if (!eventDates) return;
    const logisticsDates = getLogisticsDateDefaults({
      eventStartDate: methods.getValues('startDate') || eventDates.startDate,
      eventEndDate: methods.getValues('endDate') || eventDates.endDate,
    });

    const applyIfEmpty = (field: keyof EventFormDto, value: string) => {
      if (!methods.getValues(field)) methods.setValue(field, value);
    };

    applyIfEmpty('startDate', eventDates.startDate);
    applyIfEmpty('startTime', eventDates.startTime);
    applyIfEmpty('endDate', eventDates.endDate);
    applyIfEmpty('endTime', eventDates.endTime);
    if (stepParam === 'logistics' && logisticsDates) {
      for (const [field, value] of Object.entries(logisticsDates)) {
        applyIfEmpty(field as keyof EventFormDto, value);
      }
    }
  }, [deadline, isCreateMode, methods, stepParam]);

  useEffect(() => {
    if (isFetched) {
      if (resData) {
        const mapped = mapDetailToFormValues(resData);
        const currentValues = methods.getValues();
        methods.reset({ ...currentValues, ...mapped }, { keepDirtyValues: true });
      }
      setInitializedStep(stepParam);
    }
  }, [resData, isFetched, stepParam, methods]);

  const isFormLoading =
    isLoading ||
    (isDeadlineStep && isDeadlineLoading) ||
    (eventIdParam ? initializedStep !== stepParam : false);
  const { setIsFormLoading } = useEventDetailStore();

  useEffect(() => {
    setIsFormLoading(isFormLoading);
  }, [isFormLoading, setIsFormLoading]);

  (methods as any).isLoading = isFormLoading;
  return { methods, isLoading: isFormLoading, ...actions };
}

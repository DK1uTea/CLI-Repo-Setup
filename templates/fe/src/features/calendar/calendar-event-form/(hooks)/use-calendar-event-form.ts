'use client';

import { useLayoutEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEventDeadline } from '@/features/events/event-form/(hooks)/use-event-deadline';
import { getEventDatesFromDeadline } from '@/features/events/event-form/(helpers)/event-form-helpers';
import { calendarEventFormSchema, type CalendarEventFormDto } from '../(helpers)/calendar-event-form-schema';

function generateCalendarEventId() {
  const digits = Math.floor(10000000 + Math.random() * 90000000);
  return `EVENT-${digits}`;
}

export function useCalendarEventForm(defaultValues?: Partial<CalendarEventFormDto>) {
  const isCreateMode = !defaultValues;
  const { data: deadline } = useEventDeadline(isCreateMode);

  const methods = useForm<CalendarEventFormDto>({
    resolver: zodResolver(calendarEventFormSchema),
    defaultValues: {
      customEventId: generateCalendarEventId(),
      title: '',
      mode: '',
      targetAudience: [],
      eventTypeId: '',
      doNotPublish: false,
      shortDescription: '',
      participation: '',
      link: '',
      images: [],
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      locationId: '',
      address: '',
      street: '',
      zipCode: '',
      city: '',
      isSaveAddress: false,
      contactFirstName: '',
      contactLastName: '',
      contactEmail: '',
      contactPhone: '',
      contacts: [],
      partnershipTypes: [],
      productPartnerCategories: [],
      ...defaultValues,
    },
    mode: 'onChange',
  });

  // Create mode has no fixed offset anymore — once the deadline resolves, the
  // reference date it returns IS the earliest allowed start, so default to it
  // directly instead of an arbitrary today+N days.
  useLayoutEffect(() => {
    if (!isCreateMode || !deadline) return;

    const eventDates = getEventDatesFromDeadline(deadline.deadline);
    if (!eventDates) return;

    const applyIfEmpty = (field: keyof CalendarEventFormDto, value: string) => {
      if (!methods.getValues(field)) methods.setValue(field, value);
    };

    applyIfEmpty('startDate', eventDates.startDate);
    applyIfEmpty('startTime', eventDates.startTime);
    applyIfEmpty('endDate', eventDates.endDate);
    applyIfEmpty('endTime', eventDates.endTime);
  }, [deadline, isCreateMode, methods]);

  return { methods };
}

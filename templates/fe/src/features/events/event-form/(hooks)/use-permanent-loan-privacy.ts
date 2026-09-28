'use client';

import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  isDauerleihgabeEventType,
  isPermanentLoanEventType,
} from '../(helpers)/event-form-constants';
import type { EventFormDto } from '../(helpers)/event-form-schema';
import { useGetEventType } from './use-get-event-type';

export function usePermanentLoanPrivacy() {
  const { setValue, getValues } = useFormContext<EventFormDto>();
  const { eventTypes } = useGetEventType();
  const eventTypeId = useWatch<EventFormDto, 'eventTypeId'>({ name: 'eventTypeId' });
  const selectedType = eventTypes.find((type) => type.id === eventTypeId);
  const isPermanentLoan = isPermanentLoanEventType(selectedType);
  const defaultsToPrivate = isPermanentLoan || isDauerleihgabeEventType(selectedType);

  useEffect(() => {
    if (defaultsToPrivate && getValues('doNotPublish') !== true) {
      setValue('doNotPublish', true, { shouldDirty: false });
    }
  }, [defaultsToPrivate, getValues, setValue]);

  const applyEventTypePrivacy = (nextEventTypeId: string) => {
    const nextType = eventTypes.find((type) => type.id === nextEventTypeId);
    const nextDefaultsToPrivate =
      isPermanentLoanEventType(nextType) || isDauerleihgabeEventType(nextType);

    setValue('doNotPublish', nextDefaultsToPrivate, { shouldDirty: true });
  };

  return { isPermanentLoan, applyEventTypePrivacy };
}

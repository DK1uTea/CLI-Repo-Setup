'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  tradeFairEventFormSchema,
  type TradeFairEventFormDto,
} from '../(helpers)/trade-fair-event-form-schema';
import { useTradeFairEventActions } from './use-trade-fair-event-action';

export function useTradeFairEventForm(defaultValues?: Partial<TradeFairEventFormDto>) {
  const actions = useTradeFairEventActions();

  const methods = useForm<TradeFairEventFormDto>({
    resolver: zodResolver(tradeFairEventFormSchema),
    defaultValues: {
      title: '',
      eventMode: '',
      targetAudience: [],
      eventType: '',
      description: '',
      participation: '',
      eventId: '',
      images: [],
      surveys: [],
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      eventLocation: '',
      locationId: '',
      address: '',
      street: '',
      zipCode: '',
      city: '',
      isSaveLocation: false,
      ...defaultValues,
    },
    mode: 'onChange',
  });

  return { methods, ...actions };
}

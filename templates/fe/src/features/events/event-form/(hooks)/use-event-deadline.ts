'use client';

import { useQuery } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';
import { getEventDatesFromDeadline } from '../(helpers)/event-form-helpers';

export type EventDeadline = {
  referenceDate: string;
  countryCode: string;
  workingDays: number;
  deadline: string;
};

type EventDeadlineEnvelope = { data?: EventDeadline };

export async function getEventDeadline(): Promise<EventDeadline> {
  const response = await apiProxy.get<EventDeadlineEnvelope>(
    '/etr/holidays/deadline',
    { _skipToast: true } as object,
  );
  const deadline = response.data.data;

  if (!deadline || !getEventDatesFromDeadline(deadline.deadline)) {
    throw new Error('Invalid event deadline response');
  }

  return deadline;
}

export function useEventDeadline(enabled: boolean) {
  return useQuery({
    queryKey: ['event-deadline'],
    queryFn: getEventDeadline,
    enabled,
    retry: false,
    staleTime: Infinity,
  });
}

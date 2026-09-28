'use client';

import { useQuery } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';
import type { EventCommonDetail } from '@/features/events/event-detail/common/(services)/event-common-service';

export type { EventCommonDetail as CalendarEventDetail } from '@/features/events/event-detail/common/(services)/event-common-service';

type CalendarEventDetailEnvelope = {
  data?: EventCommonDetail;
};

async function fetchCalendarEventDetail(eventId: string) {
  const response = await apiProxy.get<CalendarEventDetailEnvelope>(`etr/calendar/${eventId}`);
  return response.data?.data;
}

export function useCalendarEventDetail(eventId: string) {
  return useQuery({
    queryKey: ['calendar-event-detail', eventId],
    queryFn: () => fetchCalendarEventDetail(eventId),
    enabled: !!eventId,
  });
}

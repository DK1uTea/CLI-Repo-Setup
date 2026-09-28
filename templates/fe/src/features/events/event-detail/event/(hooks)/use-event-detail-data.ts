'use client';

import { useQuery } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';
import type { EventCommonDetail } from '@/features/events/event-detail/common/(services)/event-common-service';

export type {
  EventCommonDetail as EventDetail,
  EventComment,
  EventCommonProduct,
} from '@/features/events/event-detail/common/(services)/event-common-service';

type EventDetailEnvelope = {
  data?: EventCommonDetail;
};

async function fetchEventDetail(eventId: string) {
  const response = await apiProxy.get<EventDetailEnvelope>(`etr/events/${eventId}`);
  return response.data?.data;
}

export function useEventDetailData(id: string) {
  return useQuery({
    queryKey: ['event-detail', id],
    queryFn: () => fetchEventDetail(id),
    enabled: !!id,
    staleTime: 0,
  });
}

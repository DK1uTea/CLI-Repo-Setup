'use client';

import { useQuery } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';

export type EventOrderActiveCount = {
  total: number;
  haveActive: boolean;
};

type EventOrderActiveCountEnvelope = { data?: EventOrderActiveCount };

async function getEventOrderActiveCount(eventId: string): Promise<EventOrderActiveCount> {
  const response = await apiProxy.get<EventOrderActiveCountEnvelope>(
    `/etr/event-orders/${eventId}/active-count`,
  );
  return response.data.data ?? { total: 0, haveActive: false };
}

export function useEventOrderActiveCount(eventId?: string | null) {
  return useQuery({
    queryKey: ['event-order-active-count', eventId],
    queryFn: () => getEventOrderActiveCount(eventId as string),
    enabled: Boolean(eventId),
    staleTime: 0,
  });
}

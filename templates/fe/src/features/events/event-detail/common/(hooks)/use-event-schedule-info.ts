'use client';

import { useContext } from 'react';
import { QueryClient, QueryClientContext, useQuery } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';

export type EventScheduleHistoryItem = {
  startDate: string;
  endDate: string;
  changedAt: string;
  changedBy: string;
  changedByAvatar?: string | null;
};

export type EventScheduleInfoResponse = {
  setup?: EventScheduleHistoryItem[];
  start?: EventScheduleHistoryItem[];
  teardown?: EventScheduleHistoryItem[];
};

export const eventScheduleInfoKeys = {
  all: ['event-schedule-info'] as const,
  detail: (eventId: string) => [...eventScheduleInfoKeys.all, eventId] as const,
};

let fallbackClient: QueryClient | null = null;
function getFallbackClient() {
  if (!fallbackClient) {
    fallbackClient = new QueryClient({
      defaultOptions: { queries: { enabled: false, retry: false } },
    });
  }
  return fallbackClient;
}

async function fetchEventScheduleInfo(eventId: string): Promise<EventScheduleInfoResponse> {
  const response = await apiProxy.get(`etr/events/${eventId}/schedule-info`);
  return response.data.data as EventScheduleInfoResponse;
}

export function useEventScheduleInfo(eventId: string) {
  const contextClient = useContext(QueryClientContext);
  const client = contextClient ?? getFallbackClient();

  return useQuery(
    {
      queryKey: eventScheduleInfoKeys.detail(eventId),
      queryFn: () => fetchEventScheduleInfo(eventId),
      enabled: !!eventId && !!contextClient,
    },
    client,
  );
}

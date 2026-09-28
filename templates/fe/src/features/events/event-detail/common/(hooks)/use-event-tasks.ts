'use client';

import { useQuery } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';
import type { PaginationType } from '@/shared/types/pagination-type';
import type { EventTask, EventTaskService } from '../(services)/event-common-service';

export type EventTasksParams = {
  eventId: string;
  page: number;
  limit: number;
  service?: EventTaskService;
};

type EventTasksEnvelope = {
  data?: { items?: EventTask[]; pagination?: PaginationType };
};

export const eventTaskKeys = {
  all: ['event-tasks'] as const,
  byEvent: (eventId: string) => [...eventTaskKeys.all, eventId] as const,
  list: (params: EventTasksParams) => [...eventTaskKeys.byEvent(params.eventId), params] as const,
};

async function fetchEventTasks(params: EventTasksParams) {
  const response = await apiProxy.get<EventTasksEnvelope>('etr/event-tasks', { params });
  const items = response.data?.data?.items;
  return {
    tasks: Array.isArray(items) ? items : [],
    pagination: response.data?.data?.pagination ?? null,
  };
}

export function useEventTasks(params: EventTasksParams) {
  return useQuery({
    queryKey: eventTaskKeys.list(params),
    queryFn: () => fetchEventTasks(params),
    enabled: !!params.eventId,
  });
}

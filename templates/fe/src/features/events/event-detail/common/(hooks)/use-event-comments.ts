'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';
import type { EventComment } from '../(services)/event-common-service';

type EventCommentsEnvelope = {
  data?: {
    items?: EventComment[];
    meta?: { nextCursor?: string | null; hasMore?: boolean };
  };
};

export const eventCommentKeys = {
  all: ['event-comments'] as const,
  byEvent: (eventId: string) => [...eventCommentKeys.all, eventId] as const,
  list: (eventId: string, limit: number) => [...eventCommentKeys.byEvent(eventId), { limit }] as const,
};

async function fetchEventComments(eventId: string, limit: number, cursor?: string) {
  const response = await apiProxy.get<EventCommentsEnvelope>(`etr/events/${eventId}/comments`, {
    params: { limit, cursor },
  });
  const items = response.data?.data?.items;
  const meta = response.data?.data?.meta;
  return {
    comments: Array.isArray(items) ? items : [],
    cursor: meta?.nextCursor ?? null,
    hasMore: meta?.hasMore ?? false,
  };
}

export function useEventComments(eventId: string, limit: number) {
  return useInfiniteQuery({
    queryKey: eventCommentKeys.list(eventId, limit),
    queryFn: ({ pageParam }) => fetchEventComments(eventId, limit, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.cursor ?? undefined : undefined),
    enabled: !!eventId,
  });
}

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';
import type { EventComment } from '../(services)/event-common-service';
import { eventCommentKeys } from './use-event-comments';

type SendEventCommentPayload = { eventId: string; content: string; parentId?: string };

async function sendEventComment({ eventId, content, parentId }: SendEventCommentPayload) {
  const response = await apiProxy.post(`etr/events/${eventId}/comments`, { content, parentId });
  return response.data.data as EventComment;
}

export function useSendEventComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendEventComment,
    onSuccess: (_, variables) => queryClient.invalidateQueries({
      queryKey: eventCommentKeys.byEvent(variables.eventId),
    }),
  });
}

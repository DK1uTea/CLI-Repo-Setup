'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';
import { eventTaskKeys } from './use-event-tasks';

type DeleteEventTaskPayload = { eventId: string; taskId: string };

async function deleteEventTask({ taskId }: DeleteEventTaskPayload): Promise<void> {
  await apiProxy.delete(`etr/event-tasks/${taskId}`);
}

export function useDeleteEventTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEventTask,
    onSuccess: (_, variables) => queryClient.invalidateQueries({
      queryKey: eventTaskKeys.byEvent(variables.eventId),
    }),
  });
}

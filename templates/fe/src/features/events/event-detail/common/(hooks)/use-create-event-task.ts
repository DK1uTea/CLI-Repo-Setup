'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';
import type { EventTask, EventTaskService } from '../(services)/event-common-service';
import { eventTaskKeys } from './use-event-tasks';

export type CreateEventTaskPayload = {
  eventId: string;
  service: EventTaskService;
  comment?: string;
  files?: string[];
};

async function createEventTask(payload: CreateEventTaskPayload): Promise<EventTask> {
  const response = await apiProxy.post('etr/event-tasks', payload);
  return response.data.data as EventTask;
}

export function useCreateEventTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEventTask,
    onSuccess: (_, variables) => queryClient.invalidateQueries({
      queryKey: eventTaskKeys.byEvent(variables.eventId),
    }),
  });
}

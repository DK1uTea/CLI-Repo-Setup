'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';

const launchEvent = async (eventId: string) => {
  const response = await apiProxy.patch(`tf/events/${eventId}/launch`);
  return response.data.data;
};

export function useLaunchEvent(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => launchEvent(eventId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['trade-fair-event-detail', eventId],
        }),
        queryClient.invalidateQueries({ queryKey: ['trade-fair-event-list'] }),
      ]);
    },
  });
}

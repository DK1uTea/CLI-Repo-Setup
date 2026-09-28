'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';

type TransferEventOwnershipPayload = { eventId: string; userId: string };

async function transferEventOwnership(payload: TransferEventOwnershipPayload): Promise<void> {
  await apiProxy.patch('etr/events/transfer-ownership', payload);
}

export function useTransferEventOwnership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transferEventOwnership,
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['event-detail', variables.eventId] }),
        queryClient.invalidateQueries({ queryKey: ['calendar-event-detail', variables.eventId] }),
      ]);
    },
  });
}

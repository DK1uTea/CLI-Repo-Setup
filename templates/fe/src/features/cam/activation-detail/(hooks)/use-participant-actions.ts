'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';

async function addParticipants(activationId: string, userIds: string[]) {
  const { data } = await apiProxy.post(`/cam/activations-admin/${activationId}/add-participants`, { userIds });
  return data;
}

async function removeParticipant(activationId: string, userId: string) {
  const { data } = await apiProxy.delete(`/cam/activations-admin/${activationId}/remove-participant`, {
    data: { userId },
  });
  return data;
}

function useInvalidateParticipants() {
  const queryClient = useQueryClient();
  return (activationId: string) =>
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === 'cam-activation-participants' && query.queryKey[1] === activationId,
    });
}

export function useAddParticipants() {
  const invalidate = useInvalidateParticipants();
  return useMutation({
    mutationFn: ({ activationId, userIds }: { activationId: string; userIds: string[] }) => addParticipants(activationId, userIds),
    onSuccess: (_, { activationId }) => invalidate(activationId),
  });
}

export function useRemoveParticipant() {
  const invalidate = useInvalidateParticipants();
  return useMutation({
    mutationFn: ({ activationId, userId }: { activationId: string; userId: string }) => removeParticipant(activationId, userId),
    onSuccess: (_, { activationId }) => invalidate(activationId),
  });
}

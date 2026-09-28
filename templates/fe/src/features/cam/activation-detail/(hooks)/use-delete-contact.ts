'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';
import { CONTACTS_QUERY_KEY } from './use-list-contacts';

async function deleteContact(contactId: string, activationId: string) {
  const { data } = await apiProxy.delete(`/cam/contacts/${contactId}`, { params: { activationId } });
  return data;
}

export function useDeleteContact(activationId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contactId: string) => deleteContact(contactId, activationId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTACTS_QUERY_KEY, activationId] });
    },
  });
}

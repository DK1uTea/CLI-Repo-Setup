'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';
import { CONTACTS_QUERY_KEY } from './use-list-contacts';

type UpdateContactBody = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  tel: string;
  address: string;
  activationId: string;
};

async function updateContact({ id, activationId, ...data }: UpdateContactBody) {
  const response = await apiProxy.put(`/cam/contacts/${id}`, data);
  return response.data;
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateContact,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [CONTACTS_QUERY_KEY, variables.activationId] });
      queryClient.invalidateQueries({ queryKey: ['cam-contact-detail', variables.id] });
    },
  });
}

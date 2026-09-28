'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';
import { CONTACTS_QUERY_KEY } from './use-list-contacts';

type AddContactBody = {
  firstName: string;
  lastName: string;
  email: string;
  tel: string;
  address: string;
  activationId: string;
  contactId?: string;
};

async function addContact(body: AddContactBody) {
  const { data } = await apiProxy.post('/cam/contacts', body);
  return data;
}

export function useAddContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addContact,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [CONTACTS_QUERY_KEY, variables.activationId] });
    },
  });
}

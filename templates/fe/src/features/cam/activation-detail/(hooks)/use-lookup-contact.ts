'use client';

import { useMutation } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';
import { ActivationContact } from './use-list-contacts';

async function lookupContact(email: string): Promise<ActivationContact | null> {
  const response = await apiProxy.get<{ data: ActivationContact | null }>('/cam/contacts/lookup', {
    params: { email },
  });
  return response.data.data;
}

export function useLookupContact() {
  return useMutation({ mutationFn: lookupContact });
}

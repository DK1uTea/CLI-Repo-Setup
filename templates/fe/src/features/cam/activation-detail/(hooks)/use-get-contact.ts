'use client';

import { useQuery } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';
import { ActivationContact } from './use-list-contacts';

async function fetchContact(contactId: string): Promise<ActivationContact> {
  const response = await apiProxy.get<{ data: ActivationContact }>(`/cam/contacts/${contactId}`);
  return response.data.data;
}

export function useGetContact(contactId: string | null) {
  return useQuery({
    queryKey: ['cam-contact-detail', contactId],
    queryFn: () => fetchContact(contactId!),
    enabled: !!contactId,
  });
}

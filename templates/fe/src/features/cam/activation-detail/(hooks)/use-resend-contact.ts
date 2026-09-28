'use client';

import { useMutation } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';

type ResendContactPayload = {
  contactId: string;
  activationId: string;
};

async function resendContact({ contactId, activationId }: ResendContactPayload) {
  const { data } = await apiProxy.post(`/cam/contacts/${contactId}/resend-email`, { activationId });
  return data;
}

export function useResendContact() {
  return useMutation({
    mutationFn: resendContact,
  });
}

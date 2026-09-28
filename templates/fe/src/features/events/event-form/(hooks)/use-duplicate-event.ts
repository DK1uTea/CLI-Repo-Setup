'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';
import { apiProxy } from '@/lib/api';

export const duplicateEventApi = async (eventId: string): Promise<{ id: string }> => {
  const response = await apiProxy.post(`/etr/events/${eventId}/duplicate`);
  return response.data.data as { id: string };
};

export function useDuplicateEvent(buildRedirectHref: (id: string) => string) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const duplicate = async (eventId: string): Promise<boolean> => {
    setIsPending(true);
    try {
      const res = await duplicateEventApi(eventId);
      toast.success('Event duplicated successfully');
      router.push(buildRedirectHref(res.id));
      return true;
    } catch (error) {
      console.error('Failed to duplicate event:', error);
      toast.error('Failed to duplicate event');
      return false;
    } finally {
      setIsPending(false);
    }
  };

  return { duplicate, isPending };
}

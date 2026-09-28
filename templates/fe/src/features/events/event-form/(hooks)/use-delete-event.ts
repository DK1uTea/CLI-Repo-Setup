'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';
import { apiProxy } from '@/lib/api';

export const deleteEventApi = async (eventId: string): Promise<void> => {
  await apiProxy.delete(`/etr/events/${eventId}`);
};

export function useDeleteEvent() {
  const router = useRouter();
  const t = useTranslations('events.list');
  const [isPending, setIsPending] = useState(false);

  const deleteEvent = async (eventId: string, callback?: () => void): Promise<boolean> => {
    setIsPending(true);
    try {
      await deleteEventApi(eventId);
      toast.success(t('deleteSuccess'));
      if (callback) {
        callback();
      } else {
        router.push('/events');
      }
      return true;
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event');
      return false;
    } finally {
      setIsPending(false);
    }
  };

  return { deleteEvent, isPending };
}

'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useQueryState, parseAsString } from 'nuqs';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { apiProxy } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import {
  refreshEventMutationQueries,
  type EventMutationRefreshScope,
} from '../(helpers)/event-mutation-refresh';

type Options = {
  redirectHref?: string;
  refreshScope?: EventMutationRefreshScope;
};

export const submitEventSummary = async (eventId: string): Promise<{ id: string }> => {
  const response = await apiProxy.post(`/etr/events/${eventId}/summary`);
  return response.data.data as { id: string };
};

export function useSubmitEvent(options: Options = {}) {
  const router = useRouter();
  const t = useTranslations('eventForm');
  const queryClient = useQueryClient();
  const [eventIdParam] = useQueryState('eventId', parseAsString);
  const redirectHref = options.redirectHref ?? '/events';
  const refreshScope = options.refreshScope ?? { type: 'cart' };
  const [isPending, setIsPending] = useState(false);

  const submit = async (): Promise<boolean> => {
    if (!eventIdParam) {
      toast.error('Event ID is missing. Cannot submit event.');
      return false;
    }

    setIsPending(true);
    try {
      await submitEventSummary(eventIdParam);
      toast.success(t('submitSuccess'));
      router.push(redirectHref);
      return true;
    } catch (error) {
      console.error('Failed to submit event summary:', error);
      await refreshEventMutationQueries(queryClient, eventIdParam, refreshScope, {
        includeActiveOrder: true,
        includeStepDetail: true,
      });
      if (!(error as { response?: unknown }).response) {
        toast.error(t('submitError'));
      }
      return false;
    } finally {
      setIsPending(false);
    }
  };

  return { submit, isPending };
}

'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useEventCartStore } from '@/features/events/(stores)/use-event-cart-store';
import { submitEventSummary } from './use-submit-event';
import {
  refreshEventMutationQueries,
  type EventMutationRefreshScope,
} from '../(helpers)/event-mutation-refresh';

export function useCreateEventOrder({ refreshScope = { type: 'cart' } }: { refreshScope?: EventMutationRefreshScope } = {}) {
  const queryClient = useQueryClient();
  const t = useTranslations('eventForm');
  const [isPending, setIsPending] = useState(false);

  const createOrder = async (eventId: string): Promise<boolean> => {
    setIsPending(true);
    try {
      await submitEventSummary(eventId);
      // The new order is built from the current cart — quantities now match
      // it exactly. Stamp locally so the cart-changed guard doesn't briefly
      // see stale actualQuantity from before this order existed.
      useEventCartStore.getState().markCartAsOrdered();
      await refreshEventMutationQueries(queryClient, eventId, refreshScope, { includeActiveOrder: true });
      return true;
    } catch (error) {
      console.error('Failed to create event order:', error);
      await refreshEventMutationQueries(queryClient, eventId, refreshScope, { includeActiveOrder: true });
      if (!(error as { response?: unknown }).response) {
        toast.error(t('orderChoiceDialog.createOrderError'));
      }
      return false;
    } finally {
      setIsPending(false);
    }
  };

  return { createOrder, isPending };
}

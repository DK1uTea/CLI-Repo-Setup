'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { apiProxy } from '@/lib/api';
import { useEventCartStore } from '@/features/events/(stores)/use-event-cart-store';
import {
  refreshEventMutationQueries,
  type EventMutationRefreshScope,
} from '../(helpers)/event-mutation-refresh';

export async function reactivateEventOrderApi(eventId: string): Promise<void> {
  await apiProxy.post(`/etr/event-orders/${eventId}/reactive`);
}

export function useReactivateEventOrder({ refreshScope = { type: 'cart' } }: { refreshScope?: EventMutationRefreshScope } = {}) {
  const queryClient = useQueryClient();
  const t = useTranslations('eventForm');
  const [isPending, setIsPending] = useState(false);

  const reactivateOrder = async (eventId: string): Promise<boolean> => {
    setIsPending(true);
    try {
      await reactivateEventOrderApi(eventId);
      // Reactivating restores the previous order as-is — the cart's current
      // quantities now match it again. Stamp locally before the async
      // invalidation below so the cart-changed guard doesn't briefly see
      // stale actualQuantity and immediately reopen its own dialog.
      useEventCartStore.getState().markCartAsOrdered();
      await refreshEventMutationQueries(queryClient, eventId, refreshScope, { includeActiveOrder: true });
      return true;
    } catch (error) {
      console.error('Failed to reactivate event order:', error);
      await refreshEventMutationQueries(queryClient, eventId, refreshScope, { includeActiveOrder: true });
      if (!(error as { response?: unknown }).response) {
        toast.error(t('orderChoiceDialog.reactivateError'));
      }
      return false;
    } finally {
      setIsPending(false);
    }
  };

  return { reactivateOrder, isPending };
}

'use client';

import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useEventCartStore } from '@/features/events/(stores)/use-event-cart-store';
import { useNavigationGuard } from '@/shared/hooks/common/use-navigation-guard';
import { validateCartForOrder, toastCartOrderError } from '../(helpers)/cart-stock-validation';
import { useReactivateEventOrder } from './use-reactivate-event-order';
import { useCreateEventOrder } from './use-create-event-order';
import type { EventMutationRefreshScope } from '../(helpers)/event-mutation-refresh';

/**
 * When an active event has no active order (for example, it was cancelled
 * outside this flow), leaving the page in that state is blocked
 * until the user picks what happens to the order. `onResolved` clears the
 * caller's missing-order flag once the order is reactivated.
 */
export function useEventOrderReactivateGuard(
  eventId: string | null,
  active: boolean,
  onResolved: () => void,
  refreshScope: EventMutationRefreshScope = { type: 'cart' },
) {
  const t = useTranslations('eventForm');
  const { reactivateOrder, isPending } = useReactivateEventOrder({ refreshScope });
  const { createOrder, isPending: isCreatingOrder } = useCreateEventOrder({ refreshScope });
  const [open, setOpen] = useState(false);
  const pendingNavRef = useRef<(() => void) | null>(null);

  useNavigationGuard(
    active && !!eventId,
    (proceed) => {
      pendingNavRef.current = proceed;
      setOpen(true);
    },
    { blocksInternalNav: false },
  );

  const stay = () => {
    pendingNavRef.current = null;
    setOpen(false);
  };

  // `onResolved` flips the guard's `active` prop to false, which clears
  // useNavigationGuard's module-level `_blocker` in a useEffect. That effect
  // only commits on the next passive-effect flush, so replaying `nav()` (an
  // anchor.click()) right after a plain setState would still hit the stale
  // blocker and get re-intercepted — the user never leaves the page.
  // flushSync forces the state update and its effect to commit synchronously
  // before we replay the navigation.
  const resolveAndNavigate = () => {
    const nav = pendingNavRef.current;
    pendingNavRef.current = null;
    flushSync(() => {
      setOpen(false);
      onResolved();
    });
    nav?.();
  };

  const confirmReactivate = async () => {
    if (!eventId) return;
    const ok = await reactivateOrder(eventId);
    if (!ok) return;

    toast.success(t('orderChoiceDialog.reactivateSuccess'));
    resolveAndNavigate();
  };

  const confirmCreateOrder = async () => {
    if (!eventId) return;
    const cart = useEventCartStore.getState().cart;
    if (toastCartOrderError(validateCartForOrder(cart), t)) return;
    const ok = await createOrder(eventId);
    if (!ok) return;

    toast.success(t('orderChoiceDialog.createOrderSuccess'));
    resolveAndNavigate();
  };

  return { open, isPending, isCreatingOrder, stay, confirmReactivate, confirmCreateOrder };
}

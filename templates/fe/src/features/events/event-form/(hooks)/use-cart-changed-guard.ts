'use client';

import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useEventCartStore } from '@/features/events/(stores)/use-event-cart-store';
import { useEventDetailStore } from '@/features/events/(stores)/use-event-detail-store';
import { useNavigationGuard } from '@/shared/hooks/common/use-navigation-guard';
import { hasCartOrderChanges } from '../(helpers)/cart-order-state';
import { validateCartForOrder, toastCartOrderError } from '../(helpers)/cart-stock-validation';
import { useEventOrderActiveCount } from './use-event-order-active-count';
import { useCreateEventOrder } from './use-create-event-order';
import type { EventMutationRefreshScope } from '../(helpers)/event-mutation-refresh';

/**
 * The event has an active order, but the cart has since diverged from it
 * (an item is new/deleted/changed relative to the order — see
 * cart-order-state.ts). Leaving the page in that state is intercepted and
 * offers Leave event (keep the old order, discard the cart divergence),
 * Stay on page, or Create new order (push the cart into a new order,
 * cancelling the previous one).
 */
export function useCartChangedGuard(
  eventId: string | null,
  enabled = true,
  refreshScope: EventMutationRefreshScope = { type: 'cart' },
) {
  const t = useTranslations('eventForm');
  const canEdit = useEventDetailStore((state) => state.canEdit);
  const { cart } = useEventCartStore();
  const { data } = useEventOrderActiveCount(enabled ? eventId : null);
  const { createOrder, isPending } = useCreateEventOrder({ refreshScope });

  const haveActive = data?.haveActive ?? false;
  const cartDiverges = enabled && canEdit && haveActive && hasCartOrderChanges(cart);

  const [open, setOpen] = useState(false);
  const pendingNavRef = useRef<(() => void) | null>(null);
  // The cart divergence doesn't clear itself just because the user chose to
  // leave/create an order — unlike the reactivate guard's "cancelled" flag,
  // there is nothing external that flips `cartDiverges` off. `bypassed`
  // provides that local override so `active` can still be forced to false
  // before replaying navigation.
  const [bypassed, setBypassed] = useState(false);
  const active = !bypassed && cartDiverges;

  useNavigationGuard(
    !!eventId && active,
    (proceed) => {
      pendingNavRef.current = proceed;
      setOpen(true);
    },
    { blocksInternalNav: false },
  );

  // The navigation-guard click interceptor unconditionally calls
  // preventDefault() whenever a guard is still registered, so simply calling
  // `nav()` again would just get re-intercepted forever. `active` must
  // actually turn false (removing this guard from the stack) before
  // replaying — flushSync forces that state update and its effect to commit
  // synchronously first, same pattern as use-event-order-reactivate-guard.ts.
  const resolveAndNavigate = () => {
    const nav = pendingNavRef.current;
    pendingNavRef.current = null;
    flushSync(() => {
      setOpen(false);
      setBypassed(true);
    });
    nav?.();
  };

  const leaveEvent = () => resolveAndNavigate();

  const stay = () => {
    pendingNavRef.current = null;
    setOpen(false);
  };

  const confirmCreateOrder = async () => {
    if (!eventId) return;
    if (toastCartOrderError(validateCartForOrder(cart), t)) return;
    const ok = await createOrder(eventId);
    if (!ok) return;

    toast.success(t('cartChangedDialog.createOrderSuccess'));
    resolveAndNavigate();
  };

  return { open, isPending, leaveEvent, stay, confirmCreateOrder };
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { useEventDetailStore } from '@/features/events/(stores)/use-event-detail-store';
import { useEventOrderActiveCount } from './use-event-order-active-count';

const ACTIVE_STATUS = 'ACTIVE';

export function useEventOrderCancelGuard(eventId: string | null, enabled = true) {
  // The calendar variant has no product/order steps, so it never needs this
  // lookup — callers pass `enabled: false` (isCalendarVariant) to skip it.
  const { data, dataUpdatedAt } = useEventOrderActiveCount(enabled ? eventId : null);
  const canEdit = useEventDetailStore((state) => state.canEdit);
  const status = useEventDetailStore((state) => state.status);
  const [cancelled, setCancelled] = useState(false);
  const shownMissingOrderIdsRef = useRef(new Set<string>());

  const haveActive = data?.haveActive ?? false;

  // An ACTIVE event with an eventId must always have an order. A DRAFT event
  // never needs this — it hasn't been published/created an order yet, so a
  // missing active order there is expected, not a problem to block on.
  // This isn't restricted to any particular step — leaving via "Back to
  // events", a breadcrumb, the sidebar app nav, or browser back/forward must
  // be blocked from ANY step, since useNavigationGuard intercepts navigation
  // regardless of the current step. Checked on every mount (not just
  // remembered from an in-session action) so a page reload still re-derives
  // this from the live active-count response rather than relying on
  // transient state that resets on reload. Tracked once per event so it
  // doesn't re-fire and reopen the dialog right after the reactivate/create-
  // order guard resolves it back to false.
  useEffect(() => {
    if (!canEdit || status !== ACTIVE_STATUS) return;

    if (eventId && !shownMissingOrderIdsRef.current.has(eventId) && dataUpdatedAt > 0 && !haveActive) {
      shownMissingOrderIdsRef.current.add(eventId);
      setCancelled(true);
    }
  }, [canEdit, dataUpdatedAt, eventId, haveActive, status]);

  return { cancelled, setCancelled };
}

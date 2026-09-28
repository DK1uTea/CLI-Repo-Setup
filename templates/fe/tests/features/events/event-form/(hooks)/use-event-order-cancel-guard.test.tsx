import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useEventOrderCancelGuard } from '@/features/events/event-form/(hooks)/use-event-order-cancel-guard';

const { activeCountState, eventDetailState, useEventOrderActiveCountMock } = vi.hoisted(() => ({
  activeCountState: { data: { total: 1, haveActive: true } as { total: number; haveActive: boolean } | undefined },
  eventDetailState: { canEdit: true, status: 'ACTIVE' as string | null },
  useEventOrderActiveCountMock: vi.fn(),
}));

vi.mock('@/features/events/event-form/(hooks)/use-event-order-active-count', () => ({
  useEventOrderActiveCount: useEventOrderActiveCountMock,
}));
vi.mock('@/features/events/(stores)/use-event-detail-store', () => ({
  useEventDetailStore: (selector: (state: typeof eventDetailState) => unknown) => selector(eventDetailState),
}));

describe('useEventOrderCancelGuard', () => {
  beforeEach(() => {
    activeCountState.data = { total: 1, haveActive: true };
    eventDetailState.canEdit = true;
    eventDetailState.status = 'ACTIVE';
    useEventOrderActiveCountMock.mockReset();
    useEventOrderActiveCountMock.mockImplementation(() => ({
      data: activeCountState.data,
      dataUpdatedAt: activeCountState.data ? 1 : 0,
    }));
  });

  it('enables the active-count lookup by default (events variant)', () => {
    renderHook(() => useEventOrderCancelGuard('event-1'));

    expect(useEventOrderActiveCountMock).toHaveBeenCalledWith('event-1');
  });

  it('disables the active-count lookup on the calendar variant — it has no product step', () => {
    renderHook(() => useEventOrderCancelGuard('event-1', false));

    expect(useEventOrderActiveCountMock).toHaveBeenCalledWith(null);
  });

  it('keeps the event available when the active-count response has an active order', () => {
    const { result } = renderHook(() => useEventOrderCancelGuard('event-1'));

    expect(result.current.cancelled).toBe(false);
  });

  it('does not mark the order as missing when the event is outside its editable period', () => {
    activeCountState.data = { total: 0, haveActive: false };
    eventDetailState.canEdit = false;

    const { result } = renderHook(() => useEventOrderCancelGuard('event-1'));

    expect(result.current.cancelled).toBe(false);
  });

  it('marks the order as missing when an active-count response arrives after mount', () => {
    activeCountState.data = undefined;
    const { result, rerender } = renderHook(() => useEventOrderCancelGuard('event-1'));

    expect(result.current.cancelled).toBe(false);

    activeCountState.data = { total: 0, haveActive: false };
    rerender();

    expect(result.current.cancelled).toBe(true);
  });

  describe('deriving the missing-order state from active-count on mount (e.g. after a reload)', () => {
    it('marks the order as cancelled/missing when a guarded step has no active order', () => {
      activeCountState.data = { total: 0, haveActive: false };

      const { result } = renderHook(() =>
        useEventOrderCancelGuard('event-1'),
      );

      expect(result.current.cancelled).toBe(true);
    });

    it('does not derive the missing-order state when the event is outside its editable period', () => {
      activeCountState.data = { total: 0, haveActive: false };
      eventDetailState.canEdit = false;

      const { result } = renderHook(() =>
        useEventOrderCancelGuard('event-1'),
      );

      expect(result.current.cancelled).toBe(false);
    });

    it('does not derive the missing-order state for a non-ACTIVE event (e.g. DRAFT) — it never had an order to begin with', () => {
      activeCountState.data = { total: 0, haveActive: false };
      eventDetailState.status = 'DRAFT';

      const { result } = renderHook(() =>
        useEventOrderCancelGuard('event-1'),
      );

      expect(result.current.cancelled).toBe(false);
    });

    it('does not derive the missing-order state before the active-count response has loaded', () => {
      activeCountState.data = undefined;

      const { result } = renderHook(() =>
        useEventOrderCancelGuard('event-1'),
      );

      expect(result.current.cancelled).toBe(false);
    });

    it('does not re-derive the missing-order state once it has been resolved, avoiding a re-open loop', () => {
      activeCountState.data = { total: 0, haveActive: false };

      const { result, rerender } = renderHook(() =>
        useEventOrderCancelGuard('event-1'),
      );
      expect(result.current.cancelled).toBe(true);

      act(() => result.current.setCancelled(false));
      rerender();

      expect(result.current.cancelled).toBe(false);
    });
  });
});

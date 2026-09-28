import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCartChangedGuard } from '@/features/events/event-form/(hooks)/use-cart-changed-guard';

const {
  activeCountState,
  cartState,
  eventDetailState,
  createOrderMock,
  navigationGuardMock,
} = vi.hoisted(() => ({
  activeCountState: { data: { total: 1, haveActive: true } as { total: number; haveActive: boolean } | undefined },
  cartState: { cart: [{ quantity: 1, actualQuantity: 0 }] as { quantity: number; actualQuantity?: number }[] },
  eventDetailState: { canEdit: true },
  createOrderMock: vi.fn(),
  navigationGuardMock: vi.fn(),
}));

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/features/events/event-form/(hooks)/use-event-order-active-count', () => ({
  useEventOrderActiveCount: () => ({ data: activeCountState.data }),
}));
vi.mock('@/features/events/event-form/(hooks)/use-create-event-order', () => ({
  useCreateEventOrder: () => ({ createOrder: createOrderMock, isPending: false }),
}));
vi.mock('@/features/events/(stores)/use-event-cart-store', () => ({
  useEventCartStore: () => ({ cart: cartState.cart }),
}));
vi.mock('@/features/events/(stores)/use-event-detail-store', () => ({
  useEventDetailStore: (selector: (state: typeof eventDetailState) => unknown) => selector(eventDetailState),
}));
vi.mock('@/shared/hooks/common/use-navigation-guard', () => ({
  useNavigationGuard: navigationGuardMock,
}));

describe('useCartChangedGuard', () => {
  beforeEach(() => {
    activeCountState.data = { total: 1, haveActive: true };
    cartState.cart = [{ quantity: 1, actualQuantity: 0 }];
    eventDetailState.canEdit = true;
    createOrderMock.mockReset();
    navigationGuardMock.mockReset();
  });

  it('activates the navigation guard when there is an active order and the cart has diverged from it', () => {
    renderHook(() => useCartChangedGuard('event-1'));

    expect(navigationGuardMock).toHaveBeenCalledWith(true, expect.any(Function), { blocksInternalNav: false });
  });

  it('does not activate when the cart matches the active order', () => {
    cartState.cart = [{ quantity: 2, actualQuantity: 2 }];
    renderHook(() => useCartChangedGuard('event-1'));

    expect(navigationGuardMock).toHaveBeenCalledWith(false, expect.any(Function), { blocksInternalNav: false });
  });

  it('does not activate when there is no active order at all', () => {
    activeCountState.data = { total: 0, haveActive: false };
    renderHook(() => useCartChangedGuard('event-1'));

    expect(navigationGuardMock).toHaveBeenCalledWith(false, expect.any(Function), { blocksInternalNav: false });
  });

  it('does not activate when the event is outside its editable period', () => {
    eventDetailState.canEdit = false;
    renderHook(() => useCartChangedGuard('event-1'));

    expect(navigationGuardMock).toHaveBeenCalledWith(false, expect.any(Function), { blocksInternalNav: false });
  });

  it('opens the dialog when navigation is intercepted', () => {
    const { result } = renderHook(() => useCartChangedGuard('event-1'));
    const onIntercepted = navigationGuardMock.mock.calls[0][1];

    act(() => onIntercepted(vi.fn()));

    expect(result.current.open).toBe(true);
  });

  it('stays on the page without navigating when Stay on page is chosen', () => {
    const proceed = vi.fn();
    const { result } = renderHook(() => useCartChangedGuard('event-1'));
    const onIntercepted = navigationGuardMock.mock.calls[0][1];
    act(() => onIntercepted(proceed));

    act(() => result.current.stay());

    expect(result.current.open).toBe(false);
    expect(proceed).not.toHaveBeenCalled();
  });

  it('resumes the pending navigation without calling any API when Leave event is chosen', () => {
    const proceed = vi.fn();
    const { result } = renderHook(() => useCartChangedGuard('event-1'));
    const onIntercepted = navigationGuardMock.mock.calls[0][1];
    act(() => onIntercepted(proceed));

    act(() => result.current.leaveEvent());

    expect(result.current.open).toBe(false);
    expect(proceed).toHaveBeenCalledTimes(1);
    expect(createOrderMock).not.toHaveBeenCalled();
  });

  it('deactivates the guard before replaying navigation, so a replayed click cannot be re-intercepted', () => {
    // The click interceptor in use-navigation-guard.ts unconditionally calls
    // preventDefault() whenever a guard is still registered — replaying
    // navigation while still "active" would just get re-intercepted forever.
    // `active` (the useNavigationGuard call's first argument) must actually
    // flip to false, synchronously, before leaveEvent() replays the nav.
    const proceed = vi.fn();
    const { result } = renderHook(() => useCartChangedGuard('event-1'));
    const onIntercepted = navigationGuardMock.mock.calls[0][1];
    act(() => onIntercepted(proceed));

    act(() => result.current.leaveEvent());

    const lastActiveArg = navigationGuardMock.mock.calls.at(-1)?.[0];
    expect(lastActiveArg).toBe(false);
  });

  it('stays deactivated on a later render even though the cart still diverges from the order', () => {
    const proceed = vi.fn();
    const { result, rerender } = renderHook(() => useCartChangedGuard('event-1'));
    const onIntercepted = navigationGuardMock.mock.calls[0][1];
    act(() => onIntercepted(proceed));
    act(() => result.current.leaveEvent());

    rerender();

    const lastActiveArg = navigationGuardMock.mock.calls.at(-1)?.[0];
    expect(lastActiveArg).toBe(false);
  });

  it('creates a new order and resumes the pending navigation on confirm', async () => {
    createOrderMock.mockResolvedValueOnce(true);
    const proceed = vi.fn();
    const { result } = renderHook(() => useCartChangedGuard('event-1'));
    const onIntercepted = navigationGuardMock.mock.calls[0][1];
    act(() => onIntercepted(proceed));

    await act(async () => {
      await result.current.confirmCreateOrder();
    });

    expect(createOrderMock).toHaveBeenCalledWith('event-1');
    expect(result.current.open).toBe(false);
    expect(proceed).toHaveBeenCalledTimes(1);
  });

  it('keeps the dialog open and does not navigate when create-order fails', async () => {
    createOrderMock.mockResolvedValueOnce(false);
    const proceed = vi.fn();
    const { result } = renderHook(() => useCartChangedGuard('event-1'));
    const onIntercepted = navigationGuardMock.mock.calls[0][1];
    act(() => onIntercepted(proceed));

    await act(async () => {
      await result.current.confirmCreateOrder();
    });

    expect(result.current.open).toBe(true);
    expect(proceed).not.toHaveBeenCalled();
  });
});

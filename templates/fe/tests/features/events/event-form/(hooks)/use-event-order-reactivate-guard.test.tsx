import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useEventOrderReactivateGuard } from '@/features/events/event-form/(hooks)/use-event-order-reactivate-guard';

const { reactivateOrderMock, createOrderMock, navigationGuardMock, cartState } = vi.hoisted(() => ({
  reactivateOrderMock: vi.fn(),
  createOrderMock: vi.fn(),
  navigationGuardMock: vi.fn(),
  cartState: { cart: [{ quantity: 1 }] },
}));

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/features/events/event-form/(hooks)/use-reactivate-event-order', () => ({
  useReactivateEventOrder: () => ({ reactivateOrder: reactivateOrderMock, isPending: false }),
}));
vi.mock('@/features/events/event-form/(hooks)/use-create-event-order', () => ({
  useCreateEventOrder: () => ({ createOrder: createOrderMock, isPending: false }),
}));
vi.mock('@/features/events/(stores)/use-event-cart-store', () => ({
  useEventCartStore: { getState: () => cartState },
}));
vi.mock('@/shared/hooks/common/use-navigation-guard', () => ({
  useNavigationGuard: navigationGuardMock,
}));

describe('useEventOrderReactivateGuard', () => {
  beforeEach(() => {
    reactivateOrderMock.mockReset();
    createOrderMock.mockReset();
    navigationGuardMock.mockReset();
    cartState.cart = [{ quantity: 1 }];
  });

  it('registers the navigation guard as active only when the order was cancelled and an eventId exists', () => {
    const onResolved = vi.fn();
    renderHook(() => useEventOrderReactivateGuard('event-1', true, onResolved));

    expect(navigationGuardMock).toHaveBeenCalledWith(true, expect.any(Function), { blocksInternalNav: false });
  });

  it('does not activate the guard when the order was not cancelled', () => {
    renderHook(() => useEventOrderReactivateGuard('event-1', false, vi.fn()));

    expect(navigationGuardMock).toHaveBeenCalledWith(false, expect.any(Function), { blocksInternalNav: false });
  });

  it('opens the dialog when navigation is intercepted', () => {
    const { result } = renderHook(() => useEventOrderReactivateGuard('event-1', true, vi.fn()));

    const onIntercepted = navigationGuardMock.mock.calls[0][1];
    act(() => onIntercepted(vi.fn()));

    expect(result.current.open).toBe(true);
  });

  it('stays on the page without navigating when Stay on page is chosen', () => {
    const proceed = vi.fn();
    const { result } = renderHook(() => useEventOrderReactivateGuard('event-1', true, vi.fn()));
    const onIntercepted = navigationGuardMock.mock.calls[0][1];
    act(() => onIntercepted(proceed));

    act(() => result.current.stay());

    expect(result.current.open).toBe(false);
    expect(proceed).not.toHaveBeenCalled();
  });

  it('reactivates the order, notifies the caller, and resumes the pending navigation on confirm', async () => {
    reactivateOrderMock.mockResolvedValueOnce(true);
    const proceed = vi.fn();
    const onResolved = vi.fn();
    const { result } = renderHook(() => useEventOrderReactivateGuard('event-1', true, onResolved));
    const onIntercepted = navigationGuardMock.mock.calls[0][1];
    act(() => onIntercepted(proceed));

    await act(async () => {
      await result.current.confirmReactivate();
    });

    expect(reactivateOrderMock).toHaveBeenCalledWith('event-1');
    expect(onResolved).toHaveBeenCalledTimes(1);
    expect(result.current.open).toBe(false);
    expect(proceed).toHaveBeenCalledTimes(1);
  });

  it('keeps the dialog open and does not navigate when reactivation fails', async () => {
    reactivateOrderMock.mockResolvedValueOnce(false);
    const proceed = vi.fn();
    const { result } = renderHook(() => useEventOrderReactivateGuard('event-1', true, vi.fn()));
    const onIntercepted = navigationGuardMock.mock.calls[0][1];
    act(() => onIntercepted(proceed));

    await act(async () => {
      await result.current.confirmReactivate();
    });

    expect(result.current.open).toBe(true);
    expect(proceed).not.toHaveBeenCalled();
  });

  it('creates a new order, notifies the caller, and resumes the pending navigation on confirm', async () => {
    createOrderMock.mockResolvedValueOnce(true);
    const proceed = vi.fn();
    const onResolved = vi.fn();
    const { result } = renderHook(() => useEventOrderReactivateGuard('event-1', true, onResolved));
    const onIntercepted = navigationGuardMock.mock.calls[0][1];
    act(() => onIntercepted(proceed));

    await act(async () => {
      await result.current.confirmCreateOrder();
    });

    expect(createOrderMock).toHaveBeenCalledWith('event-1');
    expect(onResolved).toHaveBeenCalledTimes(1);
    expect(result.current.open).toBe(false);
    expect(proceed).toHaveBeenCalledTimes(1);
  });

  it('keeps the dialog open and does not navigate when creating a new order fails', async () => {
    createOrderMock.mockResolvedValueOnce(false);
    const proceed = vi.fn();
    const { result } = renderHook(() => useEventOrderReactivateGuard('event-1', true, vi.fn()));
    const onIntercepted = navigationGuardMock.mock.calls[0][1];
    act(() => onIntercepted(proceed));

    await act(async () => {
      await result.current.confirmCreateOrder();
    });

    expect(result.current.open).toBe(true);
    expect(proceed).not.toHaveBeenCalled();
  });
});

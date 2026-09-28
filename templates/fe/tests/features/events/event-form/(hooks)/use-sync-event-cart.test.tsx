import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useSyncEventCart } from '@/features/events/event-form/(hooks)/use-sync-event-cart';

const { setCartMock, cartQueryState } = vi.hoisted(() => ({
  setCartMock: vi.fn(),
  cartQueryState: { data: undefined as { items: any[] } | undefined, enabledCalls: [] as boolean[] },
}));

vi.mock('@/features/events/(stores)/use-event-cart-store', () => ({
  useEventCartStore: (selector: (state: { setCart: typeof setCartMock }) => unknown) =>
    selector({ setCart: setCartMock }),
}));

vi.mock('@/features/events/event-form/(hooks)/use-event-products-cart', () => ({
  useEventProductsCart: (_eventId: string, options?: { enabled?: boolean }) => {
    cartQueryState.enabledCalls.push(!!options?.enabled);
    return { data: options?.enabled ? cartQueryState.data : undefined };
  },
}));

describe('useSyncEventCart', () => {
  it('does not enable the cart query on the overview or logistics steps', () => {
    cartQueryState.enabledCalls.length = 0;
    renderHook(() => useSyncEventCart('event-1', 'overview'));
    renderHook(() => useSyncEventCart('event-1', 'logistics'));

    expect(cartQueryState.enabledCalls.every((enabled) => enabled === false)).toBe(true);
    expect(setCartMock).not.toHaveBeenCalled();
  });

  it('enables the cart query and syncs the store on product_catalog, helping_hand, and summary', () => {
    cartQueryState.data = {
      items: [
        {
          id: 'p1',
          sku: 'SKU-1',
          name: 'Product 1',
          thumbnail: 'https://cdn/p1.png',
          quantity: 3,
          price: 12.5,
          productType: 'rental',
          available: 5,
          totalQuantity: 10,
          rentalAvailableQuantity: 5,
        },
      ],
    };

    renderHook(() => useSyncEventCart('event-1', 'product_catalog'));

    expect(cartQueryState.enabledCalls.at(-1)).toBe(true);
    expect(setCartMock).toHaveBeenCalledWith([
      {
        id: 'p1',
        sku: 'SKU-1',
        name: 'Product 1',
        thumbnail: 'https://cdn/p1.png',
        quantity: 3,
        price: 12.5,
        isRental: true,
        maxQuantity: 9999,
        availableQuantity: 5,
        totalQuantity: 10,
        rentalAvailableQuantity: 5,
      },
    ]);
  });

  it('drops a line whose cart quantity and active-order quantity are both 0 — nothing to show', () => {
    cartQueryState.data = {
      items: [
        {
          id: 'p1',
          sku: 'SKU-1',
          name: 'Product 1',
          thumbnail: 'https://cdn/p1.png',
          quantity: 0,
          actualQuantity: 0,
          price: 12.5,
          productType: 'rental',
          available: 5,
          totalQuantity: 10,
          rentalAvailableQuantity: 5,
        },
        {
          id: 'p2',
          sku: 'SKU-2',
          name: 'Product 2',
          thumbnail: 'https://cdn/p2.png',
          quantity: 1,
          actualQuantity: 0,
          price: 8,
          productType: 'rental',
          available: 5,
          totalQuantity: 10,
          rentalAvailableQuantity: 5,
        },
      ],
    };

    renderHook(() => useSyncEventCart('event-1', 'product_catalog'));

    const syncedCart = setCartMock.mock.calls.at(-1)?.[0];
    expect(syncedCart).toHaveLength(1);
    expect(syncedCart[0].id).toBe('p2');
  });

  it('does not enable the cart query when there is no eventId', () => {
    cartQueryState.enabledCalls.length = 0;
    renderHook(() => useSyncEventCart('', 'summary'));

    expect(cartQueryState.enabledCalls.every((enabled) => enabled === false)).toBe(true);
  });
});

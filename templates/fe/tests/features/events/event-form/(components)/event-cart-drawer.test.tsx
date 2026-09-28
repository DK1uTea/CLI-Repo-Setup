import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EventCartDrawer } from '@/features/events/event-form/(components)/event-cart-drawer';

const { syncCartCalls, syncCartState, footerState, toggleCartMock, cartState, removeFromCartMock, removeProductMutateMock, updateQuantityMock, addProductMutateMock } = vi.hoisted(() => ({
  syncCartCalls: [] as unknown[][],
  syncCartState: { isLoading: false },
  footerState: {
    onNext: vi.fn(),
    onFinalizeEvent: vi.fn(),
    hasCartChanges: false,
    isPending: false,
  },
  toggleCartMock: vi.fn(),
  cartState: { cart: [] as { id: string; sku?: string; quantity: number; price: number; isRental: boolean; actualQuantity?: number }[] },
  removeFromCartMock: vi.fn(),
  removeProductMutateMock: vi.fn(),
  updateQuantityMock: vi.fn(),
  addProductMutateMock: vi.fn(),
}));

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('nuqs', () => ({
  parseAsString: { withDefault: () => ({}) },
  useQueryState: (key: string) => [key === 'eventId' ? 'event-1' : 'product_catalog'],
}));
vi.mock('@/features/events/event-form/(hooks)/use-sync-event-cart', () => ({
  useSyncEventCart: (...args: unknown[]) => {
    syncCartCalls.push(args);
    return syncCartState;
  },
}));
vi.mock('@/features/events/(stores)/use-event-cart-store', () => ({
  useEventCartStore: () => ({
    isOpen: true, toggleCart: toggleCartMock, cart: cartState.cart, removeFromCart: removeFromCartMock, updateQuantity: updateQuantityMock,
  }),
}));
vi.mock('@/features/events/(stores)/use-event-detail-store', () => ({
  useEventDetailStore: () => true,
}));
vi.mock('@/shared/stores/use-user-store', () => ({ useCurrency: () => ({ symbol: '€' }) }));
vi.mock('@/features/events/event-form/(hooks)/use-add-product-to-event', () => ({
  useAddProductToEvent: () => ({ mutate: addProductMutateMock, isPending: false }),
}));
vi.mock('@/features/events/event-form/(hooks)/use-remove-product-from-event', () => ({
  useRemoveProductFromEvent: () => ({ mutate: removeProductMutateMock }),
}));
vi.mock('@/features/events/event-form/(hooks)/use-event-form-footer', () => ({
  useEventFormFooter: () => footerState,
}));
vi.mock('@/features/events/event-form/(hooks)/use-product-detail-href', () => ({
  useProductDetailHref: () => vi.fn(),
}));
vi.mock('@/features/events/event-form/(hooks)/use-event-order-active-count', () => ({
  useEventOrderActiveCount: () => ({ data: { total: 1, haveActive: true } }),
}));

describe('EventCartDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    footerState.onFinalizeEvent.mockResolvedValue(true);
    footerState.hasCartChanges = false;
    syncCartState.isLoading = false;
    cartState.cart = [];
    removeFromCartMock.mockReset();
    removeProductMutateMock.mockReset();
    updateQuantityMock.mockReset();
    addProductMutateMock.mockReset();
  });

  it('owns cart synchronization for the current event creation route', () => {
    syncCartCalls.length = 0;

    render(<EventCartDrawer />);

    expect(syncCartCalls).toEqual([['event-1', 'product_catalog']]);
  });

  it('shows cart item skeletons while the initial cart request is loading', () => {
    syncCartState.isLoading = true;

    render(<EventCartDrawer />);

    expect(screen.getByRole('status', { name: 'cartLoading' })).toBeInTheDocument();
    expect(screen.queryByText('cartEmpty')).not.toBeInTheDocument();
  });

  it('does not show Finalize event when the cart has no order changes', () => {
    footerState.hasCartChanges = false;
    render(<EventCartDrawer />);

    expect(screen.queryByRole('button', { name: 'actions.submit' })).not.toBeInTheDocument();
  });

  it('shows Finalize event next to Save & Continue when the cart has order changes, and closes the drawer on click', async () => {
    footerState.hasCartChanges = true;
    cartState.cart = [{ id: 'item-1', quantity: 1, price: 10, isRental: true }];
    const user = userEvent.setup();
    render(<EventCartDrawer />);

    const finalizeButton = screen.getByRole('button', { name: 'actions.submit' });
    await user.click(finalizeButton);

    expect(footerState.onFinalizeEvent).toHaveBeenCalledTimes(1);
    expect(toggleCartMock).toHaveBeenCalledTimes(1);
  });

  it('keeps the confirmed quantity when the quantity update is rejected', async () => {
    cartState.cart = [{ id: 'item-1', sku: 'SKU-1', quantity: 1, price: 10, isRental: true }];
    addProductMutateMock.mockImplementation((_variables: unknown, callbacks: { onError: (error: Error) => void }) => {
      callbacks.onError(new Error('availability changed'));
    });
    const user = userEvent.setup();

    render(<EventCartDrawer />);
    await user.click(screen.getByRole('spinbutton', { name: 'quantity' }).parentElement!.querySelector('button:last-child')!);

    expect(addProductMutateMock).toHaveBeenCalledWith(
      expect.objectContaining({ eventId: 'event-1', sku: 'SKU-1', quantity: 2 }),
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
    );
    expect(updateQuantityMock).not.toHaveBeenCalled();
  });

  describe('deleting a cart item', () => {
    it('does not remove the item from the local store when it is still tied to an active order — avoids a vanish-then-reappear flicker before the invalidated cart query refetches it as Deleted', async () => {
      cartState.cart = [{ id: 'item-1', sku: 'SKU-1', quantity: 1, price: 10, isRental: true, actualQuantity: 2 }];
      removeProductMutateMock.mockImplementation((_vars, { onSuccess }: { onSuccess: () => void }) => {
        onSuccess();
      });
      const user = userEvent.setup();
      render(<EventCartDrawer />);

      await user.click(screen.getByRole('button', { name: 'delete' }));
      const confirmButtons = screen.getAllByRole('button', { name: 'delete' });
      await user.click(confirmButtons[confirmButtons.length - 1]);

      expect(removeProductMutateMock).toHaveBeenCalledWith(
        { eventId: 'event-1', sku: 'SKU-1' },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
      expect(removeFromCartMock).not.toHaveBeenCalled();
    });

    it('removes the item from the local store when it was never part of an order', async () => {
      cartState.cart = [{ id: 'item-1', sku: 'SKU-1', quantity: 1, price: 10, isRental: true, actualQuantity: 0 }];
      removeProductMutateMock.mockImplementation((_vars, { onSuccess }: { onSuccess: () => void }) => {
        onSuccess();
      });
      const user = userEvent.setup();
      render(<EventCartDrawer />);

      await user.click(screen.getByRole('button', { name: 'delete' }));
      const confirmButtons = screen.getAllByRole('button', { name: 'delete' });
      await user.click(confirmButtons[confirmButtons.length - 1]);

      expect(removeFromCartMock).toHaveBeenCalledWith(0);
    });
  });
});

import { create } from 'zustand';

export type CartItem = {
  id: string;
  sku?: string;
  name: string;
  thumbnail: string;
  quantity: number;
  price: number;
  isRental: boolean;
  maxQuantity: number;
  availableQuantity?: number;
  totalQuantity?: number;
  rentalAvailableQuantity?: number;
  isNew?: boolean;
  slug?: string;
  /** Quantity of this product already in the event's active order (0 if none). */
  actualQuantity?: number;
};

type EventCartStore = {
  isOpen: boolean;
  cart: CartItem[];
  toggleCart: () => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  setCart: (cart: CartItem[]) => void;
  /** Stamps every item's actualQuantity to its current quantity — used right
   * after reactivating/creating an order from the current cart, so the
   * order-divergence comparison reflects the new order immediately instead
   * of waiting on the next cart refetch. */
  markCartAsOrdered: () => void;
  /** Zeroes every item's actualQuantity — used right after cancelling an
   * order, so nothing looks tied to an order that no longer exists. */
  resetActualQuantities: () => void;
};

export const useEventCartStore = create<EventCartStore>((set) => ({
  isOpen: false,
  cart: [],
  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
  addToCart: (item) =>
    set((s) => {
      const existingIndex = s.cart.findIndex(
        (existing) =>
          (item.sku && existing.sku === item.sku) || existing.id === item.id
      );
      if (existingIndex > -1) {
        return {
          cart: s.cart.map((existing, i) =>
            i === existingIndex
              ? { ...existing, quantity: existing.quantity + item.quantity }
              : existing
          ),
        };
      }
      return { cart: [...s.cart, item] };
    }),
  removeFromCart: (index) => set((s) => ({ cart: s.cart.filter((_, i) => i !== index) })),
  updateQuantity: (index, quantity) =>
    set((s) => ({
      cart: s.cart.map((item, i) => (i === index ? { ...item, quantity: Math.max(1, quantity) } : item)),
    })),
  setCart: (cart) => set({ cart }),
  markCartAsOrdered: () =>
    set((s) => ({ cart: s.cart.map((item) => ({ ...item, actualQuantity: item.quantity })) })),
  resetActualQuantities: () =>
    set((s) => ({ cart: s.cart.map((item) => ({ ...item, actualQuantity: 0 })) })),
}));

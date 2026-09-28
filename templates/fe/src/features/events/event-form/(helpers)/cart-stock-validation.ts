import { createElement } from 'react';
import { toast } from 'sonner';

export type InsufficientStockItem = {
  name: string;
  requested: number;
  available: number;
};

type StockCheckItem = {
  name: string;
  quantity: number;
  availableQuantity?: number;
  rentalAvailableQuantity?: number;
};

/**
 * Flags cart lines whose requested quantity exceeds what's actually
 * available — mirrors the per-item max check in event-cart-item.tsx, but run
 * across the whole cart right before an API call that would submit it.
 */
export function getInsufficientStockItems(cart: readonly StockCheckItem[]): InsufficientStockItem[] {
  return cart.reduce<InsufficientStockItem[]>((acc, item) => {
    const available = item.rentalAvailableQuantity ?? item.availableQuantity;
    if (typeof available !== 'number' || !Number.isInteger(available)) return acc;
    if (available >= item.quantity) return acc;
    acc.push({ name: item.name, requested: item.quantity, available });
    return acc;
  }, []);
}

export type CartOrderValidationResult =
  | { valid: true }
  | { valid: false; reason: 'EMPTY' }
  | { valid: false; reason: 'INSUFFICIENT_STOCK'; items: InsufficientStockItem[] };

/**
 * Returns true if the cart is empty or contains no items with positive quantity
 * (e.g. all lines have quantity 0 after being marked for deletion from an active order).
 */
export function isCartEmpty(cart: readonly { quantity: number }[]): boolean {
  return cart.length === 0 || !cart.some((item) => item.quantity > 0);
}

/**
 * Validates the cart before finalizing an event or creating an order.
 * Ensures the cart is non-empty and every requested line has sufficient stock.
 */
export function validateCartForOrder(cart: readonly StockCheckItem[]): CartOrderValidationResult {
  if (isCartEmpty(cart)) {
    return { valid: false, reason: 'EMPTY' };
  }
  const items = getInsufficientStockItems(cart);
  if (items.length > 0) {
    return { valid: false, reason: 'INSUFFICIENT_STOCK', items };
  }
  return { valid: true };
}

/**
 * Toasts the appropriate error message if the cart is invalid for ordering/finalizing.
 * Returns true if an error was toasted (blocked), false otherwise.
 */
export function toastCartOrderError(
  result: CartOrderValidationResult,
  t: (key: any, values?: any) => any,
): boolean {
  if (result.valid) return false;

  if (result.reason === 'EMPTY') {
    toast.error(t('productCatalog.errorCartEmpty'));
    return true;
  }

  if (result.items.length === 1) {
    const [item] = result.items;
    toast.error(
      createElement(
        'span',
        null,
        createElement('strong', null, item.name),
        `: ${t('productCatalog.insufficientStockSingle', { available: item.available, requested: item.requested })}`,
      ),
    );
  } else {
    toast.error(t('productCatalog.insufficientStockMultiple', { count: result.items.length }));
  }
  return true;
}


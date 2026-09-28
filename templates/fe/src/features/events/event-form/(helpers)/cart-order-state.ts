export type CartOrderState = 'new' | 'deleted' | 'changed' | null;

/**
 * Compares a cart line's current quantity against the quantity already in
 * the event's active order to flag whether it's newly added, pending
 * removal, or changed relative to that order.
 */
export function getCartItemOrderState(quantity: number, actualQuantity = 0): CartOrderState {
  if (actualQuantity === 0) return 'new';
  if (quantity === 0) return 'deleted';
  if (quantity !== actualQuantity) return 'changed';
  return null;
}

export function hasCartOrderChanges(
  cart: readonly { quantity: number; actualQuantity?: number }[],
): boolean {
  return cart.some((item) => getCartItemOrderState(item.quantity, item.actualQuantity) !== null);
}

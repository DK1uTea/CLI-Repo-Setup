import { describe, expect, it } from 'vitest';

import {
  getCartItemOrderState,
  hasCartOrderChanges,
} from '@/features/events/event-form/(helpers)/cart-order-state';

describe('getCartItemOrderState', () => {
  it('returns "new" when actualQuantity is 0', () => {
    expect(getCartItemOrderState(3, 0)).toBe('new');
  });

  it('returns "new" when actualQuantity is undefined', () => {
    expect(getCartItemOrderState(3, undefined)).toBe('new');
  });

  it('returns "deleted" when quantity is 0 and actualQuantity is greater than 0', () => {
    expect(getCartItemOrderState(0, 2)).toBe('deleted');
  });

  it('returns "changed" when both are positive but differ', () => {
    expect(getCartItemOrderState(3, 2)).toBe('changed');
  });

  it('returns null when both are positive and equal', () => {
    expect(getCartItemOrderState(2, 2)).toBeNull();
  });
});

describe('hasCartOrderChanges', () => {
  it('returns false for an empty cart', () => {
    expect(hasCartOrderChanges([])).toBe(false);
  });

  it('returns false when every item is unchanged', () => {
    expect(hasCartOrderChanges([{ quantity: 2, actualQuantity: 2 }, { quantity: 1, actualQuantity: 1 }])).toBe(false);
  });

  it('returns true when at least one item is new', () => {
    expect(hasCartOrderChanges([{ quantity: 2, actualQuantity: 2 }, { quantity: 1, actualQuantity: 0 }])).toBe(true);
  });

  it('returns true when at least one item is deleted', () => {
    expect(hasCartOrderChanges([{ quantity: 0, actualQuantity: 1 }])).toBe(true);
  });

  it('returns true when at least one item is changed', () => {
    expect(hasCartOrderChanges([{ quantity: 3, actualQuantity: 2 }])).toBe(true);
  });
});

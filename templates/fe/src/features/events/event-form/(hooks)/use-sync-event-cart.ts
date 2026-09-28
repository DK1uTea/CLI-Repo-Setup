'use client';

import { useEffect } from 'react';
import { useEventCartStore } from '@/features/events/(stores)/use-event-cart-store';
import type { StepName } from '../(helpers)/event-form-schema';
import { CART_STEPS } from '../(helpers)/event-form-helpers';
import { useEventProductsCart, type EventProductCartItem } from './use-event-products-cart';

function toCartItem(item: EventProductCartItem) {
  return {
    id: item.id,
    sku: item.sku,
    name: item.name,
    thumbnail: item.thumbnail || '',
    quantity: item.quantity,
    price: item.price || 0,
    isRental: item.productType === 'rental',
    maxQuantity: 9999,
    availableQuantity: item.available ?? item.quantity,
    totalQuantity: item.totalQuantity,
    rentalAvailableQuantity: item.rentalAvailableQuantity,
    actualQuantity: item.actualQuantity,
  };
}

/**
 * Steps 3-5 (Product Catalog, Helping Hands, Summary) share one cart, sourced
 * from the dedicated cart endpoint rather than the event detail response.
 */
export function useSyncEventCart(eventId: string, currentStep: StepName) {
  const setCart = useEventCartStore((s) => s.setCart);
  const enabled = !!eventId && CART_STEPS.includes(currentStep);
  const { data, isLoading } = useEventProductsCart(eventId, { enabled });

  useEffect(() => {
    if (!enabled || !data) return;
    // A line with quantity 0 and no active-order quantity has nothing in the
    // cart and nothing in the order — there's nothing to show for it.
    const visibleItems = data.items.filter(
      (item) => item.quantity !== 0 || (item.actualQuantity ?? 0) !== 0,
    );
    setCart(visibleItems.map(toCartItem));
  }, [data, enabled, setCart]);

  return { isLoading: enabled && isLoading };
}

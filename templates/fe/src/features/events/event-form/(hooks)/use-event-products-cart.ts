'use client';

import { useQuery } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';

export type EventProductCartItem = {
  id: string;
  eventId: string;
  sku: string;
  name: string;
  thumbnail: string | null;
  productType: 'rental' | 'bundle' | 'purchase';
  price: number | null;
  quantity: number;
  isRentEntirePeriod: boolean;
  wareHouseCode: string;
  available: number;
  totalQuantity: number;
  rentalAvailableQuantity: number;
  /** Quantity of this product already in the event's active order (0 if none). */
  actualQuantity: number;
};

export type EventProductsCartResponse = { items: EventProductCartItem[] };

type EventProductsCartEnvelope = { data?: EventProductsCartResponse };

async function getEventProductsCart(eventId: string): Promise<EventProductsCartResponse> {
  const response = await apiProxy.get<EventProductsCartEnvelope>(`/etr/event-products/cart/${eventId}`);
  return response.data.data ?? { items: [] };
}

export function useEventProductsCart(eventId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['event-products-cart', eventId],
    queryFn: () => getEventProductsCart(eventId),
    enabled: !!eventId && (options?.enabled ?? true),
    staleTime: 0,
  });
}

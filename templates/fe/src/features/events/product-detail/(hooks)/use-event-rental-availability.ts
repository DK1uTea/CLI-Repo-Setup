'use client';

import { useQuery } from '@tanstack/react-query';
import { mapRentalAvailabilityItems, type RentalAvailabilityApiItem } from '@/features/rent/product-detail/(helpers)/rental-availability-utils';
import { apiProxy } from '@/lib/api';

type EventRentalAvailabilityResponse = {
  data?: { items?: RentalAvailabilityApiItem[] };
};

type EventRentalAvailabilityParams = {
  slug: string;
  eventId: string;
  month: number;
  year: number;
  enabled?: boolean;
};

export function useEventRentalAvailability({
  slug,
  eventId,
  month,
  year,
  enabled = true,
}: EventRentalAvailabilityParams) {
  return useQuery({
    queryKey: ['rental-availability', 'event', slug, eventId, month, year],
    queryFn: async () => {
      const response = await apiProxy.get<EventRentalAvailabilityResponse>(
        `etr/event-products/${slug}/calendar-table`,
        { params: { slug, eventId, month, year } },
      );
      return mapRentalAvailabilityItems(response.data?.data?.items);
    },
    enabled: enabled && !!slug && !!eventId,
  });
}

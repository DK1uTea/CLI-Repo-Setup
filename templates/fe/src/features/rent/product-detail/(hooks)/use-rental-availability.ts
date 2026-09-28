'use client';

import { useQuery } from '@tanstack/react-query';

import { apiProxy } from '@/lib/api';
import { mapRentalAvailabilityItems, type RentalAvailabilityApiItem } from '../(helpers)/rental-availability-utils';

type RentalAvailabilityResponse = {
  data?: { items?: RentalAvailabilityApiItem[] };
};

type RentalAvailabilityParams = {
  slug: string;
  month: number;
  year: number;
  enabled?: boolean;
};

export function useRentalAvailability({ slug, month, year, enabled = true }: RentalAvailabilityParams) {
  return useQuery({
    queryKey: ['rental-availability', 'rent', slug, month, year],
    queryFn: async () => {
      const response = await apiProxy.get<RentalAvailabilityResponse>(
        `etr/products/${slug}/calendar-table`,
        { params: { slug, month, year } },
      );
      return mapRentalAvailabilityItems(response.data?.data?.items);
    },
    enabled: enabled && !!slug,
  });
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { getProductDetail } from '../(services)/product-detail-service';

export function useRentalProductDetail(slug: string, params?: { from?: string; to?: string }) {
  const query = useQuery({
    queryKey: ['product-detail', slug, params],
    queryFn: () => getProductDetail(slug, params),
    enabled: !!slug && !!params?.from && !!params?.to,
  });

  return {
    rentalProductDetail: query.data ?? undefined,
    isLoading: query.isLoading,
  };
}

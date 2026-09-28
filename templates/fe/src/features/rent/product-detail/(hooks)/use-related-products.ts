'use client';

import { useQuery } from '@tanstack/react-query';
import { getRelatedProducts } from '../(services)/product-detail-service';

export function useRelatedProducts(slug: string) {
  return useQuery({
    queryKey: ['related-products', slug],
    queryFn: () => getRelatedProducts(slug),
    enabled: !!slug,
  });
}

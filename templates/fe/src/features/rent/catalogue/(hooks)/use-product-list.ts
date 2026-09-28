'use client';

import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/features/rent/catalogue/(services)/product-service';

export function useProductList(params: {
  page: number;
  limit: number;
  search?: string;
  categorySlug?: string;
  from?: string;
  to?: string;
}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => getProducts(params),
  });
}

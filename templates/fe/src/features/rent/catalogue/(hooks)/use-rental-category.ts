'use client';

import { useQuery } from '@tanstack/react-query';
import { getProductFilterConfig } from '../(services)/rental-category-service';

export const useRentalCategory = () => {
  return useQuery({
    queryKey: ['product-filter-config'],
    queryFn: getProductFilterConfig,
  });
};

import { useQuery } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';
import type { ProductsListResponse } from './use-products-list';

export type GetProductsHelpingHandsListParams = {
  sort?: string;
  filter?: string;
  search?: string;
  page?: number;
  limit?: number;
  eventId?: string;
  productType?: string;
};

const fetchProductsHelpingHandsList = async (
  params: GetProductsHelpingHandsListParams
): Promise<ProductsListResponse> => {
  const queryParams: Record<string, any> = {
    sort: params.sort ?? 'createdAt:desc',
    page: params.page ?? 1,
    limit: params.limit ?? 10,
  };

  if (params.filter) queryParams.filter = params.filter;
  if (params.search) queryParams.search = params.search;
  if (params.eventId) queryParams.eventId = params.eventId;
  if (params.productType) queryParams.productType = params.productType;

  const response = await apiProxy.get('/etr/event-products/helping-hands', {
    params: queryParams,
  });
  return response.data.data as ProductsListResponse;
};

export const useProductsHelpingHandsList = (params: GetProductsHelpingHandsListParams) => {
  return useQuery({
    queryKey: ['products-helping-hands-list', params],
    queryFn: () => fetchProductsHelpingHandsList(params),
  });
};

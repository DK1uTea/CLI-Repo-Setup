import { useQuery } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';
import type { PaginationType } from '@/shared/types/pagination-type';

export type Product = {
  id: string;
  sku: string;
  name: string;
  price: number;
  imageUrl: string;
  slug: string;
  isAvailable: boolean;
  totalQuantity?: number;
  availableQuantity?: number;
  productType: 'rental' | 'bundle' | 'purchase';
  isNew?: boolean;
};

export type ProductsListResponse = {
  items: Product[];
  pagination: PaginationType;
};

export type GetProductsListParams = {
  sort?: string;
  filter?: string;
  search?: string;
  page?: number;
  limit?: number;
  eventId?: string;
  categorySlug?: string;
  brandId?: string;
};

const fetchProductsList = async (params: GetProductsListParams): Promise<ProductsListResponse> => {
  const queryParams: Record<string, any> = {
    sort: params.sort ?? 'createdAt:desc',
    page: params.page ?? 1,
    limit: params.limit ?? 10,
  };

  if (params.filter) queryParams.filter = params.filter;
  if (params.search) queryParams.search = params.search;
  if (params.eventId) queryParams.eventId = params.eventId;
  if (params.categorySlug) queryParams.categorySlug = params.categorySlug;
  if (params.brandId) queryParams.brandId = params.brandId;

  const response = await apiProxy.get('/etr/event-products', { params: queryParams });
  return response.data.data as ProductsListResponse;
};

export const useProductsList = (params: GetProductsListParams) => {
  return useQuery({
    queryKey: ['products-list', params],
    queryFn: () => fetchProductsList(params),
  });
};

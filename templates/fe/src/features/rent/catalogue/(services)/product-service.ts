import { apiProxy } from '@/lib/api';
import type { PaginationType } from '@/shared/types/pagination-type';

export type ProductCatalogItem = {
  id: string;
  sku: string;
  name: string;
  price: number;
  productType: string;
  imageUrl?: string;
  slug: string;
  isAvailable: boolean;
  totalQuantity: number;
  availableQuantity: number;
  isNew?: boolean;
};

type ProductsEnvelope = {
  data?: {
    items?: ProductCatalogItem[];
    pagination?: PaginationType;
  };
};

export async function getProducts(params: {
  page: number;
  limit: number;
  search?: string;
  categorySlug?: string;
  from?: string;
  to?: string;
}): Promise<{ products: ProductCatalogItem[]; pagination: PaginationType | null }> {
  const response = await apiProxy.get<ProductsEnvelope>('etr/products', { params });
  const products = Array.isArray(response.data?.data?.items) ? response.data.data.items : [];
  return { products, pagination: response.data?.data?.pagination ?? null };
}

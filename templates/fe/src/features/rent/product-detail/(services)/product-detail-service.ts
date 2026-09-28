import { apiProxy } from '@/lib/api';
import type { ProductCatalogItem } from '@/features/rent/catalogue/(services)/product-service';

export type ProductDetailChild = {
  sku: string;
  name: string;
  requiredQty: number;
};

export type ProductDetail = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  price: number;
  imageUrl?: string;
  images?: string[];
  totalQuantity: number;
  availableQuantity: number;
  categoryLabels?: string[];
  categorySlugs?: string[];
  brand?: string;
  manufacturer?: string;
  material?: string[];
  shippingMethod?: string;
  productType: string;
  description?: string;
  shortDescription?: string;
  isAvailable: boolean;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  children?: ProductDetailChild[];
};

type ProductDetailEnvelope = {
  data?: ProductDetail;
};

export async function getProductDetail(
  slug: string,
  params?: { from?: string; to?: string },
): Promise<ProductDetail | null> {
  const response = await apiProxy.get<ProductDetailEnvelope>(`etr/products/${slug}`, { params });
  return response.data?.data ?? null;
}

type RelatedProductsEnvelope = {
  data?: {
    items?: ProductCatalogItem[];
  };
};

export async function getRelatedProducts(slug: string): Promise<ProductCatalogItem[]> {
  const response = await apiProxy.get<RelatedProductsEnvelope>('etr/products/related', { params: { slug } });
  return Array.isArray(response.data?.data?.items) ? response.data.data.items : [];
}

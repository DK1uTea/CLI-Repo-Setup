import { apiProxy } from '@/lib/api';

export type RentalCategory = {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
};

type FilterConfigEnvelope = {
  data?: {
    categories?: RentalCategory[];
  };
};

export async function getProductFilterConfig(): Promise<RentalCategory[]> {
  const response = await apiProxy.get<FilterConfigEnvelope>('etr/products/filter-config');
  return Array.isArray(response.data?.data?.categories) ? response.data.data.categories : [];
}

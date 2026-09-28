import { apiProxy } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

type ProductsFilterConfigResponse = {
  categories: {
    id: string;
    name: string;
    slug: string;
    parentId?: string;
  }[];
  brands: {
    id: string;
    name: string;
  }[]
}

const fetchProductsFilterConfig = async (): Promise<ProductsFilterConfigResponse> => {
  const response = await apiProxy.get('/etr/event-products/filter-config');
  return response.data.data as ProductsFilterConfigResponse;
}

export const useProductsFilterConfig = () => {
  return useQuery({
    queryKey: ['products-filter-config'],
    queryFn: fetchProductsFilterConfig,
  })
}
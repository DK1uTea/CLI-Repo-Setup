import { useQuery } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';

export type ProductDocument = {
  bucket: string;
  fileName: string;
  fileType: string;
  url: string;
};

export type ProductDocumentsResponse = {
  items: ProductDocument[];
};

export function useProductDocuments(sku?: string) {
  return useQuery({
    queryKey: ['product-documents', sku],
    queryFn: async () => {
      const response = await apiProxy.get(
        `etr/products/${encodeURIComponent(sku ?? '')}/attachments`,
      );
      const data = response.data.data as ProductDocumentsResponse;
      return Array.isArray(data?.items) ? data.items : [];
    },
    enabled: Boolean(sku),
  });
}

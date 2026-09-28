"use client";

import { useQuery } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";

export type StoreAdminDetail = {
  id: string;
  storeName: string;
  storeAddress: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  description: unknown;
  status: string;
  createdAt: string;
  updatedAt: string;
};

async function fetchAdminStoreDetail(id: string): Promise<StoreAdminDetail> {
  const { data } = await apiProxy.get<{ data: StoreAdminDetail }>(
    `/cam/stores-admin/${id}`,
  );
  return data.data;
}

export function useAdminStoreDetail(id: string | null) {
  const query = useQuery({
    queryKey: ["cam-admin-store-detail", id],
    queryFn: () => fetchAdminStoreDetail(id!),
    enabled: !!id,
  });

  return {
    store: query.data ?? null,
    isLoading: query.isLoading,
  };
}

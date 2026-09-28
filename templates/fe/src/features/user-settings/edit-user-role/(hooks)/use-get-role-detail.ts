"use client";

import { useQuery } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";

export type RoleDetail = {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  status?: string;
  permissions: string[];
  updatedAt: string;
};

type RoleDetailResponse = {
  data?: RoleDetail;
};

async function fetchRoleDetail(id: string): Promise<RoleDetail> {
  const response = await apiProxy.get<RoleDetailResponse>(`/roles/${id}`);
  return response.data?.data as RoleDetail;
}

export function useGetRoleDetail(id: string) {
  return useQuery({
    queryKey: ["role-detail", id],
    queryFn: () => fetchRoleDetail(id),
    enabled: !!id,
  });
}

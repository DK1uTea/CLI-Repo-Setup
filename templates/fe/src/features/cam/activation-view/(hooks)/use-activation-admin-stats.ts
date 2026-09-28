"use client";

import { useQuery } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";

type ActivationAdminStats = {
  ready: number;
  review: number;
  clarification: number;
};

async function fetchActivationAdminStats(): Promise<ActivationAdminStats> {
  const { data } = await apiProxy.get<{ data: ActivationAdminStats }>(
    "/cam/activations-admin/stats",
  );
  return data.data;
}

export function useActivationAdminStats() {
  const query = useQuery({
    queryKey: ["cam-activation-admin-stats"],
    queryFn: fetchActivationAdminStats,
  });

  return {
    stats: query.data ?? null,
    isLoading: query.isLoading,
  };
}

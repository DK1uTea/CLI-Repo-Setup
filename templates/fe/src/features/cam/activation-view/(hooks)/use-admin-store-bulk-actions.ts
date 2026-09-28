"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";

async function bulkActivateStores(ids: string[]): Promise<void> {
  await apiProxy.post("/cam/stores-admin/bulk/active", { ids });
}

async function bulkDeactivateStores(ids: string[]): Promise<void> {
  await apiProxy.post("/cam/stores-admin/bulk/inactive", { ids });
}

export function useBulkAdminStoreActions(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["cam-admin-stores"] });
    onSuccess?.();
  };

  const activate = useMutation({
    mutationFn: (ids: string[]) => bulkActivateStores(ids),
    onSuccess: invalidate,
  });

  const deactivate = useMutation({
    mutationFn: (ids: string[]) => bulkDeactivateStores(ids),
    onSuccess: invalidate,
  });

  return {
    bulkActivate: (ids: string[]) => activate.mutate(ids),
    bulkDeactivate: (ids: string[]) => deactivate.mutate(ids),
    isPending: activate.isPending || deactivate.isPending,
  };
}

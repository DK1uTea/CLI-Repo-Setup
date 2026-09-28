"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { apiProxy } from "@/lib/api";

export type UpdateStoreDto = {
  storeName: string;
  storeAddress: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  description?: string;
};

async function updateStore(id: string, dto: UpdateStoreDto): Promise<void> {
  await apiProxy.put(`/cam/stores-admin/${id}`, dto);
}

async function activateStore(id: string): Promise<void> {
  await apiProxy.post(`/cam/stores-admin/${id}/active`);
}

async function deactivateStore(id: string): Promise<void> {
  await apiProxy.post(`/cam/stores-admin/${id}/inactive`);
}

export function useUpdateAdminStore(storeId: string, onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const t = useTranslations("activationView.store");
  return useMutation({
    mutationFn: (dto: UpdateStoreDto) => updateStore(storeId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cam-admin-stores"] });
      queryClient.invalidateQueries({
        queryKey: ["cam-admin-store-detail", storeId],
      });
      toast.success(t("updateSuccess"));
      onSuccess?.();
    },
  });
}

export function useToggleAdminStoreStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, currentStatus }: { id: string; currentStatus: string }) =>
      currentStatus === "ACTIVE" ? deactivateStore(id) : activateStore(id),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["cam-admin-stores"] });
      queryClient.invalidateQueries({ queryKey: ["cam-admin-store-detail", id] });
    },
  });
}

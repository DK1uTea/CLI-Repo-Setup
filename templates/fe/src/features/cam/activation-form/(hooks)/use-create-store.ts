"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { apiProxy } from "@/lib/api";
import type { StoreFormData } from "../(helpers)/activation-schema";

async function createStore(data: StoreFormData): Promise<{ id: string }> {
  const response = await apiProxy.post<{ data: { id: string } }>(
    "/cam/stores",
    {
      storeName: data.storeName,
      storeAddress: data.storeAddress,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
    },
    { _skipToast: true } as object,
  );
  return response.data.data;
}

export function useCreateStore() {
  const queryClient = useQueryClient();
  const t = useTranslations("activationForm.store");

  return useMutation({
    mutationFn: createStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cam-stores"] });
      toast.success(t("createSuccess"));
    },
  });
}

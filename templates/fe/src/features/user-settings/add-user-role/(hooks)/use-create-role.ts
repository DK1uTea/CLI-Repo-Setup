"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { apiProxy } from "@/lib/api";

type CreateRolePayload = {
  name: string;
  status?: string;
  description: string;
  permissions: string[];
};

async function createRole(payload: CreateRolePayload) {
  const { data } = await apiProxy.post("/roles", payload);
  return data;
}

export function useCreateRole() {
  const t = useTranslations("settings");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRole,
    onSuccess: async () => {
      toast.success(t("roleCreateSuccess"));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["roles-list"] }),
        queryClient.invalidateQueries({ queryKey: ["roles-list-infinite"] }),
      ]);
    },
  });
}

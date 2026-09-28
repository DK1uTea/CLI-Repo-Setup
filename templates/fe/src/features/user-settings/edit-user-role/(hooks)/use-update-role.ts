"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { apiProxy } from "@/lib/api";

type UpdateRolePayload = {
  id: string;
  name: string;
  status?: string;
  description: string;
  permissions: string[];
};

async function updateRole({ id, ...body }: UpdateRolePayload) {
  const { data } = await apiProxy.put(`/roles/${id}`, body);
  return data;
}

export function useUpdateRole(id: string) {
  const t = useTranslations("settings");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRole,
    onSuccess: async () => {
      toast.success(t("roleUpdateSuccess"));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["role-detail", id] }),
        queryClient.invalidateQueries({ queryKey: ["roles-list"] }),
        queryClient.invalidateQueries({ queryKey: ["roles-list-infinite"] }),
      ]);
    },
  });
}

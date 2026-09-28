"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { apiProxy } from "@/lib/api";

type DeleteRoleParams = {
  id: string;
  permanently: boolean;
};

async function deleteRole({ id, permanently }: DeleteRoleParams) {
  const path = permanently ? `/roles/${id}/primary` : `/roles/${id}`;
  const { data } = await apiProxy.delete(path);
  return data;
}

export function useDeleteRole() {
  const t = useTranslations("settings");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRole,
    onSuccess: async () => {
      toast.success(t("roleDeleteSuccess"));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["roles-list"] }),
        queryClient.invalidateQueries({ queryKey: ["roles-list-infinite"] }),
      ]);
    },
  });
}

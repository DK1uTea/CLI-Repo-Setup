"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { apiProxy } from "@/lib/api";

type ChangeRoleDto = {
  targetId: string;
  roleId: string;
};

async function changeRole(dto: ChangeRoleDto) {
  const { data } = await apiProxy.post("/user/change-role", dto);
  return data;
}

export function useChangeRole() {
  const t = useTranslations("settings");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeRole,
    onSuccess: () => {
      toast.success(t("changeRoleSuccess"));
      queryClient.invalidateQueries({ queryKey: ["user-access-list"] });
    },
  });
}

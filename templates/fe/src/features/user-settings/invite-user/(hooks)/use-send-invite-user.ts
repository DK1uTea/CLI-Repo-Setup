"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { apiProxy } from "@/lib/api";

type InviteUserPayload = {
  email: string;
  roleId: string;
};


async function sendInviteUser(payload: InviteUserPayload) {
  const { data } = await apiProxy.post("/user/invite-user", payload);
  return data;
}

export function useSendInviteUser() {
  const t = useTranslations("settings");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendInviteUser,
    onSuccess: () => {
      toast.success(t("inviteUserSuccess"));
      queryClient.invalidateQueries({ queryKey: ["user-access-list"] });
    },
  });
}

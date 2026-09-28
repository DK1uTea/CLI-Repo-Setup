"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { apiProxy } from "@/lib/api";

async function updateAvatarKey(key: string): Promise<void> {
  await apiProxy.patch("/user/avatar", { avatar: key });
}

export function useUploadAvatar() {
  const t = useTranslations("settings");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAvatarKey,
    onSuccess: async () => {
      toast.success(t("avatarUpdateSuccess"));
      await queryClient.invalidateQueries({ queryKey: ["setting", "profile"] });
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

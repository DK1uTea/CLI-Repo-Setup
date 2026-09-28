"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { s } from "@/shared/schemas";
import { useRouter } from "@/i18n/navigation";
import { useMatrixPermission } from "./use-matrix-permission";
import { useSendInviteUser } from "./use-send-invite-user";

const inviteUserSchema = z.object({
  email: s.email(),
});

type InviteUserFormValues = z.infer<typeof inviteUserSchema>;

export function useInviteUser() {
  const t = useTranslations("settings");
  const router = useRouter();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const { data: matrix, isLoading: isMatrixLoading } = useMatrixPermission();
  const sendInvite = useSendInviteUser();

  const form = useForm<InviteUserFormValues>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: InviteUserFormValues) {
    if (!selectedRoleId) {
      toast.error(t("selectRoleRequired"));
      return;
    }
    await sendInvite.mutateAsync({ email: data.email, roleId: selectedRoleId });
    form.reset();
    setSelectedRoleId(null);
    router.push("/user-settings?tab=user-roles-access");
  }

  return {
    form,
    selectedRoleId,
    setSelectedRoleId,
    permissions: matrix?.permissions ?? [],
    roles: matrix?.roles ?? [],
    isMatrixLoading,
    handleInvite: form.handleSubmit(onSubmit),
  };
}

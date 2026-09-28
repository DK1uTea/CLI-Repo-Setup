"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQueryState, parseAsString, parseAsInteger, parseAsBoolean } from "nuqs";
import { useGetListRoles } from "./use-get-list-roles";
import { useDeleteRole } from "./use-delete-role";
import { useDuplicateRole } from "./use-duplicate-role";

type ConfirmAction =
  | { type: "duplicate"; id: string; name: string }
  | { type: "delete"; id: string; name: string };

export type { ConfirmAction };

export function useManageRoles() {
  const t = useTranslations("settings");

  const [keyword] = useQueryState("keyword", parseAsString.withDefault(""));
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [deletedRoles, setDeletedRoles] = useQueryState(
    "deleted_roles",
    parseAsBoolean.withDefault(false)
  );

  const { data, isLoading } = useGetListRoles({
    search: keyword || undefined,
    page,
    limit: 10,
    ...(deletedRoles && { onlyDeleted: true }),
  });

  const roles = data?.roles ?? [];
  const pagination = data?.pagination ?? null;

  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null,
  );

  const confirmMeta = {
    duplicate: {
      title: t("duplicateRoleTitle"),
      description: t("duplicateRoleDescription"),
      action: t("duplicate"),
      destructive: false,
    },
    delete: {
      title: t("deleteRoleTitle"),
      description: t("deleteRoleDescription"),
      action: t("delete"),
      destructive: true,
    },
  };

  const deleteRole = useDeleteRole();
  const duplicateRole = useDuplicateRole();

  const handleConfirm = async () => {
    if (!confirmAction) return;
    if (confirmAction.type === "delete") {
      await deleteRole.mutateAsync({
        id: confirmAction.id,
        permanently: deletedRoles,
      });
      setConfirmAction(null);
    } else if (confirmAction.type === "duplicate") {
      await duplicateRole.mutateAsync(confirmAction.id);
      setConfirmAction(null);
    }
  };

  return {
    roles,
    pagination,
    isLoading,
    keyword,
    page,
    setPage,
    deletedRoles,
    setDeletedRoles,
    confirmAction,
    setConfirmAction,
    confirmMeta,
    handleConfirm,
    isConfirming: deleteRole.isPending || duplicateRole.isPending,
  };
}

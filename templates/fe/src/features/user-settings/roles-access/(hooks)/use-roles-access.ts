"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import { dayjs } from "@/lib/date-utils";
import { useDateFormat } from "@/shared/stores/use-user-store";
import { useGetListUserAccess } from "./use-get-list-user-access";
import { useResendInvite } from "./use-resend-invite";
import { useDeleteInvite } from "./use-delete-invite";
import { useRevokeAccount } from "./use-revoke-account";
import { useGrantAccount } from "./use-grant-account";
import { useResendCooldown } from "./use-resend-cooldown";

type SortField =
  | "createdAt"
  | "email"
  | "firstName"
  | "inviteByEmail"
  | "roleId";

type ConfirmAction =
  | { type: "revoke"; id: string }
  | { type: "grant"; id: string }
  | { type: "deleteInvite"; id: string }
  | { type: "resendInvite"; id: string };

export type { SortField, ConfirmAction };

export function useRolesAccess() {
  const t = useTranslations("settings");
  const dateFormat = useDateFormat();

  const [keyword] = useQueryState("keyword", parseAsString.withDefault(""));
  const [roleFilter, setRoleFilter] = useQueryState(
    "roleId",
    parseAsString.withDefault(""),
  );
  const [sort, setSort] = useQueryState("sort", parseAsString.withDefault(""));
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const [sortField, sortDir] = (() => {
    const parts = sort.split("::");
    if (parts.length === 2)
      return [parts[0] as SortField, parts[1] as "asc" | "desc"];
    return [null, "asc" as const];
  })();

  const apiSort = sortField ? `${sortField}:${sortDir}` : undefined;

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(1);
  }, [keyword, roleFilter]);

  const { data, isLoading } = useGetListUserAccess({
    search: keyword || undefined,
    roleId: roleFilter || undefined,
    sort: apiSort,
    page,
    limit: 10,
  });

  const users = data?.users ?? [];
  const pagination = data?.pagination ?? null;

  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null,
  );
  const [changeRoleData, setChangeRoleData] = useState<{
    userId: string;
    currentRole: string;
    email: string;
  } | null>(null);

  const resendInvite = useResendInvite();
  const deleteInvite = useDeleteInvite();
  const revokeAccount = useRevokeAccount();
  const grantAccount = useGrantAccount();
  const { getExpiresAt, startCooldown } = useResendCooldown();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDir === "asc") setSort(`${field}::desc`);
      else setSort(null);
    } else {
      setSort(`${field}::asc`);
    }
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    if (confirmAction.type === "resendInvite") {
      await resendInvite.mutateAsync(confirmAction.id);
      startCooldown(confirmAction.id);
    } else if (confirmAction.type === "deleteInvite") {
      await deleteInvite.mutateAsync(confirmAction.id);
    } else if (confirmAction.type === "revoke") {
      await revokeAccount.mutateAsync(confirmAction.id);
    } else if (confirmAction.type === "grant") {
      await grantAccount.mutateAsync(confirmAction.id);
    }
    setConfirmAction(null);
  };

  const formatDate = (dateStr: string | undefined, withTime = false) => {
    if (!dateStr) return "N/A";
    const d = dayjs.utc(dateStr);
    if (!d.isValid()) return "N/A";
    return withTime ? d.format(`${dateFormat} · HH:mm`) : d.format(dateFormat);
  };

  const confirmMeta: Record<
    ConfirmAction["type"],
    { title: string; description: string; action: string; destructive: boolean }
  > = {
    revoke: {
      title: t("revokeAccessTitle"),
      description: t("revokeAccessDescription"),
      action: t("revokeAccess"),
      destructive: true,
    },
    grant: {
      title: t("grantAccessTitle"),
      description: t("grantAccessDescription"),
      action: t("grantAccess"),
      destructive: false,
    },
    deleteInvite: {
      title: t("deleteInviteTitle"),
      description: t("deleteInviteDescription"),
      action: t("deleteInvite"),
      destructive: true,
    },
    resendInvite: {
      title: t("resendInviteTitle"),
      description: t("resendInviteDescription"),
      action: t("resendInvite"),
      destructive: false,
    },
  };

  const isConfirming =
    resendInvite.isPending ||
    deleteInvite.isPending ||
    revokeAccount.isPending ||
    grantAccount.isPending;

  return {
    users,
    pagination,
    isLoading,
    roleFilter,
    setRoleFilter,
    page,
    setPage,
    sortField,
    sortDir,
    handleSort,
    confirmAction,
    setConfirmAction,
    confirmMeta,
    handleConfirm,
    isConfirming,
    changeRoleData,
    setChangeRoleData,
    formatDate,
    getResendExpiresAt: getExpiresAt,
  };
}

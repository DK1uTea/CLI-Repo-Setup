import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import type { AssignTeamUserRole } from "@/features/reporting-tool/(helpers)/trade-fair-event-type";
import { useCreateInviteLink } from "./use-create-invite-link";
import { useGetInviteLink } from "./use-get-invite-link";

type UseShareInviteLinkProps = {
  eventSurveyId: string;
  enabled?: boolean;
  requiredLogin?: boolean;
};

export const useShareInviteLink = ({
  eventSurveyId,
  enabled = true,
  requiredLogin = true,
}: UseShareInviteLinkProps) => {
  const t = useTranslations("reportingTool.tradeFairEventForm.assignTeam.shareInviteLinkDialog");
  const [role, setRole] = useState<AssignTeamUserRole>("PROMOTER");
  const activeRole: AssignTeamUserRole = requiredLogin ? role : "PROMOTER";

  const { inviteLinks, isLoading: isGetting, isFetching } = useGetInviteLink(eventSurveyId, enabled);
  const { createInviteLink, isCreating, isError, reset } = useCreateInviteLink(eventSurveyId);

  useEffect(() => {
    reset();
  }, [activeRole, reset]);

  useEffect(() => {
    if (!enabled || isGetting || isFetching || isError) return;
    const matchedLink = inviteLinks.find((link) => link.role === activeRole);
    if (!matchedLink && !isCreating) {
      createInviteLink(activeRole).catch(() => {});
    }
  }, [activeRole, inviteLinks, isGetting, isFetching, isCreating, createInviteLink, enabled, isError]);

  const matchedLink = inviteLinks.find((link) => link.role === activeRole);
  const inviteUrl = process.env.NEXT_PUBLIC_EXTERNAL_TRADE_FAIR_INVITE_URL;
  const inviteLink = matchedLink && inviteUrl
    ? `${inviteUrl}?token=${encodeURIComponent(matchedLink.token)}`
    : "";

  const copyInviteLink = async () => {
    if (!inviteLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success(t("copySuccess"));
    } catch {
      toast.error(t("copyError"));
    }
  };

  return {
    role,
    inviteLink,
    isLoading: isGetting || isCreating,
    setRole,
    copyInviteLink,
  };
};

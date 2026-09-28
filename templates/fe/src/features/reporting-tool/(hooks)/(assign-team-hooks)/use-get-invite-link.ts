'use client';

import { useQuery } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";
import type { InviteLink } from "@/features/reporting-tool/(helpers)/trade-fair-event-type";

type InviteLinksResponse = {
  items: InviteLink[];
};

const fetchInviteLinks = async (eventSurveyId: string): Promise<InviteLink[]> => {
  const response = await apiProxy.get(`tf/invite-link/event-survey/${eventSurveyId}`);
  const data = response.data.data as InviteLinksResponse;
  return data?.items ?? [];
};

export const useGetInviteLink = (eventSurveyId: string, enabled = true) => {
  const query = useQuery({
    queryKey: ["trade-fair-invite-link-list", eventSurveyId],
    queryFn: () => fetchInviteLinks(eventSurveyId),
    enabled: enabled && !!eventSurveyId,
  });

  return {
    inviteLinks: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  };
};

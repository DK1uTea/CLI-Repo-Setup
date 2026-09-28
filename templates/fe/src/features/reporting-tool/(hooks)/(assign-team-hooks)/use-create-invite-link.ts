'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";
import type { AssignTeamUserRole, InviteLink } from "@/features/reporting-tool/(helpers)/trade-fair-event-type";

const createInviteLink = async (eventSurveyId: string, role: AssignTeamUserRole, maxUses = 100) => {
  const response = await apiProxy.post(`tf/invite-link/event-survey/${eventSurveyId}`, { role, maxUses });
  return response.data.data as InviteLink;
};

export const useCreateInviteLink = (eventSurveyId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (role: AssignTeamUserRole) => createInviteLink(eventSurveyId, role),
    onSuccess: (newLink) => {
      queryClient.setQueryData<InviteLink[]>(
        ["trade-fair-invite-link-list", eventSurveyId],
        (oldData) => {
          if (!oldData) return [newLink];
          if (oldData.some((item) => item.id === newLink.id)) return oldData;
          return [...oldData, newLink];
        }
      );
      queryClient.invalidateQueries({
        queryKey: ["trade-fair-invite-link-list", eventSurveyId],
      });
    },
  });

  return {
    createInviteLink: mutation.mutateAsync,
    isCreating: mutation.isPending,
    isError: mutation.isError,
    reset: mutation.reset,
  };
};

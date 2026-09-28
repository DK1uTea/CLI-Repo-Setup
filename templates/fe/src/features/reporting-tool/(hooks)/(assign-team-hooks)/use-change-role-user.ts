'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";
import type { AssignTeamUserRole } from "@/features/reporting-tool/(helpers)/trade-fair-event-type";

type ChangeRoleUserPayload = {
  users: {
    id: string;
    role: AssignTeamUserRole;
  }[];
};

const changeRoleUser = async (eventId: string, payload: ChangeRoleUserPayload) => {
  const response = await apiProxy.post(`tf/users/change-roles/${eventId}`, payload);
  return response.data;
};

export const useChangeRoleUser = (eventSurveyId: string, eventId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: ChangeRoleUserPayload) => changeRoleUser(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["trade-fair-user-event-survey", eventSurveyId],
      });
      queryClient.invalidateQueries({
        queryKey: ["trade-fair-event-detail", eventId],
      });
    },
  });

  return {
    changeRole: mutation.mutateAsync,
    isChanging: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
};

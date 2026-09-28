'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";
import { AddUserFormValues } from "@/features/reporting-tool/(helpers)/add-user-schema";

const addUser = async (eventSurveyId: string, payload: AddUserFormValues) => {
  const response = await apiProxy.post(`tf/users/assign-survey/${eventSurveyId}`, payload);
  return response.data;
};

export const useAddUser = (eventSurveyId: string, eventId?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: AddUserFormValues) => addUser(eventSurveyId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["trade-fair-user-event-survey", eventSurveyId],
      });
      if (eventId) {
        queryClient.invalidateQueries({
          queryKey: ["trade-fair-event-detail", eventId],
        });
      }
    },
  });

  return {
    addUser: mutation.mutateAsync,
    isAdding: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
};

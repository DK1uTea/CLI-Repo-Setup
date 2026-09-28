'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";

const deleteUser = async (assignmentId: string) => {
  const response = await apiProxy.delete(`tf/users/remove-event-assignment/${assignmentId}`);
  return response.data;
};

export const useDeleteUser = (eventSurveyId: string, eventId?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (assignmentId: string) => deleteUser(assignmentId),
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
    deleteUser: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
};

'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";

const importUsers = async (eventSurveyId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiProxy.post(`tf/users/import-users/${eventSurveyId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
};

export const useImportUsers = (eventSurveyId: string, eventId?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (file: File) => importUsers(eventSurveyId, file),
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
    importUsers: mutation.mutateAsync,
    isImporting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
};

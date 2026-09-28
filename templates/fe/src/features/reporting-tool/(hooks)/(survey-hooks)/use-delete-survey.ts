'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";

const deleteSurvey = async (surveyId: string) => {
  const response = await apiProxy.delete(`tf/surveys/${surveyId}`);
  return response.data;
};

export const useDeleteSurvey = (surveyId: string, eventId?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ["survey-action", "delete-survey", surveyId],
    mutationFn: () => deleteSurvey(surveyId),
    onSuccess: () => {
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: ['trade-fair-event-detail', eventId] });
      }
      queryClient.invalidateQueries({ queryKey: ['trade-fair-survey-list'] });
    },
  });

  return {
    deleteSurvey: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
};

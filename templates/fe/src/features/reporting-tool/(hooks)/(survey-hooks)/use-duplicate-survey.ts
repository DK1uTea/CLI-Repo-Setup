'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";

const duplicateSurvey = async (surveyId: string, name: string): Promise<{ id: string }> => {
  const response = await apiProxy.post(`tf/surveys/${surveyId}/duplicate`, { name });
  return response.data.data as { id: string };
};

export const useDuplicateSurvey = (surveyId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ["survey-action", "duplicate-survey", surveyId],
    mutationFn: (payload: { name: string }) => duplicateSurvey(surveyId, payload.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trade-fair-survey-list'] });
    },
  });

  return {
    duplicateSurvey: mutation.mutateAsync,
    isDuplicating: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
};

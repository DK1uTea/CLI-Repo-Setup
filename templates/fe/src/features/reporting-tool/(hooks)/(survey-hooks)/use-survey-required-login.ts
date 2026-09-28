'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiProxy } from '@/lib/api';

type SurveyRequiredLoginPayload = {
  requiredLogin: boolean;
};

const updateSurveyRequiredLogin = async (
  eventSurveyId: string,
  payload: SurveyRequiredLoginPayload
) => {
  const response = await apiProxy.patch(
    `tf/event-surveys/${eventSurveyId}/required-login`,
    payload
  );

  return response.data.data;
};

export const useSurveyRequiredLogin = (eventSurveyId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: SurveyRequiredLoginPayload) =>
      updateSurveyRequiredLogin(eventSurveyId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['trade-fair-survey-list'],
      });
      queryClient.invalidateQueries({
        queryKey: ['trade-fair-event-detail'],
      });
    },
  });

  return {
    updateRequiredLogin: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
};

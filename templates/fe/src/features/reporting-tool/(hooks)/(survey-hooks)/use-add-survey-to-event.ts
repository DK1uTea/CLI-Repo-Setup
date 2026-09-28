'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";

type AddSurveyToEventPayload = {
  surveys: {
    surveyId: string;
    requiredLogin: boolean;
  }[];
};

const addSurveyToEvent = async (eventId: string, payload: AddSurveyToEventPayload) => {
  const response = await apiProxy.post(`tf/events/${eventId}/assign-surveys`, payload);
  return response.data;
};

export const useAddSurveyToEvent = (eventId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: AddSurveyToEventPayload) => addSurveyToEvent(eventId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['trade-fair-event-detail', eventId],
      });
    },
  });

  return {
    addSurveyToEvent: mutation.mutateAsync,
    isAdding: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
};

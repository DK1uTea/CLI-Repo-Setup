'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { apiProxy } from "@/lib/api";

type AssignSurveyToEventPayload = {
  eventId: string;
  surveyId: string;
};

const assignSurveyToEvent = async (payload: AssignSurveyToEventPayload) => {
  const response = await apiProxy.post("tf/event-surveys", payload);
  return response.data;
};

export const useAssignSurveyToEvent = (eventId: string) => {
  const queryClient = useQueryClient();
  const t = useTranslations("reportingTool.surveyBuilder");

  const mutation = useMutation({
    mutationKey: ["survey-action", "assign-survey"],
    mutationFn: (surveyId: string) => assignSurveyToEvent({ eventId, surveyId }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["trade-fair-event-detail", eventId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["trade-fair-survey-list"],
        }),
      ]);
      toast.success(t("assignSuccess"));
    },
  });

  return {
    assignSurveyToEvent: mutation.mutateAsync,
    isAssigning: mutation.isPending,
    error: mutation.error,
  };
};

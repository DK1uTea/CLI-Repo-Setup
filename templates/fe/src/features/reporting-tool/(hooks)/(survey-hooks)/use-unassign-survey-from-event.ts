'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { apiProxy } from "@/lib/api";

const unassignSurveyFromEvent = async (eventSurveyId: string) => {
  const response = await apiProxy.delete(`tf/event-surveys/${eventSurveyId}`);
  return response.data;
};

export const useUnassignSurveyFromEvent = (eventId: string) => {
  const queryClient = useQueryClient();
  const t = useTranslations("reportingTool.surveyBuilder");

  const mutation = useMutation({
    mutationKey: ["survey-action", "unassign-survey"],
    mutationFn: unassignSurveyFromEvent,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["trade-fair-event-detail", eventId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["trade-fair-survey-list"],
        }),
      ]);
      toast.success(t("unassignSuccess"));
    },
  });

  return {
    unassignSurveyFromEvent: mutation.mutateAsync,
    isUnassigning: mutation.isPending,
    error: mutation.error,
  };
};

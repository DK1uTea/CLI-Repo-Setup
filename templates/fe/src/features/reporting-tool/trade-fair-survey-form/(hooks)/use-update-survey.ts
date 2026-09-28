'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";
import { parseAsString, useQueryState } from "nuqs";
import { TradeFairSurveyFormDto } from "../(helpers)/trade-fair-survey-form-schema";

const updateSurvey = async (surveyId: string, payload: TradeFairSurveyFormDto) => {
  const response = await apiProxy.put(`tf/surveys/${surveyId}`, payload);
  return response.data;
};

export const useUpdateSurvey = (surveyId: string) => {
  const queryClient = useQueryClient();
  const [eventId] = useQueryState("eventId", parseAsString);

  return useMutation({
    mutationFn: (payload: TradeFairSurveyFormDto) => updateSurvey(surveyId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trade-fair-survey-list"] });
      queryClient.invalidateQueries({ queryKey: ["trade-fair-survey-detail", surveyId] });
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: ["trade-fair-event-detail", eventId] });
      }
    },
  });
};

'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";
import { parseAsString, useQueryState } from "nuqs";
import { useTranslations } from "next-intl";
import { TradeFairSurveyFormDto } from "../(helpers)/trade-fair-survey-form-schema";

import { toast } from "sonner";
import type { TradeFairEvent } from "@/features/reporting-tool/(helpers)/trade-fair-event-type";

import { useAddSurveyToEvent } from "@/features/reporting-tool/(hooks)/(survey-hooks)/use-add-survey-to-event";

type CreateSurveyResponse = {
  id: string;
};

const createSurvey = async (payload: TradeFairSurveyFormDto): Promise<CreateSurveyResponse> => {
  const response = await apiProxy.post("tf/surveys", payload);
  return response.data.data as CreateSurveyResponse;
};

export const useCreateSurvey = () => {
  const queryClient = useQueryClient();
  const [eventId] = useQueryState("eventId", parseAsString);
  const t = useTranslations("reportingTool.tradeFairSurveyForm");
  const { addSurveyToEvent } = useAddSurveyToEvent(eventId || "");

  return useMutation({
    mutationFn: async (payload: TradeFairSurveyFormDto) => {
      // 1. Create survey
      const response = await createSurvey(payload);
      const surveyId = response.id;

      // 2. Add to event if eventId exists (retaining existing surveys)
      if (eventId) {
        try {
          const eventDetail = queryClient.getQueryData<TradeFairEvent>(["trade-fair-event-detail", eventId]);
          const currentSurveys = eventDetail?.surveys?.map((eventSurvey) => ({
            surveyId: eventSurvey.id,
            requiredLogin: eventSurvey.requiredLogin ?? true,
          })) ?? [];

          const updatedSurveys = [
            ...currentSurveys,
            { surveyId, requiredLogin: true },
          ];
          await addSurveyToEvent({ surveys: updatedSurveys });
        } catch (error) {
          console.error("Failed to add survey to event:", error);
          toast.warning(t("linkSurveyToEventError"));
        }
      }

      return { id: surveyId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trade-fair-survey-list"] });
    },
  });
};

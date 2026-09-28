'use client';

import { useQuery } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";
import type { SurveyDetail } from "../../(helpers)/survey-detail-type";

const fetchSurveyDetail = async (surveyId: string): Promise<SurveyDetail> => {
  const response = await apiProxy.get(`tf/surveys/${surveyId}`);
  return response.data.data as SurveyDetail;
};

export const useGetSurveyDetail = (surveyId?: string) => {
  const query = useQuery({
    queryKey: ["trade-fair-survey-detail", surveyId],
    queryFn: () => fetchSurveyDetail(surveyId!),
    enabled: !!surveyId,
  });

  return {
    surveyDetail: query.data,
    isLoading: query.isLoading,
  };
};

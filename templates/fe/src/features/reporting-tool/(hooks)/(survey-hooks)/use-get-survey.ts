'use client';

import { useQuery } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";
import type { Survey } from "../../(helpers)/trade-fair-event-type";
import { PaginationType } from "@/shared/types/pagination-type";

type SurveyListResponse = {
  items: Survey[];
  pagination: PaginationType;
}

type SurveyFilters = {
  page?: number;
  limit?: number;
  sort?: string;
}

const fetchSurveyList = async (
  eventId: string,
  filters: SurveyFilters
): Promise<SurveyListResponse> => {
  const response = await apiProxy.get(`tf/surveys/event/${eventId}`, {
    params: filters,
  })
  return response.data.data as SurveyListResponse
}

export const useGetSurvey = (
  eventId: string,
  filters?: SurveyFilters
) => {
  const mergedFilters = {
    page: filters?.page ?? 1,
    limit: filters?.limit ?? 10,
    sort: filters?.sort ?? "createdAt:desc",
  }

  const query = useQuery({
    queryKey: ['trade-fair-survey-list', eventId, mergedFilters],
    queryFn: () => fetchSurveyList(eventId, mergedFilters),
    enabled: !!eventId,
  })

  return {
    surveys: Array.isArray(query.data?.items) ? query.data.items : [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
  }
}

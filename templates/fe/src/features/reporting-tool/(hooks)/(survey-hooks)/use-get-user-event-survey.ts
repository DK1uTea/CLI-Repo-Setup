'use client';

import { useQuery } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";
import type { UserEventSurvey } from "../../(helpers)/trade-fair-event-type";
import { PaginationType } from "@/shared/types/pagination-type";

type UserEventSurveyResponse = {
  items: UserEventSurvey[];
  pagination: PaginationType;
}

type UserEventSurveyFilters = {
  page?: number;
  limit?: number;
}

const fetchUserEventSurvey = async (
  eventSurveyId: string,
  filters: UserEventSurveyFilters
): Promise<UserEventSurveyResponse> => {
  const response = await apiProxy.get(`tf/users/event-survey/${eventSurveyId}`, {
    params: filters,
  })
  return response.data.data as UserEventSurveyResponse
}

export const useGetUserEventSurvey = (
  eventSurveyId: string,
  filters?: UserEventSurveyFilters
) => {
  const mergedFilters = {
    page: filters?.page ?? 1,
    limit: filters?.limit ?? 5,
  }

  const query = useQuery({
    queryKey: ['trade-fair-user-event-survey', eventSurveyId, mergedFilters],
    queryFn: () => fetchUserEventSurvey(eventSurveyId, mergedFilters),
    enabled: !!eventSurveyId,
  })

  return {
    users: Array.isArray(query.data?.items) ? query.data.items : [],
    usersPagination: query.data?.pagination,
    isLoading: query.isLoading,
  }
}

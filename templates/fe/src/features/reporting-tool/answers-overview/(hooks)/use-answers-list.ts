'use client';

import { useEffect, useState } from "react";
import { parseAsInteger, parseAsString, useQueryState, useQueryStates } from "nuqs";
import { useQuery } from "@tanstack/react-query";

import { apiProxy } from "@/lib/api";
import type { Answer } from "../../(helpers)/trade-fair-answer-type";
import type { PaginationType } from "@/shared/types/pagination-type";

type AnswersListResponse = {
  items: Answer[];
  pagination: PaginationType;
};

const fetchAnswersList = async (
  params: {
    eventId?: string;
    page?: number;
    limit?: number;
    sort?: string;
    search?: string;
    filter?: string;
  }
): Promise<AnswersListResponse> => {
  const response = await apiProxy.get("tf/answers", {
    params,
  });
  return response.data.data as AnswersListResponse;
};

export const useAnswersList = () => {
  const [eventId] = useQueryState("eventId", parseAsString);
  const [filters, setFilters] = useQueryStates({
    keyword: parseAsString.withDefault(""),
    status: parseAsString,
    sort: parseAsString.withDefault("updatedAt:desc"),
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(5),
  });

  // Reset page to 1 when filters change
  const [prevStatus, setPrevStatus] = useState(filters.status);
  const [prevSort, setPrevSort] = useState(filters.sort);
  const [prevKeyword, setPrevKeyword] = useState(filters.keyword);

  useEffect(() => {
    if (
      filters.status !== prevStatus ||
      filters.sort !== prevSort ||
      filters.keyword !== prevKeyword
    ) {
      setPrevStatus(filters.status);
      setPrevSort(filters.sort);
      setPrevKeyword(filters.keyword);
      setFilters({ page: 1 });
    }
  }, [filters.status, filters.sort, filters.keyword, prevStatus, prevSort, prevKeyword, setFilters]);

  const queryParams = {
    eventId: eventId ?? undefined,
    page: filters.page,
    limit: filters.limit,
    sort: filters.sort,
    ...(filters.keyword ? { search: filters.keyword } : {}),
    ...(filters.status ? { filter: `status:${filters.status}` } : {}),
  };

  const query = useQuery({
    queryKey: ["trade-fair-answers-list", queryParams],
    queryFn: () => fetchAnswersList(queryParams),
    enabled: !!eventId,
  });

  return {
    answers: Array.isArray(query.data?.items) ? query.data.items : [],
    totalCount: query.data?.pagination?.total ?? 0,
    page: filters.page,
    limit: filters.limit,
    setFilters,
    eventId,
    isLoading: query.isLoading,
  };
};

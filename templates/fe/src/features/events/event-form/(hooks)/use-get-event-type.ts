'use client';

import { useQuery } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";

export type EventType = {
  id: string;
  name: string;
  slug?: string;
};

export type EventTypeRes = {
  items: EventType[];
};

const fetchEventTypes = async (): Promise<EventTypeRes> => {
  const response = await apiProxy.get('/etr/event-types');
  return response.data.data as EventTypeRes;
};

export const useGetEventType = () => {
  const query = useQuery({
    queryKey: ['event-types'],
    queryFn: fetchEventTypes,
  });

  return {
    eventTypes: query.data?.items ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    query,
  };
};
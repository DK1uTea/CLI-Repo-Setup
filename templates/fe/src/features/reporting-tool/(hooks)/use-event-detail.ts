'use client';

import { useQuery } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";
import { TradeFairEvent } from "../(helpers)/trade-fair-event-type";

const fetchEventDetail = async (eventId: string): Promise<TradeFairEvent> => {
  const response = await apiProxy.get(`tf/events/${eventId}`)
  return response.data.data as TradeFairEvent
}

export const useEventDetail = (eventId: string) => {
  const query = useQuery({
    queryKey: ['trade-fair-event-detail', eventId],
    queryFn: () => fetchEventDetail(eventId),
    enabled: !!eventId,
  })

  return {
    eventDetail: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  }
}

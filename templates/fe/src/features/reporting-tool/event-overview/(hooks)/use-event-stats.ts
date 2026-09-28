'use client';

import { useQuery } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";
import { TradeFairEventStats } from "../(helpers)/event-overview-type";

const fetchEventStats = async (eventId: string): Promise<TradeFairEventStats> => {
  const response = await apiProxy.get('tf/dashboard/stats', {
    params: { eventId },
  })
  return response.data.data as TradeFairEventStats
}

export const useEventStats = (eventId: string) => {
  const query = useQuery({
    queryKey: ['trade-fair-event-stats', eventId],
    queryFn: () => fetchEventStats(eventId),
    enabled: !!eventId,
  })

  return {
    eventStats: query.data,
    isLoading: query.isLoading,
  }
}

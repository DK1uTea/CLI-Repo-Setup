'use client';

import { useQuery } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';
import { EventAnalyticStats } from '../(helpers)/event-analytics-type';

const fetchEventAnalyticStats = async (eventId: string): Promise<EventAnalyticStats> => {
  const response = await apiProxy.get('tf/analytics/stats', {
    params: { eventId },
  });
  return response.data.data as EventAnalyticStats;
};

export const useEventAnalyticStats = (eventId: string) => {
  const query = useQuery({
    queryKey: ['trade-fair-event-analytic-stats', eventId],
    queryFn: () => fetchEventAnalyticStats(eventId),
    enabled: !!eventId,
  });

  return {
    eventStats: query.data,
    isLoading: query.isLoading,
  };
};

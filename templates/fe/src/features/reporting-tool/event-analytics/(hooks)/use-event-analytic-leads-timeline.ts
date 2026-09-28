'use client';

import { useQuery } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';
import { EventAnalyticLeadsTimelinePoint } from '../(helpers)/event-analytics-type';

const fetchLeadsTimeline = async (eventId: string): Promise<{points: EventAnalyticLeadsTimelinePoint[]}> => {
  const response = await apiProxy.get('tf/analytics/timeline', {
    params: { eventId },
  });
  return response.data.data as {points: EventAnalyticLeadsTimelinePoint[]};
};

export const useEventAnalyticLeadsTimeline = (eventId: string) => {
  const query = useQuery({
    queryKey: ['trade-fair-event-analytics-leads-timeline', eventId],
    queryFn: () => fetchLeadsTimeline(eventId),
    enabled: !!eventId,
  });

  return {
    leadsTimeline: query.data?.points,
    isLoading: query.isLoading,
  };
};

'use client';

import { useQuery } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';

type DashboardEvent = {
  id: string;
  name: string;
  eventTypeName?: string;
  startDate: string;
  createdBy?: string;
};

type DashboardEventsData = {
  mine: DashboardEvent[];
  everyone: DashboardEvent[];
};

type DashboardEventsEnvelope = {
  data?: Partial<DashboardEventsData>;
};

async function fetchDashboardEvents(): Promise<DashboardEventsData> {
  const response = await apiProxy.get<DashboardEventsEnvelope>('etr/events/dashboard');
  return {
    mine: Array.isArray(response.data?.data?.mine) ? response.data.data.mine : [],
    everyone: Array.isArray(response.data?.data?.everyone) ? response.data.data.everyone : [],
  };
}

export function useDashboardEvents() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-events'],
    queryFn: fetchDashboardEvents,
  });

  return {
    myEvents: data?.mine ?? [],
    teamEvents: data?.everyone ?? [],
    isLoading,
  };
}

export type { DashboardEvent };

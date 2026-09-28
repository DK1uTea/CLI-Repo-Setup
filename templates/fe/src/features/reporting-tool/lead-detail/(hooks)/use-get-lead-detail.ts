'use client';

import { useQuery } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';
import { Lead } from '../../(helpers)/trade-fair-lead-type';

const fetchLeadDetail = async (leadId: string): Promise<Lead> => {
  const response = await apiProxy.get(`tf/leads/${leadId}`);
  return response.data.data as Lead;
};

export const useGetLeadDetail = (leadId: string) => {
  const query = useQuery({
    queryKey: ['trade-fair-lead-detail', leadId],
    queryFn: () => fetchLeadDetail(leadId),
    enabled: !!leadId,
  });

  return {
    leadDetail: query.data,
    isLoading: query.isLoading,
  };
};

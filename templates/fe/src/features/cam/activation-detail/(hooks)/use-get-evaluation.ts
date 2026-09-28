'use client';

import { useQuery } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';
import { EvaluationPoint } from '../(helpers)/scoring-evaluation';

export type EvaluationDetail = {
  id: string;
  totalScore: number;
  maxScore: number;
  rating: string;
  points: EvaluationPoint[];
};

async function fetchEvaluation(activationId: string): Promise<EvaluationDetail> {
  const response = await apiProxy.get<{ data: EvaluationDetail }>(`/cam/evaluations/${activationId}`);
  return response.data.data;
}

export function useGetEvaluation(activationId?: string, enabled = true) {
  return useQuery({
    queryKey: ['cam-evaluation', activationId],
    queryFn: () => fetchEvaluation(activationId!),
    enabled: !!activationId && enabled,
  });
}

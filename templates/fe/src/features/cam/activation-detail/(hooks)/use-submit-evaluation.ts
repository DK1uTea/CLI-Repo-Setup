'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';
import { EvaluationScoreItem } from '../(helpers)/scoring-evaluation';

type SubmitEvaluationDto = {
  activationId: string;
  maxScore: number;
  scores: EvaluationScoreItem[];
};

async function submitEvaluation({ activationId, maxScore, scores }: SubmitEvaluationDto) {
  const { data } = await apiProxy.post('/cam/evaluations', { activationId, maxScore, scores });
  return data;
}

export function useSubmitEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitEvaluation,
    onSuccess: (_, { activationId }) => {
      queryClient.invalidateQueries({ queryKey: ['cam-activation-detail', activationId] });
      queryClient.invalidateQueries({ queryKey: ['cam-evaluation', activationId] });
      queryClient.invalidateQueries({ queryKey: ['cam-activations-grouped'] });
    },
  });
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';
import { AnswerDetail } from '../../(helpers)/trade-fair-answer-detail-type';

const fetchAnswerDetail = async (answerId: string): Promise<AnswerDetail> => {
  const response = await apiProxy.get(`tf/answers/${answerId}`);
  return response.data.data as AnswerDetail;
};

export const useGetAnswerDetail = (answerId: string) => {
  const query = useQuery({
    queryKey: ['trade-fair-answer-detail', answerId],
    queryFn: () => fetchAnswerDetail(answerId),
    enabled: !!answerId,
  });

  return {
    answerDetail: query.data,
    isLoading: query.isLoading,
  };
};

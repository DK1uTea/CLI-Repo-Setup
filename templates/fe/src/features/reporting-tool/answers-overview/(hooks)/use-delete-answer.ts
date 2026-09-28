'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiProxy } from "@/lib/api";

const fetchDeleteAnswer = async (answerId: string) => {
  const response = await apiProxy.delete(
    `tf/answers/${answerId}`
  );
  return response.data;
};

export const useDeleteAnswer = (answerId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => fetchDeleteAnswer(answerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trade-fair-answers-list"] });
    },
  });

  return {
    deleteAnswer: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
};

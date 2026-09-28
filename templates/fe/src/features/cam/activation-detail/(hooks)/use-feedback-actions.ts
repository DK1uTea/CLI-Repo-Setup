'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';

type AddFeedbackDto = {
  activationId: string;
  reason: string;
  type: 'CHECKBOX' | 'TEXT';
};

async function addFeedback(dto: AddFeedbackDto) {
  const { data } = await apiProxy.post('/cam/feedbacks', { ...dto, resolved: false });
  return data;
}

async function resolveFeedback(feedbackId: string) {
  const { data } = await apiProxy.patch(`/cam/feedbacks/${feedbackId}/resolve`);
  return data;
}

async function unresolveFeedback(feedbackId: string) {
  const { data } = await apiProxy.patch(`/cam/feedbacks/${feedbackId}/unresolve`);
  return data;
}

async function deleteFeedback(feedbackId: string) {
  const { data } = await apiProxy.delete(`/cam/feedbacks/${feedbackId}`);
  return data;
}

function useInvalidateFeedbacks() {
  const queryClient = useQueryClient();
  return (activationId: string) =>
    queryClient.invalidateQueries({ queryKey: ['cam-activation-feedbacks', activationId] });
}

export function useAddFeedback() {
  const invalidate = useInvalidateFeedbacks();
  return useMutation({
    mutationFn: addFeedback,
    onSuccess: (_, { activationId }) => invalidate(activationId),
  });
}

export function useToggleFeedbackResolved() {
  const invalidate = useInvalidateFeedbacks();
  return useMutation({
    mutationFn: ({ feedbackId, resolved }: { feedbackId: string; activationId: string; resolved: boolean }) =>
      resolved ? unresolveFeedback(feedbackId) : resolveFeedback(feedbackId),
    onSuccess: (_, { activationId }) => invalidate(activationId),
  });
}

export function useDeleteFeedback() {
  const invalidate = useInvalidateFeedbacks();
  return useMutation({
    mutationFn: ({ feedbackId }: { feedbackId: string; activationId: string }) => deleteFeedback(feedbackId),
    onSuccess: (_, { activationId }) => invalidate(activationId),
  });
}

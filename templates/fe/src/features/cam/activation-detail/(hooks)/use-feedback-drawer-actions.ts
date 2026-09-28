'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '@/shared/stores/use-user-store';
import { PERMISSIONS, PERMISSION_ALL_WILDCARD } from '@/shared/constants/permissions';
import { useUpdateActivationStatus } from '@/features/cam/activation-view/(hooks)/use-update-activation-status';
import { useGetActivationFeedbacks } from './use-get-activation-feedbacks';
import { useAddFeedback, useDeleteFeedback, useToggleFeedbackResolved } from './use-feedback-actions';

export function useFeedbackDrawerActions(
  activationId: string | undefined,
  status: string | undefined,
  open = false,
) {
  const { data: feedbackList = [], isLoading, isFetching, refetch } = useGetActivationFeedbacks(activationId);
  const permissions = useUserStore((s) => s.permissions);
  const isAdmin =
    permissions?.includes(PERMISSION_ALL_WILDCARD) ||
    permissions?.includes(PERMISSIONS.CustomerActivation.InternalAdmin);

  const { mutate: addFeedback, isPending: isAdding } = useAddFeedback();
  const { mutate: toggleResolved } = useToggleFeedbackResolved();
  const { mutate: removeFeedback, isPending: isDeleting } = useDeleteFeedback();
  const { mutate: updateStatus, isPending: isChangingStatus } = useUpdateActivationStatus();
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open && activationId) {
      refetch();
    }
  }, [open, activationId, refetch]);

  const reasons = feedbackList.filter((f) => f.type === 'CHECKBOX');
  const comments = feedbackList.filter((f) => f.type === 'TEXT');
  const isClarification = status === 'CLARIFICATION';

  function addReason(text: string) {
    if (!activationId) return;
    addFeedback({ activationId, reason: text, type: 'CHECKBOX' });
  }

  function toggleReason(id: string, resolved: boolean) {
    if (!activationId) return;

    setTogglingIds((prev) => new Set(prev).add(id));
    toggleResolved(
      { feedbackId: id, activationId, resolved },
      {
        onSettled: () => {
          setTogglingIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        },
      },
    );
  }

  function deleteReason(id: string) {
    if (!activationId) return;
    removeFeedback({ feedbackId: id, activationId });
  }

  function submit(comment: string, { onSuccess }: { onSuccess: () => void }) {
    if (!activationId) return;

    const finish = () => {
      if (isClarification) {
        onSuccess();
        return;
      }
      updateStatus({ id: activationId, status: 'CLARIFICATION' }, { onSuccess });
    };

    const hasComment = !!comment.replace(/<[^>]*>/g, '').trim();

    if (hasComment) {
      addFeedback({ activationId, reason: comment.trim(), type: 'TEXT' }, { onSuccess: finish });
    } else {
      finish();
    }
  }

  return {
    reasons,
    comments,
    isAdmin: !!isAdmin,
    isClarification,
    isLoading: isLoading || (isFetching && feedbackList.length === 0),
    addReason,
    toggleReason,
    deleteReason,
    submit,
    isAdding,
    isDeleting,
    togglingIds,
    isSubmitting: isChangingStatus || isAdding,
  };
}

'use client';

import { usePreviewSurveyActions } from '../(hooks)/use-preview-survey-actions';
import { usePreviewSurveyStore } from '../(stores)/use-preview-survey-store';
import { PreviewSurveyGroup } from './preview-survey-group';
import { PreviewSurveyReviewView } from './preview-survey-review-view';
import { PreviewSurveyBodySkeleton } from './preview-survey-body-skeleton';
import { PreviewSurveyEmpty } from './preview-survey-empty';

export default function PreviewSurveyBody() {
  const { currentStep, isReviewStep } = usePreviewSurveyActions();
  const { isLoading } = usePreviewSurveyStore();

  if (isLoading) {
    return <PreviewSurveyBodySkeleton />;
  }

  if (!currentStep) {
    return <PreviewSurveyEmpty />;
  }

  if (isReviewStep) {
    return <PreviewSurveyReviewView />;
  }

  return (
    <div className="flex flex-col gap-5">
      {currentStep.groups
        .filter((group) => !group.isDisable && group.questions.some((q) => !q.isDisable))
        .map((group) => (
          <PreviewSurveyGroup key={group.id} stepId={currentStep.id} group={group} />
        ))}
    </div>
  );
}
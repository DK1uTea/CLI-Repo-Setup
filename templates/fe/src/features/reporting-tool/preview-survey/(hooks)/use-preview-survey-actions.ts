'use client';

import { useShallow } from 'zustand/react/shallow';
import { usePreviewSurveyStore } from '../(stores)/use-preview-survey-store';
import type { Step } from '../../(helpers)/survey-detail-type';

export const REVIEW_STEP_ID = 'review-step';

export function usePreviewSurveyActions() {
  const { surveyDetail, currentStepId, setCurrentStepId } = usePreviewSurveyStore(
    useShallow((state) => ({
      surveyDetail: state.surveyDetail,
      currentStepId: state.currentStepId,
      setCurrentStepId: state.setCurrentStepId,
    }))
  );

  // 1. Sort original steps from API
  const steps = [...(surveyDetail?.steps || [])].sort((a, b) => a.position - b.position);

  // 2. Append virtual Review Step if survey has steps
  if (steps.length > 0) {
    steps.push({
      id: REVIEW_STEP_ID,
      surveyId: surveyDetail?.id || '',
      title: 'Review Answers',
      position: steps.length + 1,
      groups: [],
    } as unknown as Step);
  }

  const currentStepIndex = steps.findIndex((step) => step.id === currentStepId);
  const currentStep = steps[currentStepIndex];

  const goToStep = (stepId: string) => {
    setCurrentStepId(stepId);
  };

  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepId(steps[currentStepIndex + 1].id);
    }
  };

  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepId(steps[currentStepIndex - 1].id);
    }
  };

  return {
    steps,
    currentStep,
    currentStepId,
    currentStepIndex,
    totalStep: steps.length,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === steps.length - 2,
    isReviewStep: currentStepId === REVIEW_STEP_ID,
    goToStep,
    goToNextStep,
    goToPrevStep,
  };
}

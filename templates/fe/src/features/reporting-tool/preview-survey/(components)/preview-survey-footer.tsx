'use client';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/shared/components/ui/button';
import { buildSurveyStepFieldPaths } from '../(helpers)/build-dynamic-schema';
import { usePreviewSurveyStore } from '../(stores)/use-preview-survey-store';
import { usePreviewSurveyActions } from '../(hooks)/use-preview-survey-actions';
import { ArrowLeft, ArrowRight, Upload, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PreviewSurveyFooterSkeleton } from './preview-survey-footer-skeleton';

type PreviewSurveyFooterProps = {
  onOpenChange: (open: boolean) => void;
};

export function PreviewSurveyFooter({ onOpenChange }: PreviewSurveyFooterProps) {
  const t = useTranslations('reportingTool.previewSurvey');
  const { trigger, getValues } = useFormContext();
  const { surveyDetail, isLoading } = usePreviewSurveyStore();
  const {
    isFirstStep,
    isLastStep,
    isReviewStep,
    currentStepId,
    goToNextStep,
    goToPrevStep,
  } = usePreviewSurveyActions();

  const handleNext = async () => {
    if (!surveyDetail || !currentStepId) return;

    if (!isReviewStep) {
      // Validate the fields of the CURRENT active step only
      const stepFieldPaths = buildSurveyStepFieldPaths(surveyDetail);
      const fieldsInCurrentStep = stepFieldPaths[currentStepId] || [];

      const isValid = await trigger(fieldsInCurrentStep);
      if (!isValid) return;

      goToNextStep();
    } else {
      // We are on the Review step (the last step), click Finish to submit
      const values = getValues();
      console.log('Final Preview Survey Form Values:', values);
      onOpenChange(false);
    }
  };

  if (isLoading) {
    return <PreviewSurveyFooterSkeleton />;
  }

  if (isReviewStep) {
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center w-full">
        <Button
          type="button"
          size="xl"
          variant="outline"
          onClick={() => {
            const values = getValues();
            console.log('Draft Preview Survey Form Values:', values);
            onOpenChange(false);
          }}
          className="w-full sm:w-1/2 border-2 border-foreground"
        >
          <Upload data-icon="inline-start" />
          {t('saveDraft')}
        </Button>
        <Button
          size="xl"
          type="button"
          onClick={handleNext}
          className="w-full sm:w-1/2"
        >
          <Check data-icon="inline-start" />
          {t('save')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center w-full">
      {!isFirstStep && (
        <Button
          type="button"
          size="xl"
          variant="outline"
          onClick={goToPrevStep}
          className="w-full sm:w-1/2 border-2 border-foreground"
        >
          <ArrowLeft data-icon="inline-start" />
          {t('back')}
        </Button>
      )}
      <Button
        size="xl"
        type="button"
        onClick={handleNext}
        className={cn("w-full", isFirstStep ? "sm:w-1/2 sm:ml-auto" : "sm:w-1/2")}
      >
        {isLastStep ? t('review') : t('next')}
        <ArrowRight data-icon="inline-end" />
      </Button>
    </div>
  );
}

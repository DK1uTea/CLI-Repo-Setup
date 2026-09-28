'use client';

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/shared/components/ui/card";
import { usePreviewSurveyActions } from "../(hooks)/use-preview-survey-actions";
import { usePreviewSurveyStore } from "../(stores)/use-preview-survey-store";
import { StepIcon } from "@/shared/components/common/icons";
import { PreviewSurveyHeaderSkeleton } from "./preview-survey-header-skeleton";

const PreviewSurveyHeader = () => {
  const t = useTranslations('reportingTool.previewSurvey');
  const { currentStep, currentStepIndex, totalStep } = usePreviewSurveyActions();
  const { isLoading } = usePreviewSurveyStore();

  if (isLoading) {
    return <PreviewSurveyHeaderSkeleton />;
  }

  return (
    <Card className="shrink-0 rounded-[24px]">
      <CardContent className="gap-0">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center size-16 shrink-0 text-white font-bold text-sm select-none">
            <StepIcon className="absolute inset-0 size-16" />
            <span className="relative z-10 text-4xl font-normal">{currentStepIndex + 1}</span>
          </div>
          <div className="grow">
            <p className="text-muted-foreground font-thin text-lg">
              {t('stepIndicator', { current: currentStepIndex + 1, total: totalStep - 1 })}
            </p>
            <h3 className="font-bold text-3xl">{currentStep?.title}</h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PreviewSurveyHeader;
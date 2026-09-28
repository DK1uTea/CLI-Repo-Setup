'use client';

import { useGetSurveyDetail } from "@/features/reporting-tool/(hooks)/(survey-hooks)/use-get-survey-detail";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";

import { useTranslations } from "next-intl";
import DynamicStepFormLayout from "./dynamic-step-form-layout";
import PreviewSurveyBody from "./preview-survey-body";
import { PreviewSurveyFooter } from "./preview-survey-footer";
import PreviewSurveyHeader from "./preview-survey-header";
import { usePreviewSurveyActions } from "../(hooks)/use-preview-survey-actions";

import type { SurveyDetail } from "@/features/reporting-tool/(helpers)/survey-detail-type";

type PreviewSurveyDialogProps = {
  surveyId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surveyDetail?: SurveyDetail;
}

const PreviewSurveyDialog = ({ surveyId, open, onOpenChange, surveyDetail: propSurveyDetail }: PreviewSurveyDialogProps) => {
  const t = useTranslations('reportingTool.previewSurvey');
  const { surveyDetail: fetchedSurveyDetail, isLoading: isFetching } = useGetSurveyDetail(surveyId);
  const { isReviewStep } = usePreviewSurveyActions();

  const surveyDetail = propSurveyDetail ?? fetchedSurveyDetail;
  const isLoading = propSurveyDetail ? false : isFetching;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full sm:max-w-xl md:max-w-3xl flex flex-col max-h-[90vh] bg-background p-6 gap-4"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle className="font-semibold text-xl">{!isReviewStep ? surveyDetail?.name ?? t('preview') : t('summary')}</DialogTitle>
        </DialogHeader>
        <div className="h-px bg-border -mx-6" />
        <DynamicStepFormLayout
          surveyId={surveyId}
          surveyDetail={surveyDetail}
          isLoading={isLoading}
        >
          <div className="grow overflow-y-auto _custom-scroll overflow-x-hidden flex flex-col gap-6 min-h-0 min-w-0 pr-2">
            {!isReviewStep && <PreviewSurveyHeader />}
            <PreviewSurveyBody />
            <PreviewSurveyFooter onOpenChange={onOpenChange} />
          </div>
        </DynamicStepFormLayout>
      </DialogContent>
    </Dialog>
  );
}

export default PreviewSurveyDialog;

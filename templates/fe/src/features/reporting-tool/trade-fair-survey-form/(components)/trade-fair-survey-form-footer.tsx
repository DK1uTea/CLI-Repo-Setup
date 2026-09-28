'use client';

import { useState } from "react";
import { useFormContext, useFormState } from "react-hook-form";
import { Button } from "@/shared/components/ui/button";
import { useTranslations } from "next-intl";
import { parseAsString, useQueryState } from "nuqs";
import { TRADE_FAIR_SURVEY_FORM_CONFIG } from "../(helpers)/trade-fair-survey-form-config";
import { useTradeFairSurveyActions } from "../(hooks)/use-trade-fair-survey-action";

import { useRouter, usePathname } from "@/i18n/navigation";
import { toast } from "sonner";

import { useSubmitStepSurvey } from "../(hooks)/use-submit-step-survey";
import PreviewSurveyDialog from "@/features/reporting-tool/preview-survey/(components)/preview-survey-dialog";
import type { SurveyDetail } from "@/features/reporting-tool/(helpers)/survey-detail-type";
import type { TradeFairSurveyFormDto } from "../(helpers)/trade-fair-survey-form-schema";

import { mapFormDtoToSurveyDetail } from "../(helpers)/map-form-to-survey-detail";
import { useUnsavedChanges } from "@/shared/hooks/common/use-unsaved-changes";
import { UnsavedChangesDialog } from "@/shared/components/common/unsaved-changes-dialog";

const TradeFairSurveyFormFooter = () => {
  const t = useTranslations('reportingTool.tradeFairSurveyForm');
  const config = TRADE_FAIR_SURVEY_FORM_CONFIG;
  const router = useRouter();
  const pathname = usePathname();
  const [returnTo] = useQueryState("returnTo", parseAsString);
  const [surveyId] = useQueryState("id", parseAsString);
  const [eventId] = useQueryState("eventId", parseAsString);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewSurveyDetail, setPreviewSurveyDetail] = useState<SurveyDetail>();
  const { getValues, control, reset } = useFormContext<TradeFairSurveyFormDto>();
  const { isDirty } = useFormState<TradeFairSurveyFormDto>({ control });

  const isEditMode = pathname.includes('/update-survey');

  const rawCancelHref = returnTo || config.cancelHref;
  const cancelHref = returnTo
    ? returnTo
    : (eventId
        ? (rawCancelHref.includes('?') ? `${rawCancelHref}&eventId=${eventId}` : `${rawCancelHref}?eventId=${eventId}`)
        : rawCancelHref);

  const rawRedirectHref = config.submitRedirectHref;
  const redirectHref = returnTo
    ? returnTo
    : (eventId
        ? (rawRedirectHref.includes('?') ? `${rawRedirectHref}&eventId=${eventId}` : `${rawRedirectHref}?eventId=${eventId}`)
        : rawRedirectHref);

  const { submit: submitSurvey, isPending } = useSubmitStepSurvey();
  const { currentStep, isLastStep, goToNextStep } = useTradeFairSurveyActions({
    steps: config.steps,
  });

  const { dialogProps } = useUnsavedChanges({
    isDirty: currentStep === 'survey' && isDirty,
    onDiscard: () => reset(),
    onSave: async () => {
      const activeId = await submitSurvey();
      if (!activeId) return false;
      reset(getValues());
    },
  });

  const handleNext = async () => {
    let activeId = surveyId;
    if (currentStep === 'survey') {
      const id = await submitSurvey();
      if (!id) return;
      activeId = id;
      reset(getValues());
    }

    if (isLastStep) {
      toast.success(t('surveySaved'));
      router.push(redirectHref);
      return;
    }

    goToNextStep(activeId);
  };

  const handlePreviewOpen = () => {
    const values = getValues();
    const mapped = mapFormDtoToSurveyDetail(values);
    setPreviewSurveyDetail(mapped);
    setIsPreviewOpen(true);
  };

  const cancelButton = (
    <Button
      type="button"
      variant="outline-primary"
      href={cancelHref}
      className="w-full sm:w-auto"
    >
      {t('cancel')}
    </Button>
  );

  const previewButton = (
    <Button
      variant="outline-primary"
      type="button"
      className="w-full sm:w-auto"
      onClick={handlePreviewOpen}
    >
      {t('preview')}
    </Button>
  );

  const saveButton = (
    <Button
      type="button"
      onClick={handleNext}
      className="w-full sm:w-auto"
      disabled={isPending || (isEditMode && currentStep === 'survey' && !isDirty)}
      isLoading={isPending}
    >
      {isEditMode ? t('updateSurvey') : t('saveSurvey')}
    </Button>
  );

  return (
    <div className="sticky bottom-0 z-10 shrink-0 border-y border-border bg-card">
      <div className="grid grid-cols-2 gap-2 px-4 py-4 sm:hidden">
        {cancelButton}
        {previewButton}
        <div className="col-span-2">{saveButton}</div>
      </div>

      <div className="hidden items-center justify-between gap-2 px-6 py-5 sm:flex">
        {cancelButton}
        <div className="flex items-center justify-end gap-3">
          {previewButton}
          {saveButton}
        </div>
      </div>

      {isPreviewOpen && (
        <PreviewSurveyDialog
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          surveyDetail={previewSurveyDetail}
        />
      )}

      <UnsavedChangesDialog {...dialogProps} />
    </div>
  );
};

export default TradeFairSurveyFormFooter;

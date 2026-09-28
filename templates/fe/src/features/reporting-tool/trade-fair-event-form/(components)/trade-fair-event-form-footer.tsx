"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsString, useQueryState } from "nuqs";
import { useFormContext } from "react-hook-form";
import { TRADE_FAIR_EVENT_FORM_CONFIG } from "../(helpers)/trade-fair-event-form-config";
import { useTradeFairEventActions } from "../(hooks)/use-trade-fair-event-action";
import { useSubmitStepGeneralInfo } from "../(hooks)/use-submit-step-general-info";
import { useSubmitStepSurvey } from "../(hooks)/use-submit-step-survey";
import { useSubmitTradeFairEvent } from "../(hooks)/use-submit-trade-fair-event";
import { STEP_FIELDS, type TradeFairEventFormDto } from "../(helpers)/trade-fair-event-form-schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";

const TradeFairEventFormFooter = () => {
  const t = useTranslations('reportingTool.tradeFairEventForm');
  const config = TRADE_FAIR_EVENT_FORM_CONFIG;
  const methods = useFormContext<TradeFairEventFormDto>();
  const [eventId] = useQueryState("id", parseAsString);
  const [referrer] = useQueryState("referrer", parseAsString);
  const redirectHref = referrer === "eventDetail" && eventId
    ? `/reporting-tool/event-detail?id=${eventId}`
    : (eventId
      ? `${config.submitRedirectHref}&eventId=${eventId}`
      : config.submitRedirectHref);
  const { currentStep, isFirstStep, isLastStep, goToNextStep, goToPrevStep } = useTradeFairEventActions({
    steps: config.steps,
  });
  const { submit: submitGeneralInfo, isPending: pendingGeneralInfo } = useSubmitStepGeneralInfo();
  const { submit: submitSurvey, isPending: pendingSurvey } = useSubmitStepSurvey();
  const {
    saveDraft,
    launch,
    isPending: pendingTradeFairEvent,
  } = useSubmitTradeFairEvent({
    redirectHref,
  });

  const [isDraftConfirmOpen, setIsDraftConfirmOpen] = useState(false);

  const isPending = pendingGeneralInfo || pendingSurvey || pendingTradeFairEvent;

  const handleSaveDraft = async () => {
    let valid = false;
    if (currentStep === 'general-info') {
      valid = await methods.trigger(STEP_FIELDS['general-info']);
    } else if (currentStep === 'survey') {
      valid = await methods.trigger(STEP_FIELDS.survey);
    } else {
      valid = true;
    }

    if (valid) {
      setIsDraftConfirmOpen(true);
    }
  };

  const handleNext = async () => {
    if (currentStep === 'general-info') {
      const ok = await submitGeneralInfo();
      if (!ok) return;
    }

    if (currentStep === 'survey') {
      const ok = await submitSurvey();
      if (!ok) return;
    }

    if (currentStep === 'general-info' || currentStep === 'survey') {
      methods.reset(methods.getValues());
    }

    if (isLastStep) {
      await launch();
      return;
    }

    goToNextStep();
  };

  const backButton = (
    <Button
      type="button"
      variant="outline-primary"
      onClick={isFirstStep ? undefined : goToPrevStep}
      disabled={isPending || isFirstStep}
      className="w-full sm:w-auto"
    >
      <ArrowLeft className="size-4" />
      {t('previous')}
    </Button>
  );

  const draftButton = (
    <Button
      variant="outline-primary"
      type="button"
      onClick={handleSaveDraft}
      disabled={isPending}
      className="w-full sm:w-auto"
    >
      {t('saveAsDraft')}
    </Button>
  );

  const nextButton = (
    <Button type="button" onClick={handleNext} isLoading={isPending} className="w-full sm:w-auto">
      {isLastStep ? t('saveAndLaunch') : t('nextStep')}
    </Button>
  );

  return (
    <div className="sticky bottom-0 z-10 shrink-0 border-y border-border bg-card">
      <div className="grid grid-cols-2 gap-2 px-4 py-4 sm:hidden">
        {backButton}
        {draftButton}
        <div className="col-span-2">{nextButton}</div>
      </div>

      <div className="hidden items-center justify-between gap-2 px-6 py-5 sm:flex">
        {backButton}
        <div className="flex items-center justify-end gap-3">
          {draftButton}
          {nextButton}
        </div>
      </div>

      <AlertDialog open={isDraftConfirmOpen} onOpenChange={setIsDraftConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('saveDraftDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('saveDraftDialog.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('saveDraftDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIsDraftConfirmOpen(false);
                void saveDraft();
              }}
              disabled={isPending}
            >
              {t('saveDraftDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default TradeFairEventFormFooter;


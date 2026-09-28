'use client';

import { STEP_COMPONENTS, TRADE_FAIR_EVENT_FORM_CONFIG, TradeFairEventFormMode } from "../(helpers)/trade-fair-event-form-config";
import { useTradeFairEventActions } from "../(hooks)/use-trade-fair-event-action";
import TradeFairEventFormSidebar from "./trade-fair-event-form-sidebar";
import { useFormContext, useFormState } from "react-hook-form";
import type { TradeFairEventFormDto } from "../(helpers)/trade-fair-event-form-schema";
import { useSubmitStepGeneralInfo } from "../(hooks)/use-submit-step-general-info";
import { useSubmitStepSurvey } from "../(hooks)/use-submit-step-survey";
import { useUnsavedChanges } from "@/shared/hooks/common/use-unsaved-changes";
import { UnsavedChangesDialog } from "@/shared/components/common/unsaved-changes-dialog";

type Props = {
  mode: TradeFairEventFormMode;
};

const TradeFairEventFormBody = ({ mode }: Props) => {

  const config = TRADE_FAIR_EVENT_FORM_CONFIG;
  const { currentStep } = useTradeFairEventActions({ steps: config.steps });
  const StepComponent = STEP_COMPONENTS[currentStep];
  const methods = useFormContext<TradeFairEventFormDto>();
  const { isDirty } = useFormState({ control: methods.control });
  const { submit: submitGeneralInfo } = useSubmitStepGeneralInfo();
  const { submit: submitSurvey } = useSubmitStepSurvey();
  const submitCurrentStep = currentStep === 'general-info'
    ? submitGeneralInfo
    : currentStep === 'survey'
      ? submitSurvey
      : undefined;
  const { dialogProps } = useUnsavedChanges({
    isDirty,
    onDiscard: () => methods.reset(),
    onSave: submitCurrentStep
      ? async () => {
          if (!await submitCurrentStep()) return false;
          methods.reset(methods.getValues());
        }
      : undefined,
  });

  return (
    <div className="flex flex-col gap-5 lg:flex-row">
      <TradeFairEventFormSidebar mode={mode} />
      <div className="min-w-0 flex-1">
        <StepComponent />
      </div>
      <UnsavedChangesDialog {...dialogProps} />
    </div>
  );
}

export default TradeFairEventFormBody;

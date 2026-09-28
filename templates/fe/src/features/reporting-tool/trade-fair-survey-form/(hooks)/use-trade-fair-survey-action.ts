import { parseAsString, useQueryState } from "nuqs";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { STEP_NAMES, StepName } from "../(helpers)/trade-fair-survey-form-config";

type Options = {
  steps?: readonly StepName[];
};

export function useTradeFairSurveyActions(options: Options = {}) {
  const steps = options.steps ?? STEP_NAMES;
  const defaultStep = steps[0] ?? 'survey';
  const [rawStep, setStep] = useQueryState('step', parseAsString.withDefault(defaultStep));
  const [surveyId] = useQueryState('id', parseAsString);
  const t = useTranslations('reportingTool.tradeFairSurveyForm');
  const rawCurrentStep = (rawStep?.toLowerCase() ?? defaultStep) as StepName;
  const currentStep = steps.includes(rawCurrentStep) ? rawCurrentStep : defaultStep;
  const stepIndex = steps.indexOf(currentStep);

  const goToStep = (step: StepName, newId?: string | null) => {
    const targetIndex = steps.indexOf(step);
    const activeId = newId !== undefined ? newId : surveyId;
    if (targetIndex > 0 && !activeId) {
      toast.error(t("pleaseSaveSurveyFirst"));
      return;
    }
    window?.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(step);
  };
  const goToNextStep = (newId?: string | null) => {
    const next = steps[stepIndex + 1];
    if (next) {
      const targetIndex = steps.indexOf(next);
      const activeId = newId !== undefined ? newId : surveyId;
      if (targetIndex > 0 && !activeId) {
        toast.error(t("pleaseSaveSurveyFirst"));
        return;
      }
      window?.scrollTo({ top: 0, behavior: 'smooth' });
      setStep(next);
    }
  };
  const goToPrevStep = () => {
    const prev = steps[stepIndex - 1];
    if (prev) setStep(prev);
  };

  return {
    currentStep,
    isFirstStep: stepIndex === 0,
    isLastStep: stepIndex === steps.length - 1,
    goToStep,
    goToNextStep,
    goToPrevStep,
  };
}

import { parseAsString, useQueryState } from "nuqs";
import { STEP_NAMES, StepName } from "../(helpers)/trade-fair-event-form-config";

type Options = {
  steps?: readonly StepName[];
};

export function useTradeFairEventActions(options: Options = {}) {
  const steps = options.steps ?? STEP_NAMES;
  const defaultStep = steps[0] ?? 'general-info';
  const [rawStep, setStep] = useQueryState('step', parseAsString.withDefault(defaultStep));
  const rawCurrentStep = (rawStep?.toLowerCase() ?? defaultStep) as StepName;
  const currentStep = steps.includes(rawCurrentStep) ? rawCurrentStep : defaultStep;
  const stepIndex = steps.indexOf(currentStep);

  const goToStep = (step: StepName) => {
    window?.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(step);
  };
  const goToNextStep = () => {
    const next = steps[stepIndex + 1];
    if (next) {
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

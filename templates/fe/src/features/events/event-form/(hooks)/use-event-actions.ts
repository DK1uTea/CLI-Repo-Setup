'use client';

import { useQueryState, parseAsString } from 'nuqs';
import { STEP_NAMES, type StepName } from '../(helpers)/event-form-schema';

type Options = {
  steps?: readonly StepName[];
};

export function useEventActions(options: Options = {}) {
  const steps = options.steps ?? STEP_NAMES;
  const [rawStep, setStep] = useQueryState('step', parseAsString.withDefault('overview'));
  const rawCurrentStep = (rawStep?.toLowerCase() ?? 'overview') as StepName;
  const currentStep = steps.includes(rawCurrentStep) ? rawCurrentStep : steps[0] ?? 'overview';
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

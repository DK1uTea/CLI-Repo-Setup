import TradeFairEventFormStepAssignTeam from "../(components)/steps/trade-fair-event-form-step-assign-team";
import TradeFairEventFormStepGeneralInfo from "../(components)/steps/trade-fair-event-form-step-general-info";
import TradeFairEventFormStepReviewLaunch from "../(components)/steps/trade-fair-event-form-step-review-launch";
import TradeFairEventFormStepSurvey from "../(components)/steps/trade-fair-event-form-step-survey";

export type TradeFairEventFormMode = 'create' | 'update';


export const STEP_NAMES = ["general-info", "survey", "assign-team", "review-launch"] as const;

export type StepName = (typeof STEP_NAMES)[number];

export const STEP_COMPONENTS: Record<StepName, React.ComponentType> = {
  "general-info": TradeFairEventFormStepGeneralInfo,
  "survey": TradeFairEventFormStepSurvey,
  "assign-team": TradeFairEventFormStepAssignTeam,
  "review-launch": TradeFairEventFormStepReviewLaunch
};

type EventFormConfig = {
  steps: readonly StepName[];
  cancelHref: string;
  submitRedirectHref: string;
};

export const TRADE_FAIR_EVENT_FORM_CONFIG: EventFormConfig = {
  steps: STEP_NAMES,
  cancelHref: '/reporting-tool',
  submitRedirectHref: '/reporting-tool?tab=survey-builder',
}
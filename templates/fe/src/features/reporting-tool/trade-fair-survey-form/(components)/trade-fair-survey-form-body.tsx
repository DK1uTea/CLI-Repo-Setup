'use client';

import { STEP_COMPONENTS, TRADE_FAIR_SURVEY_FORM_CONFIG, TradeFairSurveyFormMode } from "../(helpers)/trade-fair-survey-form-config";
import { useTradeFairSurveyActions } from "../(hooks)/use-trade-fair-survey-action";
import TradeFairSurveyFormSidebar from "./trade-fair-survey-form-sidebar";

type Props = {
  mode: TradeFairSurveyFormMode;
};

const TradeFairSurveyFormBody = ({ mode }: Props) => {
  const config = TRADE_FAIR_SURVEY_FORM_CONFIG;
  const { currentStep } = useTradeFairSurveyActions({ steps: config.steps });
  const StepComponent = STEP_COMPONENTS[currentStep];

  return (
    <div className="flex flex-col gap-5 lg:flex-row">
      <TradeFairSurveyFormSidebar mode={mode} />
      <div className="min-w-0 flex-1">
        <StepComponent />
      </div>
    </div>
  );
}

export default TradeFairSurveyFormBody;

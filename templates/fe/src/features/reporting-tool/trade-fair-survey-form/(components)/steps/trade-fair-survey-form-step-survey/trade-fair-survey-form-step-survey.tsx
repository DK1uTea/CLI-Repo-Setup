'use client';

import { parseAsString, useQueryState } from "nuqs";
import { useGetSurveyDetail } from "@/features/reporting-tool/(hooks)/(survey-hooks)/use-get-survey-detail";
import SurveyNameCard from "./survey-name-card";
import SurveySteps from "./survey-steps";
import TradeFairSurveyFormStepSurveySkeleton from "./trade-fair-survey-form-step-survey-skeleton";

const TradeFairSurveyFormStepSurvey = () => {
  const [surveyId] = useQueryState("id", parseAsString);
  const { isLoading } = useGetSurveyDetail(surveyId || "");

  if (surveyId && isLoading) {
    return <TradeFairSurveyFormStepSurveySkeleton />;
  }

  return (
    <div className="flex flex-col gap-4">
      <SurveyNameCard />
      <SurveySteps />
    </div>
  );
};

export default TradeFairSurveyFormStepSurvey;

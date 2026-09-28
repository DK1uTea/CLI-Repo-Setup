'use client';

import { useEffect } from 'react';
import { FormProvider } from 'react-hook-form';
import { parseAsString, useQueryState } from 'nuqs';
import { useGetSurveyDetail } from '@/features/reporting-tool/(hooks)/(survey-hooks)/use-get-survey-detail';
import TradeFairSurveyFormFooter from "@/features/reporting-tool/trade-fair-survey-form/(components)/trade-fair-survey-form-footer";
import { useTradeFairSurveyForm } from "@/features/reporting-tool/trade-fair-survey-form/(hooks)/use-trade-fair-survey-form";

export default function TradeFairSurveyCreationLayout({ children }: { children: React.ReactNode }) {
  const { methods } = useTradeFairSurveyForm();
  const [surveyId] = useQueryState('id', parseAsString);
  const { surveyDetail } = useGetSurveyDetail(surveyId || '');

  useEffect(() => {
    if (surveyDetail) {
      methods.reset({
        name: surveyDetail.name,
        steps: surveyDetail.steps || [],
      });
    }
  }, [surveyDetail, methods]);

  return (
    <FormProvider {...methods}>
      <div className="-m-6 flex min-h-[calc(100dvh-64px)] flex-col">
        <div className="flex-1 p-6">{children}</div>
        <TradeFairSurveyFormFooter />
      </div>
    </FormProvider>
  );
}

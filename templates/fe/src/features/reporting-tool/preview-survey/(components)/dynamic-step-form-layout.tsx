'use client'

import { useEffect } from "react";
import { FormProvider } from "react-hook-form";

import { useShallow } from "zustand/react/shallow";

import type { SurveyDetail } from "../../(helpers)/survey-detail-type";
import { useDynamicForm } from "../(hooks)/use-dynamic-form";
import { usePreviewSurveyStore } from "../(stores)/use-preview-survey-store";

type DynamicStepFormLayoutProps = {
  children: React.ReactNode;
  surveyId?: string;
  surveyDetail?: SurveyDetail;
  isLoading: boolean;
}

const DynamicStepFormLayout = ({
  children,
  surveyId,
  surveyDetail,
  isLoading,
}: DynamicStepFormLayoutProps) => {
  const { methods } = useDynamicForm(surveyDetail);
  const {
    setSurveyState,
    clearSurveyState
  } = usePreviewSurveyStore(
    useShallow((state) => ({
      setSurveyState: state.setSurveyState,
      clearSurveyState: state.clearSurveyState,
    }))
  );

  useEffect(() => {
    setSurveyState({
      surveyId,
      surveyDetail,
      isLoading,
    });
  }, [isLoading, setSurveyState, surveyDetail, surveyId]);

  useEffect(() => {
    return () => {
      clearSurveyState();
    };
  }, [clearSurveyState]);

  return (
    <FormProvider {...methods}>
      {children}
    </FormProvider>
  );
}

export default DynamicStepFormLayout;

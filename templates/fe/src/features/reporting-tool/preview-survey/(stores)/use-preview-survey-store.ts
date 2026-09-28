import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import type { SurveyDetail } from '../../(helpers)/survey-detail-type';

type PreviewSurveyStore = {
  surveyId?: string;
  surveyDetail?: SurveyDetail;
  isLoading: boolean;
  currentStepId?: string;
  setSurveyState: (state: {
    surveyId?: string;
    surveyDetail?: SurveyDetail;
    isLoading: boolean;
  }) => void;
  setCurrentStepId: (currentStepId?: string) => void;
  clearSurveyState: () => void;
};

export const usePreviewSurveyStore = create<PreviewSurveyStore>()(
  devtools(
    immer((set) => ({
      surveyId: undefined,
      surveyDetail: undefined,
      isLoading: false,
      currentStepId: undefined,
      setSurveyState: (surveyState) =>
        set((state) => {
          let sortedSurveyDetail: SurveyDetail | undefined = undefined;

          if (surveyState.surveyDetail) {
            sortedSurveyDetail = {
              ...surveyState.surveyDetail,
              steps: [...surveyState.surveyDetail.steps]
                .sort((a, b) => a.position - b.position)
                .map((step) => ({
                  ...step,
                  groups: [...step.groups]
                    .sort((a, b) => a.position - b.position)
                    .map((group) => ({
                      ...group,
                      questions: [...group.questions].sort((a, b) => a.position - b.position),
                    })),
                })),
            };
          }

          state.surveyId = surveyState.surveyId;
          state.surveyDetail = sortedSurveyDetail;
          state.isLoading = surveyState.isLoading;

          const firstStepId = sortedSurveyDetail?.steps[0]?.id;
          state.currentStepId = state.currentStepId ?? firstStepId;
        }, false, 'setSurveyState'),
      setCurrentStepId: (currentStepId) =>
        set((state) => {
          state.currentStepId = currentStepId;
        }, false, 'setCurrentStepId'),
      clearSurveyState: () =>
        set((state) => {
          state.surveyId = undefined;
          state.surveyDetail = undefined;
          state.isLoading = false;
          state.currentStepId = undefined;
        }, false, 'clearSurveyState'),
    })),
    { name: 'PreviewSurveyStore' }
  )
);


import { beforeEach, describe, expect, it } from 'vitest';

import type { SurveyDetail } from '@/features/reporting-tool/(helpers)/survey-detail-type';
import { usePreviewSurveyStore } from '@/features/reporting-tool/preview-survey/(stores)/use-preview-survey-store';

const survey: SurveyDetail = {
  id: 'survey-1', name: 'Survey', createdBy: '', updatedBy: '', createdAt: '', updatedAt: '',
  steps: [2, 1].map((stepPosition) => ({
    id: `step-${stepPosition}`, surveyId: 'survey-1', title: `Step ${stepPosition}`,
    position: stepPosition, createdBy: '', updatedBy: '', createdAt: {}, updatedAt: {},
    groups: [2, 1].map((groupPosition) => ({
      id: `step-${stepPosition}-group-${groupPosition}`, stepId: `step-${stepPosition}`,
      title: `Group ${groupPosition}`, position: groupPosition, isDisable: false,
      createdBy: '', updatedBy: '', createdAt: {}, updatedAt: {},
      questions: [2, 1].map((questionPosition) => ({
        id: `question-${questionPosition}`, groupId: `group-${groupPosition}`,
        content: `Question ${questionPosition}`, type: 'SHORT_TEXT', position: questionPosition,
        isRequired: false, isDisable: false, createdBy: '', updatedBy: '', createdAt: {}, updatedAt: {},
      })),
    })),
  })),
};

beforeEach(() => usePreviewSurveyStore.getState().clearSurveyState());

describe('usePreviewSurveyStore', () => {
  it('sorts steps, groups, and questions by position without mutating input order', () => {
    usePreviewSurveyStore.getState().setSurveyState({ surveyId: survey.id, surveyDetail: survey, isLoading: false });
    const detail = usePreviewSurveyStore.getState().surveyDetail!;
    expect(detail.steps.map((step) => step.position)).toEqual([1, 2]);
    expect(detail.steps[0].groups.map((group) => group.position)).toEqual([1, 2]);
    expect(detail.steps[0].groups[0].questions.map((question) => question.position)).toEqual([1, 2]);
    expect(survey.steps.map((step) => step.position)).toEqual([2, 1]);
  });

  it('selects the first sorted step when no current step exists', () => {
    usePreviewSurveyStore.getState().setSurveyState({ surveyId: survey.id, surveyDetail: survey, isLoading: false });
    expect(usePreviewSurveyStore.getState().currentStepId).toBe('step-1');
  });

  it('preserves an explicitly selected step across refreshed survey data', () => {
    usePreviewSurveyStore.getState().setCurrentStepId('step-2');
    usePreviewSurveyStore.getState().setSurveyState({ surveyId: survey.id, surveyDetail: survey, isLoading: true });
    expect(usePreviewSurveyStore.getState().currentStepId).toBe('step-2');
    expect(usePreviewSurveyStore.getState().isLoading).toBe(true);
  });

  it('clears every preview state value', () => {
    usePreviewSurveyStore.getState().setSurveyState({ surveyId: survey.id, surveyDetail: survey, isLoading: false });
    usePreviewSurveyStore.getState().clearSurveyState();
    expect(usePreviewSurveyStore.getState()).toMatchObject({
      surveyId: undefined, surveyDetail: undefined, isLoading: false, currentStepId: undefined,
    });
  });
});

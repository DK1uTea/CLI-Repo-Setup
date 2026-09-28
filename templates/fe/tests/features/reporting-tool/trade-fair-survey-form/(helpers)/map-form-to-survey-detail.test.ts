import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  mapFormDtoToSurveyDetail,
  mapQuestionDtoToQuestion,
} from '@/features/reporting-tool/trade-fair-survey-form/(helpers)/map-form-to-survey-detail';
import type { TradeFairSurveyFormDto } from '@/features/reporting-tool/trade-fair-survey-form/(helpers)/trade-fair-survey-form-schema';

const question = {
  content: 'Choose one', type: 'SINGLE_CHOICE', position: 0,
  isRequired: true, isDisable: false,
  metadata: { options: [{ label: 'One', value: 'one' }] },
};

afterEach(() => vi.useRealTimers());

describe('mapQuestionDtoToQuestion', () => {
  it('creates stable preview ids and preserves question behaviour', () => {
    expect(mapQuestionDtoToQuestion(question)).toMatchObject({
      id: 'preview-question-id', groupId: 'preview-group-id', content: 'Choose one',
      type: 'SINGLE_CHOICE', position: 0, isRequired: true, isDisable: false,
      metadata: { options: [{ label: 'One', value: 'one' }] },
    });
  });

  it('maps checkbox-group metadata without flattening child options', () => {
    const result = mapQuestionDtoToQuestion({
      ...question, type: 'CHECKBOX_GROUP',
      metadata: { options: [{ label: 'Group A', options: [{ label: 'A', value: 'a' }] }] },
    });
    expect(result.metadata?.options).toEqual([
      { label: 'Group A', options: [{ label: 'A', value: 'a' }] },
    ]);
  });

  it('maps null metadata and placeholder to undefined', () => {
    const result = mapQuestionDtoToQuestion({ ...question, metadata: null, placeholder: null });
    expect(result.metadata).toBeUndefined();
    expect(result.placeholder).toBeUndefined();
  });
});

describe('mapFormDtoToSurveyDetail', () => {
  const form: TradeFairSurveyFormDto = {
    name: 'Visitor survey',
    steps: [{
      title: 'General', position: 0,
      groups: [{
        title: 'Contact', position: 0, isDisable: false,
        questions: [question],
      }],
    }],
  };

  it('creates deterministic fallback ids for preview hierarchy', () => {
    const result = mapFormDtoToSurveyDetail(form);
    expect(result.steps[0]).toMatchObject({ id: 'step-0', surveyId: 'preview-temp-id' });
    expect(result.steps[0].groups[0]).toMatchObject({ id: 'group-0', stepId: 'step-0' });
    expect(result.steps[0].groups[0].questions[0]).toMatchObject({ id: 'q-0', groupId: 'group-0' });
  });

  it('preserves supplied ids, positions, disabled state, and field keys', () => {
    const result = mapFormDtoToSurveyDetail({
      ...form,
      steps: [{
        ...form.steps[0], id: 'step-live', position: 4,
        groups: [{
          ...form.steps[0].groups[0], id: 'group-live', position: 3, isDisable: true,
          questions: [{ ...question, id: 'question-live', field_key: 'email', position: 2, isDisable: true }],
        }],
      }],
    });
    expect(result.steps[0]).toMatchObject({ id: 'step-live', position: 4 });
    expect(result.steps[0].groups[0]).toMatchObject({ id: 'group-live', position: 3, isDisable: true });
    expect(result.steps[0].groups[0].questions[0]).toMatchObject({
      id: 'question-live', field_key: 'email', position: 2, isDisable: true,
    });
  });

  it('uses the current instant for the virtual preview timestamps', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-01T12:00:00.000Z'));
    const result = mapFormDtoToSurveyDetail(form);
    expect(result.createdAt).toBe('2026-08-01T12:00:00.000Z');
    expect(result.updatedAt).toBe('2026-08-01T12:00:00.000Z');
  });
});

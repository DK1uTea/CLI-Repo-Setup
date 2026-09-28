import { describe, expect, it } from 'vitest';

import type { Question, QuestionType, SurveyDetail } from '@/features/reporting-tool/(helpers)/survey-detail-type';
import {
  buildFieldSchema,
  buildSurveyDefaultValues,
  buildSurveySchema,
  buildSurveyStepFieldPaths,
  buildSurveyStepFields,
} from '@/features/reporting-tool/preview-survey/(helpers)/build-dynamic-schema';

const makeQuestion = (type: QuestionType, overrides: Partial<Question> = {}): Question => ({
  id: `question-${type}`, groupId: 'group-1', content: type, type, position: 0,
  isRequired: false, isDisable: false, createdBy: '', updatedBy: '', createdAt: {}, updatedAt: {},
  ...overrides,
});

const makeSurvey = (questions: Question[]): SurveyDetail => ({
  id: 'survey-1', name: 'Survey', createdBy: '', updatedBy: '',
  createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
  steps: [{
    id: 'step-1', surveyId: 'survey-1', title: 'Step', position: 0,
    createdBy: '', updatedBy: '', createdAt: {}, updatedAt: {},
    groups: [{
      id: 'group-1', stepId: 'step-1', title: 'Group', position: 0, isDisable: false,
      createdBy: '', updatedBy: '', createdAt: {}, updatedAt: {}, questions,
    }],
  }],
});

describe('buildFieldSchema', () => {
  it('validates required email and accepts an empty optional email', () => {
    expect(buildFieldSchema(makeQuestion('EMAIL', { isRequired: true })).safeParse('invalid').success).toBe(false);
    expect(buildFieldSchema(makeQuestion('EMAIL', { isRequired: true })).safeParse('user@example.com').success).toBe(true);
    expect(buildFieldSchema(makeQuestion('EMAIL')).safeParse('').success).toBe(true);
  });

  it('treats false as a valid required yes-no answer but rejects undefined', () => {
    const schema = buildFieldSchema(makeQuestion('YES_NO', { isRequired: true }));
    expect(schema.safeParse(false).success).toBe(true);
    expect(schema.safeParse(undefined).success).toBe(false);
  });

  it.each([0, 6])('rejects rating %s outside one through five', (value) => {
    expect(buildFieldSchema(makeQuestion('RATING')).safeParse(value).success).toBe(false);
  });

  it('accepts rating boundaries one and five', () => {
    const schema = buildFieldSchema(makeQuestion('RATING', { isRequired: true }));
    expect(schema.safeParse(1).success).toBe(true);
    expect(schema.safeParse(5).success).toBe(true);
  });

  it.each(['SINGLE_CHOICE', 'DROPDOWN', 'DROPDOWN_ADD_ON'] as const)(
    'rejects an empty required %s answer', (type) => {
      expect(buildFieldSchema(makeQuestion(type, { isRequired: true })).safeParse('').success).toBe(false);
    },
  );

  it.each(['MULTIPLE_CHOICE', 'CHECKBOX_GROUP', 'MULTI_SELECT_DROPDOWN'] as const)(
    'requires at least one selected value for %s', (type) => {
      const schema = buildFieldSchema(makeQuestion(type, { isRequired: true }));
      expect(schema.safeParse([]).success).toBe(false);
      expect(schema.safeParse(['one']).success).toBe(true);
    },
  );

  it('applies input-number minimum and maximum metadata', () => {
    const schema = buildFieldSchema(makeQuestion('INPUT_NUMBER', { metadata: { min: 10, max: 20 } }));
    expect(schema.safeParse(9).success).toBe(false);
    expect(schema.safeParse(10).success).toBe(true);
    expect(schema.safeParse(20).success).toBe(true);
    expect(schema.safeParse(21).success).toBe(false);
  });

  it('accepts blank optional date and rejects blank required date', () => {
    expect(buildFieldSchema(makeQuestion('DATE')).safeParse('').success).toBe(true);
    expect(buildFieldSchema(makeQuestion('DATE', { isRequired: true })).safeParse('').success).toBe(false);
  });

  it('rejects an empty required text answer', () => {
    expect(buildFieldSchema(makeQuestion('SHORT_TEXT', { isRequired: true })).safeParse('').success).toBe(false);
  });
});

describe('survey preview builders', () => {
  const questions = [
    makeQuestion('SHORT_TEXT'), makeQuestion('MULTIPLE_CHOICE'), makeQuestion('TOGGLE'),
    makeQuestion('DATE'), makeQuestion('RATING'),
    makeQuestion('SHORT_TEXT', { id: 'disabled-question', isDisable: true }),
  ];
  const survey = makeSurvey(questions);

  it('builds defaults for each enabled field type and omits disabled questions', () => {
    expect(buildSurveyDefaultValues(survey)).toEqual({ 'step-1': {
      'question-SHORT_TEXT': '', 'question-MULTIPLE_CHOICE': [], 'question-TOGGLE': false,
      'question-DATE': undefined, 'question-RATING': undefined,
    } });
  });

  it('builds enabled field ids and fully-qualified field paths', () => {
    expect(buildSurveyStepFields(survey)['step-1']).not.toContain('disabled-question');
    expect(buildSurveyStepFieldPaths(survey)['step-1']).toEqual([
      'step-1.question-SHORT_TEXT', 'step-1.question-MULTIPLE_CHOICE',
      'step-1.question-TOGGLE', 'step-1.question-DATE', 'step-1.question-RATING',
    ]);
  });

  it('omits every question in a disabled group from schema and defaults', () => {
    const disabled = makeSurvey([makeQuestion('SHORT_TEXT', { isRequired: true })]);
    disabled.steps[0].groups[0].isDisable = true;
    expect(buildSurveyDefaultValues(disabled)).toEqual({ 'step-1': {} });
    expect(buildSurveySchema(disabled).safeParse({ 'step-1': {} }).success).toBe(true);
  });

  it('builds a nested schema that validates enabled required questions', () => {
    const required = makeSurvey([makeQuestion('SHORT_TEXT', { isRequired: true })]);
    const schema = buildSurveySchema(required);
    expect(schema.safeParse({ 'step-1': { 'question-SHORT_TEXT': '' } }).success).toBe(false);
    expect(schema.safeParse({ 'step-1': { 'question-SHORT_TEXT': 'Ada' } }).success).toBe(true);
  });
});

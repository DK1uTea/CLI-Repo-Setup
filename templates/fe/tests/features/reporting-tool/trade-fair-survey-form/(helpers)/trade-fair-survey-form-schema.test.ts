import { describe, expect, it } from 'vitest';

import {
  QuestionSchema,
  tradeFairSurveyFormSchema,
} from '@/features/reporting-tool/trade-fair-survey-form/(helpers)/trade-fair-survey-form-schema';

const question = {
  id: 'question-1', content: 'Your name?', type: 'SHORT_TEXT', position: 0,
  isRequired: true, isDisable: false, metadata: null,
};

const validSurvey = {
  name: 'Visitor survey',
  steps: [{
    id: 'step-1', title: 'General', position: 0,
    groups: [{ id: 'group-1', title: 'Contact', position: 0, isDisable: false, questions: [question] }],
  }],
};

describe('tradeFairSurveyFormSchema', () => {
  it('accepts a named survey with a step, group, and question', () => {
    expect(tradeFairSurveyFormSchema.safeParse(validSurvey).success).toBe(true);
  });

  it('rejects a missing survey name', () => {
    const result = tradeFairSurveyFormSchema.safeParse({ ...validSurvey, name: '' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.flatten().fieldErrors).toHaveProperty('name');
  });

  it('rejects a step with no groups', () => {
    const result = tradeFairSurveyFormSchema.safeParse({
      ...validSurvey, steps: [{ ...validSurvey.steps[0], groups: [] }],
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toEqual(['steps', 0, 'groups']);
  });

  it('rejects a group with no questions', () => {
    const groups = [{ ...validSurvey.steps[0].groups[0], questions: [] }];
    const result = tradeFairSurveyFormSchema.safeParse({
      ...validSurvey, steps: [{ ...validSurvey.steps[0], groups }],
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toEqual(['steps', 0, 'groups', 0, 'questions']);
  });

  it('rejects negative step, group, and question positions', () => {
    const invalid = {
      ...validSurvey,
      steps: [{
        ...validSurvey.steps[0], position: -1,
        groups: [{ ...validSurvey.steps[0].groups[0], position: -1, questions: [{ ...question, position: -1 }] }],
      }],
    };
    const result = tradeFairSurveyFormSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.map((issue) => issue.path)).toHaveLength(3);
  });
});

describe('QuestionSchema CHECKBOX_GROUP rules', () => {
  const checkboxQuestion = { ...question, type: 'CHECKBOX_GROUP' };

  it('requires grouped metadata options', () => {
    const result = QuestionSchema.safeParse({ ...checkboxQuestion, metadata: null });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toEqual(['metadata', 'options']);
  });

  it('rejects flat options for CHECKBOX_GROUP', () => {
    const result = QuestionSchema.safeParse({
      ...checkboxQuestion, metadata: { options: [{ label: 'One', value: 'one' }] },
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.at(-1)?.path).toEqual(['metadata', 'options', 0]);
  });

  it('rejects duplicate option values across different groups', () => {
    const result = QuestionSchema.safeParse({
      ...checkboxQuestion,
      metadata: { options: [
        { label: 'A', options: [{ label: 'One', value: 'same' }] },
        { label: 'B', options: [{ label: 'Again', value: 'same' }] },
      ] },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['metadata', 'options', 1, 'options', 0, 'value']);
    }
  });

  it('accepts unique option values across groups', () => {
    const result = QuestionSchema.safeParse({
      ...checkboxQuestion,
      metadata: { options: [
        { label: 'A', options: [{ label: 'One', value: 'one' }] },
        { label: 'B', options: [{ label: 'Two', value: 'two' }] },
      ] },
    });
    expect(result.success).toBe(true);
  });

  it('does not require metadata for other question types', () => {
    expect(QuestionSchema.safeParse(question).success).toBe(true);
  });
});

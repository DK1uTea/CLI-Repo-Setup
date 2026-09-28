import { describe, expect, it, vi } from 'vitest';

import {
  getQuestionTypeTranslation,
  getQuestionTypeTranslationKeys,
} from '@/features/reporting-tool/trade-fair-survey-form/(helpers)/survey-question-type-helper';

describe('survey question type translations', () => {
  it('builds full translation keys for an unscoped translator', () => {
    expect(getQuestionTypeTranslationKeys('EMAIL')).toEqual({
      labelKey: 'reportingTool.questionTypes.EMAIL.label',
      descriptionKey: 'reportingTool.questionTypes.EMAIL.description',
    });
  });

  it('builds relative translation keys for a reportingTool-scoped translator', () => {
    expect(getQuestionTypeTranslationKeys('RATING', { scoped: true })).toEqual({
      labelKey: 'questionTypes.RATING.label',
      descriptionKey: 'questionTypes.RATING.description',
    });
  });

  it('translates both the label and description keys', () => {
    const translate = vi.fn((key: string) => `translated:${key}`);
    expect(getQuestionTypeTranslation('DATE', translate)).toEqual({
      label: 'translated:reportingTool.questionTypes.DATE.label',
      description: 'translated:reportingTool.questionTypes.DATE.description',
    });
    expect(translate).toHaveBeenCalledTimes(2);
  });
});

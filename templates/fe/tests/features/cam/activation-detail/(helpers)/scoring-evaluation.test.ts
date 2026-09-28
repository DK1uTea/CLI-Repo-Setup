import { describe, expect, it } from 'vitest';

import {
  buildEvaluationScores,
  buildScoringFromEvaluation,
  FIELD_TO_EVAL_TYPE,
} from '@/features/cam/activation-detail/(helpers)/scoring-evaluation';
import { SCORING_CATEGORIES, SCORING_MAX_SCORE } from '@/features/cam/activation-detail/(helpers)/scoring-constants';
import { SCORING_DEFAULT_VALUES } from '@/features/cam/activation-detail/(helpers)/scoring-schema';

const labels = (key: string) => key;
const complete = Object.fromEntries(
  SCORING_CATEGORIES.map((category) => [category.field, category.options[0]?.key ?? '']),
);

describe('CAM scoring evaluation mapping', () => {
  it('maps every selected option to the evaluation API shape', () => {
    const result = buildEvaluationScores(complete as typeof SCORING_DEFAULT_VALUES, labels);
    expect(result).toHaveLength(9);
    expect(result[0]).toMatchObject({ type: FIELD_TO_EVAL_TYPE.htz, points: 3 });
    expect(result.every((item) => item.label.length > 0)).toBe(true);
  });

  it('uses the sum of every category maximum as the evaluation maximum', () => {
    const expected = SCORING_CATEGORIES.reduce(
      (total, category) => total + Math.max(...category.options.map((option) => option.pts)),
      0,
    );

    expect(SCORING_MAX_SCORE).toBe(expected);
    expect(SCORING_MAX_SCORE).toBe(27);
  });

  it('reconstructs selected options by translated label before points fallback', () => {
    const points = [
      { type: 'TARGET_GROUP', label: 'scoring.optionGold', value: 3 },
      { type: 'HTZ', label: 'unknown', value: 1 },
    ];
    const result = buildScoringFromEvaluation(points, labels);
    expect(result.targetGroup).toBe('GOLD');
    expect(result.htz).toBe('LOW');
  });
});

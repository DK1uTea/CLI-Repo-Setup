import { describe, expect, it } from 'vitest';

import { buildScoringSchema, SCORING_DEFAULT_VALUES } from '@/features/cam/activation-detail/(helpers)/scoring-schema';

const valid = Object.fromEntries(Object.keys(SCORING_DEFAULT_VALUES).map((key) => [key, 'OPTION']));

describe('CAM scoring schema', () => {
  it('requires one option for each of nine scoring categories', () => {
    expect(buildScoringSchema('required').safeParse(valid).success).toBe(true);
    expect(buildScoringSchema('required').safeParse(SCORING_DEFAULT_VALUES).success).toBe(false);
  });

  it('returns the configured required message for an empty option', () => {
    const result = buildScoringSchema('Option erforderlich').safeParse({ ...valid, htz: '' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toBe('Option erforderlich');
  });
});

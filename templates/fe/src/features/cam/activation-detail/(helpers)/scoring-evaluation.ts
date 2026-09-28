import { SCORING_CATEGORIES, ScoringFieldKey } from './scoring-constants';
import { ScoringFormValues, SCORING_DEFAULT_VALUES } from './scoring-schema';

export type EvaluationPoint = {
  type: string;
  label: string;
  value: number;
};

export type EvaluationScoreItem = {
  type: string;
  label: string;
  points: number;
};

/** Maps each scoring form field to the point `type` enum the /evaluations endpoint uses. */
export const FIELD_TO_EVAL_TYPE: Record<ScoringFieldKey, string> = {
  htz: 'HTZ',
  targetGroup: 'TARGET_GROUP',
  salesConcept: 'SALES_CONCEPT',
  contractSituation: 'CONTRACT_SITUATION',
  revenuePotential: 'REVENUE_POTENTIAL',
  hMarkt: 'H_MARKT',
  ahMarkt: 'AH_MARKT',
  brandFit: 'BRAND_FIT',
  impulsePoints: 'EFFICIENCY',
};

/** Converts selected scoring option keys into the {type, label, points} shape POST /evaluations expects. */
export function buildEvaluationScores(
  values: ScoringFormValues,
  translateLabel: (labelKey: string) => string,
): EvaluationScoreItem[] {
  return SCORING_CATEGORIES.map((category) => {
    const option = category.options.find((o) => o.key === values[category.field]);
    return {
      type: FIELD_TO_EVAL_TYPE[category.field],
      label: option ? translateLabel(option.labelKey) : '',
      points: option?.pts ?? 0,
    };
  });
}

/**
 * Reverses a previously-submitted evaluation's points back into scoring form values.
 * Matches by translated label first, falling back to points — options can share the
 * same points (e.g. PLATINUM/GOLD both worth 3), so points alone would be ambiguous.
 */
export function buildScoringFromEvaluation(
  points: EvaluationPoint[],
  translateLabel: (labelKey: string) => string,
): ScoringFormValues {
  const values = { ...SCORING_DEFAULT_VALUES };

  for (const category of SCORING_CATEGORIES) {
    const point = points.find((p) => p.type === FIELD_TO_EVAL_TYPE[category.field]);
    if (!point) continue;

    const option =
      category.options.find((o) => translateLabel(o.labelKey) === point.label) ??
      category.options.find((o) => o.pts === point.value);

    if (option) values[category.field] = option.key;
  }

  return values;
}

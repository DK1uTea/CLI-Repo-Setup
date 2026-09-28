export type SpecifyTag = string | { label: string; highlighted?: boolean };

export type ScoringOption = {
  key: string;
  labelKey: string;
  pts: number;
  specifyTags?: SpecifyTag[];
};

export type ScoringFieldKey =
  | 'htz'
  | 'targetGroup'
  | 'salesConcept'
  | 'contractSituation'
  | 'revenuePotential'
  | 'hMarkt'
  | 'ahMarkt'
  | 'brandFit'
  | 'impulsePoints';

export type ScoringCategory = {
  field: ScoringFieldKey;
  titleKey: string;
  questionKey: string;
  options: ScoringOption[];
};

/**
 * Internal CAM-admin evaluation rubric — independent from the sales-submitted
 * briefing values (see briefing-constants.ts). Each option carries the points
 * awarded toward the activation's total evaluation score.
 */
export const SCORING_CATEGORIES: ScoringCategory[] = [
  {
    field: 'htz',
    titleKey: 'scoring.htzTitle',
    questionKey: 'scoring.htzQuestion',
    options: [
      {
        key: 'HIGH', labelKey: 'scoring.optionHigh', pts: 3,
        specifyTags: [
          'Main station', 'Airport', { label: 'High traffic zone', highlighted: true },
          'Shopping centre', 'Tourism', 'Venue & surroundings', 'Leisure park',
        ],
      },
      {
        key: 'MEDIUM', labelKey: 'scoring.optionMedium', pts: 2,
        specifyTags: ['Urban location', 'Densely populated residential area', 'Frequented location/customer centre'],
      },
      {
        key: 'LOW', labelKey: 'scoring.optionLow', pts: 1,
        specifyTags: ['Urban location', 'Densely populated residential area', 'Frequented location/customer centre'],
      },
    ],
  },
  {
    field: 'targetGroup',
    titleKey: 'scoring.targetGroupTitle',
    questionKey: 'scoring.targetGroupQuestion',
    options: [
      { key: 'PLATINUM', labelKey: 'scoring.optionPlatinum', pts: 3 },
      { key: 'GOLD', labelKey: 'scoring.optionGold', pts: 3 },
      { key: 'SILVER', labelKey: 'scoring.optionSilver', pts: 2 },
      { key: 'BRONZE', labelKey: 'scoring.optionBronze', pts: 1 },
      { key: 'IRON', labelKey: 'scoring.optionIron', pts: 0 },
    ],
  },
  {
    field: 'salesConcept',
    titleKey: 'scoring.salesConceptTitle',
    questionKey: 'scoring.salesConceptQuestion',
    options: [
      { key: 'PLATINUM', labelKey: 'scoring.optionPlatinum', pts: 3 },
      { key: 'GOLD', labelKey: 'scoring.optionGold', pts: 3 },
      { key: 'SILVER', labelKey: 'scoring.optionSilver', pts: 2 },
      { key: 'BRONZE', labelKey: 'scoring.optionBronze', pts: 1 },
      { key: 'IRON', labelKey: 'scoring.optionIron', pts: 0 },
    ],
  },
  {
    field: 'contractSituation',
    titleKey: 'scoring.contractSituationTitle',
    questionKey: 'scoring.contractSituationQuestion',
    options: [
      { key: 'PLATINUM', labelKey: 'scoring.optionPlatinum', pts: 3 },
      { key: 'GOLD', labelKey: 'scoring.optionGold', pts: 3 },
      { key: 'SILVER', labelKey: 'scoring.optionSilver', pts: 2 },
      { key: 'BRONZE', labelKey: 'scoring.optionBronze', pts: 1 },
      { key: 'IRON', labelKey: 'scoring.optionIron', pts: 0 },
    ],
  },
  {
    field: 'revenuePotential',
    titleKey: 'scoring.revenuePotentialTitle',
    questionKey: 'scoring.revenuePotentialQuestion',
    options: [
      { key: 'ALL_IPPS', labelKey: 'scoring.optionAllIpps', pts: 3 },
      { key: 'HIGH_POTENTIAL', labelKey: 'scoring.optionHighPotential', pts: 3 },
      { key: 'MEDIUM_POTENTIAL', labelKey: 'scoring.optionMediumPotential', pts: 2 },
      { key: 'LOW_POTENTIAL', labelKey: 'scoring.optionLowPotential', pts: 1 },
    ],
  },
  {
    field: 'hMarkt',
    titleKey: 'scoring.hMarktTitle',
    questionKey: 'scoring.hMarktQuestion',
    options: [
      { key: 'SOCVI', labelKey: 'scoring.optionSocvi', pts: 3 },
      { key: 'SOVI', labelKey: 'scoring.optionSovi', pts: 3 },
      { key: 'ZWEITPLATZIERUNG', labelKey: 'scoring.optionSecondaryPlacement', pts: 3 },
      { key: 'DISRUPTION_POINT', labelKey: 'scoring.optionDisruptionPoint', pts: 1 },
      { key: 'SONSTIGES', labelKey: 'scoring.optionOther', pts: 0 },
    ],
  },
  {
    field: 'ahMarkt',
    titleKey: 'scoring.ahMarktTitle',
    questionKey: 'scoring.ahMarktQuestion',
    options: [
      { key: 'AUSSENANSICHT', labelKey: 'scoring.optionExteriorView', pts: 3 },
      { key: 'KUEHLER', labelKey: 'scoring.optionCooler', pts: 2 },
      { key: 'MEALDEAL', labelKey: 'scoring.optionMealDeal', pts: 1 },
      { key: 'INNENAKTIVIERUNG', labelKey: 'scoring.optionInteriorActivation', pts: 1 },
      { key: 'SONSTIGE', labelKey: 'scoring.optionOther', pts: 0 },
    ],
  },
  {
    field: 'brandFit',
    titleKey: 'scoring.brandFitTitle',
    questionKey: 'scoring.brandFitQuestion',
    options: [
      { key: 'SCENE_PREMIUM', labelKey: 'scoring.optionScenePremium', pts: 3 },
      { key: 'STANDARD', labelKey: 'scoring.optionStandard', pts: 2 },
      { key: 'LOW', labelKey: 'scoring.optionLowFit', pts: 1 },
    ],
  },
  {
    field: 'impulsePoints',
    titleKey: 'scoring.impulsePointsTitle',
    questionKey: 'scoring.impulsePointsQuestion',
    options: [
      { key: 'HIGH', labelKey: 'scoring.optionHighPotentialFull', pts: 3 },
      { key: 'MEDIUM', labelKey: 'scoring.optionStandardPotential', pts: 2 },
      { key: 'LOW', labelKey: 'scoring.optionLowPotentialFull', pts: 1 },
    ],
  },
];

export const SCORING_MAX_SCORE = SCORING_CATEGORIES.reduce(
  (sum, category) => sum + Math.max(...category.options.map((o) => o.pts)),
  0,
);

export type ScoreGroup = {
  labelKey: string;
  fields: ScoringFieldKey[];
  max: number;
};

/** Groups categories into the 6 score buckets shown on the total-score breakdown. */
export const SCORE_GROUPS: ScoreGroup[] = [
  { labelKey: 'scoring.groupLocationAttractiveness', fields: ['htz'], max: 3 },
  { labelKey: 'scoring.groupCustomerRelevance', fields: ['targetGroup', 'salesConcept', 'contractSituation'], max: 9 },
  { labelKey: 'scoring.groupSalesPotential', fields: ['revenuePotential'], max: 3 },
  { labelKey: 'scoring.groupActivationPotential', fields: ['hMarkt', 'ahMarkt'], max: 6 },
  { labelKey: 'scoring.groupBrandFit', fields: ['brandFit'], max: 3 },
  { labelKey: 'scoring.groupEconomicEfficiency', fields: ['impulsePoints'], max: 3 },
];

import { ActivationDetail } from '../../(hooks)/use-activation-detail';
import { ScoringFieldKey } from './scoring-constants';
import {
  HIGH_TRAFFIC_ZONE_LABELS,
  TARGET_GROUP_LABELS,
  SALES_CONCEPT_LABELS,
  CONTRACT_SITUATION_LABELS,
  REVENUE_POTENTIAL_LABELS,
  H_MARKT_LOCATION_LABELS,
  AH_MARKT_LOCATION_LABELS,
  BRAND_FIT_LABELS,
} from './briefing-constants';

const formatEnumLabel = (value?: string) => {
  if (!value) return '';
  return value.split('_').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
};

const mapLabels = (keys: string[] | undefined, map: Record<string, string>): string | null => {
  if (!keys || keys.length === 0) return null;
  return keys.map((k) => map[k] ?? formatEnumLabel(k)).join(', ');
};

/** Read-only preview of what the sales rep submitted for a given scoring category — shown as the "Answer" box. */
export function buildScoringAnswerText(activationDetail: ActivationDetail, field: ScoringFieldKey): string | null {
  switch (field) {
    case 'htz':
      return [mapLabels(activationDetail.highTrafficZones, HIGH_TRAFFIC_ZONE_LABELS), activationDetail.highTrafficZoneNotes]
        .filter(Boolean).join(' — ') || null;
    case 'targetGroup':
      return [mapLabels(activationDetail.targetGroups, TARGET_GROUP_LABELS), activationDetail.targetGroupNotes]
        .filter(Boolean).join(' — ') || null;
    case 'salesConcept':
      return [mapLabels(activationDetail.salesConcepts, SALES_CONCEPT_LABELS), activationDetail.salesConceptNotes]
        .filter(Boolean).join(' — ') || null;
    case 'contractSituation':
      return [mapLabels(activationDetail.contractSituations, CONTRACT_SITUATION_LABELS), activationDetail.contractSituationNotes]
        .filter(Boolean).join(' — ') || null;
    case 'revenuePotential':
      return mapLabels(activationDetail.revenuePotentials, REVENUE_POTENTIAL_LABELS);
    case 'hMarkt':
      return mapLabels(activationDetail.aMarket, H_MARKT_LOCATION_LABELS);
    case 'ahMarkt':
      return mapLabels(activationDetail.ahMarket, AH_MARKT_LOCATION_LABELS);
    case 'brandFit':
      return [activationDetail.brandFit ? (BRAND_FIT_LABELS[activationDetail.brandFit] ?? formatEnumLabel(activationDetail.brandFit)) : null, activationDetail.brandFitNotes]
        .filter(Boolean).join(' — ') || null;
    case 'impulsePoints':
      return null;
    default:
      return null;
  }
}

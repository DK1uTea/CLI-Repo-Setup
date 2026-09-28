import React from "react";
import { ActivationDetail } from "../../../(hooks)/use-activation-detail";
import { useTranslations } from "next-intl";

type Props = {
  activationDetail: ActivationDetail;
};

type BriefingRow = {
  label: string;
  value: React.ReactNode;
  show: boolean;
};

import {
  HIGH_TRAFFIC_ZONE_LABELS,
  TARGET_GROUP_LABELS,
  SALES_CONCEPT_LABELS,
  CONTRACT_SITUATION_LABELS,
  REVENUE_POTENTIAL_LABELS,
  H_MARKT_LOCATION_LABELS,
  AH_MARKT_LOCATION_LABELS,
  BRAND_FIT_LABELS,
  PROFITABILITY_LABELS
} from "../../(helpers)/briefing-constants";

const formatEnumLabel = (value?: string) => {
  if (!value) return '';
  return value
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

const mapLabel = (key: string, map: Record<string, string>) => map[key] ?? formatEnumLabel(key);

const mapLabels = (keys?: string[], map?: Record<string, string>): string => {
  if (!keys || keys.length === 0) return '—';
  if (!map) return keys.map(formatEnumLabel).join(', ');
  return keys.map(k => mapLabel(k, map)).join(', ');
};

const ActivationDetailBriefing = ({ activationDetail }: Props) => {
  const t = useTranslations('activationView');
  const rows: BriefingRow[] = [
    {
      label: t('drawer.briefing.responsibleCam'),
      value: formatEnumLabel(activationDetail.responsibleCam) || "—",
      show: !!activationDetail.responsibleCam
    },
    {
      label: t('drawer.briefing.numberOfOutlets'),
      value: (() => {
        const n = activationDetail.numberOfOutlets;
        if (n == null) return "—";
        const label = n === 1 ? t('drawer.briefing.outlet', { count: n }) : t('drawer.briefing.outlets', { count: n });
        return activationDetail.outletNotes ? `${label}, ${activationDetail.outletNotes}` : label;
      })(),
      show: activationDetail.numberOfOutlets != null
    },
    {
      label: t('drawer.briefing.highTrafficZone'),
      value: (() => {
        const base = mapLabels(activationDetail.highTrafficZones, HIGH_TRAFFIC_ZONE_LABELS);
        return activationDetail.highTrafficZoneNotes ? `${base}, ${activationDetail.highTrafficZoneNotes}` : base;
      })(),
      show: !!(activationDetail.highTrafficZones && activationDetail.highTrafficZones.length > 0)
    },
    {
      label: t('drawer.briefing.targetGroup'),
      value: (() => {
        const base = mapLabels(activationDetail.targetGroups, TARGET_GROUP_LABELS);
        return activationDetail.targetGroupNotes ? `${base}, ${activationDetail.targetGroupNotes}` : base;
      })(),
      show: !!(activationDetail.targetGroups && activationDetail.targetGroups.length > 0)
    },
    {
      label: t('drawer.briefing.salesConcept'),
      value: (() => {
        const base = mapLabels(activationDetail.salesConcepts, SALES_CONCEPT_LABELS);
        return activationDetail.salesConceptNotes ? `${base}, ${activationDetail.salesConceptNotes}` : base;
      })(),
      show: !!(activationDetail.salesConcepts && activationDetail.salesConcepts.length > 0)
    },
    {
      label: t('drawer.briefing.contractSituation'),
      value: (() => {
        const base = mapLabels(activationDetail.contractSituations, CONTRACT_SITUATION_LABELS);
        return activationDetail.contractSituationNotes ? `${base}, ${activationDetail.contractSituationNotes}` : base;
      })(),
      show: !!(activationDetail.contractSituations && activationDetail.contractSituations.length > 0)
    },
    {
      label: t('drawer.briefing.revenuePotential'),
      value: mapLabels(activationDetail.revenuePotentials, REVENUE_POTENTIAL_LABELS),
      show: !!(activationDetail.revenuePotentials && activationDetail.revenuePotentials.length > 0)
    },
    {
      label: t('drawer.briefing.ahMarket'),
      value: mapLabels(activationDetail.ahMarket, AH_MARKT_LOCATION_LABELS),
      show: !!(activationDetail.ahMarket && activationDetail.ahMarket.length > 0)
    },
    {
      label: t('drawer.briefing.hMarkt'),
      value: (() => {
        const base = mapLabels(activationDetail.aMarket, H_MARKT_LOCATION_LABELS);
        return activationDetail.aMarketNotes ? `${base}, ${activationDetail.aMarketNotes}` : base;
      })(),
      show: !!(activationDetail.aMarket && activationDetail.aMarket.length > 0)
    },
    {
      label: t('drawer.briefing.brandFit'),
      value: (() => {
        if (!activationDetail.brandFit) return "—";
        return activationDetail.brandFitNotes
          ? `${mapLabel(activationDetail.brandFit, BRAND_FIT_LABELS)}, ${activationDetail.brandFitNotes}`
          : mapLabel(activationDetail.brandFit, BRAND_FIT_LABELS);
      })(),
      show: !!activationDetail.brandFit
    },
    {
      label: t('drawer.briefing.profitability'),
      value: (() => {
        if (!activationDetail.profitability) return "—";
        return PROFITABILITY_LABELS[activationDetail.profitability] ?? mapLabel(activationDetail.profitability, PROFITABILITY_LABELS);
      })(),
      show: !!activationDetail.profitability
    }
  ];

  const visibleRows = rows.filter(r => r.show);

  if (visibleRows.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        {t('drawer.noBriefingData')}
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-background p-4">
      <p className="text-base font-semibold text-foreground">{t('drawer.briefingTitle')}</p>
      <div className="flex flex-col">
        {visibleRows.map((row, index) => (
          <div
            key={index}
            className="flex items-start justify-start gap-4 border-b border-border py-3.5 last:border-b-0"
          >
            <span className="w-[45%] shrink-0 text-sm leading-snug text-muted-foreground">
              {row.label}
            </span>
            <span className="wrap-break-word text-start text-sm leading-snug text-foreground">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivationDetailBriefing;

'use client';

import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/shared/components/ui/empty";
import { useTranslations } from "next-intl";

const EventAnalyticsLeadsTimelineNoData = () => {
  const t = useTranslations("reportingTool.eventAnalytics.leadsTimeline");

  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{t("noDataTitle")}</EmptyTitle>
        <EmptyDescription>{t("noDataDescription")}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};

export default EventAnalyticsLeadsTimelineNoData;

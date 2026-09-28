'use client';

import { Card } from "@/shared/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/shared/components/ui/empty";
import { useTranslations } from "next-intl";

const EventOverviewStatsNoData = () => {
  const t = useTranslations("reportingTool.eventOverview.stats");

  return (
    <Card>
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t("noDataTitle")}</EmptyTitle>
          <EmptyDescription>{t("noDataDescription")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </Card>
  );
}

export default EventOverviewStatsNoData;

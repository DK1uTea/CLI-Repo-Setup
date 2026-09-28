'use client';

import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/shared/components/ui/empty";
import { useTranslations } from "next-intl";

const EventOverviewMainNoData = () => {
  const t = useTranslations("reportingTool.eventOverview");

  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{t("noDataTitle")}</EmptyTitle>
        <EmptyDescription>{t("noDataDescription")}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export default EventOverviewMainNoData;

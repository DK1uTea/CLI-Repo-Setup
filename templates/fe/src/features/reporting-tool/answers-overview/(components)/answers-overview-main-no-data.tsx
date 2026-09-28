'use client';

import { useTranslations } from "next-intl";

import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/shared/components/ui/empty";

const AnswersOverviewMainNoData = () => {
  const t = useTranslations("reportingTool.answersOverview");

  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{t("noDataTitle")}</EmptyTitle>
        <EmptyDescription>{t("noDataDescription")}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};

export default AnswersOverviewMainNoData;

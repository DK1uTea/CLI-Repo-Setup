'use client';

import { Download, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsString, useQueryStates } from "nuqs";

import { SearchFilterBar } from "@/shared/components/common/search-filter-bar";
import { Button } from "@/shared/components/ui/button";
import { useAnswerExport } from "../(hooks)/use-answer-export";

const AnswersSearchFilter = () => {
  const t = useTranslations("reportingTool.answersOverview");
  const { exportAnswers, isExporting, eventId } = useAnswerExport();
  const [filters, setFilters] = useQueryStates({
    status: parseAsString.withDefault(""),
    sort: parseAsString.withDefault("updatedAt:desc"),
  });
  const statusOptions = [
    { value: "ALL", label: t("status.all") },
    { value: "DRAFT", label: t("status.DRAFT") },
    { value: "IN_PROGRESS", label: t("status.IN_PROGRESS") },
    { value: "COMPLETED", label: t("status.COMPLETED") },
  ];
  const sortOptions = [
    { value: "updatedAt:desc", label: t("sort.newest") },
    { value: "updatedAt:asc", label: t("sort.oldest") },
  ];

  return (
    <div className="flex w-full flex-col items-stretch gap-2.5 lg:flex-row lg:items-center">
      <SearchFilterBar
        className="min-w-0 flex-1"
        inputClassName="min-w-72 flex-1"
        filters={[
          {
            name: "sort",
            placeholder: t("sortPlaceholder"),
            options: sortOptions,
            value: filters.sort || "createdAt:desc",
            onChange: (value) => setFilters({ sort: value === "createdAt:desc" ? null : value }),
          },
          {
            name: "status",
            placeholder: t("statusPlaceholder"),
            options: statusOptions,
            value: filters.status || "ALL",
            onChange: (value) => setFilters({ status: value === "ALL" ? null : value }),
            showIcon: true,
          },
        ]}
        placeholder={t("searchPlaceholder")}
      />
      <Button
        className="h-8 w-full shrink-0 lg:w-auto text-sm"
        onClick={exportAnswers}
        disabled={isExporting || !eventId}
      >
        {t("export")}
        {isExporting ? (
          <Loader2 className="animate-spin" data-icon="inline-end" />
        ) : (
          <Download data-icon="inline-end" />
        )}
      </Button>
    </div>
  );
};

export default AnswersSearchFilter;

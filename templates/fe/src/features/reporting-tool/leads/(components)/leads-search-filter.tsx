'use client';

import { Download, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsString, useQueryStates } from "nuqs";

import { SearchFilterBar } from "@/shared/components/common/search-filter-bar";
import { Button } from "@/shared/components/ui/button";
import { useLeadExport } from "../(hooks)/use-lead-export";

const LeadsSearchFilter = () => {
  const t = useTranslations("reportingTool.leadsOverview");
  const { exportLeads, isExporting, eventId } = useLeadExport();
  const [filters, setFilters] = useQueryStates({
    status: parseAsString.withDefault(""),
    sort: parseAsString.withDefault("updatedAt:desc"),
  });
  const statusOptions = [
    { value: "ALL", label: t("status.all") },
    { value: "NEW", label: t("status.NEW") },
    { value: "EXISTED", label: t("status.EXISTED") },
  ];
  const sortOptions = [
    { value: "updatedAt:desc", label: t("sort.newest") },
    { value: "updatedAt:asc", label: t("sort.oldest") },
    { value: "company:asc", label: t("sort.companyAsc") },
    { value: "company:desc", label: t("sort.companyDesc") },
    { value: "fullName:asc", label: t("sort.nameAsc") },
    { value: "fullName:desc", label: t("sort.nameDesc") },
  ];

  return (
    <div className="flex w-full flex-col items-stretch gap-2.5 lg:flex-row lg:items-center">
      <SearchFilterBar
        className="min-w-0 flex-1"
        filters={[
          {
            name: "sort",
            placeholder: t("sortPlaceholder"),
            options: sortOptions,
            value: filters.sort || "updatedAt:desc",
            onChange: (value) => setFilters({ sort: value === "updatedAt:desc" ? null : value }),
          },
          {
            name: "status",
            placeholder: t("statusPlaceholder"),
            options: statusOptions,
            value: filters.status || "ALL",
            onChange: (value) => setFilters({ status: value === "ALL" ? null : value }),
            showIcon: true
          },
        ]}
        inputClassName="min-w-72 flex-1"
        placeholder={t("searchPlaceholder")}
      />
      <Button
        className="h-8 w-full shrink-0 text-sm lg:w-auto"
        onClick={exportLeads}
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

export default LeadsSearchFilter;

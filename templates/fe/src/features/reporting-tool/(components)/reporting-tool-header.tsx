'use client';

import { Button } from "@/shared/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsString, useQueryState } from "nuqs";

const ReportingToolHeader = () => {
  const t = useTranslations("reportingTool.header");
  const [tab] = useQueryState("tab", parseAsString);
  const [eventId] = useQueryState("eventId", parseAsString);
  const showCreateButton = !tab || tab === "dashboard";
  const createEventHref = eventId
    ? `/reporting-tool/new-event?returnEventId=${encodeURIComponent(eventId)}`
    : "/reporting-tool/new-event";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center min-h-12">
      <h4 className="font-semibold text-2xl">{t("titles.eventOverview")}</h4>
      {showCreateButton && (
        <Button
          href={createEventHref}>
          {t("createEvent")} <PlusIcon />
        </Button>
      )}
    </div>
  );
}

export default ReportingToolHeader;

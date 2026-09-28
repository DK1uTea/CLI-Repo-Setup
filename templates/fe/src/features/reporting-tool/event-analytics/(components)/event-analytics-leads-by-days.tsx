'use client';

import { dayjs } from "@/lib/date-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useTranslations } from "next-intl";
import { parseAsString, useQueryState } from "nuqs";

import { useEventAnalyticLeadsTimeline } from "../(hooks)/use-event-analytic-leads-timeline";
import EventAnalyticsLeadsByDaysNoData from "./event-analytics-leads-by-days-no-data";
import EventAnalyticsLeadsByDaysSkeleton from "./event-analytics-leads-by-days-skeleton";

const EventAnalyticsLeadsByDays = () => {
  const t = useTranslations("reportingTool.eventAnalytics.leadsByDays");
  const [eventId] = useQueryState("eventId", parseAsString);
  const { leadsTimeline, isLoading } = useEventAnalyticLeadsTimeline(eventId ?? "");

  if (isLoading) {
    return <EventAnalyticsLeadsByDaysSkeleton />;
  }

  const rows = leadsTimeline?.map((point, index) => ({
    label: t("dayLabel", { day: index + 1 }),
    date: dayjs.utc(point.date).format("DD/MM"),
    value: point.newLeads + point.existingLeads,
  })) ?? [];

  const maxValue = Math.max(...rows.map((row) => row.value), 1);

  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length > 0 ? (
          <div className="flex flex-col gap-3">
            {rows.map((row) => (
              <div key={`${row.label}-${row.date}`} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm">
                  {row.label} <span className="font-normal text-muted-foreground/60">[{row.value}]</span>
                </span>
                <div className="h-5 flex-1 overflow-hidden rounded-sm bg-muted">
                  <div
                    className="h-full rounded-sm bg-primary"
                    style={{ width: `${(row.value / maxValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EventAnalyticsLeadsByDaysNoData />
        )}
      </CardContent>
    </Card>
  );
};

export default EventAnalyticsLeadsByDays;

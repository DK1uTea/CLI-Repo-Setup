'use client';

import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/lib/utils";
import { CalendarDays, UserRound, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { parseAsString, useQueryState } from "nuqs";
import { useEventStats } from "../(hooks)/use-event-stats";
import EventOverviewStatsNoData from "./event-overview-stats-no-data";
import EventOverviewStatsSkeleton from "./event-overview-stats-skeleton";
import { formatStatChange } from "../../(helpers)/format-stat-change";

const EventOverviewStats = () => {
  const t = useTranslations("reportingTool.eventOverview.stats");
  const locale = useLocale();
  const [eventId] = useQueryState("eventId", parseAsString);
  const { eventStats, isLoading } = useEventStats(eventId ?? "");

  if (isLoading) {
    return <EventOverviewStatsSkeleton />;
  }

  if (!eventStats) {
    return <EventOverviewStatsNoData />;
  }

  const stats = [
    {
      label: t("totalLeads"),
      value: eventStats.totalLeads,
      change: eventStats.totalLeadsChangePercent,
      suffix: t("fromYesterday"),
      icon: Users,
    },
    {
      label: t("leadsToday"),
      value: eventStats.leadsToday,
      change: eventStats.leadsTodayChangePercent,
      suffix: t("inLastHour"),
      icon: Users,
    },
    {
      label: t("leadsLastMonth"),
      value: eventStats.leadsLastMonth,
      change: eventStats.leadsLastMonthChangePercent,
      suffix: t("fromLastMonth"),
      icon: CalendarDays,
    },
    {
      label: t("activeUsers"),
      value: eventStats.activeUsers,
      change: eventStats.activeUsersChangePercent,
      suffix: t("fromYesterday"),
      icon: UserRound,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const formattedChange = formatStatChange(stat.change);
        const changeClassName = stat.change < 0 ? "text-destructive" : "text-success";

        return (
          <Card key={stat.label} className="min-h-40 rounded-3xl">
            <CardContent className="flex h-full flex-col justify-between gap-10">
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm">{stat.label}</p>
                <Icon className="size-5 shrink-0 text-primary" />
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-2xl font-semibold">{new Intl.NumberFormat(locale).format(stat.value)}</p>
                <p className="text-sm">
                  <span className={cn(changeClassName)}>{formattedChange}</span>{" "}
                  <span>{stat.suffix}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default EventOverviewStats;

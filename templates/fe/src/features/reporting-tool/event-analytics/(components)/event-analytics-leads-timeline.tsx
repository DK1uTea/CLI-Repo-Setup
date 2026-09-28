'use client';

import { dayjs } from "@/lib/date-utils";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/shared/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useTranslations } from "next-intl";
import { parseAsString, useQueryState } from "nuqs";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { useEventAnalyticLeadsTimeline } from "../(hooks)/use-event-analytic-leads-timeline";
import EventAnalyticsLeadsTimelineSkeleton from "./event-analytics-leads-timeline-skeleton";
import { EventAnalyticsTooltip } from "./event-analytics-tooltip";

const EMPTY_Y_AXIS_TICKS = [0, 1, 2, 3, 4, 5];

const formatChartValue = (value: number) => {
  if (value === 0) return "0";
  if (Math.abs(value) < 1000) return `${Math.round(value)}`;

  const compact = value / 1000;

  return `${Number.isInteger(compact) ? compact : compact.toFixed(1)}k`;
};

const EventAnalyticsLeadsTimeline = () => {
  const t = useTranslations("reportingTool.eventAnalytics");
  const [eventId] = useQueryState("eventId", parseAsString);
  const { leadsTimeline, isLoading } = useEventAnalyticLeadsTimeline(eventId ?? "");

  if (isLoading) {
    return <EventAnalyticsLeadsTimelineSkeleton />;
  }

  const chartData = leadsTimeline?.map((point) => ({
    date: dayjs.utc(point.date).format("DD/MM"),
    newLeads: point.newLeads,
    existingLeads: point.existingLeads,
  })) ?? [];
  const renderedChartData = chartData.length > 0
    ? chartData
    : [{ date: "", newLeads: 0, existingLeads: 0 }];

  const totalNewLeads = chartData.reduce((total, point) => total + point.newLeads, 0);
  const totalExistingLeads = chartData.reduce((total, point) => total + point.existingLeads, 0);
  const chartConfig = {
    newLeads: {
      label: t("stats.newLeads"),
      color: "var(--primary)",
    },
    existingLeads: {
      label: t("stats.existingLeads"),
      color: "#a855f7",
    },
  } satisfies ChartConfig;

  return (
    <Card className="rounded-3xl">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <CardTitle>{t("leadsTimeline.title")}</CardTitle>
        <Select defaultValue="last-year">
          <SelectTrigger className="min-w-32 bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="last-year">{t("filters.lastYear")}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <LineChart data={renderedChartData} margin={{ top: 16, left: 12, right: 12, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="var(--border)" strokeOpacity={1} strokeWidth={2.5} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: number) => formatChartValue(value)}
              width={40}
              allowDecimals={false}
              ticks={chartData.length === 0 ? EMPTY_Y_AXIS_TICKS : undefined}
              domain={
                chartData.length === 0
                  ? [0, 5]
                  : [0, (dataMax: number) => dataMax + 1]
              }
            />
            <ChartTooltip
              cursor={{
                strokeDasharray: "4 4",
                style: {
                  stroke: "var(--foreground)",
                  strokeOpacity: 0.5,
                  strokeWidth: 1,
                },
              }}
              content={<EventAnalyticsTooltip chartConfig={chartConfig} />}
            />
            <Line
              dataKey="newLeads"
              type="linear"
              stroke="var(--color-newLeads)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="existingLeads"
              type="linear"
              stroke="var(--color-existingLeads)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>

        <div className="mt-4 flex flex-wrap gap-10">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-primary" />
              <p className="text-sm text-muted-foreground">{t("stats.newLeads")}</p>
            </div>
            <p className="mt-3.5 text-2xl leading-tight">{totalNewLeads.toLocaleString()}</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[#a855f7]" />
              <p className="text-sm text-muted-foreground">{t("stats.existingLeads")}</p>
            </div>
            <p className="mt-3.5 text-2xl leading-tight">{totalExistingLeads.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventAnalyticsLeadsTimeline;

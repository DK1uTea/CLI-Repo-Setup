'use client'

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { parseAsString, useQueryState } from "nuqs";
import { useEventActivity } from "../(hooks)/use-event-activity";
import { RecentActivity } from "../../(helpers)/recent-activity-type";
import EventOverviewActivitiesNoData from "./event-overview-activities-no-data";
import EventOverviewActivitiesSkeleton from "./event-overview-activities-skeleton";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { dayjs, formatDate } from "@/lib/date-utils";
import { useDateFormat } from "@/shared/stores/use-user-store";
import { getInitials } from "../../(helpers)/get-initials";

const resolveActivityDescription = (activity: RecentActivity, t: any) => {
  if (activity.metadata) {
    try {
      const parsed = typeof activity.metadata === "string" ? JSON.parse(activity.metadata) : activity.metadata;
      if (parsed?.note) return parsed.note;
    } catch { }
  }

  const actorName = activity.actor?.name || t("someone");

  const leadName = activity.lead?.fullName ?? "";
  const company = activity.lead?.company ?? "";
  const leadRef = company || leadName;
  const companyParens = company ? ` (${company})` : "";

  try {
    return t(activity.type, {
      actor: actorName,
      lead: leadName,
      leadRef,
      company: companyParens,
      name: leadName || actorName,
      survey: activity.survey?.name ?? "",
    });
  } catch {
    return activity.type;
  }
};

const EventOverviewActivities = () => {
  const t = useTranslations("reportingTool.eventOverview.activities");
  const locale = useLocale();
  const dateFormat = useDateFormat();
  const [eventId] = useQueryState("eventId", parseAsString);
  const { eventActivity: activities, isLoading } = useEventActivity(eventId ?? "", 5);

  if (isLoading) {
    return <EventOverviewActivitiesSkeleton />;
  }

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-lg font-semibold">{t("title")}</p>
              <p className="text-muted-foreground">{t("description")}</p>
            </div>
            <Button
              variant="outline-primary"
              href={`/reporting-tool/recent-activity?eventId=${eventId}`}>
              {t("seeAll")}
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>

          {activities.length === 0 && (
            <EventOverviewActivitiesNoData />
          )}

          {activities.length > 0 && (
            <div className="divide-y divide-border">
              {activities.map((activity: RecentActivity) => {
                const timeAgo = dayjs(activity.createdAt).locale(locale).fromNow();
                const formattedDate = formatDate(activity.createdAt, dateFormat);

                return (
                  <div key={activity.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <Avatar size="lg">
                      <AvatarFallback className="font-semibold text-primary bg-primary/10">
                        {getInitials(activity.actor?.name ?? "")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {resolveActivityDescription(activity, t)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{formattedDate}</p>
                    </div>

                    <span className="shrink-0 text-xs text-muted-foreground">{timeAgo}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventOverviewActivities;

'use client';

import { useTranslations, useLocale } from "next-intl";
import { parseAsString, useQueryState } from "nuqs";
import { useEventActivity } from "../../event-overview/(hooks)/use-event-activity";
import { RecentActivity } from "../../(helpers)/recent-activity-type";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { dayjs, formatDate } from "@/lib/date-utils";
import { useDateFormat } from "@/shared/stores/use-user-store";
import RecentActivitySkeleton from "./recent-activity-skeleton";
import RecentActivityNoData from "./recent-activity-no-data";
import RecentActivityPagination from "./recent-activity-pagination";
import RecentActivityHeader from "./recent-activity-header";
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

const RecentActivityMain = () => {
  const t = useTranslations("reportingTool.eventOverview.activities");
  const locale = useLocale();
  const dateFormat = useDateFormat();

  const [eventId] = useQueryState("eventId", parseAsString);

  const {
    eventActivity: activities,
    eventActivityPagination,
    isLoading,
    filters,
    setFilters,
  } = useEventActivity(eventId ?? "", 10);

  const page = filters.page;
  const pageSize = filters.limit;
  const totalPages = eventActivityPagination?.totalPages ?? 1;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilters({ page: newPage });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePageSizeChange = (newSize: string) => {
    setFilters({
      limit: Number(newSize),
      page: 1,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <RecentActivityHeader eventId={eventId} />
        <RecentActivitySkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <RecentActivityHeader eventId={eventId} />
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">

          {/* Activity list */}
          <div className="divide-y divide-border">
            {activities.length === 0 && <RecentActivityNoData />}
            {activities.length > 0 &&
              activities.map((activity) => {
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

          {/* Pagination */}
          <RecentActivityPagination
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            total={eventActivityPagination?.total ?? 0}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default RecentActivityMain;

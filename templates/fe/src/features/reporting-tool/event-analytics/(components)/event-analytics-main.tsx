'use client';

import { parseAsString, useQueryState } from "nuqs";
import TradeFairEventCard from "../../(components)/trade-fair-event-card";
import { useEventDetail } from "../../(hooks)/use-event-detail";
import EventAnalyticsLeadsByDays from "./event-analytics-leads-by-days";
import EventAnalyticsLeadsTimeline from "./event-analytics-leads-timeline";
import EventAnalyticsMainNoData from "./event-analytics-main-no-data";
import EventAnalyticsMainSkeleton from "./event-analytics-main-skeleton";
import EventAnalyticsStats from "./event-analytics-stats";

const EventAnalyticsMain = () => {
  const [eventId] = useQueryState("eventId", parseAsString);

  const {
    eventDetail,
    isLoading
  } = useEventDetail(eventId ?? "");

  if (isLoading) {
    return <EventAnalyticsMainSkeleton />;
  }

  if (!eventDetail) {
    return <EventAnalyticsMainNoData />;
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <TradeFairEventCard event={eventDetail} />
      <EventAnalyticsStats />
      <EventAnalyticsLeadsTimeline />
      <EventAnalyticsLeadsByDays />
    </div>
  );
}

export default EventAnalyticsMain;

'use client';

import { parseAsString, useQueryState } from "nuqs";
import { useEventDetail } from "../../(hooks)/use-event-detail";
import TradeFairEventCard from "../../(components)/trade-fair-event-card";
import EventOverviewStats from "./event-overview-stats";
import EventOverviewActivities from "./event-overview-activities";
import EventOverviewMainNoData from "./event-overview-main-no-data";
import EventOverviewMainSkeleton from "./event-overview-main-skeleton";

const EventOverviewMain = () => {
  const [eventId] = useQueryState("eventId", parseAsString);
  const { eventDetail, isLoading } = useEventDetail(eventId ?? "");

  if (isLoading) {
    return <EventOverviewMainSkeleton />;
  }

  if (!eventDetail) {
    return <EventOverviewMainNoData />;
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <TradeFairEventCard event={eventDetail} />
      <EventOverviewStats />
      <EventOverviewActivities />
    </div>
  );
}

export default EventOverviewMain;

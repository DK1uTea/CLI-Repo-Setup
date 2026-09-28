'use client';

import { parseAsString, useQueryState } from "nuqs";

import TradeFairEventCard from "../../(components)/trade-fair-event-card";
import { useEventDetail } from "../../(hooks)/use-event-detail";
import SurveyOverviewCard from "./survey-overview-card";
import SurveyBuilderMainSkeleton from "./survey-builder-main-skeleton";
import SurveyBuilderMainEmpty from "./survey-builder-main-empty";

const SurveyBuilderMain = () => {
  const [eventId] = useQueryState("eventId", parseAsString);
  const { eventDetail, isLoading } = useEventDetail(eventId ?? "");

  if (isLoading) {
    return <SurveyBuilderMainSkeleton />;
  }

  if (!eventDetail) {
    return <SurveyBuilderMainEmpty />;
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <TradeFairEventCard event={eventDetail} />
      <SurveyOverviewCard event={eventDetail} />
    </div>
  );
}

export default SurveyBuilderMain;


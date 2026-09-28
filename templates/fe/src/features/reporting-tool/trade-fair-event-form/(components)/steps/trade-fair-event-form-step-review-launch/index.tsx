"use client";

import { useEventDetail } from "@/features/reporting-tool/(hooks)/use-event-detail";
import { parseAsString, useQueryState } from "nuqs";
import ReviewEventInfoCard from "./review-event-info-card";
import SurveyAssignTeam from "./survey-assign-team";

const TradeFairEventFormStepReviewLaunch = () => {
  const [eventId] = useQueryState("id", parseAsString);
  const {
    eventDetail,
    isLoading: isEventDetailLoading,
  } = useEventDetail(eventId || "");

  return (
    <div className="flex flex-col gap-4">
      <ReviewEventInfoCard eventDetail={eventDetail} isEventDetailLoading={isEventDetailLoading} />
      <SurveyAssignTeam eventDetail={eventDetail} isEventDetailLoading={isEventDetailLoading} />
    </div>
  );
}

export default TradeFairEventFormStepReviewLaunch;

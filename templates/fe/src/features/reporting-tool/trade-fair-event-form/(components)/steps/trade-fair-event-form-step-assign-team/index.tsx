'use client';

import { useEventDetail } from "@/features/reporting-tool/(hooks)/use-event-detail";
import { parseAsString, useQueryState } from "nuqs";

import TradeFairEventFormStepAssignTeamSkeleton from "./trade-fair-event-form-step-assign-team-skeleton";
import AssignTeamCard from "@/features/reporting-tool/(components)/(assign-team-components)/assign-team-card";

const TradeFairEventFormStepAssignTeam = () => {

  const [eventId] = useQueryState("id", parseAsString);

  const {
    eventDetail,
    isLoading: isEventDetailLoading,
  } = useEventDetail(eventId || "");

  if (isEventDetailLoading) {
    return <TradeFairEventFormStepAssignTeamSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4">
      {eventDetail?.surveys && eventDetail?.surveys.map((eventSurvey) => (
        <AssignTeamCard key={eventSurvey.id} eventSurvey={eventSurvey} />
      ))}
    </div>
  )
}

export default TradeFairEventFormStepAssignTeam;

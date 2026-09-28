import type { TradeFairEvent } from "@/features/reporting-tool/(helpers)/trade-fair-event-type";
import SurveyAssignTeamCard from "./survey-assign-team-card";
import SurveyAssignTeamSkeleton from "./survey-assign-team-skeleton";

type Props = {
  eventDetail?: TradeFairEvent;
  isEventDetailLoading: boolean;
}

const SurveyAssignTeam = ({ eventDetail, isEventDetailLoading }: Props) => {
  if (isEventDetailLoading) {
    return <SurveyAssignTeamSkeleton />;
  }

  if (!eventDetail) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {eventDetail.surveys?.map((eventSurvey) => (
        <SurveyAssignTeamCard key={eventSurvey.id} eventSurvey={eventSurvey} />
      ))}
    </div>
  );
}

export default SurveyAssignTeam;

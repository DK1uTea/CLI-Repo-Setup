import EventSurveyCardSkeleton from "../../../../(components)/(assign-team-components)/assign-team-card-skeleton";

const TradeFairEventFormStepAssignTeamSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 2 }).map((_, index) => (
        <EventSurveyCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default TradeFairEventFormStepAssignTeamSkeleton;

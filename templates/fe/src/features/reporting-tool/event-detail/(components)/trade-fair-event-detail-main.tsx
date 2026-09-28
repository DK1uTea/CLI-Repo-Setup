'use client';

import { parseAsString, useQueryState } from "nuqs";
import TradeFairEventDetailHeader from "./trade-fair-event-detail-header";
import { useEventDetail } from "../../(hooks)/use-event-detail";
import ReviewEventInfoCard from "../../trade-fair-event-form/(components)/steps/trade-fair-event-form-step-review-launch/review-event-info-card";
import SurveyAssignTeam from "../../trade-fair-event-form/(components)/steps/trade-fair-event-form-step-review-launch/survey-assign-team";
import TradeFairEventDetailFooter from "./trade-fair-event-detail-footer";

const TradeFairEventDetailMain = () => {
  const [eventId] = useQueryState("id", parseAsString);
  const {
    eventDetail,
    isLoading: isEventDetailLoading,
  } = useEventDetail(eventId || "");

  return (
    <div className="-m-6 flex min-h-[calc(100dvh-64px)] flex-col">
      <div className="flex-1 p-6 w-full max-w-3xl mx-auto flex flex-col gap-4">
        <TradeFairEventDetailHeader eventId={eventId ?? ""} />
        <ReviewEventInfoCard eventDetail={eventDetail} isEventDetailLoading={isEventDetailLoading} />
        <SurveyAssignTeam eventDetail={eventDetail} isEventDetailLoading={isEventDetailLoading} />
      </div>
      <TradeFairEventDetailFooter />
    </div>
  );
}

export default TradeFairEventDetailMain;
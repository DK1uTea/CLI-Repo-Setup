import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/shared/components/ui/empty";
import { ClipboardCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { EventSurvey } from "../../(helpers)/trade-fair-event-type";
import SurveyActiveItemCard from "./survey-active-item-card";
import SurveyItemCardSkeleton from "./survey-item-card-skeleton";

type Props = {
  surveys: EventSurvey[];
  isLoading: boolean;
}

const SurveysOfEvent = ({ surveys, isLoading }: Props) => {
  const t = useTranslations("reportingTool.surveyBuilder");

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <p className="font-semibold text-lg">{t("surveysOfEventTitle")}</p>
        {Array.from({ length: 2 }).map((_, index) => (
          <SurveyItemCardSkeleton key={index} showUsers />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="font-semibold text-lg">{t("surveysOfEventTitle")}</p>
      {surveys.length > 0 ? (
        surveys.map((eventSurvey) => (
          <SurveyActiveItemCard
            key={eventSurvey.id}
            eventSurvey={eventSurvey}
          />
        ))
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardCheck />
            </EmptyMedia>
            <EmptyTitle>{t("noEventSurveysTitle")}</EmptyTitle>
            <EmptyDescription>{t("noEventSurveysDescription")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}

export default SurveysOfEvent;

"use client";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { useGetSurvey } from "../../(hooks)/(survey-hooks)/use-get-survey";
import SurveyLibrary from "./survey-library";
import SurveysOfEvent from "./surveys-of-event";
import { TradeFairEvent } from "../../(helpers)/trade-fair-event-type";

type Props = {
  event: TradeFairEvent;
}

const SurveyOverviewCard = ({ event }: Props) => {
  const t = useTranslations("reportingTool.surveyBuilder");
  const [eventId] = useQueryState("eventId", parseAsString);
  const [page, setPage] = useQueryState("surveyPage", parseAsInteger.withDefault(1));
  const { surveys, pagination, isLoading } = useGetSurvey(eventId ?? "", { page });

  const surveysOfEvent = event.surveys ?? [];

  const surveysOfEventIds = new Set(surveysOfEvent.map((survey) => survey.id));
  const availableSurveys = surveys.filter((survey) => !surveysOfEventIds.has(survey.id));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="gap-0">
        <div className="flex flex-col gap-5">
          <Button variant="outline-primary" className="w-full text-sm" href={`/reporting-tool/new-survey?eventId=${eventId}`}>
            {t("createNewSurvey")}
            <PlusIcon data-icon="inline-end" />
          </Button>
          <SurveysOfEvent surveys={surveysOfEvent} isLoading={false} />
          <SurveyLibrary
            surveys={availableSurveys}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={setPage}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default SurveyOverviewCard;

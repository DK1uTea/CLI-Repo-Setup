'use client';

import { useState } from "react";
import { useGetSurvey } from "@/features/reporting-tool/(hooks)/(survey-hooks)/use-get-survey";
import { getValidationMessage } from "@/lib/field-error";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller, useFormContext, useFormState } from "react-hook-form";
import { usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import type { TradeFairEventFormDto } from "../../../(helpers)/trade-fair-event-form-schema";
import SurveyCardSkeleton from "./survey-card-skeleton";
import SurveyItemCard from "./survey-item-card";
import SurveyLibraryPagination from "@/features/reporting-tool/survey-builder/(components)/survey-library-pagination";

const SurveyCard = () => {
  const { control } = useFormContext<TradeFairEventFormDto>();
  const { errors } = useFormState<TradeFairEventFormDto>({ control });
  const t = useTranslations("reportingTool.tradeFairEventForm.survey");

  const [paramId] = useQueryState("id", parseAsString);
  const eventId = paramId;

  const [page, setPage] = useState(1);
  const { surveys, pagination, isLoading } = useGetSurvey(eventId ?? "", { page, limit: 10 });

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPath = searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname;

  const shouldReturn = pathname === '/reporting-tool/new-event' || pathname === '/reporting-tool/update-event';

  const params = new URLSearchParams();
  if (eventId) params.set("eventId", eventId);
  if (shouldReturn) params.set("returnTo", currentPath);

  const newSurveyHref = params.toString()
    ? `/reporting-tool/new-survey?${params.toString()}`
    : `/reporting-tool/new-survey`;

  const surveysError =
    errors.surveys?.message === "fieldErrors.required"
      ? getValidationMessage("fieldErrors.required")
      : errors.surveys?.message;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t("title")}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6" data-field="surveys">
          {surveysError && (
            <p className="text-sm font-medium text-destructive">
              {surveysError}
            </p>
          )}

          <Button variant="outline-primary" href={newSurveyHref}>
            {t("createNewSurvey")}
            <PlusIcon data-icon="inline-end" />
          </Button>

          {isLoading && <SurveyCardSkeleton />}
          {!isLoading && (
            <Controller
              name="surveys"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-6">
                  {surveys.map((survey) => {
                    const selectedSurveys = field.value || [];
                    const selectedSurvey = selectedSurveys.find(
                      (item) => item.surveyId === survey.id,
                    );
                    const isChecked = Boolean(selectedSurvey);

                    return (
                      <SurveyItemCard
                        key={survey.id}
                        survey={survey}
                        checked={isChecked}
                        requiredLogin={selectedSurvey?.requiredLogin ?? true}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([
                              ...selectedSurveys,
                              {
                                surveyId: survey.id,
                                requiredLogin: true,
                              },
                            ]);
                            return;
                          }

                          field.onChange(
                            selectedSurveys.filter(
                              (item) => item.surveyId !== survey.id,
                            ),
                          );
                        }}
                        onRequiredLoginChange={(requiredLogin) => {
                          field.onChange(
                            selectedSurveys.map((item) =>
                              item.surveyId === survey.id
                                ? { ...item, requiredLogin }
                                : item,
                            ),
                          );
                        }}
                      />
                    );
                  })}
                </div>
              )}
            />
          )}

          {!isLoading && surveys.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("noSurveys")}</p>
          )}

          <SurveyLibraryPagination
            page={page}
            totalPages={pagination?.totalPages ?? 1}
            totalCount={pagination?.total ?? 0}
            onPageChange={setPage}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default SurveyCard;

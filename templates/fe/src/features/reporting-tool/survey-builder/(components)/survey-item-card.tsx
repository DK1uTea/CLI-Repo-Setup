"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Survey } from "../../(helpers)/trade-fair-event-type";
import { PlusIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import SurveyActionsDropdown from "../../(components)/(survey-components)/survey-actions-dropdown";
import SurveyActionAlertDialog, { SurveyAction } from "../../(components)/(survey-components)/survey-action-alert-dialog";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { useEventSurveysAction } from "../../(hooks)/(survey-hooks)/use-event-surveys-action";
import { useDeleteSurvey } from "../../(hooks)/(survey-hooks)/use-delete-survey";
import { useDuplicateSurvey } from "../../(hooks)/(survey-hooks)/use-duplicate-survey";
import { useIsAnySurveyActionPending } from "../../(hooks)/(survey-hooks)/use-is-any-survey-action-pending";
import { parseAsString, useQueryState } from "nuqs";

type Props = {
  survey: Survey;
}

const SurveyItemCard = ({ survey }: Props) => {

  const [dialogAction, setDialogAction] = useState<SurveyAction>();
  const t = useTranslations("reportingTool.surveyBuilder");

  const [eventId] = useQueryState("eventId", parseAsString);
  const { assignSurvey, isMutating } = useEventSurveysAction();
  const { deleteSurvey } = useDeleteSurvey(survey.id, eventId ?? undefined);
  const { duplicateSurvey } = useDuplicateSurvey(survey.id);
  // Assign/unassign/delete/duplicate mutate the same survey lists, so any one
  // of them in flight — on this card or another — locks every card's actions
  // to avoid racing invalidated-query refetches against a second mutation.
  const isAnyActionPending = useIsAnySurveyActionPending();

  const handleConfirm = async () => {
    if (dialogAction === "assign") {
      await assignSurvey(survey.id);
      setDialogAction(undefined);
    } else if (dialogAction === "duplicate") {
      await duplicateSurvey({ name: `${survey.name} (Copy)` });
      setDialogAction(undefined);
    } else if (dialogAction === "delete") {
      await deleteSurvey();
      setDialogAction(undefined);
    }
  };

  return (
    <>
      <Card>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="grow">
                <p className="font-semibold text-lg">{survey.name}</p>
                <p className="text-muted-foreground">{t("questions", { count: survey.totalQuestions ?? 0 })}</p>
              </div>
              <Button
                variant="outline-primary"
                className="hidden lg:inline-flex"
                disabled={isAnyActionPending}
                // Radix's AlertDialogAction closes the dialog synchronously on
                // click (its `onOpenChange` fires before the mutation
                // settles), so `dialogAction` is already back to undefined by
                // the time the request is in flight — the card's own button
                // is the only thing left on screen that can show progress.
                isLoading={isMutating}
                onClick={() => setDialogAction("assign")}
              >
                <PlusIcon data-icon="inline-start" />
                {t("addToEvent")}
              </Button>
              <SurveyActionsDropdown
                surveyId={survey.id}
                canEdit={survey.canEdit}
                onActionChange={setDialogAction}
                disabled={isAnyActionPending}
              />
            </div>
            <Button
              variant="outline-primary"
              className="lg:hidden"
              disabled={isAnyActionPending}
              isLoading={isMutating}
              onClick={() => setDialogAction("assign")}
            >
              <PlusIcon data-icon="inline-start" />
              {t("addToEvent")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <SurveyActionAlertDialog
        surveyName={survey.name}
        action={dialogAction}
        open={Boolean(dialogAction)}
        onOpenChange={(open) => !open && setDialogAction(undefined)}
        onConfirm={handleConfirm}
        isPending={dialogAction === "assign" && isMutating}
      />
    </>
  );
}

export default SurveyItemCard;

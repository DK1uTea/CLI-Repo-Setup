'use client';

import { Survey } from "@/features/reporting-tool/(helpers)/trade-fair-event-type";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/shared/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { useTranslations } from "next-intl";
import { useState } from "react";
import SurveyActionAlertDialog, { type SurveyAction } from "../../../../(components)/(survey-components)/survey-action-alert-dialog";
import SurveyActionsDropdown from "../../../../(components)/(survey-components)/survey-actions-dropdown";
import RequiredLoginAlertDialog from "@/features/reporting-tool/(components)/(survey-components)/required-login-alert-dialog";
import { useDeleteSurvey } from "@/features/reporting-tool/(hooks)/(survey-hooks)/use-delete-survey";
import { useDuplicateSurvey } from "@/features/reporting-tool/(hooks)/(survey-hooks)/use-duplicate-survey";
import { parseAsString, useQueryState } from "nuqs";

type Props = {
  survey: Survey;
  checked: boolean;
  requiredLogin: boolean;
  onCheckedChange: (checked: boolean) => void;
  onRequiredLoginChange: (requiredLogin: boolean) => void;
}

const SurveyItemCard = ({
  survey,
  checked,
  requiredLogin,
  onCheckedChange,
  onRequiredLoginChange,
}: Props) => {
  const [dialogAction, setDialogAction] = useState<SurveyAction>();
  const [eventId] = useQueryState("id", parseAsString);
  const { deleteSurvey } = useDeleteSurvey(survey.id, eventId ?? undefined);
  const { duplicateSurvey } = useDuplicateSurvey(survey.id);
  const t = useTranslations("reportingTool.tradeFairEventForm.survey");

  const handleToggle = () => {
    onCheckedChange(!checked);
  };

  const handleConfirm = async () => {
    if (dialogAction === "duplicate") {
      await duplicateSurvey({ name: `${survey.name} (Copy)` });
      setDialogAction(undefined);
    } else if (dialogAction === "delete") {
      await deleteSurvey();
      setDialogAction(undefined);
    }
  };

  return (
    <>
      <Card
        className={cn("py-5 border border-transparent hover:border-primary rounded-4xl cursor-pointer", { "bg-primary/10 border-primary text-primary": checked })}
        onClick={handleToggle}
      >
        <CardContent>
          <div className="flex items-center gap-3">
            <RadioGroup
              value={checked ? survey.id : ""}
              className="w-fit"
            >
              <RadioGroupItem
                value={survey.id}
                aria-label={survey.name}
                className="border-2 border-muted size-5"
                onClick={(event) => {
                  event.stopPropagation();
                  handleToggle();
                }}
              />
            </RadioGroup>
            <div className="flex flex-col grow">
              <p className="text-base font-semibold">{survey.name}</p>
              <p className={cn("text-muted-foreground", { "text-primary": checked })}>
                {t("questions", { count: survey.totalQuestions ?? 0 })}
              </p>
            </div>
            {checked && (
              <div onClick={(event) => event.stopPropagation()}>
                <RequiredLoginAlertDialog
                  requiredLogin={requiredLogin}
                  onRequiredLoginChange={onRequiredLoginChange}
                />
              </div>
            )}
            <SurveyActionsDropdown
              surveyId={survey.id}
              onActionChange={setDialogAction}
              canEdit={survey.canEdit}
            />
          </div>
        </CardContent>
      </Card>

      <SurveyActionAlertDialog
        surveyName={survey.name}
        action={dialogAction}
        open={Boolean(dialogAction)}
        onOpenChange={(open) => !open && setDialogAction(undefined)}
        onConfirm={handleConfirm}
      />
    </>
  );
}

export default SurveyItemCard;

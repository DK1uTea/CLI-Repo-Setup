"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { EventSurvey } from "../../(helpers)/trade-fair-event-type";
import AssignUsersDialog from "./assign-users-dialog";
import SurveyActionAlertDialog, { SurveyAction } from "../../(components)/(survey-components)/survey-action-alert-dialog";
import { useState } from "react";
import { useEventSurveysAction } from "../../(hooks)/(survey-hooks)/use-event-surveys-action";
import { useDeleteSurvey } from "../../(hooks)/(survey-hooks)/use-delete-survey";
import { useDuplicateSurvey } from "../../(hooks)/(survey-hooks)/use-duplicate-survey";
import { useIsAnySurveyActionPending } from "../../(hooks)/(survey-hooks)/use-is-any-survey-action-pending";
import { SurveyActiveItemCardContent } from "./survey-active-item-card-content";
import { parseAsString, useQueryState } from "nuqs";

type Props = {
  eventSurvey: EventSurvey;
}

const SurveyActiveItemCard = ({ eventSurvey }: Props) => {
  const [dialogAction, setDialogAction] = useState<SurveyAction>();
  const [assignUsersDialogOpen, setAssignUsersDialogOpen] = useState(false);
  const { unassignSurvey, isMutating } = useEventSurveysAction();
  const [eventId] = useQueryState("eventId", parseAsString);
  const { deleteSurvey } = useDeleteSurvey(eventSurvey.id, eventId ?? undefined);
  const { duplicateSurvey } = useDuplicateSurvey(eventSurvey.id);
  // Assign/unassign/delete/duplicate mutate the same survey lists, so any one
  // of them in flight — on this card or another — locks every card's actions
  // to avoid racing invalidated-query refetches against a second mutation.
  const isAnyActionPending = useIsAnySurveyActionPending();

  const assignments = eventSurvey.assignments ?? [];
  const hasAssignments = assignments.length > 0;
  const totalAssignments = eventSurvey.assignmentCount ?? 0;
  const remainingAssignmentsCount = totalAssignments - assignments.length;
  const openAssignUsersDialog = () => setAssignUsersDialogOpen(true);

  const handleConfirm = async () => {
    if (dialogAction === "unassign") {
      await unassignSurvey(eventSurvey.eventSurveyId);
      setDialogAction(undefined);
    } else if (dialogAction === "duplicate") {
      await duplicateSurvey({ name: `${eventSurvey.name} (Copy)` });
      setDialogAction(undefined);
    } else if (dialogAction === "delete") {
      await deleteSurvey();
      setDialogAction(undefined);
    }
  };

  return (
    <>
      <Card className="bg-primary/10 border border-primary!">
        <CardContent>
          <SurveyActiveItemCardContent
            eventSurvey={eventSurvey}
            hasAssignments={hasAssignments}
            assignments={assignments}
            remainingAssignmentsCount={remainingAssignmentsCount}
            openAssignUsersDialog={openAssignUsersDialog}
            setDialogAction={setDialogAction}
            disabled={isAnyActionPending}
            isUnassigning={isMutating}
          />
        </CardContent>
      </Card>

      <SurveyActionAlertDialog
        surveyName={eventSurvey.name}
        action={dialogAction}
        open={Boolean(dialogAction)}
        onOpenChange={(open) => !open && setDialogAction(undefined)}
        onConfirm={handleConfirm}
        isPending={dialogAction === "unassign" && isMutating}
      />
      <AssignUsersDialog
        eventSurvey={eventSurvey}
        open={assignUsersDialogOpen}
        onOpenChange={setAssignUsersDialogOpen}
      />
    </>
  );
}

export default SurveyActiveItemCard;

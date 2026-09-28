'use client';

import { parseAsString, useQueryState } from "nuqs";
import { useAssignSurveyToEvent } from "./use-assign-survey-to-event";
import { useUnassignSurveyFromEvent } from "./use-unassign-survey-from-event";

export const useEventSurveysAction = () => {
  const [eventId] = useQueryState("eventId", parseAsString);
  const resolvedEventId = eventId ?? "";
  const { assignSurveyToEvent, isAssigning } = useAssignSurveyToEvent(resolvedEventId);
  const { unassignSurveyFromEvent, isUnassigning } =
    useUnassignSurveyFromEvent(resolvedEventId);

  const assignSurvey = async (surveyId: string) => {
    if (!eventId) return;
    await assignSurveyToEvent(surveyId);
  };

  const unassignSurvey = async (eventSurveyId: string) => {
    if (!eventId) return;
    await unassignSurveyFromEvent(eventSurveyId);
  };

  return {
    assignSurvey,
    unassignSurvey,
    isMutating: isAssigning || isUnassigning,
  };
};

'use client';

import { useIsMutating } from "@tanstack/react-query";

// Assign/unassign/delete/duplicate mutations across every survey card share
// the "survey-action" mutationKey prefix, so this reflects whether ANY of
// them is in flight — not just the card that triggered it — letting the UI
// lock every other card's action buttons while one is mutating.
export const useIsAnySurveyActionPending = () => {
  return useIsMutating({ mutationKey: ["survey-action"] }) > 0;
};

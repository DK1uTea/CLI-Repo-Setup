'use client';

import { parseAsStringEnum, useQueryState } from 'nuqs';

export function useFeedbackDrawerUrl() {
  const [feedbackDrawer, setFeedbackDrawer] = useQueryState(
    'feedback_drawer',
    parseAsStringEnum(['open']),
  );

  const open = feedbackDrawer === 'open';

  return {
    open,
    openDrawer: () => setFeedbackDrawer('open'),
    closeDrawer: () => setFeedbackDrawer(null),
  };
}

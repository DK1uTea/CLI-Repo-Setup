'use client';

import { parseAsStringEnum, useQueryState } from 'nuqs';

export function useParticipantsDrawerUrl() {
  const [participantsDrawer, setParticipantsDrawer] = useQueryState(
    'participants_drawer',
    parseAsStringEnum(['open']),
  );

  const open = participantsDrawer === 'open';

  return {
    open,
    openDrawer: () => setParticipantsDrawer('open'),
    closeDrawer: () => setParticipantsDrawer(null),
  };
}

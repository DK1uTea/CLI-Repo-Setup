'use client';

import { parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';

export function useActivationDetailDrawerUrl() {
  const [{ activation_drawer, activation_id }, setDrawerParams] = useQueryStates({
    activation_drawer: parseAsStringEnum(['open']),
    activation_id: parseAsString,
    activationTab: parseAsString,
  });

  const open = activation_drawer === 'open';

  function openDrawer(activationId: string) {
    setDrawerParams({ activation_drawer: 'open', activation_id: activationId });
  }

  function closeDrawer() {
    setDrawerParams({ activation_drawer: null, activation_id: null, activationTab: null });
  }

  return { open, activationId: activation_id, openDrawer, closeDrawer };
}

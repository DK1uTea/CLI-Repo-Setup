'use client';

import { useEffect, useState } from 'react';
import { useUserFilterPreferences } from './use-user-filter-preferences';
import {
  hasSavedFilters,
  type FilterPreferenceScreen,
  type SavedUserFilters,
} from '../(helpers)/user-filter-preferences';

export function useSyncFilterPreferences(
  screen: FilterPreferenceScreen,
  hasExplicitFilters: boolean,
  apply: (saved: SavedUserFilters) => Promise<unknown> | unknown,
) {
  const { data, isFetched, isError } = useUserFilterPreferences(screen);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready || (!isFetched && !isError)) return;

    const run = async () => {
      if (!isError && data && hasSavedFilters(data) && !hasExplicitFilters) {
        await apply(data);
      }
      setReady(true);
    };

    void run();
  }, [apply, data, hasExplicitFilters, isError, isFetched, ready]);

  return ready;
}

import { useEffect, useState } from 'react'

import {
  type FilterPreferenceScreen,
  type SavedUserFilters,
  hasSavedFilters,
} from '../(helpers)/user-filter-preferences'
import { useUserFilterPreferences } from './use-user-filter-preferences'

const inflightSync = new Map<FilterPreferenceScreen, Promise<void>>()

type Args = {
  screen: FilterPreferenceScreen
  current: SavedUserFilters
  applyUrl: (patch: Record<string, unknown>) => unknown
  toUrl: (prefs: SavedUserFilters) => Record<string, unknown>
}

export function useAppliedFilterPreferences({ screen, current, applyUrl, toUrl }: Args) {
  const prefs = useUserFilterPreferences(screen)
  const [isSynced, setIsSynced] = useState(false)

  useEffect(() => {
    if (!prefs.isFetched) return

    let promise = inflightSync.get(screen)
    if (!promise) {
      const saved = prefs.data
      const snapshot = current
      promise = Promise.resolve().then(async () => {
        if (saved && hasSavedFilters(saved) && !hasSavedFilters(snapshot)) {
          await Promise.resolve(applyUrl(toUrl(saved)))
        }
      })
      inflightSync.set(screen, promise)
    }

    void promise.finally(() => setIsSynced(true))
  }, [prefs.isFetched, prefs.data, current, applyUrl, toUrl, screen])

  return { ...prefs, saved: prefs.data, isSynced }
}

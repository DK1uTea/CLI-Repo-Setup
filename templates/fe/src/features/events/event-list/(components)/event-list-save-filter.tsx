'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import {
  useSaveUserFilterPreferences,
  useUserFilterPreferences,
} from '../(hooks)/use-user-filter-preferences';
import { areSavedFiltersEqual } from '../(helpers)/saved-filter-comparison';
import {
  DEFAULT_SAVED_FILTERS,
  type FilterPreferenceScreen,
  type SavedUserFilters,
} from '../(helpers)/user-filter-preferences';

type Props = {
  screen: FilterPreferenceScreen;
  namespace?: 'events.list' | 'calendarList';
  payload: SavedUserFilters;
  onReset: () => Promise<unknown> | unknown;
};

export function EventListSaveFilter({
  screen,
  namespace = 'events.list',
  payload,
  onReset,
}: Props) {
  const t = useTranslations(namespace);
  const preferences = useUserFilterPreferences(screen);
  const savePreferences = useSaveUserFilterPreferences(screen);
  const [open, setOpen] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState<SavedUserFilters | null>(null);
  const isPending = savePreferences.isPending;
  const isSnapshotLoading = preferences.isPending;
  const currentSavedSnapshot = savedSnapshot ?? preferences.data;
  const isUnchanged = currentSavedSnapshot !== undefined
    && areSavedFiltersEqual(payload, currentSavedSnapshot);
  const actionsDisabled = isSnapshotLoading || isUnchanged;

  const handleSave = async () => {
    await savePreferences.mutateAsync(payload);
    setSavedSnapshot(payload);
    toast.success(t('saveFilterSuccess'));
    setOpen(false);
  };

  const handleReset = async () => {
    await savePreferences.mutateAsync(DEFAULT_SAVED_FILTERS);
    setSavedSnapshot(DEFAULT_SAVED_FILTERS);
    await onReset();
    toast.success(t('resetFilterSuccess'));
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={(next) => { if (!isPending) setOpen(next); }}>
      <PopoverTrigger asChild>
        <Button variant="default" size="sm" className="h-8 text-sm font-semibold" aria-expanded={open}>
          {t('saveFilter')}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-40 p-2 flex flex-col gap-2">
        <Button
          variant="default"
          size="sm"
          className="w-full justify-center"
          isLoading={isPending}
          disabled={actionsDisabled}
          onClick={() => void handleSave()}
        >
          {t('save')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-center"
          disabled={isPending}
          onClick={() => void handleReset()}
        >
          {t('reset')}
        </Button>
      </PopoverContent>
    </Popover>
  );
}

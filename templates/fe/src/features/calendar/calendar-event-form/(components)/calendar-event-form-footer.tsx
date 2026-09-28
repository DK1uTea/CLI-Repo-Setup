'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/ui/button';
import { useEventDetailStore } from '@/features/events/(stores)/use-event-detail-store';
import { useSubmitCalendarEvent } from '../(hooks)/use-submit-calendar-event';

export function CalendarEventFormFooter() {
  const t = useTranslations('eventForm');
  const { submit, isPending, isUpdateMode } = useSubmitCalendarEvent();
  const canEdit = useEventDetailStore((s) => s.canEdit);
  const isDisableSubmit = isUpdateMode && !canEdit;

  return (
    <div className="sticky bottom-0 z-10 flex shrink-0 items-center justify-end gap-2 border-y border-border bg-card px-6 py-5">
      <Button
        type="button"
        variant="outline"
        href="/calendar-dashboard"
        disabled={isPending}
      >
        {t('actions.cancel')}
      </Button>
      <Button type="button" onClick={submit} isLoading={isPending} disabled={isDisableSubmit}>
        {isUpdateMode ? t('actions.update') : t('createEvent')}
      </Button>
    </div>
  );
}

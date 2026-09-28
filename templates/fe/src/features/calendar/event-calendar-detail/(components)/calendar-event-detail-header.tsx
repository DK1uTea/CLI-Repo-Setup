'use client';

import { useTranslations } from 'next-intl';
import { ArrowLeftIcon, ArrowUpDownIcon, PenLineIcon, CopyIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { ComponentGuard } from '@/shared/components/common/component-guard';
import { PERMISSIONS, PERMISSION_ALL_WILDCARD } from '@/shared/constants/permissions';
import { useHasPermission } from '@/shared/stores/use-user-store';
import { useDuplicateEvent } from '@/features/events/event-form/(hooks)/use-duplicate-event';
// import { CalendarEventDetailDownloadPdf } from './calendar-event-detail-download-pdf';
import type { CalendarEventDetail } from '../(hooks)/use-calendar-event-detail';
import { canEditCalendarEvent } from '@/features/calendar/(helpers)/can-edit-calendar-event';

type Props = {
  event: CalendarEventDetail;
  onTransfer: () => void;
};

export function CalendarEventDetailHeader({ event, onTransfer }: Props) {
  const t = useTranslations('calendarEventDetail');
  const isAdmin = useHasPermission(PERMISSION_ALL_WILDCARD);
  const canEdit = canEditCalendarEvent(event, isAdmin);
  const { duplicate, isPending: isDuplicating } = useDuplicateEvent(
    (id) => `/calendar-dashboard/update-calendar-event?eventId=${id}`,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="outline-primary" href="/calendar-dashboard" className="size-10 shrink-0">
          <ArrowLeftIcon className="size-4" />
        </Button>
        <h1 className="text-xl font-semibold">{t('title')}</h1>
      </div>

      <Card className="flex-row flex-wrap justify-end gap-2 px-5">

        {isAdmin && (
          <Button variant="outline-primary" className="gap-2" onClick={onTransfer}>
            {t('transferEvent')}
            <ArrowUpDownIcon className="size-4" />
          </Button>
        )}

        {canEdit && (
          <ComponentGuard requiredKeys={PERMISSIONS.Calendar.Update}>
            <Button
              variant="outline-primary"
              className="gap-2"
              href={`/calendar-dashboard/update-calendar-event?eventId=${event.id}`}
            >
              {t('editEvent')}
              <PenLineIcon className="size-4" />
            </Button>
          </ComponentGuard>
        )}

        <ComponentGuard requiredKeys={PERMISSIONS.Calendar.DuplicateEvent}>
          <Button
            variant="outline-primary"
            className="gap-2"
            isLoading={isDuplicating}
            onClick={() => duplicate(event.id)}
          >
            {t('duplicateEvent')}
            <CopyIcon className="size-4" />
          </Button>
        </ComponentGuard>

        {/* <CalendarEventDetailDownloadPdf event={event} /> */}
      </Card>
    </div>
  );
}

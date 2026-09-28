'use client';

import { useTranslations } from 'next-intl';
import { ArrowLeftIcon, ArrowUpDownIcon, PenLineIcon, CopyIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { ComponentGuard } from '@/shared/components/common/component-guard';
import { PERMISSIONS, PERMISSION_ALL_WILDCARD } from '@/shared/constants/permissions';
import { useUserStore } from '@/shared/stores/use-user-store';
import { useDuplicateEvent } from '@/features/events/event-form/(hooks)/use-duplicate-event';
import { EventDetailDownloadPdf } from './event-detail-download-pdf';
import type { EventDetail } from '../(hooks)/use-event-detail-data';

type Props = {
  event: EventDetail;
  onTransfer: () => void;
};

export function EventDetailHeader({ event, onTransfer }: Props) {
  const t = useTranslations('eventDetail');
  const isAdmin = useUserStore((state) =>
    state.permissions?.includes(PERMISSION_ALL_WILDCARD) ?? false
  );

  const editHref = `/events/update-event?eventId=${event.id}&state=update`;
  const { duplicate, isPending: isDuplicating } = useDuplicateEvent(
    (id) => `/events/update-event?eventId=${id}&state=update`,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="outline-primary" href="/events" className="size-10 shrink-0">
          <ArrowLeftIcon className="size-4" />
        </Button>
        <h1 className="text-xl font-semibold">{t('title')}</h1>
      </div>

      <Card className="flex-row flex-wrap justify-end gap-2 px-5">
        {(event.isOwner || isAdmin) && (
          <ComponentGuard requiredKeys={PERMISSIONS.Event.TransferEvent}>
            <Button variant="outline-primary" className="gap-2" onClick={onTransfer}>
              {t('transferEvent')}
              <ArrowUpDownIcon className="size-4" />
            </Button>
          </ComponentGuard>
        )}

        {event.canEdit && (
          <ComponentGuard requiredKeys={PERMISSIONS.Event.Update}>
            <Button variant="outline-primary" className="gap-2" href={editHref}>
              {t('editEvent')}
              <PenLineIcon className="size-4" />
            </Button>
          </ComponentGuard>
        )}

        <ComponentGuard requiredKeys={PERMISSIONS.Event.DuplicateEvent}>
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

        <EventDetailDownloadPdf eventId={event.id} />
      </Card>
    </div>
  );
}

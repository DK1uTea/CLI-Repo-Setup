'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useCalendarEventDetail } from '../(hooks)/use-calendar-event-detail';
import { useBreadcrumbs } from '@/shared/hooks/common/use-breadcrumbs';
import { EventCommonSkeleton } from '@/features/events/event-detail/common/(components)/event-common-skeleton';
import { EventCommonInfoCard } from '@/features/events/event-detail/common/(components)/event-common-info-card';
import { EventCommonSchedule } from '@/features/events/event-detail/common/(components)/event-common-schedule';
import { EventCommonPartnership } from '@/features/events/event-detail/common/(components)/event-common-partnership';
import { EventCommonLocation } from '@/features/events/event-detail/common/(components)/event-common-location';
import { EventCommonDocuments } from '@/features/events/event-detail/common/(components)/event-common-documents';
import { EventCommonComments } from '@/features/events/event-detail/common/(components)/event-common-comments';
import { EventCommonTransfer } from '@/features/events/event-detail/common/(components)/event-common-transfer';
import { useTransferEventOwnership } from '@/features/events/event-detail/common/(hooks)/use-transfer-event-ownership';
import { CalendarEventDetailHeader } from './calendar-event-detail-header';

type Props = { id: string };

export function CalendarEventDetailMain({ id }: Props) {
  const t = useTranslations('calendarEventDetail');
  const { data: event, isLoading } = useCalendarEventDetail(id);
  const [transferOpen, setTransferOpen] = useState(false);
  const transferOwnership = useTransferEventOwnership();

  useBreadcrumbs([
    { label: t('title'), href: '/calendar-dashboard' },
    { label: event?.name ?? '' },
  ]);

  if (isLoading || !event) return <EventCommonSkeleton />;

  const handleTransferConfirm = async (newOwnerUserId: string) => {
    await transferOwnership.mutateAsync({ eventId: event.id, userId: newOwnerUserId });
    toast.success(t('transferEvent'));
  };

  return (
    <div className="space-y-5">
      <CalendarEventDetailHeader event={event} onTransfer={() => setTransferOpen(true)} />
      <EventCommonInfoCard event={event} namespace="calendarEventDetail" />
      <EventCommonSchedule event={event} namespace="calendarEventDetail" />
      <EventCommonPartnership event={event} namespace="calendarEventDetail" />
      <EventCommonDocuments eventId={event.id} namespace="calendarEventDetail" />
      <EventCommonLocation event={event} namespace="calendarEventDetail" />
      <EventCommonComments eventId={event.id} namespace="calendarEventDetail" />

      <EventCommonTransfer
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        namespace="calendarEventDetail"
        onConfirm={handleTransferConfirm}
      />
    </div>
  );
}

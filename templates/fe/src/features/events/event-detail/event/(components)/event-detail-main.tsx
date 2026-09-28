'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useEventDetailData } from '../(hooks)/use-event-detail-data';
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
import { EventDetailHeader } from './event-detail-header';
import { EventDetailLogistics } from './event-detail-logistics';
import { EventDetailRentedProducts } from './event-detail-rented-products';

type Props = { id: string };

export function EventDetailMain({ id }: Props) {
  const t = useTranslations('events');
  const tDetail = useTranslations('eventDetail');
  const { data: event, isLoading } = useEventDetailData(id);
  const [transferOpen, setTransferOpen] = useState(false);
  const transferOwnership = useTransferEventOwnership();

  useBreadcrumbs([
    { label: t('title'), href: '/events' },
    { label: event?.name ?? '' },
  ]);

  if (isLoading || !event) return <EventCommonSkeleton />;

  const handleTransferConfirm = async (newOwnerUserId: string) => {
    await transferOwnership.mutateAsync({ eventId: event.id, userId: newOwnerUserId });
    toast.success(tDetail('transferEvent'));
  };

  return (
    <div className="flex flex-col gap-5">
      <EventDetailHeader event={event} onTransfer={() => setTransferOpen(true)} />
      <EventCommonInfoCard event={event} namespace="eventDetail" />
      <EventCommonSchedule event={event} namespace="eventDetail" />
      <EventDetailLogistics event={event} />
      <EventCommonPartnership event={event} namespace="eventDetail" />
      <EventDetailRentedProducts event={event} />
      <EventCommonDocuments eventId={event.id} namespace="eventDetail" />
      <EventCommonLocation event={event} namespace="eventDetail" />
      <EventCommonComments eventId={event.id} namespace="eventDetail" />

      <EventCommonTransfer
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        namespace="eventDetail"
        onConfirm={handleTransferConfirm}
      />
    </div>
  );
}

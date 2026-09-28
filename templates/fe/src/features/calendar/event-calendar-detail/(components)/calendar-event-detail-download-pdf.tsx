'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { FileDownIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useCurrency, useDateFormat, useHasPermission } from '@/shared/stores/use-user-store';
import { PERMISSIONS } from '@/shared/constants/permissions';
import { EventCommonPdfContentWrapper } from '@/features/events/event-detail/common/(components)/event-common-pdf-content-wrapper';
import { useDownloadPdf } from '@/features/events/event-detail/common/(hooks)/use-download-pdf';
import { EventDetailPdfContent, getPrintedAt } from '@/features/events/event-detail/event/(components)/event-detail-pdf-content';
import { useEventStepDetail, type EventDetail } from '@/features/events/event-form/(hooks)/use-event-step-detail';
import type { CalendarEventDetail } from '../(hooks)/use-calendar-event-detail';

type Props = { event: CalendarEventDetail };

const buildFileName = (eventId: string, summary?: EventDetail | null) =>
  `${summary?.overview?.customEventId ?? summary?.general?.id ?? eventId}.pdf`;

export function CalendarEventDetailDownloadPdf({ event }: Props) {
  const calendarT = useTranslations('calendarEventDetail');
  const eventT = useTranslations('eventDetail');
  const dateFormat = useDateFormat();
  const currency = useCurrency();
  const showPrice = useHasPermission(PERMISSIONS.Product.ShowPrice);
  const [requested, setRequested] = useState(false);
  const [pendingDownload, setPendingDownload] = useState(false);
  const { data: summary, isFetching } = useEventStepDetail(event.id, 'summary', { enabled: requested });
  const { contentRef, downloading, download } = useDownloadPdf(eventT('pdf.generateError'));

  useEffect(() => {
    if (pendingDownload && summary) {
      setPendingDownload(false);
      download(buildFileName(event.id, summary));
    }
  }, [pendingDownload, summary, event.id, download]);

  const handleClick = () => {
    if (summary) {
      download(buildFileName(event.id, summary));
      return;
    }
    setPendingDownload(true);
    setRequested(true);
  };

  return (
    <>
      <Button
        variant="outline-primary"
        className="gap-2"
        isLoading={downloading || (requested && isFetching)}
        onClick={handleClick}
      >
        <FileDownIcon className="size-4" />
        {calendarT('downloadPdf')}
      </Button>

      {summary && (
        <EventCommonPdfContentWrapper contentRef={contentRef}>
          <EventDetailPdfContent
            event={summary}
            dateFormat={dateFormat}
            currencySymbol={currency.symbol}
            showPrice={showPrice}
            printedAt={getPrintedAt(dateFormat)}
            t={eventT as (key: string) => string}
          />
        </EventCommonPdfContentWrapper>
      )}
    </>
  );
}

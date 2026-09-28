'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { FileDownIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useDateFormat, useCurrency, useHasPermission } from '@/shared/stores/use-user-store';
import { PERMISSIONS } from '@/shared/constants/permissions';
import { useEventStepDetail, type EventDetail } from '@/features/events/event-form/(hooks)/use-event-step-detail';
import { EventCommonPdfContentWrapper } from '@/features/events/event-detail/common/(components)/event-common-pdf-content-wrapper';
import { useDownloadPdf } from '@/features/events/event-detail/common/(hooks)/use-download-pdf';
import { EventDetailPdfContent, getPrintedAt } from './event-detail-pdf-content';

type Props = { eventId: string };

const buildFileName = (eventId: string, summary?: EventDetail | null) =>
  `${summary?.overview?.customEventId ?? summary?.general?.id ?? eventId}.pdf`;

export function EventDetailDownloadPdf({ eventId }: Props) {
  const t = useTranslations('eventDetail');
  const dateFormat = useDateFormat();
  const currency = useCurrency();
  const showPrice = useHasPermission(PERMISSIONS.Product.ShowPrice);

  // Summary is only needed to build the PDF, so it's fetched on demand — not on every page load.
  const [requested, setRequested] = useState(false);
  const [pendingDownload, setPendingDownload] = useState(false);
  const { data: summary, isFetching } = useEventStepDetail(eventId, 'summary', { enabled: requested });
  const { contentRef, downloading, download } = useDownloadPdf(t('pdf.generateError'));

  useEffect(() => {
    if (pendingDownload && summary) {
      setPendingDownload(false);
      download(buildFileName(eventId, summary));
    }
  }, [pendingDownload, summary, eventId, download]);

  const handleClick = () => {
    if (summary) {
      download(buildFileName(eventId, summary));
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
        {t('downloadPdf')}
        <FileDownIcon className="size-4" />
      </Button>

      {summary && (
        <EventCommonPdfContentWrapper contentRef={contentRef}>
          <EventDetailPdfContent
            event={summary}
            dateFormat={dateFormat}
            currencySymbol={currency.symbol}
            showPrice={showPrice}
            printedAt={getPrintedAt(dateFormat)}
            t={t as (key: string) => string}
          />
        </EventCommonPdfContentWrapper>
      )}
    </>
  );
}

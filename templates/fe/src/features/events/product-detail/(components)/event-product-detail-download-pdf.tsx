'use client';

import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { EventCommonPdfContentWrapper } from '@/features/events/event-detail/common/(components)/event-common-pdf-content-wrapper';
import { useDownloadPdf } from '@/features/events/event-detail/common/(hooks)/use-download-pdf';
import { resolveProductImageSrc } from '@/features/rent/product-detail/(helpers)/resolve-product-image-src';
import { Button } from '@/shared/components/ui/button';
import { useCurrency, useDateFormat } from '@/shared/stores/use-user-store';
import type { EventProductDetail } from '../(hooks)/use-event-product-detail';
import { EventProductDetailPdfContent, getPrintedAt } from './event-product-detail-pdf-content';

type Props = { product: EventProductDetail };

export function EventProductDetailDownloadPdf({ product }: Props) {
  const t = useTranslations('events.productDetail');
  const dateFormat = useDateFormat();
  const currency = useCurrency();
  const { contentRef, downloading, download } = useDownloadPdf(t('pdf.generateError'));
  const rawImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : product.image_url ? [product.image_url] : [];
  const images = rawImages.map(resolveProductImageSrc);
  const fileName = `${product.sku || product.slug || product.name}.pdf`;

  return (
    <>
      <Button
        variant="outline-primary"
        className="shrink-0 self-end gap-2 md:self-start"
        isLoading={downloading}
        onClick={() => download(fileName)}
      >
        {t('downloadPdf')} <Download data-icon="inline-end" />
      </Button>
      <EventCommonPdfContentWrapper contentRef={contentRef} padding="20px">
        <EventProductDetailPdfContent
          product={product}
          images={images}
          currencySymbol={currency.symbol}
          printedAt={getPrintedAt(dateFormat)}
          t={t as (key: string) => string}
        />
      </EventCommonPdfContentWrapper>
    </>
  );
}

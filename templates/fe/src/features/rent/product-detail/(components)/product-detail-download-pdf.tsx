'use client';

import { useTranslations } from 'next-intl';
import { Download } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useCurrency, useDateFormat } from '@/shared/stores/use-user-store';
import { EventCommonPdfContentWrapper } from '@/features/events/event-detail/common/(components)/event-common-pdf-content-wrapper';
import { useDownloadPdf } from '@/features/events/event-detail/common/(hooks)/use-download-pdf';
import type { ProductDetail } from '../(services)/product-detail-service';
import { resolveProductImageSrc } from '../(helpers)/resolve-product-image-src';
import { ProductDetailPdfContent, getPrintedAt } from './product-detail-pdf-content';

type Props = {
  product: ProductDetail;
};

export function ProductDetailDownloadPdf({ product }: Props) {
  const t = useTranslations('rent.productDetail');
  const dateFormat = useDateFormat();
  const currency = useCurrency();
  const { contentRef, downloading, download } = useDownloadPdf(t('pdf.generateError'));
  const rawImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : product.imageUrl
      ? [product.imageUrl]
      : [];
  const images = rawImages.map(resolveProductImageSrc);
  const fileName = `${product.sku || product.slug || product.name}.pdf`;

  return (
    <>
      <Button
        variant="outline-primary"
        className="shrink-0 gap-2"
        isLoading={downloading}
        onClick={() => download(fileName)}
      >
        {t('downloadPdf')} <Download data-icon="inline-end" />
      </Button>
      <EventCommonPdfContentWrapper contentRef={contentRef} padding="20px">
        <ProductDetailPdfContent
          product={product}
          images={images}
          dateFormat={dateFormat}
          currencySymbol={currency.symbol}
          printedAt={getPrintedAt(dateFormat)}
          t={t as (key: string) => string}
        />
      </EventCommonPdfContentWrapper>
    </>
  );
}

'use client';

import { Card, CardContent } from '@/shared/components/ui/card';
import ProductGeneralCarousel from '@/features/rent/product-detail/(components)/product-general-carousel';
import { useEventProductDetail } from '../(hooks)/use-event-product-detail';
import { EventProductDetailInfo } from './event-product-detail-info';
import { EventProductDetailTabs } from './event-product-detail-tabs';
import { EventProductDetailMainSkeleton } from './event-product-detail-main-skeleton';

export function EventProductDetailMain() {
  const { product, eventId, isLoading } = useEventProductDetail();

  if (isLoading || !product || !eventId) return <EventProductDetailMainSkeleton />;

  const images = Array.isArray(product.images) && product.images.length
    ? product.images
    : (product.image_url ? [product.image_url] : []);

  return (
    <Card className="py-0">
      <CardContent className="flex flex-col gap-8 p-6 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
          <ProductGeneralCarousel images={images} name={product.name} />
          <EventProductDetailInfo product={product} />
        </div>
        <EventProductDetailTabs product={product} eventId={eventId} />
      </CardContent>
    </Card>
  );
}

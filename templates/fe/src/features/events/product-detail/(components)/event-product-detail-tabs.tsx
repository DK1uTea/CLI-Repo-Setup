'use client';

import { useTranslations } from 'next-intl';
import { TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';
import { TabsUrl } from '@/shared/components/ui/tabs-url';
import RentalAvailability from '@/features/rent/product-detail/(components)/rental-availability';
import { ProductDocuments } from '@/features/rent/product-detail/(components)/product-documents';
import type { ProductDetail } from '@/features/rent/product-detail/(services)/product-detail-service';
import { EventProductDescription } from './event-product-description';
import type { EventProductDetail } from '../(hooks)/use-event-product-detail';

type Props = { product: EventProductDetail; eventId: string };

export function EventProductDetailTabs({ product, eventId }: Props) {
  const t = useTranslations('events.productDetail');
  const rentalProduct = {
    ...product,
    availableQuantity: product.availableQuantity,
    totalQuantity: product.quantity,
  } as unknown as ProductDetail;
  const isRental = product.productType === 'rental';

  return (
    <TabsUrl defaultValue="description" paramName="tab" keepParams>
      <TabsList variant="line">
        <TabsTrigger value="description">{t('tabDescription')}</TabsTrigger>
        {isRental && (
          <TabsTrigger value="availability">{t('tabAvailability')}</TabsTrigger>
        )}
        <TabsTrigger value="documents">{t('documents')}</TabsTrigger>
      </TabsList>
      <TabsContent value="description" className="pt-4">
        <EventProductDescription
          description={product.description}
          shortDescription={product.shortDescription}
          weight={product.weight}
          length={product.length}
          width={product.width}
          height={product.height}
          bundleItems={product.productType === 'bundle' && Array.isArray(product.children)
            ? product.children
            : undefined}
        />
      </TabsContent>
      {isRental && (
        <TabsContent value="availability" className="pt-4">
          <div className="**:data-[slot=card]:rounded-none **:data-[slot=card]:bg-transparent **:data-[slot=card]:py-0 **:data-[slot=card]:ring-0 **:data-[slot=card-content]:px-0 **:data-[slot=card-header]:px-0">
            <RentalAvailability product={rentalProduct} source="event" eventId={eventId} />
          </div>
        </TabsContent>
      )}
      <TabsContent value="documents" className="pt-4">
        <ProductDocuments sku={product.sku} />
      </TabsContent>
    </TabsUrl>
  );
}

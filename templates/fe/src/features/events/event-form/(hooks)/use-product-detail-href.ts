'use client';

import { usePathname } from '@/i18n/navigation';
import { useQueryState, parseAsString } from 'nuqs';

export type ProductDetailStep = 'product_catalog' | 'helping_hand';

export function useProductDetailHref() {
  const pathname = usePathname();
  const [eventId] = useQueryState('eventId', parseAsString);
  const referer = pathname.includes('new-event') ? 'new-event' : 'update-event';

  return (productSlug: string, step: ProductDetailStep): string =>
    `/events/product-detail?eventId=${eventId ?? ''}&referer=${referer}&product=${productSlug}&step=${step}`;
}

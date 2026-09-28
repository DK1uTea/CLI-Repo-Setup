'use client';

import { useTranslations } from 'next-intl';
import { ShoppingBagIcon } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion';
import { Empty, EmptyHeader, EmptyTitle, EmptyMedia } from '@/shared/components/ui/empty';
import { EventCartList } from '@/features/events/(components)/event-cart-list';
import type { EventDetail, EventCommonProduct } from '../(hooks)/use-event-detail-data';
import type { CartItem } from '@/features/events/(stores)/use-event-cart-store';

function toCartItem(p: EventCommonProduct, index: number): CartItem {
  return {
    id: `${p.name}-${index}`,
    name: p.name,
    thumbnail: p.thumbnail ? `${process.env.NEXT_PUBLIC_MEP_STORE ?? ''}${p.thumbnail}` : '',
    quantity: p.quantity,
    price: p.price,
    isRental: true,
    maxQuantity: p.quantity,
  };
}

type Props = { event: EventDetail };

export function EventDetailRentedProducts({ event }: Props) {
  const t = useTranslations('eventDetail');
  const products = Array.isArray(event.productCatalog) ? event.productCatalog : [];
  const items = products.filter((p) => p.quantity > 0);

  return (
    <Card className="py-0">
      <Accordion type="single" collapsible defaultValue="open">
        <AccordionItem value="open" className="border-none">
          <AccordionTrigger className="px-6 py-4 hover:no-underline font-semibold text-lg">
            {t('rentedProducts')}
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-5 h-auto!">
            {items.length === 0 ? (
              <Empty>
                <EmptyMedia>
                  <ShoppingBagIcon className="size-24 text-primary opacity-40" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>{t('noProducts')}</EmptyTitle>
                </EmptyHeader>
              </Empty>
            ) : (
              <EventCartList items={items.map(toCartItem)} readOnly hideDelete />
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

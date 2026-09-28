'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { formatDate } from '@/lib/date-utils';
import { useDateFormat } from '@/shared/stores/use-user-store';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { ExpandableHtml } from '@/shared/components/common/expandable-html';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/shared/components/ui/carousel';
import type { EventCommonDetail, EventCommonNamespace } from '../(services)/event-common-service';

type Props = { event: EventCommonDetail; namespace: EventCommonNamespace };

export function EventCommonInfoCard({ event, namespace }: Props) {
  const t = useTranslations(namespace);
  const tCommon = useTranslations('common');
  const dateFormat = useDateFormat();

  const createdDate = formatDate(event.createdAt, dateFormat);
  const authorName = event.createdBy?.name ?? '';
  const initials = authorName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const images = Array.isArray(event.images) ? event.images : [];
  const orderId = event.orderId ?? event.order?.id;
  const orderStatus = event.orderStatus ?? event.order?.status;

  return (
    <Card className="py-0">
      <CardContent className="space-y-4 py-5">
        {images.length > 0 && (
          <Carousel opts={{ loop: true }} className="w-full">
            <CarouselContent>
              {images.map((img, i) => (
                <CarouselItem key={i}>
                  <div className="relative mx-auto aspect-video max-h-190 w-full max-w-7xl overflow-hidden rounded-xl bg-muted">
                    <Image src={img} alt="" fill className="object-contain" translate="no" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-3" />
            <CarouselNext className="right-3" />
          </Carousel>
        )}

        <p className="text-sm">
          {t('eventCreated')} {createdDate}
        </p>

        {orderId && (
          <p className="text-sm font-bold">
            {t('orderId')}: {orderId}
            {orderStatus ? ` - ${orderStatus.toUpperCase()}` : ''}
          </p>
        )}

        <h2 className="text-2xl font-bold" translate="no">
          {event.name}
        </h2>

        {authorName && (
          <div className="flex items-center gap-2.5 text-sm" translate="no">
            <Avatar>
              <AvatarImage src={event.createdBy?.avatar ?? undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span>
              <span className="text-muted-foreground">{t('organizedBy')}</span>
              <span>{' '}</span>
              <span className="font-medium">{authorName}</span>
            </span>
          </div>
        )}

        {event.shortDescription && (
          <ExpandableHtml
            html={event.shortDescription}
            className="prose prose-sm max-w-none text-sm leading-relaxed wrap-break-word"
            seeMoreLabel={tCommon('seeMore')}
            seeLessLabel={tCommon('seeLess')}
          />
        )}
      </CardContent>
    </Card>
  );
}

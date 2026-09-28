'use client';

import { useTranslations } from 'next-intl';
import { MapPinIcon } from 'lucide-react';
import { DetailAccordionSection } from '@/shared/components/ui/detail-accordion-section';
import type { EventCommonDetail, EventCommonNamespace } from '../(services)/event-common-service';
import { SummaryMap } from '@/features/events/event-form/(components)/steps/event-form-step-summary/summary-map';

type Props = { event: EventCommonDetail; namespace: EventCommonNamespace };

export function EventCommonLocation({ event, namespace }: Props) {
  const t = useTranslations(namespace);
  const location = event.location;

  const address = [location?.street, location?.postalCode, location?.city, location?.state, location?.countryCode]
    .filter(Boolean)
    .join(', ');

  if (!location?.name && !address) return null;

  return (
    <DetailAccordionSection title={t('location')} className="flex flex-col gap-1.5">
      {location?.name && (
        <p className="flex items-center gap-2 text-sm font-medium" translate="no">
          <MapPinIcon className="size-4 shrink-0 text-muted-foreground" />
          {location.name}
        </p>
      )}
      {address && (
        <p className="pl-6 text-sm text-muted-foreground" translate="no">
          {address}
        </p>
      )}
      <SummaryMap lat={location?.latitude} lng={location?.longitude} title={location?.name} address={address} />
    </DetailAccordionSection>
  );
}

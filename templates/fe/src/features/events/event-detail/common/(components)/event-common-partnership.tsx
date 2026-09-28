'use client';

import { useTranslations } from 'next-intl';
import { DetailAccordionSection } from '@/shared/components/ui/detail-accordion-section';
import { DetailTextField } from '@/shared/components/ui/detail-field';
import { usePartnershipData } from '@/features/events/event-form/(hooks)/use-partnership-data';
import type { EventCommonDetail, EventCommonNamespace } from '../(services)/event-common-service';

type Props = { event: EventCommonDetail; namespace: EventCommonNamespace };

export function EventCommonPartnership({ event, namespace }: Props) {
  const t = useTranslations(namespace);
  const { data: options } = usePartnershipData();

  const types = event.partnershipTypes ?? [];
  if (types.length === 0) return null;

  const selectedTypes = types
    .map((key) => options?.find((o) => o.key === key))
    .filter(Boolean) as { key: string; label: string }[];
  const productPartnerCategories = options
    ?.find((option) => option.key === 'PRODUCT_PARTNER')
    ?.categories.filter((category) =>
      Array.isArray(event.productPartnerCategories)
      && event.productPartnerCategories.includes(category.key)
    ) ?? [];

  if (selectedTypes.length === 0) return null;

  return (
    <DetailAccordionSection title={t('partnership')}>
      <div className='flex flex-col gap-4'>

        <div className='flex flex-col gap-1.5'>
          <p className="text-xs text-muted-foreground">{t('partnership')}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {selectedTypes.map((p) => (
              <DetailTextField key={p.key} value={p.label} />
            ))}
          </div>
        </div>
        {productPartnerCategories.length > 0 && (
          <div className='flex flex-col gap-1.5'>
            <p className="text-xs text-muted-foreground">{t('partnershipItems')}</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {productPartnerCategories.map((category) => (
                <DetailTextField key={category.key} value={category.label} />
              ))}
            </div>
          </div>
        )}
      </div>
    </DetailAccordionSection>
  );
}

'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { useUnsavedChanges } from '@/shared/hooks/common/use-unsaved-changes';
import { UnsavedChangesDialog } from '@/shared/components/common/unsaved-changes-dialog';
import { useTranslations } from 'next-intl';
import { MapPinIcon } from 'lucide-react';
import type { EventFormDto } from '../../../(helpers)/event-form-schema';
import { useQueryState, parseAsString } from 'nuqs';
import { useQueryClient } from '@tanstack/react-query';
import type { EventDetail } from '../../../(hooks)/use-event-step-detail';
import { SummaryEventSection } from './summary-event-section';
import { SummaryLogisticsSection } from './summary-logistics-section';
import { SummaryFilesSection } from './summary-files-section';
import { SummaryCartSection } from './summary-cart-section';
import { SummaryMap } from './summary-map';
import { Card, CardContent } from '@/shared/components/ui/card';

function SummaryBlock({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-base font-medium">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export function EventFormStepSummary() {
  const t = useTranslations('eventForm');
  const methods = useFormContext<EventFormDto>();
  const { control, formState: { isDirty } } = methods;
  const { dialogProps } = useUnsavedChanges({
    isDirty,
    onDiscard: () => methods.reset(),
  });
  const values = useWatch({ control }) as Partial<EventFormDto>;

  const [eventIdParam] = useQueryState('eventId', parseAsString);
  const queryClient = useQueryClient();
  const resData = queryClient.getQueryData<EventDetail>(['event-step-detail', eventIdParam || '', 'summary']);
  const lat = resData?.overview?.location?.latitude;
  const lng = resData?.overview?.location?.longitude;

  const address = [values.address, values.street, values.city, values.zipCode].filter(Boolean).join(', ');

  return (
    <Card data-testid="event-form-summary-step">
      <CardContent className="space-y-10">
      <SummaryBlock
        title={t('summary.eventInfo')}
        description={t('summary.eventInfoDescription')}
      >
        <SummaryEventSection />
      </SummaryBlock>

      <SummaryBlock title={t('summary.logistics')}>
        <SummaryLogisticsSection />
      </SummaryBlock>

      <SummaryBlock title={t('summary.filesAndDocuments')}>
        <SummaryFilesSection />
      </SummaryBlock>

      <SummaryBlock title={t('summary.products')}>
        <SummaryCartSection />
      </SummaryBlock>

      <SummaryBlock title={t('summary.locationTitle')}>
        {address && (
          <div className="mb-4 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <MapPinIcon className="size-4 shrink-0" />
              <span translate="no">{address}</span>
            </div>
            <p className="text-sm text-muted-foreground" translate="no">{address}</p>
          </div>
        )}
        <SummaryMap title={values.title} address={address || undefined} lat={lat} lng={lng} />
      </SummaryBlock>
      </CardContent>
      <UnsavedChangesDialog {...dialogProps} />
    </Card>
  );
}

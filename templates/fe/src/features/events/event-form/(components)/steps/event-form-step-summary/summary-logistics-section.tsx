import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { parseAsString, useQueryState } from 'nuqs';
import { useQueryClient } from '@tanstack/react-query';
import { formatDate } from '@/lib/date-utils';
import { useDateFormat } from '@/shared/stores/use-user-store';
import type { EventFormDto } from '../../../(helpers)/event-form-schema';
import type { EventDetail } from '../../../(hooks)/use-event-step-detail';
import { SummaryInfoTable } from './summary-info-table';

export function SummaryLogisticsSection() {
  const t = useTranslations('eventForm');
  const dateFormat = useDateFormat();
  const { control } = useFormContext<EventFormDto>();
  const values = useWatch({ control }) as Partial<EventFormDto>;
  const [eventIdParam] = useQueryState('eventId', parseAsString);
  const queryClient = useQueryClient();
  const summary = queryClient.getQueryData<EventDetail>([
    'event-step-detail', eventIdParam || '', 'summary',
  ]);

  const setupStartFmt = values.setupStartDate ? formatDate(values.setupStartDate, dateFormat) : '';
  const setupEndFmt = values.setupEndDate ? formatDate(values.setupEndDate, dateFormat) : '';
  const setupTimeline = setupStartFmt && setupEndFmt ? `${setupStartFmt} - ${setupEndFmt}` : undefined;

  const teardownStartFmt = values.teardownStartDate ? formatDate(values.teardownStartDate, dateFormat) : '';
  const teardownEndFmt = values.teardownEndDate ? formatDate(values.teardownEndDate, dateFormat) : '';
  const teardownTimeline = teardownStartFmt && teardownEndFmt ? `${teardownStartFmt} - ${teardownEndFmt}` : undefined;
  const deliveryAddress = summary?.logistics?.location
    ? [
        summary.logistics.location.name,
        summary.logistics.location.street,
        summary.logistics.location.city,
        summary.logistics.location.state,
        summary.logistics.location.postalCode,
      ].filter(Boolean).join(', ')
    : undefined;

  const rows = [
    { label: t('logistics.warehouse'), value: summary?.logistics?.warehouseName },
    { label: t('summary.setupTimeline'), value: setupTimeline },
    { label: t('summary.teardownTimeline'), value: teardownTimeline },
    { label: t('summary.logisticsContactName'), value: values.logisticsContactName },
    { label: t('summary.logisticsContactEmail'), value: values.logisticsContactEmail },
    { label: t('summary.logisticsContactPhone'), value: values.logisticsContactPhone },
    ...(deliveryAddress ? [{ label: t('summary.deliveryAddress'), value: deliveryAddress }] : []),
    ...(values.logisticComment
      ? [{ label: t('summary.logisticsComment'), value: values.logisticComment, html: true as const }]
      : []),
  ];

  return <SummaryInfoTable rows={rows} />;
}

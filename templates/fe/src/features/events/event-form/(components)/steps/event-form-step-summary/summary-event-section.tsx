import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { parseAsString, useQueryState } from 'nuqs';
import { useQueryClient } from '@tanstack/react-query';
import { formatDate } from '@/lib/date-utils';
import { useDateFormat } from '@/shared/stores/use-user-store';
import { PARTICIPATION_OPTIONS } from '../../../(helpers)/event-form-constants';
import type { EventFormDto } from '../../../(helpers)/event-form-schema';
import type { EventDetail } from '../../../(hooks)/use-event-step-detail';

export function SummaryEventSection() {
  const t = useTranslations('eventForm');
  const dateFormat = useDateFormat();
  const { control } = useFormContext<EventFormDto>();
  const values = useWatch({ control }) as Partial<EventFormDto>;
  const [eventIdParam] = useQueryState('eventId', parseAsString);
  const queryClient = useQueryClient();
  const summary = queryClient.getQueryData<EventDetail>([
    'event-step-detail', eventIdParam || '', 'summary',
  ]);

  const contactName = [values.contactFirstName, values.contactLastName].filter(Boolean).join(' ');
  const participationOption = PARTICIPATION_OPTIONS.find(({ value }) => value === values.participation);
  const participationLabel = participationOption
    ? t(`overview.participationOptions.${participationOption.labelKey}`)
    : undefined;
  const startFmt = values.startDate ? formatDate(values.startDate, dateFormat) : '';
  const endFmt = values.endDate ? formatDate(values.endDate, dateFormat) : '';
  const timeline = startFmt && endFmt ? `${startFmt} - ${endFmt}` : undefined;

  const rows = [
    { label: t('summary.eventName'), value: values.title },
    { label: t('overview.participation'), value: participationLabel },
    { label: t('summary.eventTimeline'), value: timeline },
    { label: t('summary.location'), value: summary?.overview?.location?.name },
    { label: t('summary.contactName'), value: contactName },
    { label: t('summary.contactEmail'), value: values.contactEmail },
    { label: t('summary.contactPhone'), value: values.contactPhone },
  ];

  const contacts = (values.contacts ?? []).filter((c) => c.contactName || c.contactEmail);

  return (
    <div className="overflow-hidden rounded-xl border border-border text-sm">
      <table className="w-full">
        <tbody>
          {rows.map(({ label, value }) => (
            <tr key={label} className="border-b last:border-b-0">
              <td className="w-52 shrink-0 border-r border-border px-6 py-3 font-medium">{label}</td>
              <td className="px-6 py-3 font-light" translate="no">{value?.trim() || '—'}</td>
            </tr>
          ))}

          {contacts.map((c, i) => (
            <tr key={i} className="border-b last:border-b-0">
              <td className="w-52 shrink-0 border-r border-border px-6 py-3 font-medium">
                {i === 0 ? t('overview.otherContactsTitle') : ''}
              </td>
              <td className="px-6 py-3 font-light" translate="no">
                <div className="flex flex-col gap-0.5">
                  {c.contactName && <span className="font-medium">{c.contactName}</span>}
                  {c.contactEmail && <span className="text-xs">{c.contactEmail}</span>}
                  {c.contactPhone && <span className="text-xs">{c.contactPhone}</span>}
                  {c.role && <span className="text-xs text-muted-foreground">{c.role}</span>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

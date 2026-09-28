'use client';

import { useTranslations } from 'next-intl';
import { DetailAccordionSection } from '@/shared/components/ui/detail-accordion-section';
import { DetailDateField } from '@/shared/components/ui/detail-field';
import type { EventCommonDetail, EventCommonNamespace } from '../(services)/event-common-service';
import { useEventScheduleInfo } from '../(hooks)/use-event-schedule-info';
import { EventScheduleHistoryPopover } from './event-schedule-history-popover';

type Props = { event: EventCommonDetail; namespace: EventCommonNamespace };

export function EventCommonSchedule({ event, namespace }: Props) {
  const t = useTranslations(namespace);
  const { data: scheduleInfo } = useEventScheduleInfo(event.id);

  return (
    <DetailAccordionSection title={t('scheduleDetails')}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-4">
          <DetailDateField
            label={t('setupStart')}
            value={event.logistics?.setup?.start}
            valueClassName="truncate"
            labelExtra={
              <EventScheduleHistoryPopover
                history={scheduleInfo?.setup}
                startLabel={t('setupStart')}
                endLabel={t('setupEnd')}
                namespace={namespace}
              />
            }
          />
          <DetailDateField
            label={t('setupEnd')}
            value={event.logistics?.setup?.end}
            valueClassName="truncate"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <DetailDateField
            label={t('eventStart')}
            value={event.startTime}
            valueClassName="truncate"
            labelExtra={
              <EventScheduleHistoryPopover
                history={scheduleInfo?.start}
                startLabel={t('eventStart')}
                endLabel={t('eventEnd')}
                namespace={namespace}
              />
            }
          />
          <DetailDateField
            label={t('eventEnd')}
            value={event.endTime}
            valueClassName="truncate"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <DetailDateField
            label={t('teardownStart')}
            value={event.logistics?.teardown?.start}
            valueClassName="truncate"
            labelExtra={
              <EventScheduleHistoryPopover
                history={scheduleInfo?.teardown}
                startLabel={t('teardownStart')}
                endLabel={t('teardownEnd')}
                namespace={namespace}
                align="end"
              />
            }
          />
          <DetailDateField
            label={t('teardownEnd')}
            value={event.logistics?.teardown?.end}
            valueClassName="truncate"
          />
        </div>
      </div>
    </DetailAccordionSection>
  );
}

'use client';

import { ClipboardClock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import type { EventCommonNamespace } from '../(services)/event-common-service';
import type { EventScheduleHistoryItem } from '../(hooks)/use-event-schedule-info';
import { EventScheduleHistoryTimeline } from './event-schedule-history-timeline';

type Props = {
  history?: EventScheduleHistoryItem[];
  startLabel: string;
  endLabel: string;
  namespace: EventCommonNamespace;
  align?: 'start' | 'center' | 'end';
};

export function EventScheduleHistoryPopover({
  history,
  startLabel,
  endLabel,
  namespace,
  align = 'start',
}: Props) {
  const t = useTranslations(namespace);
  const items = Array.isArray(history) ? history : [];
  const hasHistory = items.length > 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t('viewEditHistory')}
          className="inline-flex cursor-pointer items-center gap-1 bg-transparent text-[11px] font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ClipboardClock className="size-3.5" aria-hidden="true" />
          <span>{t('viewEditHistory')}</span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align={align}
        sideOffset={6}
        collisionPadding={16}
        className="flex max-h-95 w-84 flex-col p-4"
      >
        <h3 className="mb-3 shrink-0 text-sm font-semibold text-foreground">{t('dateEditHistory')}</h3>

        {!hasHistory ? (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
            <ClipboardClock className="size-7 text-muted-foreground/50" aria-hidden="true" />
            <span className="text-xs text-muted-foreground">{t('noDateEditHistory')}</span>
          </div>
        ) : (
          <div className="max-h-75 overflow-y-auto px-1 pr-2 _custom-scroll">
            <EventScheduleHistoryTimeline
              items={items}
              startLabel={startLabel}
              endLabel={endLabel}
              namespace={namespace}
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

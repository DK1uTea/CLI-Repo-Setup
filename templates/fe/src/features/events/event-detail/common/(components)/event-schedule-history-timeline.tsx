'use client';

import { useTranslations } from 'next-intl';
import { formatDate } from '@/lib/date-utils';
import { useDateFormat } from '@/shared/stores/use-user-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import type { EventCommonNamespace } from '../(services)/event-common-service';
import type { EventScheduleHistoryItem } from '../(hooks)/use-event-schedule-info';

type Props = {
  items: EventScheduleHistoryItem[];
  startLabel: string;
  endLabel: string;
  namespace: EventCommonNamespace;
};

function getInitials(name: string) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function EventScheduleHistoryTimeline({
  items,
  startLabel,
  endLabel,
  namespace,
}: Props) {
  const t = useTranslations(namespace);
  const dateFormat = useDateFormat();

  return (
    <div className="flex flex-col py-0.5 pl-1">
      {items.map((entry, index) => {
        const isCurrent = index === 0;
        const isOriginal = index === items.length - 1;

        return (
          <div key={`${entry.changedAt}-${index}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`mt-1 size-3 shrink-0 rounded-full ring-2 ring-border ${
                  isCurrent ? 'bg-primary ring-primary/20' : 'bg-muted-foreground/40'
                }`}
              />
              {index < items.length - 1 && <div className="my-1 w-0.5 flex-1 bg-border" />}
            </div>

            <div className="flex flex-1 flex-col gap-1.5 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <Avatar size="sm">
                  {entry.changedByAvatar && (
                    <AvatarImage src={entry.changedByAvatar} alt={entry.changedBy} />
                  )}
                  <AvatarFallback>{getInitials(entry.changedBy)}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-semibold text-foreground">{entry.changedBy}</span>
                {isCurrent && (
                  <Badge variant="default" className="h-4 px-1.5 text-[10px]">
                    {t('currentValue')}
                  </Badge>
                )}
                {isOriginal && (
                  <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                    {t('originalValue')}
                  </Badge>
                )}
              </div>

              <span className="text-[11px] text-muted-foreground">
                {formatDate(entry.changedAt, dateFormat, true) || '—'}
              </span>

              <div
                className={`flex flex-col gap-1 rounded-md border p-2 text-xs ${
                  isCurrent ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/40'
                }`}
              >
                <span className="text-muted-foreground">
                  {startLabel}:{' '}
                  <span className="font-medium text-foreground">
                    {formatDate(entry.startDate, dateFormat, true) || '—'}
                  </span>
                </span>
                <span className="text-muted-foreground">
                  {endLabel}:{' '}
                  <span className="font-medium text-foreground">
                    {formatDate(entry.endDate, dateFormat, true) || '—'}
                  </span>
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

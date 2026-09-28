'use client';

import dynamic from 'next/dynamic';
import { LoadingIcon } from '@/shared/components/common/icons';

const EventMapInner = dynamic(
  () => import('@/features/events/event-form/(components)/steps/event-form-step-summary/summary-map-inner').then(
    (m) => ({ default: m.SummaryMapInner })
  ),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex items-center justify-center rounded-[14px] bg-muted text-sm text-muted-foreground"
        style={{ height: 400 }}
      >
        <LoadingIcon className="size-7" />
      </div>
    ),
  }
);

type Props = {
  lat?: number | null;
  lng?: number | null;
  title?: string;
  address?: string;
  organizer?: string;
};

export function EventMap(props: Props) {
  return <EventMapInner {...props} />;
}

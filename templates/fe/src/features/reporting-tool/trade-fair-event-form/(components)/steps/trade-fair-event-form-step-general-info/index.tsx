'use client';

import { parseAsString, useQueryState } from 'nuqs';
import { useEventDetail } from '@/features/reporting-tool/(hooks)/use-event-detail';
import { DateCard } from './date-card';
import { EventInfoCard } from './event-info-card';
import { ImagesCard } from './images-card';
import { LocationCard } from './location-card';
import TradeFairEventFormStepGeneralInfoSkeleton from './trade-fair-event-form-step-general-info-skeleton';

const TradeFairEventFormStepGeneralInfo = () => {
  const [eventId] = useQueryState('id', parseAsString);
  const { isLoading: isEventDetailLoading } = useEventDetail(eventId || '');
  const isLoadingEventDetail = Boolean(eventId && isEventDetailLoading);

  if (isLoadingEventDetail) {
    return <TradeFairEventFormStepGeneralInfoSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4">
      <EventInfoCard />
      <ImagesCard />
      <DateCard />
      <LocationCard />
    </div>
  );
};

export default TradeFairEventFormStepGeneralInfo;

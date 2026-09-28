'use client';

import { parseAsString, useQueryState } from 'nuqs';
import { useEventDetail } from '@/features/reporting-tool/(hooks)/use-event-detail';
import AssignTeamCard from '@/features/reporting-tool/(components)/(assign-team-components)/assign-team-card';
import AssignTeamCardSkeleton from '@/features/reporting-tool/(components)/(assign-team-components)/assign-team-card-skeleton';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/components/ui/empty';
import { ClipboardX } from 'lucide-react';
import { useTranslations } from 'next-intl';

const TradeFairSurveyFormStepAssignUsers = () => {
  const t = useTranslations('reportingTool.tradeFairEventForm.assignTeam');
  const [surveyId] = useQueryState('id', parseAsString);
  const [eventId] = useQueryState('eventId', parseAsString);

  const {
    eventDetail,
    isLoading: isEventLoading,
    isFetching: isEventFetching,
  } = useEventDetail(eventId || '');

  if (eventId && (isEventLoading || isEventFetching)) {
    return <AssignTeamCardSkeleton />;
  }

  const foundEventSurvey = eventDetail?.surveys?.find(
    (es) => es.id === surveyId
  );

  if (!foundEventSurvey) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ClipboardX />
          </EmptyMedia>
          <EmptyTitle>{t('noSurveyTitle')}</EmptyTitle>
          <EmptyDescription>{t('noSurveyDescription')}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <AssignTeamCard eventSurvey={foundEventSurvey} />
    </div>
  );
};

export default TradeFairSurveyFormStepAssignUsers;

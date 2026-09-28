'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/components/ui/empty';
import { ActivityIcon } from 'lucide-react';
import { useActivationActivity } from '../../(hooks)/use-activation-activity';
import ActivityItem from './activity-item';

type Props = {
  activationId: string;
};

const ActivationActivity = ({ activationId }: Props) => {
  const t = useTranslations('activationView');
  const { activities, isLoading, hasMore, nextBatchSize, loadMore } = useActivationActivity(activationId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <Empty>
        <EmptyMedia>
          <ActivityIcon className="size-12 text-primary opacity-40" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>{t('activity.noActivityYet')}</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {activities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}

      {hasMore && (
        <Button data-testid="cam-activity-load-more" variant="outline" size="sm" className="w-full" onClick={loadMore}>
          {t('activity.showMore', { count: nextBatchSize })}
        </Button>
      )}
    </div>
  );
};

export default ActivationActivity;

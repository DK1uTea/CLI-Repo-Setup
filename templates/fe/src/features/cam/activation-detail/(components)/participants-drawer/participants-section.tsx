'use client';

import { useTranslations } from 'next-intl';
import { UsersIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/components/ui/empty';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ParticipantDetail } from '../../(hooks)/use-get-activation-participants';
import ParticipantListItem from './participant-list-item';

type Props = {
  participants: ParticipantDetail[];
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  canManage: boolean;
  onRemove: (id: string) => void;
};

const ParticipantsSection = ({
  participants,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  canManage,
  onRemove,
}: Props) => {
  const t = useTranslations('activationView.participants');

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium tracking-wide text-muted-foreground">{t('title')}</p>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      ) : participants.length === 0 ? (
        <Empty className="py-6">
          <EmptyMedia>
            <UsersIcon className="size-12 text-primary opacity-40" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle className="text-sm">{t('noParticipants')}</EmptyTitle>
            <EmptyDescription className="text-xs">{t('noParticipantsDescription')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {participants.map((participant) => (
            <ParticipantListItem
              key={participant.id}
              participant={participant}
              canManage={canManage}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}

      {hasNextPage && (
        <Button
          type="button"
          variant="ghost-primary"
          size="sm"
          className="w-full"
          isLoading={isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          {t('loadMore')}
        </Button>
      )}
    </div>
  );
};

export default ParticipantsSection;

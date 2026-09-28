'use client';

import { useTranslations } from 'next-intl';
import { ArrowLeftIcon } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/shared/components/ui/button';
import { useBreadcrumbs } from '@/shared/hooks/common/use-breadcrumbs';
import { useActivationDetail } from '../../(hooks)/use-activation-detail';
import { useGetActivationFeedbacks } from '../(hooks)/use-get-activation-feedbacks';
import { useUserStore } from '@/shared/stores/use-user-store';
import { canViewActivationBriefing } from '../(helpers)/activation-detail-permissions';
import ActivationDetailBody from './activation-detail-body';
import ActivationDetailFooter from './activation-detail-footer';
import FeedbackDrawer from './feedback-drawer/feedback-drawer';
import ParticipantsDrawer from './participants-drawer/participants-drawer';
import DetailDrawerSkeleton from './detail-drawer-skeleton';
import DetailDrawerNoData from './detail-drawer-no-data';

type Props = {
  activationId: string;
  backTo?: string;
};

const ActivationDetailPage = ({ activationId, backTo = '/customer-activation' }: Props) => {
  const t = useTranslations('activationView');
  const router = useRouter();
  const permissions = useUserStore((state) => state.permissions);
  const showBriefing = canViewActivationBriefing(permissions);
  const { data: activationDetail, isLoading } = useActivationDetail(activationId);
  useGetActivationFeedbacks(activationId);

  const activationName = activationDetail?.name ?? activationDetail?.code;
  useBreadcrumbs(
    activationName
      ? [{ label: t('titleAdmin'), href: '/customer-activation' }, { label: activationName }]
      : [{ label: t('titleAdmin'), href: '/customer-activation' }],
  );

  return (
    <>
      <div className="-m-6 flex min-h-[calc(100dvh-64px)] flex-col">
        <div className="flex-1 p-6">
          <div className="relative">
            <Button
              variant="outline-primary"
              size="icon"
              className="shrink-0 rounded-full w-10 h-10 absolute"
              href={backTo}
              aria-label={t('backToList')}
            >
              <ArrowLeftIcon className="size-5" />
            </Button>

            <div className="mx-auto flex w-full max-w-3xl flex-col rounded-2xl border border-border bg-card">
              {isLoading && <DetailDrawerSkeleton />}
              {!isLoading && activationDetail && (
                <ActivationDetailBody
                  activationDetail={activationDetail}
                  showScoring
                  showActivity
                  showBriefing={showBriefing}
                  showStatusBadge
                />
              )}
              {!isLoading && !activationDetail && <DetailDrawerNoData />}
            </div>
          </div>
        </div>
        {activationDetail && (
          <ActivationDetailFooter activationDetail={activationDetail} onStatusChanged={() => router.push(backTo)} />
        )}
      </div>
      <FeedbackDrawer activationId={activationId} status={activationDetail?.status} />
      <ParticipantsDrawer activationId={activationId} />
    </>
  );
};

export default ActivationDetailPage;

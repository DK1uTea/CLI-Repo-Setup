'use client';

import { useTranslations } from 'next-intl';
import { parseAsString, useQueryState } from 'nuqs';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { useUserStore } from '@/shared/stores/use-user-store';
import { PERMISSIONS, PERMISSION_ALL_WILDCARD } from '@/shared/constants/permissions';
import { useUpdateActivationStatus } from '@/features/cam/activation-view/(hooks)/use-update-activation-status';
import { ActivationDetail } from '../../(hooks)/use-activation-detail';
import { callScoringApprove, triggerScoringValidation, useScoringValidatorStore } from '../(hooks)/use-scoring-validator-store';
import { useFeedbackDrawerUrl } from '../(hooks)/use-feedback-drawer-url';
import { ACTIVATION_STATUS } from '../../(helpers)/cam-constants';

type Props = {
  activationDetail: ActivationDetail;
  /** Called after a status move or approve succeeds — page redirects to the board, drawer closes itself. */
  onStatusChanged?: () => void;
};

const ActivationDetailFooter = ({ activationDetail, onStatusChanged }: Props) => {
  const t = useTranslations('activationView');
  const permissions = useUserStore((s) => s.permissions);
  const isAdmin =
    permissions?.includes(PERMISSION_ALL_WILDCARD) || permissions?.includes(PERMISSIONS.CustomerActivation.InternalAdmin);
  const isSalesRep =
    permissions?.includes(PERMISSION_ALL_WILDCARD) || permissions?.includes(PERMISSIONS.CustomerActivation.Sale);

  const { mutate: updateStatus, isPending: isMoving } = useUpdateActivationStatus();
  const isApproving = useScoringValidatorStore((s) => s.isApproving);
  const { openDrawer: openFeedbackDrawer } = useFeedbackDrawerUrl();
  const [activationTab, setActivationTab] = useQueryState('activationTab', parseAsString);

  const { id, status } = activationDetail;
  const moveTo = (next: string) => updateStatus({ id, status: next }, { onSuccess: () => onStatusChanged?.() });

  const handleApprove = async () => {
    if ((activationDetail.evaluation?.score ?? 0) > 0) {
      moveTo(ACTIVATION_STATUS.APPROVED);
      return;
    }

    if (activationTab !== 'scoring') {
      toast.error(t('scoring.completeBeforeApprove'));
      setActivationTab('scoring');
      return;
    }

    const valid = await triggerScoringValidation();

    if (!valid) {
      toast.error(t('scoring.completeBeforeApprove'));
      setActivationTab('scoring');
      return;
    }

    await callScoringApprove();
    onStatusChanged?.();
  };

  if (status === ACTIVATION_STATUS.COMPLETED || status === ACTIVATION_STATUS.CANCELLED) return null;

  if (isAdmin && status === ACTIVATION_STATUS.DRAFT) {
    return (
      <FooterBar>
        <Button className="sm:ml-auto" onClick={() => moveTo(ACTIVATION_STATUS.READY)} isLoading={isMoving}>
          {t('footer.moveToReady')}
        </Button>
      </FooterBar>
    );
  }

  if (isAdmin && status === ACTIVATION_STATUS.APPROVED) {
    return (
      <FooterBar>
        <Button className="sm:ml-auto" onClick={() => moveTo(ACTIVATION_STATUS.IN_PROGRESS)} isLoading={isMoving}>
          {t('footer.moveToInProgress')}
        </Button>
      </FooterBar>
    );
  }

  if (isAdmin && status === ACTIVATION_STATUS.IN_PROGRESS) {
    return (
      <FooterBar>
        <Button className="sm:ml-auto" onClick={() => moveTo(ACTIVATION_STATUS.INSTALLATION)} isLoading={isMoving}>
          {t('footer.moveToInstallation')}
        </Button>
      </FooterBar>
    );
  }

  if (isAdmin && status === ACTIVATION_STATUS.INSTALLATION) {
    return (
      <FooterBar>
        <Button className="sm:ml-auto" onClick={() => moveTo(ACTIVATION_STATUS.COMPLETED)} isLoading={isMoving}>
          {t('footer.moveToCompleted')}
        </Button>
      </FooterBar>
    );
  }

  if ((isAdmin || isSalesRep) && status === ACTIVATION_STATUS.READY) {
    return (
      <FooterBar>
        <Button className="sm:ml-auto" onClick={() => moveTo(ACTIVATION_STATUS.REVIEW)} isLoading={isMoving}>
          {t('footer.moveToReview')}
        </Button>
      </FooterBar>
    );
  }

  if (isAdmin && (status === ACTIVATION_STATUS.REVIEW || status === ACTIVATION_STATUS.CLARIFICATION)) {
    return (
      <FooterBar>
        <Button variant="outline" className="sm:ml-auto" onClick={openFeedbackDrawer} disabled={isApproving}>
          {t('footer.requestChange')}
        </Button>
        <Button onClick={handleApprove} isLoading={isApproving}>
          {t('footer.approve')}
        </Button>
      </FooterBar>
    );
  }

  if (isSalesRep && status === ACTIVATION_STATUS.CLARIFICATION) {
    return (
      <FooterBar>
        <Button className="sm:ml-auto" onClick={openFeedbackDrawer}>
          {t('footer.returnFeedback')}
        </Button>
      </FooterBar>
    );
  }

  return null;
};

function FooterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 flex shrink-0 items-center gap-3 border-t border-border bg-card px-6 py-4">
      {children}
    </div>
  );
}

export default ActivationDetailFooter;

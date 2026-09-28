'use client';

import { useTranslations } from 'next-intl';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useGetActivationFeedbacks } from '../(hooks)/use-get-activation-feedbacks';
import { useFeedbackDrawerUrl } from '../(hooks)/use-feedback-drawer-url';

type Props = {
  activationId: string;
};

const AddressedIssues = ({ activationId }: Props) => {
  const t = useTranslations('activationView');
  const { data: feedbacks = [] } = useGetActivationFeedbacks(activationId);
  const { openDrawer } = useFeedbackDrawerUrl();

  const reasons = feedbacks.filter((f) => f.type === 'CHECKBOX');
  if (reasons.length === 0) return null;

  const resolvedCount = reasons.filter((r) => r.resolved).length;
  const progressPercent = Math.round((resolvedCount / reasons.length) * 100);

  return (
    <div className="flex cursor-pointer flex-col gap-1.5" onClick={openDrawer}>
      <span className="text-muted-foreground/80 text-xs">{t('feedback.addressedIssues')}</span>

      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">{progressPercent}%</span>
      </div>

      <div className="flex flex-col">
        {reasons.map((reason) => (
          <div key={reason.id} className="flex items-center gap-2 py-0.5">
            <Checkbox checked={reason.resolved} disabled />
            <span className={cn('text-sm', reason.resolved ? 'text-muted-foreground line-through' : 'text-foreground')}>
              {reason.reason}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressedIssues;

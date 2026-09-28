'use client';

import { Checkbox } from '@/shared/components/ui/checkbox';
import { Button } from '@/shared/components/ui/button';
import { Trash2 } from 'lucide-react';
import { LoadingIcon } from '@/shared/components/common/icons';
import { cn } from '@/lib/utils';
import { Feedback } from '../../(hooks)/use-get-activation-feedbacks';

type Props = {
  reason: Feedback;
  canManage: boolean;
  isToggling?: boolean;
  onToggle: (id: string, resolved: boolean) => void;
  onDelete: (id: string) => void;
};

const FeedbackReasonItem = ({ reason, canManage, isToggling, onToggle, onDelete }: Props) => {
  const id = `feedback-reason-${reason.id}`;

  return (
    <div className={cn('flex items-center gap-2', isToggling && 'opacity-70')}>
      <label
        htmlFor={id}
        className={cn('flex flex-1 items-center gap-2', canManage && !isToggling && 'cursor-pointer')}
      >
        {isToggling ? (
          <LoadingIcon className="size-4.5 shrink-0 text-muted-foreground" />
        ) : (
          <Checkbox
            id={id}
            checked={reason.resolved}
            disabled={!canManage}
            onCheckedChange={() => onToggle(reason.id, reason.resolved)}
          />
        )}
        <span className="flex-1 text-sm text-foreground">{reason.reason}</span>
      </label>
      {canManage && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(reason.id)}
          disabled={isToggling}
        >
          <Trash2 className="size-4" />
        </Button>
      )}
    </div>
  );
};

export default FeedbackReasonItem;

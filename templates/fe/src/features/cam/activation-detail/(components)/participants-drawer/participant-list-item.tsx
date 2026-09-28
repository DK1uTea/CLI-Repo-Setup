'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { Trash2 } from 'lucide-react';
import { ParticipantDetail } from '../../(hooks)/use-get-activation-participants';

type Props = {
  participant: ParticipantDetail;
  canManage: boolean;
  onRemove: (id: string) => void;
};

const ParticipantListItem = ({ participant, canManage, onRemove }: Props) => {
  const { user } = participant;
  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]?.toUpperCase() || '').join('').slice(0, 2)
    : 'U';

  return (
    <div className="flex items-center gap-3">
      <Avatar>
        {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
      </div>
      {canManage && participant.isAbleToDeleted && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={() => onRemove(participant.user.id)}
        >
          <Trash2 className="size-4" />
        </Button>
      )}
    </div>
  );
};

export default ParticipantListItem;

'use client';

import { XIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { CamUser } from '../../(hooks)/use-list-cam-users';

type Props = {
  selectedUsers: CamUser[];
  onRemove: (id: string) => void;
};

const ParticipantPendingList = ({ selectedUsers, onRemove }: Props) => {
  if (selectedUsers.length === 0) return null;

  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border p-2">
      {selectedUsers.map((user) => {
        const initials = user.name
          ? user.name.split(' ').map((n) => n[0]?.toUpperCase() || '').join('').slice(0, 2)
          : 'U';

        return (
          <div key={user.id} className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted">
            <Avatar size="sm">
              {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="flex-1 truncate text-sm text-foreground">{user.name}</span>
            <button
              type="button"
              aria-label={`Remove ${user.name}`}
              onClick={() => onRemove(user.id)}
              className="flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
            >
              <XIcon className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ParticipantPendingList;

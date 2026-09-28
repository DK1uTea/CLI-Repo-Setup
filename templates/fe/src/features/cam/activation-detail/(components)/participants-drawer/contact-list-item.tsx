'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { ActivationContactListItem } from '../../(hooks)/use-list-contacts';
import ContactResendButton from './contact-resend-button';

type Props = {
  contact: ActivationContactListItem;
  activationId: string;
  canManage: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

const ContactListItem = ({ contact, activationId, canManage, onEdit, onDelete }: Props) => {
  const fullName = contact.name?.trim() ?? '';
  const initials = fullName
    ? fullName.split(' ').map((n) => n[0]?.toUpperCase() || '').join('').slice(0, 2)
    : 'U';

  return (
    <div className="group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-background">
      <Avatar>
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{fullName}</p>
        {(contact.email || contact.tel) && (
          <p className="truncate text-xs text-muted-foreground">
            {[contact.email, contact.tel].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {canManage && <ContactResendButton contactId={contact.id} activationId={activationId} />}
        {canManage && !contact.isOwner && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-primary"
            onClick={() => onEdit(contact.id)}
          >
            <Pencil className="size-4" />
          </Button>
        )}
        {canManage && !contact.isOwner && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(contact.id)}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ContactListItem;

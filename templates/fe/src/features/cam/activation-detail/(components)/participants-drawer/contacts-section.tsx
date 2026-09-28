'use client';

import { useTranslations } from 'next-intl';
import { PlusIcon, ContactIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/shared/components/ui/empty';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ActivationContactListItem } from '../../(hooks)/use-list-contacts';
import ContactListItem from './contact-list-item';

type Props = {
  contacts: ActivationContactListItem[];
  activationId: string;
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  canManage: boolean;
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

const ContactsSection = ({
  contacts,
  activationId,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  canManage,
  onAdd,
  onEdit,
  onDelete,
}: Props) => {
  const t = useTranslations('activationView.participants.contacts');

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground">{t('title')}</p>
        {canManage && (
          <Button type="button" variant="outline-primary" size="xs" onClick={onAdd}>
            <PlusIcon data-icon="inline-start" />
            {t('add')}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <Empty className="py-6">
          <EmptyMedia variant="icon">
            <ContactIcon />
          </EmptyMedia>
          <EmptyTitle className="text-sm">{t('noContactsYet')}</EmptyTitle>
          <EmptyDescription className="text-xs">{t('noContactsYetDescription')}</EmptyDescription>
        </Empty>
      ) : (
        <div className="flex flex-col gap-1">
          {contacts.map((contact) => (
            <ContactListItem
              key={contact.id}
              contact={contact}
              activationId={activationId}
              canManage={canManage}
              onEdit={onEdit}
              onDelete={onDelete}
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

export default ContactsSection;

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import type { UseFormSetError } from 'react-hook-form';
import type { AxiosError } from 'axios';
import { Button } from '@/shared/components/ui/button';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { useUserStore } from '@/shared/stores/use-user-store';
import { PERMISSIONS, PERMISSION_ALL_WILDCARD } from '@/shared/constants/permissions';
import { useListActivationParticipants } from '../../(hooks)/use-list-activation-participants';
import { useAddParticipants, useRemoveParticipant } from '../../(hooks)/use-participant-actions';
import { useParticipantsDrawerUrl } from '../../(hooks)/use-participants-drawer-url';
import { useListContacts } from '../../(hooks)/use-list-contacts';
import { useGetContact } from '../../(hooks)/use-get-contact';
import { useAddContact } from '../../(hooks)/use-add-contact';
import { useUpdateContact } from '../../(hooks)/use-update-contact';
import { useDeleteContact } from '../../(hooks)/use-delete-contact';
import { CamUser } from '../../(hooks)/use-list-cam-users';
import type { AddContactFormValues } from '../../(helpers)/add-contact-schema';
import ParticipantSearchCombobox from './participant-search-combobox';
import ParticipantPendingList from './participant-pending-list';
import ParticipantsSection from './participants-section';
import ContactsSection from './contacts-section';
import AddContactDialog from './add-contact-dialog';
import RemoveParticipantConfirmDialog from './remove-participant-confirm-dialog';
import DeleteContactConfirmDialog from './delete-contact-confirm-dialog';

type Props = {
  activationId?: string;
};

type ContactErrorEnvelope = { error_code?: string };

const ParticipantsDrawer = ({ activationId }: Props) => {
  const t = useTranslations('activationView.participants');
  const tc = useTranslations('activationView.participants.contacts');
  const { open, closeDrawer } = useParticipantsDrawerUrl();

  const permissions = useUserStore((s) => s.permissions);
  const canManage = !!(
    permissions?.includes(PERMISSION_ALL_WILDCARD) || permissions?.includes(PERMISSIONS.CustomerActivation.InternalAdmin)
  );

  const {
    participants,
    isLoading: isParticipantsLoading,
    hasNextPage: hasMoreParticipants,
    fetchNextPage: fetchMoreParticipants,
    isFetchingNextPage: isLoadingMoreParticipants,
  } = useListActivationParticipants(activationId, { enabled: open });
  const { mutate: addParticipants, isPending: isAddingParticipants } = useAddParticipants();
  const { mutate: removeParticipant } = useRemoveParticipant();

  const {
    contacts,
    isLoading: isContactsLoading,
    hasNextPage: hasMoreContacts,
    fetchNextPage: fetchMoreContacts,
    isFetchingNextPage: isLoadingMoreContacts,
  } = useListContacts(activationId, { enabled: open });

  const [selectedUsers, setSelectedUsers] = useState<CamUser[]>([]);
  const [removeTargetId, setRemoveTargetId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [openAddContact, setOpenAddContact] = useState(false);
  const [editContactId, setEditContactId] = useState<string | null>(null);

  const { mutate: addContact, isPending: isAddingContact } = useAddContact();
  const { mutate: updateContact, isPending: isUpdatingContact } = useUpdateContact();
  const { mutate: deleteContact, isPending: isDeletingContact } = useDeleteContact(activationId);
  const { data: editContactData, isLoading: isLoadingEditDetail } = useGetContact(editContactId);

  const editInitialValues: Partial<AddContactFormValues> | undefined = editContactData
    ? {
        firstName: editContactData.firstName,
        lastName: editContactData.lastName,
        phone: editContactData.tel,
        email: editContactData.email,
        address: editContactData.address,
      }
    : undefined;

  const handleContactError = (error: AxiosError<ContactErrorEnvelope>, setError: UseFormSetError<AddContactFormValues>) => {
    const code = error.response?.data?.error_code;
    if (code === 'CONTACTS.DUPLICATE_EMAIL' || code === 'DUPLICATE_EMAIL') {
      setError('email', { type: 'server', message: tc('addContactDialog.duplicateEmail') });
    } else if (code === 'CONTACTS.CONTACT_ALREADY_IN_ACTIVATION' || code === 'CONTACT_ALREADY_IN_ACTIVATION') {
      setError('email', { type: 'server', message: tc('addContactDialog.contactAlreadyInActivation') });
    } else if (code === 'CONTACTS.DUPLICATE_TEL' || code === 'DUPLICATE_TEL') {
      setError('phone', { type: 'server', message: tc('addContactDialog.duplicateTel') });
    }
  };

  const handleAddContactSubmit = (data: AddContactFormValues, setError: UseFormSetError<AddContactFormValues>) => {
    if (!activationId) return;
    addContact(
      { ...data, tel: data.phone, activationId },
      {
        onSuccess: () => {
          toast.success(tc('addContactDialog.contactAdded'));
          setOpenAddContact(false);
        },
        onError: (error) => handleContactError(error as AxiosError<ContactErrorEnvelope>, setError),
      },
    );
  };

  const handleEditContactSubmit = (data: AddContactFormValues, setError: UseFormSetError<AddContactFormValues>) => {
    if (!editContactId || !activationId) return;
    updateContact(
      { id: editContactId, firstName: data.firstName, lastName: data.lastName, email: data.email, tel: data.phone, address: data.address, activationId },
      {
        onSuccess: () => {
          toast.success(tc('addContactDialog.contactUpdated'));
          setEditContactId(null);
        },
        onError: (error) => handleContactError(error as AxiosError<ContactErrorEnvelope>, setError),
      },
    );
  };

  const handleSaveParticipants = () => {
    if (!activationId || selectedUsers.length === 0) return;
    addParticipants(
      { activationId, userIds: selectedUsers.map((u) => u.id) },
      {
        onSuccess: () => {
          toast.success(t('participantsAdded'));
          setSelectedUsers([]);
          closeDrawer();
        },
      },
    );
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !next && closeDrawer()}>
      <SheetContent side="right" showCloseButton={false} className="w-full gap-0 p-0 sm:min-w-100">
        <SheetHeader className="border-b border-border px-4 py-2">
          <SheetTitle className="sr-only">{t('title')}</SheetTitle>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">{t('title')}</p>
            <Button variant="ghost" size="icon" onClick={closeDrawer}>
              <X className="text-primary" />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto _custom-scroll px-4 py-4">
          {canManage && (
            <div className="flex flex-col gap-2">
              <ParticipantSearchCombobox
                participants={participants}
                selectedUsers={selectedUsers}
                onAdd={(user) => setSelectedUsers((prev) => [...prev, user])}
              />
              <ParticipantPendingList
                selectedUsers={selectedUsers}
                onRemove={(id) => setSelectedUsers((prev) => prev.filter((u) => u.id !== id))}
              />
            </div>
          )}

          <ParticipantsSection
            participants={participants}
            isLoading={isParticipantsLoading}
            hasNextPage={hasMoreParticipants}
            isFetchingNextPage={isLoadingMoreParticipants}
            fetchNextPage={fetchMoreParticipants}
            canManage={canManage}
            onRemove={setRemoveTargetId}
          />

          {activationId && (
            <ContactsSection
              contacts={contacts}
              activationId={activationId}
              isLoading={isContactsLoading}
              hasNextPage={hasMoreContacts}
              isFetchingNextPage={isLoadingMoreContacts}
              fetchNextPage={fetchMoreContacts}
              canManage={canManage}
              onAdd={() => setOpenAddContact(true)}
              onEdit={setEditContactId}
              onDelete={setDeleteTargetId}
            />
          )}
        </div>

        {canManage && (
          <SheetFooter className="flex-row justify-end gap-3 border-t border-border">
            <Button type="button" variant="outline-primary" onClick={closeDrawer}>
              {t('cancel')}
            </Button>
            <Button
              type="button"
              isLoading={isAddingParticipants}
              disabled={selectedUsers.length === 0}
              onClick={handleSaveParticipants}
            >
              {t('save')}
            </Button>
          </SheetFooter>
        )}

        <RemoveParticipantConfirmDialog
          open={!!removeTargetId}
          onOpenChange={(next) => !next && setRemoveTargetId(null)}
          onConfirm={() => {
            if (removeTargetId && activationId) {
              removeParticipant(
                { activationId, userId: removeTargetId },
                { onSuccess: () => toast.success(t('participantRemoved')) },
              );
            }
            setRemoveTargetId(null);
          }}
        />

        <DeleteContactConfirmDialog
          open={!!deleteTargetId}
          isPending={isDeletingContact}
          onOpenChange={(next) => !next && setDeleteTargetId(null)}
          onConfirm={() => {
            if (deleteTargetId) {
              deleteContact(deleteTargetId, {
                onSuccess: () => {
                  toast.success(tc('contactDeleted'));
                  setDeleteTargetId(null);
                },
              });
            }
          }}
        />

        <AddContactDialog
          open={openAddContact}
          onClose={() => setOpenAddContact(false)}
          onSubmit={handleAddContactSubmit}
          isLoading={isAddingContact}
        />

        <AddContactDialog
          open={!!editContactId}
          onClose={() => setEditContactId(null)}
          onSubmit={handleEditContactSubmit}
          isLoading={isUpdatingContact}
          isDetailLoading={isLoadingEditDetail}
          initialValues={editInitialValues}
          title={tc('addContactDialog.editTitle')}
        />
      </SheetContent>
    </Sheet>
  );
};

export default ParticipantsDrawer;

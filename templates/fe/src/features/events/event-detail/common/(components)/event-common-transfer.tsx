'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { Button } from '@/shared/components/ui/button';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from '@/shared/components/ui/combobox';
import { useOwnershipTransferCandidates } from '../(hooks)/use-ownership-transfer-candidates';
import type { EventCommonNamespace } from '../(services)/event-common-service';

type Props = {
  open: boolean;
  onClose: () => void;
  namespace: EventCommonNamespace;
  onConfirm: (newOwnerUserId: string) => Promise<void> | void;
};

export function EventCommonTransfer({ open, onClose, namespace, onConfirm }: Props) {
  const t = useTranslations(namespace);
  const [newOwnerUserId, setNewOwnerUserId] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const comboboxAnchor = useComboboxAnchor();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useOwnershipTransferCandidates(search, open);
  const candidates = data?.pages.flatMap((p) => p.candidates) ?? [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwnerUserId) {
      toast.error(t('transferOwnerRequired'));
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm(newOwnerUserId);
      setConfirmOpen(false);
      setNewOwnerUserId('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewOwnerUserId('');
    setSearch('');
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent aria-describedby={undefined} className="sm:max-w-md gap-0">
          <DialogHeader>
            <DialogTitle>{t('transferEvent')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <Combobox
              value={newOwnerUserId}
              onValueChange={(v) => setNewOwnerUserId(v ?? '')}
              itemToStringLabel={(id) => {
                const c = candidates.find((c) => c.id === id);
                return c ? c.name : String(id);
              }}
            >
              <div ref={comboboxAnchor}>
                <ComboboxInput
                  placeholder={t('newOwner')}
                  showClear={!!newOwnerUserId}
                  onSearchChange={setSearch}
                  className="h-10 w-full"
                  translate="no"
                />
              </div>
              <ComboboxContent
                anchor={comboboxAnchor}
                sideOffset={4}
                className="min-w-(--anchor-width)!"
              >
                <ComboboxList
                  onLoadMore={fetchNextPage}
                  hasMore={!!hasNextPage}
                  loadingMore={isFetchingNextPage}
                >
                  {candidates.length === 0 && (
                    <ComboboxEmpty>{t('noUsersFound')}</ComboboxEmpty>
                  )}
                  {candidates.map((c) => (
                    <ComboboxItem key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </ComboboxItem>
                  ))}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={!newOwnerUserId}>
                {t('save')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('transferConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('transferConfirmDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={loading}>
              {t('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

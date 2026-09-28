'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PlusIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
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
import { Feedback } from '../../(hooks)/use-get-activation-feedbacks';
import FeedbackReasonItem from './feedback-reason-item';

type Props = {
  reasons: Feedback[];
  canManage: boolean;
  togglingIds: Set<string>;
  onAdd: (text: string) => void;
  onToggle: (id: string, resolved: boolean) => void;
  onDelete: (id: string) => void;
  isAdding: boolean;
};

const FeedbackReasonsSection = ({ reasons, canManage, togglingIds, onAdd, onToggle, onDelete, isAdding }: Props) => {
  const t = useTranslations('activationView');
  const [showAddInput, setShowAddInput] = useState(false);
  const [newReasonText, setNewReasonText] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleAddConfirm = () => {
    if (!newReasonText.trim()) return;
    onAdd(newReasonText.trim());
    setNewReasonText('');
    setShowAddInput(false);
  };

  return (
    <div className="flex flex-col">


      <div className="flex flex-col gap-2">
        {reasons.map((reason) => (
          <FeedbackReasonItem
            key={reason.id}
            reason={reason}
            canManage={canManage}
            isToggling={togglingIds.has(reason.id)}
            onToggle={onToggle}
            onDelete={setDeleteTargetId}
          />
        ))}
      </div>

      {canManage &&
        (showAddInput ? (
          <div className="flex flex-col gap-2">
            <Input
              autoFocus
              translate="no"
              value={newReasonText}
              onChange={(e) => setNewReasonText(e.target.value)}
              placeholder={t('feedback.enterReason')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddConfirm();
                if (e.key === 'Escape') setShowAddInput(false);
              }}
            />
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => setShowAddInput(false)}>
                {t('feedback.cancel')}
              </Button>
              <Button type="button" size="sm" className="flex-1" onClick={handleAddConfirm} disabled={isAdding}>
                {t('feedback.add')}
              </Button>
            </div>
          </div>
        ) : (
          <Button type="button" variant="ghost" size="sm" className="w-fit gap-1.5 text-primary" onClick={() => setShowAddInput(true)}>
            <PlusIcon className="size-4" />
            {t('feedback.addItem')}
          </Button>
        ))}

      <AlertDialog open={!!deleteTargetId} onOpenChange={(next) => !next && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('feedback.deleteReasonTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('feedback.deleteReasonDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('feedback.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (deleteTargetId) onDelete(deleteTargetId);
                setDeleteTargetId(null);
              }}
            >
              {t('feedback.deleteReasonBtn')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FeedbackReasonsSection;

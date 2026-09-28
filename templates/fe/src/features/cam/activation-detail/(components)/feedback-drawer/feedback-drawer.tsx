'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { Editor } from '@/shared/components/ui/editor';
import { Input } from '@/shared/components/ui/input';
import { ActivationStatusBadge } from '../../../(components)/activation-status-badge';
import { useFeedbackDrawerUrl } from '../../(hooks)/use-feedback-drawer-url';
import { useFeedbackDrawerActions } from '../../(hooks)/use-feedback-drawer-actions';
import FeedbackReasonsSection from './feedback-reasons-section';
import FeedbackCommentList from './feedback-comment-list';
import FeedbackDrawerSkeleton from './feedback-drawer-skeleton';
import { Card, CardContent } from '@/shared/components/ui/card';

type Props = {
  activationId?: string;
  status?: string;
};

const FeedbackDrawer = ({ activationId, status }: Props) => {
  const t = useTranslations('activationView');
  const { open, closeDrawer } = useFeedbackDrawerUrl();
  const {
    reasons,
    comments,
    isAdmin,
    isClarification,
    isLoading,
    addReason,
    toggleReason,
    deleteReason,
    submit,
    isAdding,
    isDeleting,
    togglingIds,
    isSubmitting,
  } = useFeedbackDrawerActions(activationId, status, open);

  const [comment, setComment] = useState('');
  const [isCommentExpanded, setIsCommentExpanded] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleClose = () => {
    setIsSuccess(false);
    setComment('');
    setIsCommentExpanded(false);
    closeDrawer();
  };

  const handleSubmit = () => {
    submit(comment, { onSuccess: () => setIsSuccess(true) });
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !next && handleClose()}>
      <SheetContent side="right" showCloseButton={false} className="w-full gap-0 p-0 sm:min-w-120">
        <SheetHeader className="border-b border-border px-4 py-2">
          <SheetTitle className="sr-only">{t('feedback.title')}</SheetTitle>
          <div className="flex items-center justify-between gap-2">
            <ActivationStatusBadge status={status ?? ''} />
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="text-primary" />
            </Button>
          </div>
        </SheetHeader>

        {isLoading ? (
          <FeedbackDrawerSkeleton />
        ) : isSuccess ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
            <CheckCircle className="size-12 text-primary" strokeWidth={1.5} />
            <p className="text-base font-medium text-foreground">{t('feedback.feedbackSent')}</p>
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-0 px-4 py-4 flex flex-col gap-3">
              <p className="text-lg font-medium text-foreground">{t('feedback.addReasons')}</p>
              <Card>
                <CardContent className='flex flex-col gap-5 _custom-scroll overflow-y-auto'>
                  <FeedbackReasonsSection
                    reasons={reasons}
                    canManage={isAdmin}
                    togglingIds={togglingIds}
                    onAdd={addReason}
                    onToggle={toggleReason}
                    onDelete={deleteReason}
                    isAdding={isAdding}
                  />

                  {isCommentExpanded ? (
                    <div className="flex flex-col gap-1.5">
                      <p className="text-sm font-medium text-foreground">{t('feedback.additionComment')}</p>
                      <Editor
                        value={comment}
                        onChange={setComment}
                        placeholder={t('feedback.enterReason')}
                        className="min-h-32"
                        focusOnMount
                      />
                    </div>
                  ) : (
                    <div>
                      <Input
                        readOnly
                        aria-label={t('feedback.additionComment')}
                        placeholder={t('feedback.additionalCommentPlaceholder')}
                        onFocus={() => setIsCommentExpanded(true)}
                        className='bg-input'
                      />
                    </div>
                  )}

                  <FeedbackCommentList comments={comments} />
                </CardContent>
              </Card>
            </div>

            <SheetFooter className="flex-row gap-3 border-t border-border">
              <Button variant="outline" className="flex-1" onClick={handleClose} disabled={isSubmitting || isDeleting}>
                {t('feedback.cancel')}
              </Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
                {isClarification ? t('feedback.returnFeedback') : t('feedback.requestChange')}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default FeedbackDrawer;

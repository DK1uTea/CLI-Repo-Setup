'use client';

import { useTranslations } from 'next-intl';
import { ClipboardPenLine, Copy } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useEventFormFooter } from '../(hooks)/use-event-form-footer';
import { EventFormDeleteDialog } from './event-form-delete-dialog';
import { EventFormDraftDialog } from './event-form-draft-dialog';
import type { StepName } from '../(helpers)/event-form-schema';
import { type EventFormVariant } from '../(helpers)/event-form-config';

type Props = {
  variant?: EventFormVariant;
};

export function EventFormFooter({ variant = 'events' }: Props) {
  const t = useTranslations('eventForm');
  const tDetail = useTranslations('events.productDetail');

  const {
    router,
    config,
    isProductDetail,
    currentStep,
    isFirstStep,
    isLastStep,
    goToPrevStep,
    eventIdParam,
    referer,
    openDelete,
    setOpenDelete,
    openDraft,
    setOpenDraft,
    isPending,
    isCartEmptyStep,
    isDeadlineBlocked,
    isDisableField,
    onNext,
    onConfirmDelete,
    onConfirmDraft,
    pendingDelete,
    pendingDraft,
    duplicate,
  } = useEventFormFooter(variant);

  // --- Product detail: navigate back to the catalog step or forward to the next step ---
  if (isProductDetail) {
    const stepIndex = config.steps.indexOf(currentStep);
    const nextStep = config.steps[stepIndex + 1] ?? currentStep;
    const buildUrl = (step: StepName) =>
      `/events/${referer}?eventId=${eventIdParam ?? ''}&step=${step}`;

    return (
      <div className="sticky bottom-0 z-10 flex shrink-0 items-center justify-end gap-2 border-y border-border bg-card px-6 py-5">
        <Button type="button" data-testid="product-detail-cancel-button" variant="outline" onClick={() => router.push(buildUrl(currentStep))}>
          {tDetail('cancel')}
        </Button>
        <Button type="button" data-testid="product-detail-continue-button" onClick={() => router.push(buildUrl(nextStep))}>
          {tDetail('saveAndContinue')}
        </Button>
      </div>
    );
  }

  const backButton = (
    <Button
      type="button"
      variant="outline-primary"
      href={isFirstStep ? config.cancelHref : undefined}
      onClick={isFirstStep ? undefined : goToPrevStep}
      disabled={isPending}
    >
      {isFirstStep ? t('actions.cancel') : t('actions.back')}
    </Button>
  );

  const nextButton = (
    <Button
      type="button"
      data-testid="event-form-next-button"
      onClick={onNext}
      isLoading={isPending}
      disabled={isCartEmptyStep || isDisableField || isDeadlineBlocked}
    >
      {isLastStep ? t('actions.submit') : t('actions.next')}
    </Button>
  );

  return (
    <div className="sticky bottom-0 z-10 shrink-0 border-y border-border bg-card">
      {/* Mobile: 2-column grid, submit always full width */}
      <div className="grid grid-cols-2 gap-2 px-6 py-4 sm:hidden">
        <Button
          type="button"
          data-testid="event-form-delete-button"
          variant="outline"
          className="text-muted-foreground hover:text-destructive"
          disabled={!eventIdParam || isPending || isDisableField}
          onClick={() => setOpenDelete(true)}
        >
          {t('actions.deleteEvent')}
        </Button>
        <Button
          type="button"
          data-testid="event-form-save-as-draft-button"
          variant="outline-primary"
          className="gap-2"
          disabled={isPending || isDisableField}
          onClick={() => setOpenDraft(true)}
        >
          {t('actions.saveAsDraft')}
          <ClipboardPenLine className="size-4" data-icon="inline-end" />
        </Button>
        {backButton}
        <Button
          type="button"
          variant="outline-primary"
          className="gap-2"
          disabled={!eventIdParam || isPending || isDisableField}
          onClick={() => eventIdParam && duplicate(eventIdParam)}
        >
          {t('actions.duplicateEvent')}
          <Copy className="size-4" data-icon="inline-end" />
        </Button>
        <div className="col-span-2">{nextButton}</div>
      </div>

      {/* Desktop: flex justify-end */}
      <div className="hidden flex-wrap items-center justify-end gap-2 px-6 py-5 sm:flex">
        <Button
          type="button"
          data-testid="event-form-delete-button"
          variant="outline"
          className="text-muted-foreground hover:text-destructive"
          disabled={!eventIdParam || isPending || isDisableField}
          onClick={() => setOpenDelete(true)}
        >
          {t('actions.deleteEvent')}
        </Button>
        <Button
          type="button"
          data-testid="event-form-save-as-draft-button"
          variant="outline-primary"
          className="gap-2"
          disabled={isPending || isDisableField}
          onClick={() => setOpenDraft(true)}
        >
          {t('actions.saveAsDraft')}
          <ClipboardPenLine className="size-4" data-icon="inline-end" />
        </Button>
        {backButton}
        <Button
          type="button"
          variant="outline-primary"
          className="gap-2"
          disabled={!eventIdParam || isPending || isDisableField}
          onClick={() => eventIdParam && duplicate(eventIdParam)}
        >
          {t('actions.duplicateEvent')}
          <Copy className="size-4" data-icon="inline-end" />
        </Button>
        {nextButton}
      </div>

      <EventFormDeleteDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        onConfirm={onConfirmDelete}
        isPending={pendingDelete}
      />

      <EventFormDraftDialog
        open={openDraft}
        onOpenChange={setOpenDraft}
        onConfirm={onConfirmDraft}
        isPending={pendingDraft}
      />
    </div>
  );
}

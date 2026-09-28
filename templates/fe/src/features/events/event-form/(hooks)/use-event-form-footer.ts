'use client';

import { createElement, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { useQueryState, parseAsString } from 'nuqs';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useEventCartStore } from '@/features/events/(stores)/use-event-cart-store';

import { toast } from 'sonner';
import { useEventActions } from './use-event-actions';
import { useEventDeadline } from './use-event-deadline';
import { useSubmitStepOverview } from './use-submit-step-overview';
import { useSubmitStepLogistics } from './use-submit-step-logistics';
import { useSubmitStepHelpingHands } from './use-submit-step-helping-hands';
import { useSubmitEvent } from './use-submit-event';
import { useDeleteEvent } from './use-delete-event';
import { useDuplicateEvent } from './use-duplicate-event';
import { useEventDetailStore } from '@/features/events/(stores)/use-event-detail-store';
import { EVENT_FORM_CONFIG, type EventFormVariant } from '../(helpers)/event-form-config';
import { CART_STEPS } from '../(helpers)/event-form-helpers';
import { hasCartOrderChanges } from '../(helpers)/cart-order-state';
import { isCartEmpty, validateCartForOrder } from '../(helpers)/cart-stock-validation';
import type { EventFormDto } from '../(helpers)/event-form-schema';
import { getEventMutationRefreshScope } from '../(helpers)/event-mutation-refresh';

export function useEventFormFooter(variant: EventFormVariant) {
  const methods = useFormContext<EventFormDto>();
  const t = useTranslations('eventForm');
  const pathname = usePathname();
  const router = useRouter();
  const config = EVENT_FORM_CONFIG[variant];

  const isProductDetail = pathname.includes('/product-detail');

  const { currentStep, isFirstStep, isLastStep, goToPrevStep, goToNextStep } = useEventActions({ steps: config.steps });
  const { isError: isDeadlineError, isLoading: isDeadlineLoading } = useEventDeadline(
    currentStep === 'overview' || currentStep === 'logistics',
  );
  const [eventIdParam] = useQueryState('eventId', parseAsString);
  const [referer] = useQueryState('referer', parseAsString.withDefault('new-event'));
  const [productSlug] = useQueryState('product', parseAsString);

  const { cart } = useEventCartStore();

  const canEdit = useEventDetailStore((s) => s.canEdit);
  const status = useEventDetailStore((s) => s.status);
  const isDisableField = eventIdParam ? !canEdit : false;

  const refreshScope = getEventMutationRefreshScope(pathname, currentStep, productSlug);

  const [openDelete, setOpenDelete] = useState(false);
  const [openDraft, setOpenDraft] = useState(false);

  const { submit: submitOverview, isPending: pendingOverview } = useSubmitStepOverview();
  const { submit: submitLogistics, isPending: pendingLogistics } = useSubmitStepLogistics();
  const { submit: submitHelpingHands, isPending: pendingHelpingHands } = useSubmitStepHelpingHands();
  const { submit: submitEvent, isPending: pendingEvent } = useSubmitEvent({
    redirectHref: config.submitRedirectHref,
    refreshScope,
  });

  const { deleteEvent, isPending: pendingDelete } = useDeleteEvent();
  const buildDuplicateRedirectHref = (id: string) =>
    variant === 'calendar'
      ? `/calendar-dashboard/update-calendar-event?eventId=${id}`
      : `/events/update-event?eventId=${id}&state=update`;
  const { duplicate, isPending: pendingDuplicate } = useDuplicateEvent(buildDuplicateRedirectHref);
  const [pendingDraft, setPendingDraft] = useState(false);

  const isPending =
    pendingOverview ||
    pendingLogistics ||
    pendingHelpingHands ||
    pendingEvent ||
    pendingDelete ||
    pendingDuplicate ||
    pendingDraft;

  // Product Catalog and Summary need products before continuing / submitting.
  const isCartEmptyStep =
    (currentStep === 'product_catalog' || currentStep === 'summary') && isCartEmpty(cart);
  // A cart line diverging from the event's active order (new/deleted/changed,
  // see cart-order-state.ts) can be finalized immediately instead of walking
  // through to Summary. A DRAFT event was never published/ordered, so this
  // never applies until the event is ACTIVE.
  const hasCartChanges =
    status === 'ACTIVE' && CART_STEPS.includes(currentStep) && hasCartOrderChanges(cart);
  const isDeadlineBlocked = isDeadlineLoading || isDeadlineError;
  // Product Catalog and Summary skip submission but still complete the draft flow.
  const isDraftWithoutSubmitStep = currentStep === 'product_catalog' || currentStep === 'summary';

  // Blocks proceeding past a cart step (and finalizing) when the cart is empty
  // or a line's requested quantity exceeds what's available — reported once by
  // name, or summarized by count once two or more lines are affected.
  const blockIfInvalidCart = () => {
    if (!CART_STEPS.includes(currentStep)) return false;
    const result = validateCartForOrder(cart);
    if (result.valid) return false;

    if (result.reason === 'EMPTY') {
      toast.error(t('productCatalog.errorCartEmpty'));
      return true;
    }

    if (result.items.length === 1) {
      const [item] = result.items;
      toast.error(
        createElement(
          'span',
          null,
          createElement('strong', null, item.name),
          `: ${t('productCatalog.insufficientStockSingle', { available: item.available, requested: item.requested })}`,
        ),
      );
    } else {
      toast.error(t('productCatalog.insufficientStockMultiple', { count: result.items.length }));
    }
    return true;
  };

  const onNext = async () => {
    if (isDisableField || isDeadlineBlocked) return;
    if (blockIfInvalidCart()) return;

    if (currentStep === 'overview') {
      const ok = await submitOverview();
      if (!ok) return;
    } else if (currentStep === 'logistics') {
      const ok = await submitLogistics();
      if (!ok) return;
    } else if (currentStep === 'helping_hand') {
      const ok = await submitHelpingHands();
      if (!ok) return;
    }

    if (currentStep !== 'product_catalog' && currentStep !== 'summary') {
      methods.reset(methods.getValues());
    }

    if (isLastStep) {
      await submitEvent();
      return;
    }

    goToNextStep();
  };

  const onFinalizeEvent = async (): Promise<boolean> => {
    if (isDisableField || isDeadlineBlocked) return false;
    if (blockIfInvalidCart()) return false;
    return submitEvent();
  };

  const onConfirmDelete = async () => {
    if (eventIdParam) {
      const ok = await deleteEvent(eventIdParam);
      if (ok) setOpenDelete(false);
    }
  };

  const onConfirmDraft = async () => {
    if (isDraftWithoutSubmitStep) {
      toast.success(t('draftSaveSuccess'));
      setOpenDraft(false);
      router.push('/events?status=DRAFT');
      return;
    }

    setPendingDraft(true);
    try {
      let ok = false;
      if (currentStep === 'overview') {
        ok = await submitOverview({ asDraft: true });
      } else if (currentStep === 'logistics') {
        ok = await submitLogistics({ asDraft: true });
      } else if (currentStep === 'helping_hand') {
        ok = await submitHelpingHands({ asDraft: true });
      }
      if (!ok) return;

      toast.success(t('draftSaveSuccess'));
      setOpenDraft(false);
      router.push('/events?status=DRAFT');
    } finally {
      setPendingDraft(false);
    }
  };

  return {
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
    hasCartChanges,
    isDeadlineBlocked,
    isDisableField,
    onNext,
    onFinalizeEvent,
    onConfirmDelete,
    onConfirmDraft,
    pendingDelete,
    pendingDraft,
    duplicate,
  };
}

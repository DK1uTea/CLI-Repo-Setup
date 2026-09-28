'use client';

// import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { useQueryState, parseAsString } from 'nuqs';
import { Button } from '@/shared/components/ui/button';
import { useEventDetailStore } from '@/features/events/(stores)/use-event-detail-store';
import { isPermanentLoanEventType } from '../(helpers)/event-form-constants';
import { getEventFormDetailStep } from '../(helpers)/event-form-helpers';
import type { EventFormDto } from '../(helpers)/event-form-schema';
import { useEventActions } from '../(hooks)/use-event-actions';
import { useEventStepDetail } from '../(hooks)/use-event-step-detail';
// import { useEventVisibility } from '../(hooks)/use-event-visibility';
import { useEventFormFooter } from '../(hooks)/use-event-form-footer';
import { useGetEventType } from '../(hooks)/use-get-event-type';
// import { EventFormVisibilityDialog } from './event-form-visibility-dialog';

type Props = {
  className?: string;
};

// TEMPORARY: the publish/unpublish (Public event / Do not publish) toggle is
// on hold — clicking now just does what Save & Continue does instead of
// opening the confirm dialog and calling the visibility API. The original
// logic is commented out (not deleted) so it can be restored later.
export function EventFormVisibilityButton({ className }: Props) {
  const t = useTranslations('eventForm');
  const doNotPublish = useWatch<EventFormDto, 'doNotPublish'>({ name: 'doNotPublish' });
  const eventTypeId = useWatch<EventFormDto, 'eventTypeId'>({ name: 'eventTypeId' });
  const [eventId] = useQueryState('eventId', parseAsString);
  const { currentStep } = useEventActions();
  const { data: eventDetail } = useEventStepDetail(eventId || '', getEventFormDetailStep(currentStep));
  const canEdit = useEventDetailStore((s) => s.canEdit);
  const isFormLoading = useEventDetailStore((s) => s.isFormLoading);
  const { eventTypes } = useGetEventType();
  // const { mutate, isPending } = useEventVisibility();
  // const [confirmOpen, setConfirmOpen] = useState(false);
  const { onNext, isPending } = useEventFormFooter('events');

  const selectedType = eventTypes.find((type) => type.id === eventTypeId);
  const isPermanentLoan =
    isPermanentLoanEventType(selectedType) ||
    isPermanentLoanEventType({
      slug: eventDetail?.general?.eventTypeSlug,
      name: eventDetail?.general?.eventTypeName,
    });
  const isPrivate =
    isPermanentLoan ||
    (isFormLoading ? eventDetail?.general?.isPrivate === true : !!doNotPublish);
  const isDisabled = !canEdit || isPermanentLoan || isPending;

  // const handleClick = () => {
  //   if (!eventId || isDisabled) return;
  //   setConfirmOpen(true);
  // };
  //
  // const handleConfirm = () => {
  //   if (!eventId || isDisabled) return;
  //   const nextIsPrivate = !isPrivate;
  //   mutate(
  //     { eventId, isPrivate: nextIsPrivate },
  //     {
  //       onSuccess: () => {
  //         setValue('doNotPublish', nextIsPrivate, { shouldDirty: false });
  //         setConfirmOpen(false);
  //       },
  //     },
  //   );
  // };

  return (
    <Button
      variant="outline-primary"
      type="button"
      className={className}
      isLoading={isPending}
      disabled={isDisabled}
      aria-pressed={!isPrivate}
      onClick={onNext}
    >
      {t('publicEvent')}
    </Button>
    // <EventFormVisibilityDialog
    //   open={confirmOpen}
    //   onOpenChange={setConfirmOpen}
    //   onConfirm={handleConfirm}
    //   isPrivate={isPrivate}
    //   isPending={isPending}
    // />
  );
}

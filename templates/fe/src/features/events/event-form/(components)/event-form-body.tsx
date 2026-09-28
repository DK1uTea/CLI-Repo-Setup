'use client';

import { useEffect, useRef } from 'react';
import { useQueryState, parseAsString } from 'nuqs';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useCalendarEventDetail } from '@/features/calendar/event-calendar-detail/(hooks)/use-calendar-event-detail';
import { canEditCalendarEvent } from '@/features/calendar/(helpers)/can-edit-calendar-event';
import { useEventDetailStore } from '@/features/events/(stores)/use-event-detail-store';
import { useHasPermission } from '@/shared/stores/use-user-store';
import { PERMISSION_ALL_WILDCARD } from '@/shared/constants/permissions';
import { useEventActions } from '../(hooks)/use-event-actions';
import { useEventDeadline } from '../(hooks)/use-event-deadline';
import { useEventStepDetail } from '../(hooks)/use-event-step-detail';
import { EVENT_FORM_CONFIG, type EventFormMode, type EventFormVariant } from '../(helpers)/event-form-config';
import { getEventFormDetailStep } from '../(helpers)/event-form-helpers';
import type { StepName } from '../(helpers)/event-form-schema';
import { EventFormSidebar } from './event-form-sidebar';
import { EventFormStepOverview } from './steps/event-form-step-overview';
import { EventFormStepLogistics } from './steps/event-form-step-logistics';
import { EventFormStepProductCatalog } from './steps/event-form-step-product-catalog';
import { EventFormStepHelpingHands } from './steps/event-form-step-helping-hands';
import { EventFormStepSummary } from './steps/event-form-step-summary';
import { OverviewSkeleton } from './steps/event-form-step-overview/overview-skeleton';
import { LogisticsSkeleton } from './steps/event-form-step-logistics/logistics-skeleton';
import { ProductCatalogSkeleton } from './steps/event-form-step-product-catalog/product-catalog-skeleton';
import { HelpingHandsSkeleton } from './steps/event-form-step-helping-hands/helping-hands-skeleton';
import { SummarySkeleton } from './steps/event-form-step-summary/summary-skeleton';

type Props = { mode: EventFormMode; variant?: EventFormVariant };

const OTHER_STEP_COMPONENTS: Partial<Record<StepName, React.ComponentType>> = {
  logistics: EventFormStepLogistics,
  product_catalog: EventFormStepProductCatalog,
  helping_hand: EventFormStepHelpingHands,
  summary: EventFormStepSummary,
};

const SKELETON_COMPONENTS: Record<StepName, React.ComponentType> = {
  overview: OverviewSkeleton,
  logistics: LogisticsSkeleton,
  product_catalog: ProductCatalogSkeleton,
  helping_hand: HelpingHandsSkeleton,
  summary: SummarySkeleton,
};

export function EventFormBody({ mode, variant = 'events' }: Props) {
  const t = useTranslations('eventForm.overview');
  const config = EVENT_FORM_CONFIG[variant];
  const { currentStep } = useEventActions({ steps: config.steps });
  const [eventIdParam] = useQueryState('eventId', parseAsString);
  const isEventsVariant = variant === 'events';
  const isDeadlineEnabled = currentStep === 'overview' || currentStep === 'logistics';
  const { isError: isDeadlineError, isLoading: isDeadlineLoading } = useEventDeadline(isDeadlineEnabled);
  const isDeadlineUnavailable = isDeadlineEnabled && isDeadlineError;
  const hasShownDeadlineError = useRef(false);

  const detailStep = getEventFormDetailStep(currentStep);
  const { data: eventDetail } = useEventStepDetail(
    isEventsVariant ? eventIdParam || '' : '',
    isEventsVariant ? detailStep : null,
  );
  const { data: calendarEventDetail } = useCalendarEventDetail(
    isEventsVariant ? '' : eventIdParam || '',
  );
  const isCalendarAdmin = useHasPermission(PERMISSION_ALL_WILDCARD);
  const isEditMode = !!eventIdParam;
  const {
    isFormLoading,
    setCanEdit,
    setStatus,
    setIsOverviewLocked,
  } = useEventDetailStore();
  const canEdit = isEventsVariant
    ? eventDetail?.canEdit
    : canEditCalendarEvent(calendarEventDetail, isCalendarAdmin);
  const isDetailLoaded = isEventsVariant ? !!eventDetail : !!calendarEventDetail;
  const isDisableField = isEditMode && isDetailLoaded ? canEdit === false : false;

  useEffect(() => {
    if (isEditMode && isDetailLoaded) {
      setCanEdit(canEdit ?? true);
      setStatus(isEventsVariant ? eventDetail?.general?.status ?? null : null);
    } else if (!isEditMode) {
      setCanEdit(true);
      setStatus(null);
    }
  }, [isEditMode, isDetailLoaded, canEdit, isEventsVariant, eventDetail, setCanEdit, setStatus]);

  useEffect(() => {
    setIsOverviewLocked(currentStep === 'overview' && isDeadlineUnavailable);
  }, [currentStep, isDeadlineUnavailable, setIsOverviewLocked]);

  useEffect(() => {
    if (isDeadlineUnavailable && !hasShownDeadlineError.current) {
      toast.error(t('deadlineUnavailable'));
      hasShownDeadlineError.current = true;
    }
    if (!isDeadlineUnavailable) hasShownDeadlineError.current = false;
  }, [isDeadlineUnavailable, t]);

  const SkeletonComponent = SKELETON_COMPONENTS[currentStep];
  const OtherStepComponent = OTHER_STEP_COMPONENTS[currentStep];

  return (
    <div className="flex flex-col gap-5 lg:flex-row">
      <EventFormSidebar mode={mode} variant={variant} />
      <div className="min-w-0 flex-1">
        {isFormLoading || (isDeadlineEnabled && isDeadlineLoading) ? (
          <SkeletonComponent />
        ) : (
          <fieldset
            disabled={isDisableField || isDeadlineUnavailable}
            className="m-0 min-w-0 border-0 p-0"
          >
            {currentStep === 'overview' ? (
              <EventFormStepOverview
                variant={variant}
                showParticipation={variant !== 'calendar'}
              />
            ) : OtherStepComponent ? (
              <OtherStepComponent />
            ) : null}
          </fieldset>
        )}
      </div>
    </div>
  );
}

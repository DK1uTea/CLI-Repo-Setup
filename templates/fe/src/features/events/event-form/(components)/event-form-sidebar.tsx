'use client';

import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeftIcon, CalendarIcon } from 'lucide-react';
import { useWatch } from 'react-hook-form';
import { useQueryState, parseAsString } from 'nuqs';
import { usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { dayjs } from '@/lib/date-utils';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { requestGuardedNavigation } from '@/shared/hooks/common/use-navigation-guard';
import { useEventDetailStore } from '@/features/events/(stores)/use-event-detail-store';
import { useSubmitCalendarEvent } from '@/features/calendar/calendar-event-form/(hooks)/use-submit-calendar-event';
import { useEventActions } from '../(hooks)/use-event-actions';
import { useEventOrderCancelGuard } from '../(hooks)/use-event-order-cancel-guard';
import { useEventOrderReactivateGuard } from '../(hooks)/use-event-order-reactivate-guard';
import { useCartChangedGuard } from '../(hooks)/use-cart-changed-guard';
import { useEventStepDetail } from '../(hooks)/use-event-step-detail';
import { getEventFormDetailStep } from '../(helpers)/event-form-helpers';
import { getEventMutationRefreshScope } from '../(helpers)/event-mutation-refresh';
import type { EventFormDto } from '../(helpers)/event-form-schema';
import { EVENT_FORM_CONFIG, type EventFormMode, type EventFormVariant } from '../(helpers)/event-form-config';
import { EventFormOrderChoiceDialog } from './event-form-order-choice-dialog';
import { EventFormCartChangedDialog } from './event-form-cart-changed-dialog';
import { EventFormSidebarInfoSkeleton } from './event-form-sidebar-info-skeleton';
import { EventFormVisibilityButton } from './event-form-visibility-button';

type Props = { mode: EventFormMode; variant?: EventFormVariant };

export function EventFormSidebar({ mode, variant = 'events' }: Props) {
  const t = useTranslations('eventForm');
  const locale = useLocale();
  const pathname = usePathname();
  const config = EVENT_FORM_CONFIG[variant];
  const steps = config.steps;
  const { currentStep, goToStep } = useEventActions({ steps });
  const isCalendarVariant = variant === 'calendar';
  const backLabel = isCalendarVariant ? t('backToCalendar') : t('backToEvents');
  const { submit: submitCalendarEvent, isPending: isPublishing } = useSubmitCalendarEvent();

  const [eventIdParam] = useQueryState('eventId', parseAsString);
  const [productSlug] = useQueryState('product', parseAsString);
  const refreshScope = getEventMutationRefreshScope(pathname, currentStep, productSlug);
  const shouldUseGeneralFallback = !isCalendarVariant && currentStep !== 'overview' && !!eventIdParam;
  const { data: eventDetail, isLoading: isEventDetailLoading } = useEventStepDetail(
    shouldUseGeneralFallback ? eventIdParam : '',
    shouldUseGeneralFallback ? getEventFormDetailStep(currentStep) : null,
  );
  const { cancelled: orderCancelled, setCancelled: setOrderCancelled } = useEventOrderCancelGuard(
    eventIdParam,
    !isCalendarVariant,
  );
  const {
    open: orderChoiceOpen,
    isPending: isReactivatingOrder,
    isCreatingOrder,
    stay: stayOnOrderChoice,
    confirmReactivate,
    confirmCreateOrder,
  } = useEventOrderReactivateGuard(
    eventIdParam,
    orderCancelled,
    () => setOrderCancelled(false),
    refreshScope,
  );
  const {
    open: cartChangedOpen,
    isPending: isCreatingOrderFromCartChange,
    leaveEvent: leaveEventFromCartChange,
    stay: stayOnCartChange,
    confirmCreateOrder: confirmCreateOrderFromCartChange,
  } = useCartChangedGuard(eventIdParam, !isCalendarVariant, refreshScope);

  const formTitle = useWatch<EventFormDto, 'title'>({ name: 'title' });
  const formEventId = useWatch<EventFormDto, 'customEventId'>({ name: 'customEventId' });
  const formStartDate = useWatch<EventFormDto, 'startDate'>({ name: 'startDate' });
  const formStartTime = useWatch<EventFormDto, 'startTime'>({ name: 'startTime' });
  const formEndDate = useWatch<EventFormDto, 'endDate'>({ name: 'endDate' });
  const formEndTime = useWatch<EventFormDto, 'endTime'>({ name: 'endTime' });

  const { canEdit, status: storedStatus } = useEventDetailStore();
  const general = shouldUseGeneralFallback ? eventDetail?.general : undefined;
  const title = formTitle || general?.name;
  const eventId = formEventId || general?.customEventId;
  const status = storedStatus || general?.status;
  const isSidebarInfoLoading = shouldUseGeneralFallback && isEventDetailLoading && !eventDetail;
  const isDisablePublic = isCalendarVariant && !!eventIdParam && !canEdit;

  const currentIndex = steps.indexOf(currentStep);
  const isCreateEventFlow = variant === 'events' && mode === 'create';
  const canNavigateToStep = (index: number) =>
    isCreateEventFlow ? index <= currentIndex : index === currentIndex || Boolean(eventIdParam);
  const navigateToStep = (step: typeof currentStep) => {
    if (step === currentStep) return;
    requestGuardedNavigation(() => goToStep(step));
  };

  const startDateTime = formStartDate
    ? `${formStartDate}T${formStartTime || '00:00'}`
    : general?.startTime;
  const formattedDate = startDateTime
    ? dayjs.utc(startDateTime).locale(locale).format('ddd, MMM D, YYYY, h:mm A')
    : null;
  const eventEndDateTime = formEndDate && formEndTime ? dayjs.utc(`${formEndDate}T${formEndTime}`) : null;
  const isExpired =
    status === 'ACTIVE' &&
    !!eventEndDateTime &&
    eventEndDateTime.valueOf() <= dayjs.utc().valueOf();

  return (
    <>
      {/* Mobile compact bar */}
      <div className="lg:hidden sticky top-0 z-20 -mx-6 px-6 bg-background pt-1.5 pb-3 border-b border-border">
        <div className='flex items-center gap-2 mb-3'>
          <Button
            variant="outline-primary"
            href={config.cancelHref}
            aria-label={backLabel}
            className="size-8"
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <p className="text-sm font-semibold">
            {mode === 'create' ? t('createEvent') : t('updateEvent')}
          </p>
        </div>
        <div className='flex items-center justify-between mb-3'>
          <div className='flex flex-col gap-1.5'>
            {isSidebarInfoLoading ? (
              <EventFormSidebarInfoSkeleton compact />
            ) : (
              <>
                <div className='flex items-center gap-2'>
                  {(status || (mode === 'update' && canEdit)) && (
                    <div className="flex flex-wrap gap-1.5">
                      {status && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded px-2 py-0.5 text-xs font-semibold border-transparent",
                            status === 'DRAFT'
                              ? "bg-slate-100 text-slate-600"
                              : isExpired
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                          )}
                        >
                          {status === 'DRAFT'
                            ? t('status.DRAFT')
                            : isExpired
                              ? t('status.EXPIRED')
                              : t('status.ACTIVE')}
                        </Badge>
                      )}
                      {mode === 'update' && canEdit && status !== 'DRAFT' && (
                        <Badge
                          variant="outline"
                          className="rounded px-2 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-800"
                        >
                          {t('status.editing')}
                        </Badge>
                      )}
                    </div>
                  )}
                  {formattedDate && (
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="text-sm font-semibold text-muted-foreground">{formattedDate}</span>
                    </div>
                  )}
                </div>
                <p className="break-all text-lg font-bold text-foreground" translate="no">
                  {title || t('eventNameLabel')}
                </p>
              </>
            )}
          </div>
          <div>
            {isCalendarVariant ? (
              <Button
                variant="outline-primary"
                type="button"
                className="w-full"
                isLoading={isPublishing}
                disabled={isDisablePublic}
                onClick={submitCalendarEvent}
              >
                {t('publicEvent')}
              </Button>
            ) : (
              <EventFormVisibilityButton className="w-full" />
            )}
          </div>
        </div>
        <div className="flex items-center justify-center gap-2">
          {steps.map((step, index) => {
            const isActive = step === currentStep;
            const isPast = index < currentIndex;
            const canNavigate = canNavigateToStep(index);
            return (
              <button
                key={step}
                type="button"
                disabled={!canNavigate}
                onClick={canNavigate ? () => navigateToStep(step) : undefined}
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  isActive || isPast ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                  !canNavigate && 'opacity-50 cursor-default',
                )}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop full sidebar */}
      <aside className="no-scroll hidden lg:flex sticky top-20 h-[calc(100dvh-64px)] w-1/4 shrink-0 flex-col overflow-y-auto _custom-scroll bg-background px-1 pb-28">
        <div className="flex items-center gap-3">
          <Button
            variant="outline-primary"
            href={config.cancelHref}
            aria-label={backLabel}
            className="size-10"
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <h1 className="text-[22px] font-semibold">
            {mode === 'create' ? t('createEvent') : t('updateEvent')}
          </h1>
        </div>

        <Card className="mt-4 md:mt-7 shrink-0">
          <CardContent>
            {isSidebarInfoLoading ? (
              <EventFormSidebarInfoSkeleton />
            ) : <>
              {(status || (mode === 'update' && canEdit)) && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {status && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded px-2 py-0.5 text-xs font-semibold border-transparent",
                      status === 'DRAFT'
                        ? "bg-slate-100 text-slate-600"
                        : isExpired
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                    )}
                  >
                    {status === 'DRAFT'
                      ? t('status.DRAFT')
                      : isExpired
                        ? t('status.EXPIRED')
                        : t('status.ACTIVE')}
                  </Badge>
                )}
                {mode === 'update' && canEdit && status !== 'DRAFT' && (
                  <Badge
                    variant="outline"
                    className="rounded px-2 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-800"
                  >
                    {t('status.editing')}
                  </Badge>
                )}
              </div>
            )}
            <p className="break-all text-lg font-bold text-foreground" translate="no">
              {title || t('eventNameLabel')}
            </p>

            {formattedDate && (
              <div className="mt-3 flex items-center gap-2">
                <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="text-sm font-semibold text-muted-foreground">{formattedDate}</span>
              </div>
            )}

            {eventId && (
              <p className="mt-3 text-sm font-semibold text-muted-foreground" translate="no">
                ID: {eventId}
              </p>
            )}
            </>}

            <div className="mt-11.5">
              {isCalendarVariant ? (
                <Button
                  variant="outline-primary"
                  type="button"
                  className="w-full"
                  isLoading={isPublishing}
                  disabled={isDisablePublic}
                  onClick={submitCalendarEvent}
                >
                  {t('publicEvent')}
                </Button>
              ) : (
                <EventFormVisibilityButton className="w-full" />
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-9">
          <p className="mb-3 text-base font-medium text-muted-foreground">
            {t('stepsLabel')}
          </p>
          <div className="space-y-2.5">
            {steps.map((step, index) => {
              const isActive = step === currentStep;
              const isPast = index < currentIndex;
              const canNavigate = canNavigateToStep(index);
              return (
                <Card
                  key={step}
                  data-testid={`event-form-step-${step}`}
                  role={canNavigate ? 'button' : undefined}
                  tabIndex={canNavigate ? 0 : undefined}
                  onClick={canNavigate ? () => navigateToStep(step) : undefined}
                  onKeyDown={canNavigate ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigateToStep(step);
                    }
                  } : undefined}
                  className={cn(
                    isActive ? 'bg-gray-100' : canNavigate ? 'hover:bg-light-gray cursor-pointer' : 'cursor-default opacity-50',
                    'py-3.5',
                  )}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col px-3 py-2">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                            isActive || isPast ? 'bg-primary text-primary-foreground' : 'bg-gray-400 text-white',
                          )}
                        >
                          {index + 1}
                        </span>
                        <p className={cn('text-sm font-semibold', !isActive && 'text-muted-foreground')}>
                          {t(`steps.${step}`)}
                        </p>
                      </div>
                      {isActive && (
                        <p className="pl-9 text-[13px] text-muted-foreground">
                          {t(`stepDescriptions.${step}`)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </aside>

      <EventFormOrderChoiceDialog
        open={orderChoiceOpen}
        onStay={stayOnOrderChoice}
        onReactivate={confirmReactivate}
        onCreateOrder={confirmCreateOrder}
        isPending={isReactivatingOrder}
        isCreatingOrder={isCreatingOrder}
      />

      <EventFormCartChangedDialog
        open={cartChangedOpen}
        onLeaveEvent={leaveEventFromCartChange}
        onStay={stayOnCartChange}
        onCreateOrder={confirmCreateOrderFromCartChange}
        isPending={isCreatingOrderFromCartChange}
      />
    </>
  );
}

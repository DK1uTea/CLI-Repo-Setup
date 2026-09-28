'use client';

import { useEffect } from 'react';
import { FormProvider } from 'react-hook-form';
import { useQueryState, parseAsString } from 'nuqs';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useRouter } from '@/i18n/navigation';
import { PageLoading } from '@/shared/components/common/page-loading';
import { useHasPermission } from '@/shared/stores/use-user-store';
import { PERMISSION_ALL_WILDCARD } from '@/shared/constants/permissions';
import { CalendarEventFormFooter } from '@/features/calendar/calendar-event-form/(components)/calendar-event-form-footer';
import { useCalendarEventForm } from '@/features/calendar/calendar-event-form/(hooks)/use-calendar-event-form';
import { useCalendarEventDetail } from '@/features/calendar/event-calendar-detail/(hooks)/use-calendar-event-detail';
import { mapCalendarEventDetailToForm } from '@/features/calendar/calendar-event-form/(helpers)/map-calendar-event-detail-to-form';
import type { CalendarEventFormDto } from '@/features/calendar/calendar-event-form/(helpers)/calendar-event-form-schema';
import { canEditCalendarEvent } from '@/features/calendar/(helpers)/can-edit-calendar-event';

function CalendarEventFormProvider({
  defaultValues,
  children,
}: {
  defaultValues?: Partial<CalendarEventFormDto>;
  children: React.ReactNode;
}) {
  const { methods } = useCalendarEventForm(defaultValues);

  return (
    <FormProvider {...methods}>
      <div className="-m-6 flex min-h-[calc(100dvh-64px)] flex-col">
        <div className="flex-1 p-6">{children}</div>
        <CalendarEventFormFooter />
      </div>
    </FormProvider>
  );
}

export default function CalendarEventLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('calendarEventDetail');
  const router = useRouter();
  const [eventId] = useQueryState('eventId', parseAsString);
  const { data: event, isLoading } = useCalendarEventDetail(eventId ?? '');
  const isCalendarAdmin = useHasPermission(PERMISSION_ALL_WILDCARD);
  const canEdit = canEditCalendarEvent(event, isCalendarAdmin);
  const isForbidden = !!eventId && !isLoading && !!event && !canEdit;

  useEffect(() => {
    if (isForbidden) {
      toast.error(t('editPermissionDenied', { name: event?.name ?? '' }));
      router.replace('/calendar-dashboard');
    }
  }, [isForbidden, event?.name, router, t]);

  // Don't mount the form until the real data is ready — mounting once with the
  // final values (instead of empty defaults + a later reset()) avoids child
  // fields (DateCard, LocationCard, ContactCard...) ever seeing a stale state.
  if (eventId && (isLoading || isForbidden)) return <PageLoading />;

  return (
    <CalendarEventFormProvider
      key={eventId ?? 'new'}
      defaultValues={event ? mapCalendarEventDetailToForm(event) : undefined}
    >
      {children}
    </CalendarEventFormProvider>
  );
}

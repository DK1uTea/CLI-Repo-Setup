import { dayjs } from '@/lib/date-utils';
import type { CalendarEventDetail } from '@/features/calendar/event-calendar-detail/(hooks)/use-calendar-event-detail';
import { mapEventImageUrlsToFiles } from '@/features/events/event-form/(helpers)/event-image-files';
import type { CalendarEventFormDto } from './calendar-event-form-schema';

// react-hook-form's reset() replaces the ENTIRE value set rather than merging —
// any field left out here would become `undefined`, breaking required array
// fields (e.g. useFieldArray on `contacts`). Always return the full shape.
export function mapCalendarEventDetailToForm(event: CalendarEventDetail): CalendarEventFormDto {
  const start = event.startTime ? dayjs.utc(event.startTime) : null;
  const end = event.endTime ? dayjs.utc(event.endTime) : null;

  return {
    customEventId: event.customEventId ?? '',
    title: event.name ?? '',
    mode: event.mode ?? '',
    targetAudience: event.targetAudience ?? [],
    eventTypeId: event.eventTypeId ?? '',
    doNotPublish: event.isPrivate ?? false,
    shortDescription: event.shortDescription ?? '',
    participation: '',
    link: event.link ?? '',
    images: mapEventImageUrlsToFiles(event.images),
    startDate: start?.format('YYYY-MM-DD') ?? '',
    startTime: start?.format('HH:mm') ?? '',
    endDate: end?.format('YYYY-MM-DD') ?? '',
    endTime: end?.format('HH:mm') ?? '',
    locationId: event.locationId ?? '',
    address: event.location?.name ?? '',
    street: event.location?.street ?? '',
    zipCode: event.location?.postalCode ?? '',
    city: event.location?.city ?? '',
    isSaveAddress: !!event.locationId,
    contactFirstName: event.adminContact?.firstName ?? '',
    contactLastName: event.adminContact?.lastName ?? '',
    contactEmail: event.adminContact?.email ?? '',
    contactPhone: event.adminContact?.phone ?? '',
    contacts: (event.otherContacts ?? []).map((c) => ({
      contactName: c.name ?? '',
      contactEmail: c.email ?? '',
      contactPhone: c.phone ?? '',
      role: c.role ?? '',
    })),
    partnershipTypes: event.partnershipTypes ?? [],
    productPartnerCategories: Array.isArray(event.productPartnerCategories)
      ? event.productPartnerCategories
      : [],
  };
}

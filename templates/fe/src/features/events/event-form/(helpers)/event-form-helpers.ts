import { dayjs } from '@/lib/date-utils';
import { type EventDetail, type EventStepDetailStep } from '../(hooks)/use-event-step-detail';
import { mapEventImageUrlsToFiles } from './event-image-files';
import type { StepName } from './event-form-schema';

const DETAIL_STEPS: readonly EventStepDetailStep[] = ['overview', 'logistics', 'helping_hand', 'summary'];

/** Product Catalog has no detail endpoint — reuse Helping Hands to read `general`. */
export function getEventFormDetailStep(step: string | null | undefined): EventStepDetailStep | null {
  if (step === 'product_catalog') return 'helping_hand';
  if (step && DETAIL_STEPS.includes(step as EventStepDetailStep)) return step as EventStepDetailStep;
  return null;
}

/** Steps that share the wizard's cart and can guard/finalize its order. */
export const CART_STEPS: readonly StepName[] = ['product_catalog', 'helping_hand', 'summary'];

export function getDefaultDates() {
  return {
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '00:00',
    setupStartDate: '',
    setupStartTime: '',
    setupEndDate: '',
    setupEndTime: '',
    teardownStartDate: '',
    teardownStartTime: '',
    teardownEndDate: '',
    teardownEndTime: '00:00',
  };
}

type LogisticsDateDefaultInput = {
  eventStartDate: string;
  eventEndDate: string;
};

export function getLogisticsDateDefaults({
  eventStartDate, eventEndDate,
}: LogisticsDateDefaultInput) {
  const eventStart = dayjs.utc(eventStartDate, 'YYYY-MM-DD', true);
  const eventEnd = dayjs.utc(eventEndDate, 'YYYY-MM-DD', true);
  if (!eventStart.isValid() || !eventEnd.isValid()) return null;

  const setupCandidate = eventStart.subtract(1, 'day');
  const setupEnd = setupCandidate.add(1, 'day');
  const teardownStart = eventEnd.add(1, 'day');
  const teardownEnd = teardownStart.add(1, 'day');

  return {
    setupStartDate: setupCandidate.format('YYYY-MM-DD'), setupStartTime: '00:00',
    setupEndDate: setupEnd.format('YYYY-MM-DD'), setupEndTime: '00:00',
    teardownStartDate: teardownStart.format('YYYY-MM-DD'), teardownStartTime: '00:00',
    teardownEndDate: teardownEnd.format('YYYY-MM-DD'), teardownEndTime: '00:00',
  };
}

export function getEventDatesFromDeadline(deadline: string) {
  const eventStart = dayjs.utc(deadline, 'YYYY-MM-DD', true);
  if (!eventStart.isValid()) return null;

  const eventEnd = eventStart.add(1, 'day');
  const logistics = getLogisticsDateDefaults({
    eventStartDate: eventStart.format('YYYY-MM-DD'),
    eventEndDate: eventEnd.format('YYYY-MM-DD'),
  });
  if (!logistics) return null;

  return {
    startDate: eventStart.format('YYYY-MM-DD'),
    startTime: '00:00',
    endDate: eventEnd.format('YYYY-MM-DD'),
    endTime: '00:00',
    ...logistics,
  };
}

export const isOverlapping = (
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
) => startA <= endB && endA >= startB;

/**
 * The backend sends `{}` (not `[]`) for an empty list on some endpoints, and `{}` is
 * truthy — so `(x || []).map(...)` throws and takes the whole wizard down. Every list
 * field read off a detail response goes through these two guards.
 */
const toArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const toUploadedFiles = mapEventImageUrlsToFiles;

export const mapDetailToFormValues = (data: Partial<EventDetail>) => {
  const values: any = {};

  if (typeof data.general?.isPrivate === 'boolean') {
    values.doNotPublish = data.general.isPrivate;
  }
  if (data.general?.eventTypeId) {
    values.eventTypeId = data.general.eventTypeId;
  }

  // 1. Overview Map
  if (data.overview) {
    const ov = data.overview;
    values.title = ov.title || '';
    values.mode = ov.mode || '';
    values.targetAudience = toArray(ov.targetAudience);
    values.customEventId = ov.customEventId || '';
    values.eventTypeId = ov.eventTypeId || '';
    values.shortDescription = ov.shortDescription || '';
    values.participation = ov.participation || '';
    values.link = ov.link || '';
    values.locationId = ov.locationId || '';
    values.doNotPublish = ov.isPrivate ?? false;
    values.partnershipTypes = toArray(ov.partnershipTypes);
    values.productPartnerCategories = toArray(ov.productPartnerCategories);

    if (ov.startDate) {
      values.startDate = dayjs.utc(ov.startDate).format('YYYY-MM-DD');
      values.startTime = dayjs.utc(ov.startDate).format('HH:mm');
    }
    if (ov.endDate) {
      values.endDate = dayjs.utc(ov.endDate).format('YYYY-MM-DD');
      values.endTime = dayjs.utc(ov.endDate).format('HH:mm');
    }

    if (ov.location) {
      values.address = ov.location.name || '';
      values.street = ov.location.street || '';
      values.zipCode = ov.location.postalCode || '';
      values.city = ov.location.city || '';
      values.isSaveAddress = !!ov.locationId;
    }

    if (ov.adminContact) {
      values.contactFirstName = ov.adminContact.firstName || '';
      values.contactLastName = ov.adminContact.lastName || '';
      values.contactEmail = ov.adminContact.email || '';
      values.contactPhone = ov.adminContact.phone || '';
    }

    values.contacts = toArray(ov.contacts);
    values.images = toUploadedFiles(ov.images);
  }

  // 2. Logistics Map
  if (data.logistics) {
    const log = data.logistics;
    values.wareHouseCode = log.wareHouseCode || '';
    values.logisticsContactName = log.contact?.name || '';
    values.logisticsContactEmail = log.contact?.email || '';
    values.logisticsContactPhone = log.contact?.phone || '';

    if (log.schedule?.setUp?.start) {
      values.setupStartDate = dayjs.utc(log.schedule.setUp.start).format('YYYY-MM-DD');
      values.setupStartTime = dayjs.utc(log.schedule.setUp.start).format('HH:mm');
    }
    if (log.schedule?.setUp?.end) {
      values.setupEndDate = dayjs.utc(log.schedule.setUp.end).format('YYYY-MM-DD');
      values.setupEndTime = dayjs.utc(log.schedule.setUp.end).format('HH:mm');
    }

    if (log.schedule?.teardown?.start) {
      values.teardownStartDate = dayjs.utc(log.schedule.teardown.start).format('YYYY-MM-DD');
      values.teardownStartTime = dayjs.utc(log.schedule.teardown.start).format('HH:mm');
    }
    if (log.schedule?.teardown?.end) {
      values.teardownEndDate = dayjs.utc(log.schedule.teardown.end).format('YYYY-MM-DD');
      values.teardownEndTime = dayjs.utc(log.schedule.teardown.end).format('HH:mm');
    }

    values.isDifferentDeliveryAddress = !!log.delivery;
    if (log.delivery) {
      values.deliveryLocations = [
        {
          eventLocation: log.locationId || '',
          deliveryAddress: log.delivery.name || '',
          deliveryStreet: log.delivery.street || '',
          deliveryZipCode: log.delivery.postalCode || '',
          deliveryCity: log.delivery.city || '',
          isGenerateAddress: log.isSaveAddress ?? false,
        },
      ];
    } else {
      values.deliveryLocations = [];
    }

    values.accessPermit = toUploadedFiles(log.accessPermit);
    values.certifications = toUploadedFiles(log.certifications);
    values.eventDocuments = toUploadedFiles(log.eventDocuments);
    values.venueLayouts = toUploadedFiles(log.venueLayouts);
    values.logisticComment = log.logisticComment || '';
  }

  // 3. Helping Hands Map
  if (data.helpingHands) {
    const hh = data.helpingHands;
    values.helpingHandComment = hh.helpingHandComment || '';
    values.assemblyPlanograms = toUploadedFiles(hh.assemblyPlanograms);
  }

  return values;
};

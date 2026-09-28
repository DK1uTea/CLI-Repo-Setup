'use client';

import { useQuery } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';

export type EventGeneralDetail = {
  id: string;
  name: string;
  startTime: string;
  status?: string;
  totalWeight?: number;
  isPrivate?: boolean;
  eventTypeId?: string;
  eventTypeName?: string;
  eventTypeSlug?: string;
  customEventId?: string;
};

export type EventOverviewDetail = {
  id: string;
  title: string;
  mode: string;
  targetAudience: string[];
  customEventId: string;
  eventTypeId: string;
  shortDescription: string;
  participation: string;
  link: string | null;
  images: string[];
  startDate: string;
  endDate: string;
  locationId: string | null;
  location: {
    name: string;
    street: string;
    postalCode: string;
    city: string;
    state: string;
    countryCode: string;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  adminContact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  } | null;
  isPrivate: boolean;
  isCalendarEvent: boolean;
  partnershipTypes: string[];
  productPartnerCategories: string[];
  contacts?: any[];
};

export type EventLogisticsDetail = {
  id: string;
  eventId: string;
  locationId: string | null;
  location: {
    name: string;
    street: string;
    postalCode: string;
    city: string;
    state: string;
    countryCode: string;
    latitude: number;
    longitude: number;
  } | null;
  contact: {
    name: string;
    email: string;
    phone: string;
  } | null;
  schedule: {
    setUp: {
      start: string;
      end: string;
    } | null;
    teardown: {
      start: string;
      end: string;
    } | null;
  } | null;
  wareHouseCode: string;
  warehouseName: string;
  venueLayouts: string[];
  accessPermit: string[];
  certifications: string[];
  eventDocuments: string[];
  logisticComment: string;
  delivery?: {
    name: string;
    street: string;
    city: string;
    postalCode: string;
  } | null;
  isSaveAddress?: boolean;
};

export type EventProductCatalogItem = {
  id: string;
  eventId: string;
  sku: string;
  name: string;
  thumbnail: string | null;
  productType: 'rental' | 'bundle' | 'purchase';
  price: number | null;
  quantity: number;
  rentalAvailableQuantity: number;
  totalQuantity: number;
  isRentEntirePeriod: boolean;
  wareHouseCode: string;
};

export type EventHelpingHandsDetail = {
  id: string;
  eventId: string;
  assemblyPlanograms: string[];
  helpingHandComment: string;
};

export type EventCostSummary = {
  equipmentRental: number;
  purchasedItems: number;
  services: number;
  transportCosts: number;
  pmCost: number;
  totalEventCost: number;
};

export type EventDetail = {
  general: EventGeneralDetail;
  overview?: EventOverviewDetail;
  logistics?: EventLogisticsDetail;
  productCatalog?: EventProductCatalogItem[];
  helpingHands?: EventHelpingHandsDetail;
  costSummary?: EventCostSummary;
  canEdit?: boolean;
  isOwner?: boolean;
  order?: {
    id: string;
    status: string;
  }
};

export type EventStepDetailStep = 'overview' | 'logistics' | 'helping_hand' | 'summary';

const mapFrontendStepToApiStep = (step: EventStepDetailStep): string => {
  if (step === 'helping_hand') return 'helping-hands';
  return step;
};

export const getEventStepDetail = async (
  eventId: string,
  step: EventStepDetailStep,
): Promise<EventDetail> => {
  const apiStep = mapFrontendStepToApiStep(step);
  const response = await apiProxy.get(`/etr/events/${eventId}/detail/${apiStep}`);
  return response.data.data as EventDetail;
};

export function useEventStepDetail(
  eventId: string,
  step: EventStepDetailStep | null,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['event-step-detail', eventId, step],
    queryFn: async (): Promise<EventDetail | null> => {
      if (!eventId || !step) return null;
      return getEventStepDetail(eventId, step);
    },
    enabled: !!eventId && !!step && (options?.enabled ?? true),
    staleTime: 0,
  });
}

export type FilterPreferenceScreen = 'EVENT_NAVIGATOR_LIST' | 'EVENT_NAVIGATOR_CALENDAR' | 'EVENT_CALENDAR_LIST';

export type CalendarViewKey = 'month' | 'week' | 'day';

export type SavedUserFilters = {
  timeFrame?: string;
  onlyMine?: boolean;
  status?: string;
  eventTypeId?: string;
  userId?: string;
  targetAudience?: string[];
  partnershipTypes?: string[];
  productPartnerCategories?: string[];
  startDate?: string;
  endDate?: string;
  limit?: string;
  view?: CalendarViewKey;
};

export const DEFAULT_SAVED_FILTERS: SavedUserFilters = {
  timeFrame: 'UPCOMING',
  onlyMine: true,
};

export const userFilterPreferenceKeys = {
  all: ['user-filter-preferences'] as const,
  screen: (screen: FilterPreferenceScreen) => [...userFilterPreferenceKeys.all, screen] as const,
};

const ARRAY_KEYS = ['targetAudience', 'partnershipTypes', 'productPartnerCategories'] as const;

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
  if (typeof value === 'string' && value) return value.split(',').filter(Boolean);
  return [];
}

export function normalizeSavedFilters(raw: unknown): SavedUserFilters {
  if (!raw || typeof raw !== 'object') return {};
  const data = raw as Record<string, unknown>;
  const result: SavedUserFilters = {};

  if (typeof data.timeFrame === 'string') result.timeFrame = data.timeFrame;
  if (typeof data.onlyMine === 'boolean') result.onlyMine = data.onlyMine;
  if (typeof data.status === 'string') result.status = data.status;
  if (typeof data.eventTypeId === 'string') result.eventTypeId = data.eventTypeId;
  if (typeof data.event_type === 'string') result.eventTypeId = data.event_type;
  if (typeof data.userId === 'string') result.userId = data.userId;
  if (typeof data.startDate === 'string') result.startDate = data.startDate;
  if (typeof data.start_date === 'string') result.startDate = data.start_date;
  if (typeof data.endDate === 'string') result.endDate = data.endDate;
  if (typeof data.end_date === 'string') result.endDate = data.end_date;
  if (typeof data.limit === 'string' || typeof data.limit === 'number') result.limit = String(data.limit);
  if (typeof data.take === 'string' || typeof data.take === 'number') result.limit = String(data.take);
  if (typeof data.my_event === 'string') result.onlyMine = data.my_event === 'true';
  if (data.view === 'month' || data.view === 'week' || data.view === 'day') result.view = data.view;

  for (const key of ARRAY_KEYS) {
    const value = data[key];
    if (value == null) continue;
    result[key] = toStringArray(value);
  }

  return result;
}

export function hasSavedFilters(filters: SavedUserFilters): boolean {
  return Object.keys(filters).length > 0;
}

type EventListUrlFilters = {
  status?: string | null;
  event_type?: string | null;
  timeFrame?: string | null;
  my_event?: string | null;
  userId?: string | null;
  targetAudience?: string | null;
  partnershipTypes?: string | null;
  productPartnerCategories?: string | null;
  limit?: string | null;
  start_date?: string | null;
  end_date?: string | null;
};

export function eventListUrlHasExplicitFilters(filters: EventListUrlFilters): boolean {
  return Boolean(
    filters.status
    || filters.event_type
    || (filters.timeFrame && filters.timeFrame !== 'UPCOMING')
    || (filters.my_event && filters.my_event !== 'true')
    || filters.userId
    || filters.targetAudience
    || filters.partnershipTypes
    || filters.productPartnerCategories
    || filters.limit
    || filters.start_date
    || filters.end_date,
  );
}

export function eventListUrlToSaved(filters: EventListUrlFilters): SavedUserFilters {
  return normalizeSavedFilters({
    timeFrame: filters.timeFrame ?? undefined,
    onlyMine: filters.my_event !== 'false',
    status: filters.status ?? undefined,
    event_type: filters.event_type ?? undefined,
    userId: filters.userId ?? undefined,
    targetAudience: filters.targetAudience ?? undefined,
    partnershipTypes: filters.partnershipTypes ?? undefined,
    productPartnerCategories: filters.productPartnerCategories ?? undefined,
    limit: filters.limit ?? undefined,
    start_date: filters.start_date ?? undefined,
    end_date: filters.end_date ?? undefined,
  });
}

export function savedToEventListUrl(saved: SavedUserFilters): EventListUrlFilters {
  return {
    timeFrame: saved.timeFrame ?? 'UPCOMING',
    my_event: saved.onlyMine === false ? 'false' : 'true',
    status: saved.status ?? null,
    event_type: saved.eventTypeId ?? null,
    userId: saved.userId ?? null,
    targetAudience: saved.targetAudience?.join(',') ?? null,
    partnershipTypes: saved.partnershipTypes?.join(',') ?? null,
    productPartnerCategories: saved.productPartnerCategories?.join(',') ?? null,
    limit: saved.limit ?? null,
    start_date: saved.startDate ?? null,
    end_date: saved.endDate ?? null,
  };
}

type CalendarListUrlFilters = {
  status?: string | null;
  eventTypeId?: string | null;
  timeFrame?: string | null;
  onlyMine?: boolean | null;
  userId?: string | null;
  targetAudience?: string[] | null;
  partnershipTypes?: string[] | null;
  productPartnerCategories?: string[] | null;
  take?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

export function calendarListUrlHasExplicitFilters(filters: CalendarListUrlFilters): boolean {
  return Boolean(
    filters.status
    || filters.eventTypeId
    || (filters.timeFrame && filters.timeFrame !== 'UPCOMING')
    || filters.onlyMine === false
    || filters.userId
    || filters.targetAudience?.length
    || filters.partnershipTypes?.length
    || filters.productPartnerCategories?.length
    || filters.take
    || filters.startDate
    || filters.endDate,
  );
}

export function calendarListUrlToSaved(filters: CalendarListUrlFilters): SavedUserFilters {
  return normalizeSavedFilters({
    timeFrame: filters.timeFrame ?? undefined,
    onlyMine: filters.onlyMine !== false,
    status: filters.status ?? undefined,
    eventTypeId: filters.eventTypeId ?? undefined,
    userId: filters.userId ?? undefined,
    targetAudience: filters.targetAudience ?? undefined,
    partnershipTypes: filters.partnershipTypes ?? undefined,
    productPartnerCategories: filters.productPartnerCategories ?? undefined,
    take: filters.take ?? undefined,
    startDate: filters.startDate ?? undefined,
    endDate: filters.endDate ?? undefined,
  });
}

export function savedToCalendarListUrl(saved: SavedUserFilters): CalendarListUrlFilters {
  return {
    timeFrame: saved.timeFrame ?? 'UPCOMING',
    onlyMine: saved.onlyMine !== false,
    status: saved.status ?? null,
    eventTypeId: saved.eventTypeId ?? null,
    userId: saved.userId ?? null,
    targetAudience: saved.targetAudience ?? null,
    partnershipTypes: saved.partnershipTypes ?? null,
    productPartnerCategories: saved.productPartnerCategories ?? null,
    take: saved.limit ?? null,
    startDate: saved.startDate ?? null,
    endDate: saved.endDate ?? null,
  };
}

/**
 * The calendar tab derives its query date range from `view` + FullCalendar's own
 * visible-range callback, not from a persisted startDate/endDate — those are only
 * ever a snapshot of whatever range happened to be on screen when Save was clicked,
 * so they are intentionally excluded here (unlike the list tab's mapping).
 */
export function eventCalendarUrlToSaved(filters: EventListUrlFilters, view: CalendarViewKey): SavedUserFilters {
  return normalizeSavedFilters({
    timeFrame: filters.timeFrame ?? undefined,
    onlyMine: filters.my_event !== 'false',
    status: filters.status ?? undefined,
    event_type: filters.event_type ?? undefined,
    userId: filters.userId ?? undefined,
    targetAudience: filters.targetAudience ?? undefined,
    partnershipTypes: filters.partnershipTypes ?? undefined,
    productPartnerCategories: filters.productPartnerCategories ?? undefined,
    limit: filters.limit ?? undefined,
    view,
  });
}

export function savedToEventCalendarUrl(saved: SavedUserFilters): { filters: EventListUrlFilters; view: CalendarViewKey } {
  return {
    filters: {
      timeFrame: saved.timeFrame ?? 'UPCOMING',
      my_event: saved.onlyMine === false ? 'false' : 'true',
      status: saved.status ?? null,
      event_type: saved.eventTypeId ?? null,
      userId: saved.userId ?? null,
      targetAudience: saved.targetAudience?.join(',') ?? null,
      partnershipTypes: saved.partnershipTypes?.join(',') ?? null,
      productPartnerCategories: saved.productPartnerCategories?.join(',') ?? null,
      limit: saved.limit ?? null,
      start_date: null,
      end_date: null,
    },
    view: saved.view ?? 'month',
  };
}

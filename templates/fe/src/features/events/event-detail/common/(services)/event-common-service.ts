export type EventCommonNamespace = 'eventDetail' | 'calendarEventDetail';

export type EventCommonCreatedBy = { avatar?: string; name?: string };

export type EventCommonLocation = {
  name?: string;
  street?: string;
  postalCode?: string;
  city?: string;
  state?: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
};

export type EventCommonLogisticsWindow = { start?: string; end?: string };
export type EventCommonLogisticsContact = { name?: string; email?: string; phone?: string };

export type EventCommonLogistics = {
  setup?: EventCommonLogisticsWindow;
  teardown?: EventCommonLogisticsWindow;
  contact?: EventCommonLogisticsContact;
  warehouse?: string;
  warehouseName?: string;
};

export type EventCommonProduct = {
  name: string;
  price: number;
  thumbnail?: string;
  quantity: number;
};

export type EventCommonAdminContact = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
};

export type EventCommonOtherContact = {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
};

export type EventCommonDetail = {
  id: string;
  name: string;
  createdAt: string;
  createdBy?: EventCommonCreatedBy;
  shortDescription?: string;
  startTime: string;
  endTime: string;
  partnershipTypes?: string[];
  productPartnerCategories?: string[];
  isPrivate?: boolean;
  location?: EventCommonLocation;
  logistics?: EventCommonLogistics;
  productCatalog?: EventCommonProduct[];
  canEdit?: boolean;
  isOwner?: boolean;
  customEventId?: string;
  mode?: string;
  targetAudience?: string[];
  eventTypeId?: string;
  link?: string | null;
  images?: string[];
  locationId?: string | null;
  adminContact?: EventCommonAdminContact;
  otherContacts?: EventCommonOtherContact[];
  orderId?: string | null;
  orderStatus?: string | null;
  order?: { id?: string | null; status?: string | null } | null;
};

export type EventCommentAuthor = { id: string; name: string; avatar?: string | null };

export type EventComment = {
  id: string;
  content: string;
  createdAt: string;
  createdBy?: EventCommentAuthor | null;
  children?: EventComment[];
};

export type EventTaskService = 'AUFBAU' | 'ABBAU' | 'DEFEKT' | 'OTHER';
export type EventTaskAuthor = { id: string; name?: string; avatar?: string | null };

export type EventTask = {
  id: string;
  eventId: string;
  service: EventTaskService;
  comment?: string;
  files?: string[];
  createdBy?: EventTaskAuthor | null;
  createdAt: string;
  canDelete?: boolean;
};

export type OwnershipTransferCandidate = { id: string; name: string; email: string };

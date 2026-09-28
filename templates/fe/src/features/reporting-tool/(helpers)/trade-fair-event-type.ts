type TradeFairEventStatus = "PUBLISHED" | "DRAFT" | "CANCELLED";
type TradeFairEventMode = "FACE_TO_FACE" | "HYBRID" | "ONLINE";
type TradeFairLocationStatus = "ACTIVE" | "INACTIVE";

type TradeFairEventLocation = {
  id: string;
  locationName: string;
  street: string;
  city: string;
  postcode: string;
  state: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  status: TradeFairLocationStatus;
  userId: string;
  country: string;
}

type TradeFairEventAttachment = {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

type UserStatus = "ACTIVE" | "INVITED";

export type AssignTeamUserRole = "PROMOTER" | "SALES_REP" | "ADMIN";

export type Survey = {
  id: string;
  name: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string | Record<string, never>;
  updatedAt?: string | Record<string, never>;
  totalQuestions?: number;
  description?: string;
  status?: "ACTIVE" | "INACTIVE";
  canEdit: boolean;
}

export type EventSurvey = {
  id: string;
  eventSurveyId: string;
  name: string;
  description: string;
  totalQuestions?: number;
  assignmentCount: number;
  assignments: {
    id: string;
    userId: string;
    role: AssignTeamUserRole;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  }[];
  requiredLogin: boolean;
  canEdit: boolean;
}

export type TradeFairEvent = {
  id: string;
  name: string;
  description: string;
  type: string;
  leadTarget: number;
  startDate: string;           // ISO 8601 date string
  endDate: string;             // ISO 8601 date string
  status: TradeFairEventStatus;
  createdBy?: string;          // User UUID
  updatedBy?: string;          // User UUID
  createdAt?: string;          // ISO 8601 date string
  updatedAt?: string;          // ISO 8601 date string
  locationId?: string;
  location: TradeFairEventLocation;
  attachments: TradeFairEventAttachment[];
  mode: TradeFairEventMode;
  eventCode: string;
  targetAudience: string;
  participation?: string;      // Optional — not present on all events
  surveys?: EventSurvey[];
}

export type UserEventSurvey = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AssignTeamUserRole;
  status: UserStatus;
  createdAt: string;
  assignmentId: string;
};

export type InviteLink = {
  id: string;
  token: string;
  role: AssignTeamUserRole;
  eventSurveyId: string;
  usedCount: number;
  maxUses: number;
  status: string;
  createdAt: string | Record<string, never>;
  updatedAt?: string;
};

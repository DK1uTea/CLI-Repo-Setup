export type ActivityActor = {
  id: string;
  name: string;
};

export type ActivityLead = {
  company: string;
  fullName: string;
  email: string | null;
};

export type ActivitySurvey = {
  id: string;
  name: string;
};

export type RecentActivityType =
  | "ANSWER_UPDATED"
  | "LEAD_UPDATED"
  | "ANSWER_SUBMITTED"
  | "LEAD_CREATED";

export type RecentActivity = {
  id: string;
  type: RecentActivityType;
  createdAt: string;
  metadata: string | Record<string, unknown> | null;
  actor: ActivityActor;
  lead: ActivityLead | null;
  survey: ActivitySurvey;
};

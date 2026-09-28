import { Lead } from "./trade-fair-lead-type";

export type AnswerStatus = 'COMPLETED' | 'IN_PROGRESS' | 'DRAFT';

export type FormFieldValue = string | string[];

export type FormSection = Record<string, FormFieldValue>;

export type FormData = Record<string, FormSection>;

/**
 * Lead shape as embedded inside Answer —
 * createdAt/updatedAt may be unpopulated (empty object) in this context
 */
export type AnswerLead = Omit<Lead, 'createdAt' | 'updatedAt'> & {
  createdAt: string | Record<string, never>;
  updatedAt: string | Record<string, never>;
};

export type AnswerUser = {
  email: string;
  firstName: string;
  lastName: string;
}

export type Answer = {
  id: string;
  status: AnswerStatus;
  createdAt: string;
  updatedAt: string;
  lead: {
    id: string;
    email: string;
    fullName: string;
    firstName?: string;
    lastName?: string;
  };
  survey: {
    id?: string;
    name: string;
  };
  user: AnswerUser | null;
}

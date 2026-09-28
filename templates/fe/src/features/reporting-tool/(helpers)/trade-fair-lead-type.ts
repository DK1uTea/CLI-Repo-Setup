export type LeadStatus = 'NEW' | 'EXISTED';

export type LeadSource = 'manual' | 'import' | 'api';

export type Lead = {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  zipCode: string | number;
  city: string;
  status: LeadStatus;
  source: LeadSource;
  eventId?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  // Optional fields
  salutation?: string;
  function?: string;
  externalId?: string;
}
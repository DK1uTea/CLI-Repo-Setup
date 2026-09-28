import type { SelectFloatOption } from '@/shared/components/ui/select-float';

export const EVENT_MODE_OPTIONS: SelectFloatOption[] = [
  { value: 'FACE_TO_FACE', label: 'Face to Face' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'ONLINE', label: 'Online' },
];

export const TARGET_AUDIENCE_OPTIONS: SelectFloatOption[] = [
  { value: 'AT_WORK_AND_INSTITUTION', label: 'At work & Institution' },
  { value: 'CONSUMER', label: 'Consumer' },
  { value: 'GASTRONOMIE_HOTELLERIE', label: 'Gastronomie / Hotellerie' },
  { value: 'GFGH_GFM', label: 'GFGH / GFM' },
  { value: 'HANDEL', label: 'Handel' },
  { value: 'LEISURE_AND_ENTERTAINMENT', label: 'Leisure & Entertainment' },
  { value: 'MITARBEITENDE', label: 'Mitarbeitende' },
  { value: 'ON_THE_GO', label: 'On The Go' },
  { value: 'PETROL', label: 'Petrol' },
  { value: 'PRESSE', label: 'Presse' },
  { value: 'STAKEHOLDER', label: 'Stakeholder' },
];

export const PARTICIPATION_OPTIONS = [
  { value: 'NOT_POSSIBLE', labelKey: 'not_possible' },
  { value: 'PERSONAL_INVITATION', labelKey: 'personal_invitation' },
  { value: 'TICKET_ALLOCATION', labelKey: 'ticket_allocation' },
] as const;

export const EVENT_CONTACT_ROLES = [
  'ADMIN',
  'ORGANIZER',
  'CATERING',
  'MANAGEMENT',
  'ELECTRICIAN',
  'TECHNICIAN',
  'SERVICE_LEAD',
] as const;

export type EventContactRole = (typeof EVENT_CONTACT_ROLES)[number];

export const PDF_UPLOAD_ACCEPT: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
};

export const IMAGE_AND_PDF_UPLOAD_ACCEPT: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/heif': ['.heif'],
  'image/heic': ['.heic'],
  'image/gif': ['.gif'],
  ...PDF_UPLOAD_ACCEPT,
};

const PERMANENT_LOAN_SLUGS = new Set([
  'permanent-loan',
  'performance-load',
]);

const PERMANENT_LOAN_NAMES = new Set([
  'permanent loan',
  'performance load',
  'permance load',
]);

export function isPermanentLoanEventType(
  type?: { slug?: string | null; name?: string | null } | null,
) {
  if (!type) return false;
  const slug = type.slug?.trim().toLowerCase();
  const name = type.name?.trim().toLowerCase();
  return (!!slug && PERMANENT_LOAN_SLUGS.has(slug)) || (!!name && PERMANENT_LOAN_NAMES.has(name));
}

export function isDauerleihgabeEventType(
  type?: { slug?: string | null; name?: string | null } | null,
) {
  if (!type) return false;
  const slug = type.slug?.trim().toLowerCase();
  const name = type.name?.trim().toLowerCase();
  return slug === 'dauerleihgabe' || name === 'dauerleihgabe';
}

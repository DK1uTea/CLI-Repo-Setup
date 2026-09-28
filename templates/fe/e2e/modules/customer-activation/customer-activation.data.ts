import type { Page } from '@playwright/test';

import { primaryCredentials } from '../../shared/session';

export type CamRole = 'admin' | 'sale' | 'installer' | 'agency';

type Credentials = { email: string; password: string };

const ROLE_ENV = {
  sale: ['E2E_CAM_SALE_EMAIL', 'E2E_CAM_SALE_PASSWORD'],
  installer: ['E2E_CAM_INSTALLER_EMAIL', 'E2E_CAM_INSTALLER_PASSWORD'],
  agency: ['E2E_CAM_AGENCY_EMAIL', 'E2E_CAM_AGENCY_PASSWORD'],
} as const;

export function camCredentials(role: CamRole): Credentials | null {
  if (role === 'admin') return primaryCredentials();

  const [emailKey, passwordKey] = ROLE_ENV[role];
  const email = process.env[emailKey];
  const password = process.env[passwordKey];
  return email && password ? { email, password } : null;
}

export function secondarySaleCredentials(): Credentials | null {
  const credentialPairs = [
    ['E2E_CAM_SALE_B_EMAIL', 'E2E_CAM_SALE_B_PASSWORD'],
    ['E2E_CAM_SALE_2_EMAIL', 'E2E_CAM_SALE_2_PASSWORD'],
  ] as const;

  for (const [emailKey, passwordKey] of credentialPairs) {
    const email = process.env[emailKey];
    const password = process.env[passwordKey];
    if (email && password) return { email, password };
  }

  return null;
}

/**
 * The catch-all `/api/[...path]` proxy only forwards an `Authorization` header the
 * incoming request already carried — it never reads the `accessToken` cookie itself
 * (see `src/app/api/[...path]/route.ts`). The browser's own axios client attaches that
 * header on every call, but a raw `page.request.get('/api/cam/...')` bypasses it
 * entirely and gets a real 401 from the backend. Spread this into every such call.
 */
export async function authHeaders(page: Page): Promise<Record<string, string>> {
  const cookies = await page.context().cookies();
  const token = cookies.find((cookie) => cookie.name === 'accessToken')?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const CAM_ROUTES = {
  main: '/customer-activation',
  create: '/customer-activation/new-activation',
  update: '/customer-activation/update-activation',
  detail: (id: string) => `/customer-activation/${id}`,
  store: (id: string) => `/customer-activation/store/${id}`,
} as const;

export const COPY = {
  pageHeading: 'Meine Aktivierungen',
  sidebar: 'Kundenaktivierung',
  newActivation: 'Neue Aktivierung',
  adminTabs: ['Dashboard', 'Intake Board', 'Stores'],
  formTabs: ['Vorhandener Store', 'Neuer Store'],
  formTitle: 'Neue Aktivierung',
  storeStep: 'Store auswählen',
  briefingStep: 'Briefing-Fragen ausfüllen',
  cancel: 'Abbrechen',
  addStore: 'Neuen Store hinzufügen',
  backToList: 'Zurück zur Liste',
  editStore: 'Store bearbeiten',
  submitActivation: 'Aktivierung einreichen',
  storeFields: {
    name: 'Store-Name',
    address: 'Adresse',
    contact: 'Ansprechpartner',
    phone: 'Telefon',
    email: 'E-Mail',
  },
  detailTabs: {
    overview: 'Überblick',
    briefing: 'Briefing Zusammenfassung',
    scoring: 'Bewertung',
    activity: 'Aktivität',
    communication: 'Kommunikation',
  },
  boardColumns: ['Entwürfe', 'Bereit', 'Überprüfung', 'Klärung', 'Genehmigt', 'In Bearbeitung', 'Installation', 'Abgeschlossen'],
  emptyStores: 'Keine Stores gefunden',
  noCases: 'Keine Fälle gefunden',
  noCasesDescription: 'Versuchen Sie, Ihre Suche oder Filter anzupassen.',
  notificationTitle: 'Benachrichtigungen',
  searchCase: 'Fälle suchen...',
  roleBoardSearch: 'Fall suchen...',
  searchStore: 'Store oder Inhabername suchen...',
  activationName: 'Aktivierungsname',
  approve: 'Genehmigen',
  maintenanceTitle: 'Dieser Bereich ist vorübergehend nicht verfügbar',
  outletNotesPlaceholder: 'Details zu den Outlets eingeben...',
  chatAttachment: 'Anhänge auswählen',
  chatComment: 'Kommentar hinzufügen...',
} as const;

export const EN_COPY = {
  pageHeading: 'My activations',
  sidebar: 'Customer Activation',
  newActivation: 'New Activation',
  adminTabs: ['Dashboard', 'Intake Board', 'Stores'],
  formTabs: ['Existing store', 'New store'],
  formTitle: 'New activation',
  storeStep: 'Choose store',
  briefingStep: 'Fill in briefing questions',
  cancel: 'Cancel',
  addStore: 'Add new store',
  backToList: 'Back to list',
  editStore: 'Edit store',
  submitActivation: 'Submit activation',
  storeFields: { name: 'Store name', address: 'Address', contact: 'Contact name', phone: 'Phone', email: 'Email' },
  detailTabs: { overview: 'Overview', briefing: 'Briefing Summary', scoring: 'Scoring', activity: 'Activity', communication: 'Communication' },
  boardColumns: ['Draft', 'Ready', 'Review', 'Clarify', 'Approved', 'In Progress', 'Installation', 'Completed'],
  emptyStores: 'No stores found',
  noCases: 'No cases found',
  noCasesDescription: 'Try adjusting your search or filters.',
  notificationTitle: 'Notifications',
  searchCase: 'Search cases...',
  roleBoardSearch: 'Search case...',
  searchStore: 'Search store or owner name...',
  activationName: 'Activation name',
  approve: 'Approve',
  maintenanceTitle: 'This section is temporarily unavailable',
  outletNotesPlaceholder: 'Enter details about outlets...',
  chatAttachment: 'Select attachments',
  chatComment: 'Add a comment...',
} as const;

export type CamLocale = 'de' | 'en';
export type CamCopy = typeof COPY | typeof EN_COPY;

export function pageLocale(page: Page): CamLocale {
  return new URL(page.url()).pathname.split('/')[1] === 'en' ? 'en' : 'de';
}

export function localizedCamPath(page: Page, path: string) {
  return `/${pageLocale(page)}${path.startsWith('/') ? path : `/${path}`}`;
}

export function camCopy(page: Page): CamCopy {
  return pageLocale(page) === 'en' ? EN_COPY : COPY;
}

/**
 * Required-briefing option labels for step 2 — these are real backend-seeded option
 * values, not translated by locale: confirmed live (2026-07-31) that they render in
 * English regardless of the active German/English UI locale.
 */
export const REQUIRED_CHOICES = {
  responsible: 'Eifert, Kirstin',
  outlets: '1x Outlet',
  highTrafficZone: 'Train station',
  targetGroup: 'Teenagers',
  salesConcept: 'Take-away (to go)',
  contractSituation: 'No contract',
  revenuePotential: 'New customer acquisition',
  ahMarket: 'Entrance area',
  hMarket: 'Refrigerator',
  brandFit: 'Standard',
  profitability: 'Below the dashboard framework (< 100%)',
} as const;

export const CAM_STATUSES = [
  'DRAFT',
  'READY',
  'REVIEW',
  'CLARIFICATION',
  'APPROVED',
  'IN_PROGRESS',
  'INSTALLATION',
  'COMPLETED',
  'CANCELLED',
] as const;

export type CamStatus = (typeof CAM_STATUSES)[number];

export const mutationFixturesEnabled = () =>
  process.env.E2E_CAM_ALLOW_MUTATIONS === 'true';

export const destructiveFixtureReason =
  'Set E2E_CAM_ALLOW_MUTATIONS=true only after provisioning resettable CAM records and cleanup.';

export function uniqueActivationName() {
  return `E2E Activation ${Date.now()}`;
}

import type { Page } from '@playwright/test';
import { primaryCredentials } from '../../shared/session';

/**
 * Test data for the reporting-tool (Trade Fair) module. Every spec here hits the real
 * backend — see `.claude/skills/e2e-module-testing/SKILL.md`.
 */

/**
 * The primary E2E account (`primaryCredentials()`) already carries both
 * `ReportingTool.Management` and `ReportingTool.Manager` — confirmed live (2026-07-31):
 * its sidebar shows the reporting-tool entry and `/reporting-tool` resolves to the
 * workspace, not the forbidden view. No dedicated reporting-tool account is needed for
 * the permitted path.
 */
export function permittedCredentials() {
  return primaryCredentials();
}

/**
 * `E2E_CAM_SALE_EMAIL`/`E2E_CAM_SALE_PASSWORD` (a CAM-only role account) has neither
 * `ReportingTool.Management` nor `ReportingTool.Manager` — confirmed live (2026-07-31):
 * visiting `/reporting-tool` renders the shared `ForbiddenView`.
 * Reused here rather than provisioning a second dedicated account.
 *
 * This account's real, stored `preferredLanguage` has been observed reverting to `en`
 * between sessions (cause unknown — not reproduced from any reporting-tool code path).
 * Every spec using it must tolerate either locale rather than assert German copy, or
 * re-assert the locale first.
 */
export function deniedCredentials() {
  const email = process.env.E2E_CAM_SALE_EMAIL;
  const password = process.env.E2E_CAM_SALE_PASSWORD;
  return email && password ? { email, password } : null;
}

export type ReportingToolLocale = 'de' | 'en';

export const QA_EVENT_FIXTURE_ID = 'cmok1sjg70029ms0s4zj1ertj';

export const TF_ROUTES = {
  root: '/reporting-tool',
  selectEvent: '/reporting-tool/select-event',
  newEvent: '/reporting-tool/new-event',
  updateEvent: (id: string) => `/reporting-tool/update-event?id=${id}`,
  newSurvey: (eventId: string) => `/reporting-tool/new-survey?eventId=${eventId}`,
  newSurveyTemplate: '/reporting-tool/new-survey',
  updateSurvey: (id: string) => `/reporting-tool/update-survey?id=${id}`,
  workspace: (eventId: string, tab?: string) =>
    `/reporting-tool?eventId=${eventId}${tab ? `&tab=${tab}` : ''}`,
  eventDetail: '/reporting-tool/event-detail',
  report: '/reporting-tool/report',
  lead: '/reporting-tool/lead',
  recentActivity: (eventId: string) => `/reporting-tool/recent-activity?eventId=${eventId}`,
} as const;

export const TAB_PARAMS = {
  dashboard: 'dashboard',
  surveyBuilder: 'survey-builder',
  reports: 'reports',
  leads: 'leads',
  analytics: 'analytics',
} as const;

/** Visible copy for both supported locales, matching `src/messages/{de,en}.json`. */
export const COPY = {
  de: {
    sidebarLabel: 'Event-Berichtstool',
    selectEvent: { heading: 'Umfragen', searchPlaceholder: 'Events suchen...', createEvent: 'Event erstellen', viewDetails: 'Details ansehen', noEvents: 'Keine Events gefunden' },
    workspace: { tabs: { dashboard: 'Dashboard', surveyBuilder: 'Umfrage-Editor', reports: 'Antworten', leads: 'Leads', analytics: 'Analytik' }, headings: { dashboard: 'Veranstaltungsübersicht', surveyBuilder: 'Umfrage-Builder', reports: 'Antwortübersicht', leads: 'Leads', recentActivity: 'Letzte Aktivitäten' }, stats: { totalLeads: 'Kontakte gesamt', leadsToday: 'Kontakte heute', leadsLastMonth: 'Kontakte letzten Monat', activeUsers: 'Aktive Benutzer' }, activities: { title: 'Letzte Aktivitäten', seeAll: 'Alle anzeigen', noDataTitle: 'Keine letzten Aktivitäten', noDataDescription: 'Keine Aktivitäten gefunden' }, emptyStates: { analyticsLeadsByDays: 'Keine Leads nach Tagen gefunden' }, editEvent: 'Veranstaltung bearbeiten', changeEvent: 'Event ändern', deleteEvent: 'Event löschen', createEventLink: 'Event erstellen' },
    reports: { searchPlaceholder: 'Bericht suchen...', export: 'Exportieren', emptyState: 'Keine Antworten gefunden.', table: { lead: 'Lead', survey: 'Umfrage', status: 'Status', date: 'Datum', user: 'Benutzer' }, status: { all: 'Alle', DRAFT: 'Entwurf', IN_PROGRESS: 'In Bearbeitung', COMPLETED: 'Abgeschlossen' }, sort: { newest: 'Neueste', oldest: 'Älteste' }, edit: 'Bericht bearbeiten', delete: 'Bericht löschen' },
    leads: { searchPlaceholder: 'Lead suchen...', export: 'Exportieren', emptyState: 'Keine Leads gefunden.', table: { lead: 'Lead', company: 'Unternehmen', address: 'Adresse', phoneNumber: 'Telefonnummer', email: 'E-Mail' }, status: { all: 'Alle', NEW: 'Neu', EXISTED: 'Bestehend' }, sort: { newest: 'Neueste', oldest: 'Älteste', companyAsc: 'Unternehmen (A-Z)', companyDesc: 'Unternehmen (Z-A)', nameAsc: 'Name (A-Z)', nameDesc: 'Name (Z-A)' } },
    assignTeam: { addUser: 'Benutzer hinzufügen', submitUser: 'Benutzer hinzufügen', assignUsers: 'Benutzer zuweisen', shareInviteLink: 'Link teilen', importUsers: 'Benutzer importieren', noDataAvailable: 'Keine Daten verfügbar', firstName: 'Vorname', lastName: 'Nachname', email: 'E-Mail', salesRep: 'Sales Rep', remove: 'Entfernen' },
    forbidden: { title: 'Zugriff verweigert' },
    eventWizard: { createHeading: 'Veranstaltung erstellen', updateHeading: 'Event aktualisieren', fields: { title: 'Veranstaltungstitel', mode: 'Veranstaltungsmodus', audience: 'Zielgruppe', eventId: 'Event-ID', type: 'Veranstaltungstyp', descriptionPlaceholder: 'Bitte fügen Sie eine kurze Beschreibung des Events hinzu.', participation: 'Teilnahme', venueName: 'Veranstaltungsort', street: 'Adresse', zipCode: 'Postleitzahl', city: 'Stadt' }, actions: { saveAsDraft: 'Als Entwurf speichern', saveAndLaunch: 'Speichern & starten', nextStep: 'Nächster Schritt', back: 'Zurück' } },
    surveyBuilder: { title: 'Umfragen', onThisEvent: 'Bei dieser Veranstaltung', surveyLibrary: 'Umfragebibliothek', createNewSurvey: 'Neue Umfrage erstellen', assignUsers: 'Benutzer zuweisen', addToEvent: 'Zur Veranstaltung hinzufügen', unassignSurvey: 'Umfrage entfernen' },
    survey: { heading: 'Neue Umfrage', saveSurvey: 'Umfrage speichern', preview: 'Vorschau', surveyNamePlaceholder: 'Umfragename eingeben...', noSurveys: 'Keine Umfragen in diesem Event' },
  },
  en: {
    sidebarLabel: 'Event Reporting Tool',
    selectEvent: { heading: 'Surveys', searchPlaceholder: 'Search events...', createEvent: 'Create event', viewDetails: 'View details', noEvents: 'No events found' },
    workspace: { tabs: { dashboard: 'Dashboard', surveyBuilder: 'Survey Builder', reports: 'Answers', leads: 'Leads', analytics: 'Analytics' }, headings: { dashboard: 'Event Overview', surveyBuilder: 'Survey builder', reports: 'Answers overview', leads: 'Leads', recentActivity: 'Recent Activities' }, stats: { totalLeads: 'Total leads', leadsToday: 'Leads today', leadsLastMonth: 'Leads last month', activeUsers: 'Active users' }, activities: { title: 'Recent activities', seeAll: 'See all', noDataTitle: 'No recent activities', noDataDescription: 'No activities found' }, emptyStates: { analyticsLeadsByDays: 'No leads by days found' }, editEvent: 'Edit Event', changeEvent: 'Change event', deleteEvent: 'Delete event', createEventLink: 'Create event' },
    reports: { searchPlaceholder: 'Search reports...', export: 'Export', emptyState: 'No answers found.', table: { lead: 'Lead', survey: 'Survey', status: 'Status', date: 'Date', user: 'User' }, status: { all: 'All', DRAFT: 'Draft', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed' }, sort: { newest: 'Newest', oldest: 'Oldest' }, edit: 'Edit answer', delete: 'Delete answer' },
    leads: { searchPlaceholder: 'Search leads...', export: 'Export', emptyState: 'No leads found.', table: { lead: 'Lead', company: 'Company', address: 'Address', phoneNumber: 'Phone Number', email: 'Email' }, status: { all: 'All', NEW: 'New', EXISTED: 'Existed' }, sort: { newest: 'Newest', oldest: 'Oldest', companyAsc: 'Company (A-Z)', companyDesc: 'Company (Z-A)', nameAsc: 'Name (A-Z)', nameDesc: 'Name (Z-A)' } },
    assignTeam: { addUser: 'Add user', submitUser: 'Add user', assignUsers: 'Assign users', shareInviteLink: 'Share link', importUsers: 'Import users', noDataAvailable: 'No data available', firstName: 'First name', lastName: 'Last name', email: 'Email', salesRep: 'Sales Rep', remove: 'Remove' },
    forbidden: { title: 'Access Denied' },
    eventWizard: { createHeading: 'Create event', updateHeading: 'Update event', fields: { title: 'Event title', mode: 'Event mode', audience: 'Target Audience', eventId: 'Event ID', type: 'Event type', descriptionPlaceholder: 'Please add a short description of the event.', participation: 'Participation', venueName: 'Venue Name', street: 'Street', zipCode: 'Postal Code', city: 'City' }, actions: { saveAsDraft: 'Save as draft', saveAndLaunch: 'Save & Launch', nextStep: 'Next step', back: 'Previous' } },
    surveyBuilder: { title: 'Surveys', onThisEvent: 'On this event', surveyLibrary: 'Survey library', createNewSurvey: 'Create new survey', assignUsers: 'Assign users', addToEvent: 'Add to event', unassignSurvey: 'Unassign survey' },
    survey: { heading: 'Create survey', saveSurvey: 'Save Survey', preview: 'Preview', surveyNamePlaceholder: 'Enter survey name...', noSurveys: 'No surveys on this event' },
  },
} as const;

export type ReportingToolCopy = (typeof COPY)[ReportingToolLocale];
export type ReportingToolTab = keyof typeof COPY.de.workspace.tabs;

export function pageLocale(page: Page): ReportingToolLocale {
  const segment = new URL(page.url()).pathname.split('/').filter(Boolean)[0];
  return segment === 'en' ? 'en' : 'de';
}

export function localizedRoute(page: Page, path: string) {
  return `/${pageLocale(page)}${path}`;
}

/** A unique fixture for a single create journey. Cleanup: delete via the workspace's own "Event löschen" action. */
export function uniqueEventFixture() {
  const stamp = Date.now().toString().slice(-8);
  return {
    title: `TF E2E Event ${stamp}`,
    description: `Automated reporting-tool E2E test event created ${new Date().toISOString()}.`,
  };
}

export function uniqueSurveyFixture() {
  return `TF E2E Survey ${Date.now().toString().slice(-8)}`;
}

/** Event wizard mutations need a disposable QA event fixture, not shared production data. */
export function eventWizardMutationEnabled() {
  return process.env.E2E_TF_EVENT_MUTATIONS === 'true';
}

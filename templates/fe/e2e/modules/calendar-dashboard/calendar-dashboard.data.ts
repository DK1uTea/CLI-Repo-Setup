/**
 * calendar-dashboard (Event-Katalog) — visible copy, German (`de.json`), read from the
 * `calendarList` namespace and cross-checked against
 * `src/features/calendar/calendar-list/(components)/*`.
 */
export const COPY = {
  cardTitle: 'Events',
  searchPlaceholder: 'Suche nach einem Event',
  filterStatus: 'Status',
  filterTimeFrame: 'Zeitrahmen',
  filterEventType: 'Filtern',
  myEvent: 'Meine Events',
  noEvents: 'Es gibt noch keine Veranstaltungen',
  noEventsDescription: 'Erstellen Sie ein neues Event, um zu beginnen',
  exportToExcel: 'Excel exportieren',
  edit: 'Bearbeiten',
  delete: 'Löschen',
} as const;

/** The overview-form heading/submit copy is identical to the Events wizard — see
 * `e2e/modules/events/events.page.ts` `DE` / `DE_ERRORS`, reused directly since
 * `EventFormBody` renders the exact same `EventFormStepOverview` component for both
 * `variant="events"` and `variant="calendar"` (src/features/calendar/CONTEXT.md). */

/**
 * A real POST to `/api/etr/calendar` creates a real, persisted row in the shared backend.
 * Mirrors `E2E_CAM_ALLOW_MUTATIONS` (see `e2e/modules/customer-activation/customer-activation.data.ts`):
 * mutation specs skip themselves unless explicitly opted in, so a routine `pnpm test:e2e`
 * run never creates orphan data in a shared account by accident.
 */
export const mutationFixturesEnabled = () =>
  process.env.E2E_CALENDAR_ALLOW_MUTATIONS === 'true';

export const destructiveFixtureReason =
  'Set E2E_CALENDAR_ALLOW_MUTATIONS=true only after confirming it is safe to create/delete real calendar events in this backend.';

/** A unique title/custom ID for a single create journey — calendar accepts any non-empty
 * `customEventId` (no `EVENT-\d+` format rule, unlike the Events wizard). */
export function uniqueCalendarEventFixture() {
  const stamp = Date.now().toString().slice(-8);
  return {
    title: `E2E Calendar Event ${stamp}`,
    description: `Automated E2E test calendar event created ${new Date().toISOString()}.`,
  };
}

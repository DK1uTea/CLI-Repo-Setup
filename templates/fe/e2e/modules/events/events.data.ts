/**
 * Test data for the events module. Every spec here hits the real backend — see
 * `.claude/skills/e2e-module-testing/SKILL.md`.
 */

/**
 * events — visible copy, read off the rendered page (German, the default locale).
 *
 * The sidebar label ("Event-Navigator") also appears a second time as a disabled
 * breadcrumb span[role=link] on every events page — use `sidebarLink()` from
 * shared/session.ts for that assertion, not a raw `getByRole('link', { name: ... })`,
 * which is a strict-mode violation across the two matches.
 */
export const COPY = {
  sidebarLabel: 'Event-Navigator',
} as const;

/**
 * Real backend rule, confirmed live (2026-07-30) and by the product owner: `canEdit` on a
 * freshly created DRAFT Event depends on how far in the future its start date is — an
 * Event starting within the near-term deadline window (see `/etr/holidays/deadline`) comes
 * back `canEdit:false` even for its own creator/owner immediately after `POST overview`,
 * while one scheduled comfortably further out comes back `canEdit:true`. A full create ->
 * edit -> publish E2E journey must schedule the Event this far out, or every step after
 * Overview is locked read-only for its own creator.
 */
export const FAR_FUTURE_DAYS_FROM_TODAY = 30;

/** A unique `EVENT-<digits>` id and title for a single create journey. */
export function uniqueEventFixture() {
  const stamp = Date.now().toString().slice(-8);
  return {
    title: `E2E Event ${stamp}`,
    customEventId: `EVENT-10${stamp}`,
    description: `Automated E2E test event created ${new Date().toISOString()}.`,
  };
}

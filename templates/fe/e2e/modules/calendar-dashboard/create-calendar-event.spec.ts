import { expect, test } from '@playwright/test';

import { resumeSessionAt } from '../../shared/session';
import { EventFormPage } from '../events/events.page';
import {
  destructiveFixtureReason,
  mutationFixturesEnabled,
  uniqueCalendarEventFixture,
} from './calendar-dashboard.data';

/**
 * calendar-dashboard — the create journey, walked through the real UI and real backend.
 *
 * Unlike the Events wizard, calendar create is a single Overview-only form (no Logistics /
 * Product Catalog / Helping Hands / Summary steps — see `docs/specs/calendar-dashboard.md`),
 * so this reuses `EventFormPage.fillRequiredOverview` from the events module directly rather
 * than duplicating locators: `EventFormBody` renders the exact same `EventFormStepOverview`
 * component for both `variant="events"` and `variant="calendar"`
 * (`src/features/calendar/CONTEXT.md`), so its `data-testid`s are identical here.
 *
 * A real POST to `/api/etr/calendar` persists a real row in the shared backend, so this spec
 * only runs with an explicit opt-in (`E2E_CALENDAR_ALLOW_MUTATIONS=true`), mirroring CAM's
 * `E2E_CAM_ALLOW_MUTATIONS` — see calendar-dashboard.data.ts.
 */

test('create calendar event', async ({ page }) => {
  test.skip(!mutationFixturesEnabled(), destructiveFixtureReason);
  test.setTimeout(60_000);

  const form = new EventFormPage(page);
  const fixture = uniqueCalendarEventFixture();

  await resumeSessionAt(page, 'calendarDashboard');
  await page.goto('/calendar-dashboard/new-calendar-event');

  // Calendar's own create form auto-fills startDate/startTime/endDate/endTime from the live
  // deadline response once it resolves (see use-calendar-event-form.ts) — no manual date
  // picking is needed for the happy path, unlike the Events wizard's Logistics step.
  await form.fillRequiredOverview(fixture);

  const created = page.waitForResponse(
    (r) => r.url().includes('/api/etr/calendar') && r.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Event erstellen' }).click();
  const response = await created;
  const body = await response.json();

  expect(response.ok()).toBeTruthy();
  expect(body.status).toBeGreaterThanOrEqual(200);
  expect(body.status).toBeLessThan(300);
  expect(body.data.id).toEqual(expect.any(String));

  await expect(page).toHaveURL(/\/(de|en)\/calendar-dashboard(\?|$)/);

  // Cleanup — delete uses the same endpoint as the Events module (docs/specs/calendar-dashboard.md).
  const deleteResponse = await page.request.delete(`/api/etr/events/${body.data.id}`);
  expect(deleteResponse.ok()).toBeTruthy();
});

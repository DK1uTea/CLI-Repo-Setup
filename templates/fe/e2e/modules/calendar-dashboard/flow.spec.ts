import { expect, test } from '@playwright/test';

import {
  MODULES,
  openModule,
  resumeSessionAt,
  sidebarLink,
  signIn,
  wildcardAdminCredentials,
} from '../../shared/session';
import { CalendarDashboardPage } from './calendar-dashboard.page';
import { COPY } from './calendar-dashboard.data';

/**
 * calendar-dashboard (Event-Katalog) — reaching the module and its click-through flows.
 *
 * The primary account owns no events under the default "Meine Events" (`onlyMine=true`)
 * filter (confirmed live: every event returned there belongs to other organizers) — so
 * flows needing a real event navigate with `onlyMine=false` first, instead of skipping.
 */

async function firstVisibleEvent(page: import('@playwright/test').Page) {
  const listResponse = page.waitForResponse((r) => r.url().includes('/api/etr/calendar?'));
  await resumeSessionAt(page, 'calendarDashboard');
  await page.goto('/de/calendar-dashboard?onlyMine=false');
  const body = await (await listResponse).json();

  const groups = Array.isArray(body?.data?.items) ? body.data.items : [];
  return groups.flatMap((g: { events?: unknown[] }) => g.events ?? [])[0] as
    | { id: string; title: string; status?: string; isOwner?: boolean }
    | undefined;
}

test.describe('calendar-dashboard journey', () => {
  test('signs in, then opens Event-Katalog from the sidebar', async ({ page }) => {
    await signIn(page);
    await expect(sidebarLink(page, 'calendarDashboard')).toBeVisible();

    await openModule(page, 'calendarDashboard');

    await expect(page).toHaveURL(new RegExp(MODULES.calendarDashboard.href.replace(/\//g, '\\/')));
    const calendar = new CalendarDashboardPage(page);
    await expect(calendar.cardTitle).toBeVisible();

    // Sheet #1/#3 — the full layout: Events panel, Create Event, and the filter row
    // (Event-Typ, Status, Zeitrahmen, Datum, Partnerschaft) all present.
    await expect(calendar.createEventButton).toBeVisible();
    await expect(calendar.searchInput).toBeVisible();
    await expect(calendar.eventTypeFilterButton).toBeVisible();
    await expect(calendar.statusFilterButton).toBeVisible();
    await expect(calendar.timeFrameFilterButton).toBeVisible();
    await expect(calendar.dateFilterButton).toBeVisible();
    await expect(calendar.partnershipFilterButton).toBeVisible();
  });

  test('sends an unauthenticated visitor to login instead', async ({ page }) => {
    await page.goto(MODULES.calendarDashboard.href);

    await expect(page).toHaveURL(/\/de\/login/);
  });

  test('clicking a calendar event card navigates to its detail page', async ({ page }) => {
    const firstEvent = await firstVisibleEvent(page);
    test.skip(!firstEvent, 'No calendar event visible for this account to click through.');

    const calendar = new CalendarDashboardPage(page);
    await calendar.eventCard(firstEvent!.title).click();

    await expect(page).toHaveURL(new RegExp(`/calendar-event-detail/${firstEvent!.id}`));
  });

  test('clicking Edit on an editable event navigates to the update page', async ({ page }) => {
    const firstEditable = await (async () => {
      const listResponse = page.waitForResponse((r) => r.url().includes('/api/etr/calendar?'));
      await resumeSessionAt(page, 'calendarDashboard');
      await page.goto('/de/calendar-dashboard?onlyMine=false');
      const body = await (await listResponse).json();
      const groups = Array.isArray(body?.data?.items) ? body.data.items : [];
      const events = groups.flatMap((g: { events?: unknown[] }) => g.events ?? []) as Array<{
        id: string;
        title: string;
        status?: string;
      }>;
      return events.find((e) => e.status !== 'DELETED');
    })();
    test.skip(!firstEditable, 'No non-DELETED calendar event visible to test Edit with.');

    const calendar = new CalendarDashboardPage(page);
    const editButton = calendar.eventCardEditButton(firstEditable!.title);
    test.skip(
      !(await editButton.isVisible().catch(() => false)),
      'This account cannot edit the first visible event (not owner/admin) — see docs/specs/calendar-dashboard.md permission rules.',
    );

    await editButton.click();

    await expect(page).toHaveURL(
      new RegExp(`/calendar-dashboard/update-calendar-event\\?eventId=${firstEditable!.id}`),
    );
  });

  test('clicking Delete opens the confirmation dialog without deleting anything', async ({
    page,
  }) => {
    const firstEvent = await firstVisibleEvent(page);
    test.skip(!firstEvent, 'No calendar event visible for this account to test Delete with.');

    const calendar = new CalendarDashboardPage(page);
    const deleteButton = calendar.eventCardDeleteButton(firstEvent!.title);
    test.skip(
      !(await deleteButton.isVisible().catch(() => false)),
      'This account cannot delete the first visible event (not owner, no Calendar.Delete) — see docs/specs/calendar-dashboard.md permission rules.',
    );

    let deleteRequested = false;
    page.on('request', (request) => {
      if (request.url().includes('/api/etr/events/') && request.method() === 'DELETE') {
        deleteRequested = true;
      }
    });

    await deleteButton.click();
    await expect(calendar.deleteDialog).toBeVisible();

    // Read-only pass — see docs/specs/calendar-dashboard.md's Out of Scope. Cancel instead
    // of confirming, so nothing is actually deleted from the shared real account.
    await calendar.deleteDialogCancelButton.click();
    await expect(calendar.deleteDialog).toBeHidden();
    expect(deleteRequested).toBe(false);
  });

  // Sheet #4/#5 — events render grouped by month, and each card shows a date badge,
  // name, category and date range (see calendar-list-item.tsx / calendar-list-results.tsx).
  test('groups the event list into month sections', async ({ page }) => {
    const firstEvent = await firstVisibleEvent(page);
    test.skip(!firstEvent, 'No calendar event visible for this account to check month grouping with.');

    const calendar = new CalendarDashboardPage(page);
    await expect(calendar.monthGroupHeadings.first()).toBeVisible();
    await expect(calendar.eventCard(firstEvent!.title)).toBeVisible();
  });

  // Sheet #9 — search matches an event by its real name against the real backend.
  test('searching by event name shows a matching event in the list', async ({ page }) => {
    const firstEvent = await firstVisibleEvent(page);
    test.skip(!firstEvent, 'No calendar event visible for this account to search for.');

    const searchTerm = firstEvent!.title.slice(0, Math.max(3, Math.floor(firstEvent!.title.length / 2)));
    const listResponse = page.waitForResponse((r) => r.url().includes('/api/etr/calendar?') && r.url().includes('search='));
    const calendar = new CalendarDashboardPage(page);
    await calendar.searchInput.fill(searchTerm);
    await calendar.searchInput.press('Enter');
    const body = await (await listResponse).json();

    const groups = Array.isArray(body?.data?.items) ? body.data.items : [];
    const titles = groups
      .flatMap((g: { events?: Array<{ title?: string }> }) => g.events ?? [])
      .map((e: { title?: string }) => e.title);
    expect(titles.some((title: string | undefined) => title === firstEvent!.title)).toBe(true);
  });

  // Sheet #8 — a filter combination with no matches shows the empty state, not an error.
  test('shows the empty state for a search term that matches nothing', async ({ page }) => {
    const listResponse = page.waitForResponse((r) => r.url().includes('/api/etr/calendar?') && r.url().includes('search='));
    await resumeSessionAt(page, 'calendarDashboard');
    await page.goto('/de/calendar-dashboard?onlyMine=false');
    const calendar = new CalendarDashboardPage(page);
    await calendar.searchInput.fill('no-such-event-zzz-99999');
    await calendar.searchInput.press('Enter');
    await listResponse;

    await expect(page.getByText(COPY.noEvents)).toBeVisible();
  });

  // Sheet #15/#16 — Status defaults to no filter (All), and picking Draft narrows to
  // Draft-status events only (verified against the real response body, not guessed).
  test('selecting the Draft status filter returns only Draft-status events', async ({ page }) => {
    const listResponse = page.waitForResponse((r) => r.url().includes('/api/etr/calendar?') && r.url().includes('status=DRAFT'));
    await resumeSessionAt(page, 'calendarDashboard');
    await page.goto('/de/calendar-dashboard?onlyMine=false&status=DRAFT');
    const body = await (await listResponse).json();

    const groups = Array.isArray(body?.data?.items) ? body.data.items : [];
    const events = groups.flatMap((g: { events?: Array<{ status?: string }> }) => g.events ?? []);
    test.skip(events.length === 0, 'No Draft-status calendar events visible for this account.');
    expect(events.every((e: { status?: string }) => e.status === 'DRAFT')).toBe(true);
  });

  // Sheet #21 — Export Excel is wildcard-admin only; needs a dedicated admin account.
  test('shows Export Excel only for a wildcard-admin account', async ({ page }) => {
    const admin = wildcardAdminCredentials();
    test.skip(!admin, 'Set E2E_WILDCARD_ADMIN_EMAIL/PASSWORD in .env.local to test Export Excel visibility.');

    await resumeSessionAt(page, 'calendarDashboard', admin!);
    const calendar = new CalendarDashboardPage(page);
    await expect(calendar.exportToExcelButton).toBeVisible();
  });
});

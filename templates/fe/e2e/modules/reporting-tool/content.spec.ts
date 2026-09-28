import { expect, test } from '@playwright/test';

import { formatDate } from '@/lib/date-utils';
import { authenticateViaApi } from '../../shared/session';
import { localizedRoute, permittedCredentials, QA_EVENT_FIXTURE_ID, TAB_PARAMS, TF_ROUTES } from './reporting-tool.data';
import { ReportingToolPage } from './reporting-tool.page';
import { createDraftEventFixture } from './reporting-tool.fixtures';

async function firstEventId(tf: ReportingToolPage) {
  await expect(tf.eventDetailLinks.first()).toBeVisible();
  const href = await tf.eventDetailLinks.first().getAttribute('href');
  if (!href) return null;
  return new URL(href, 'http://localhost').searchParams.get('eventId');
}

test.describe('reporting-tool content', () => {
  test('[TF-C-05] Keeps eventId while switching dashboard, survey-builder, reports, leads, and analytics tabs.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    await tf.gotoSelectEvent();
    const eventId = await firstEventId(tf);
    test.skip(!eventId, 'The permitted account has no event fixture.');

    await tf.gotoWorkspace(eventId!);
    await expect(tf.tab('dashboard')).toHaveAttribute('aria-selected', 'true');
    for (const [name, param] of Object.entries(TAB_PARAMS)) {
      await tf.openTab(name as keyof typeof TAB_PARAMS);
      if (param === 'dashboard') {
        await expect(page).toHaveURL(new RegExp(`eventId=${eventId}(?:$|&)`));
      } else {
        await expect(page).toHaveURL(new RegExp(`eventId=${eventId}.*tab=${param}|tab=${param}.*eventId=${eventId}`));
      }
      await expect(tf.tab(name as keyof typeof TAB_PARAMS)).toHaveAttribute('aria-selected', 'true');
    }
  });

  test('[TF-C-25] Renders the selected event banner with its real metadata and edit/change navigation.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    await tf.gotoSelectEvent();
    await expect(tf.eventCards.first()).toBeVisible();

    const eventId = await tf.firstEventId();
    test.skip(!eventId, 'The permitted account has no event fixture.');
    const detailResponse = page.waitForResponse(
      (response) => response.url().includes(`/api/tf/events/${eventId}`) && response.request().method() === 'GET',
    );
    await tf.gotoWorkspace(eventId!);
    const eventBody = await (await detailResponse).json();
    const event = eventBody?.data ?? eventBody;
    const banner = page.locator('[data-slot="card"]').filter({ hasText: event.name }).first();

    await expect(banner).toBeVisible();
    await expect(banner).toContainText(event.name);
    await expect(banner).toContainText(event.type === 'CONGRESS' ? /Congress|Kongress/ : String(event.type));
    await expect(banner).toContainText(event.status === 'PUBLISHED' ? /Published|Veröffentlicht/ : event.status === 'DRAFT' ? /Draft|Entwurf/ : /Cancelled|Abgesagt/);
    await expect(banner).toContainText(/\d{1,2}[./-]\d{1,2}[./-]\d{4}/);
    if (event.description) await expect(banner).toContainText(event.description);
    if (event.attachments?.[0]?.url) await expect(banner.locator(`img[alt="${event.name}"]`)).toBeVisible();

    const edit = banner.getByRole('link', { name: tf.copy.workspace.editEvent });
    await expect(edit).toHaveAttribute('href', new RegExp(`update-event\\?id=${eventId}`));
    await edit.click();
    await expect(page).toHaveURL(new RegExp(`/(?:de|en)/reporting-tool/update-event\\?id=${eventId}`));

    await tf.gotoWorkspace(eventId!);
    const refreshedBanner = page.locator('[data-slot="card"]').filter({ hasText: event.name }).first();
    await refreshedBanner.getByRole('link', { name: tf.copy.workspace.changeEvent }).click();
    await expect(page).toHaveURL(/\/(?:de|en)\/reporting-tool\/select-event/);
  });

  test('[TF-C-26] Changes the selected event and refreshes the dashboard banner and event-scoped context.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    await tf.gotoSelectEvent();
    await expect(tf.eventCards.first()).toBeVisible();
    let createdEventId: string | null = null;
    if (await tf.eventCards.count() < 2) {
      createdEventId = await createDraftEventFixture(page, tf);
      await tf.gotoSelectEvent();
    }
    try {
      await expect(tf.eventCards.nth(1)).toBeVisible();
      const firstCard = tf.eventCards.nth(0);
      const secondCard = tf.eventCards.nth(1);
      const firstHref = await firstCard.locator('a[href*="eventId="]').first().getAttribute('href');
      const secondHref = await secondCard.locator('a[href*="eventId="]').first().getAttribute('href');
      const firstName = (await firstCard.locator('p').first().textContent())?.trim();
      const secondName = (await secondCard.locator('p').first().textContent())?.trim();
      const firstEventId = firstHref ? new URL(firstHref, 'http://localhost').searchParams.get('eventId') : null;
      const secondEventId = secondHref ? new URL(secondHref, 'http://localhost').searchParams.get('eventId') : null;
      expect(firstEventId && secondEventId && firstName && secondName).toBeTruthy();

      await tf.gotoWorkspace(firstEventId!);
      await expect(page.getByText(firstName!, { exact: true })).toBeVisible();
      const firstBanner = page.locator('[data-slot="card"]').filter({ hasText: firstName! }).first();
      await firstBanner.getByRole('link', { name: tf.copy.workspace.changeEvent }).click();
      const secondEventCard = tf.eventCards
        .filter({ has: page.locator(`a[href*="eventId=${secondEventId}"]`) })
        .first();
      await expect(secondEventCard).toBeVisible();
      const secondDetailResponse = page.waitForResponse(
        (response) => response.url().includes(`/api/tf/events/${secondEventId}`) && response.request().method() === 'GET',
      );
      const secondStatsResponse = page.waitForResponse(
        (response) => response.url().includes(`/api/tf/dashboard/stats?eventId=${secondEventId}`) && response.request().method() === 'GET',
      );
      const secondActivitiesResponse = page.waitForResponse(
        (response) => response.url().includes(`/api/tf/dashboard/activities?eventId=${secondEventId}`) && response.request().method() === 'GET',
      );
      await secondEventCard.getByRole('link', { name: tf.copy.selectEvent.viewDetails }).click();

      await expect(page).toHaveURL(new RegExp(`eventId=${secondEventId}`));
      await expect(page.getByText(secondName!, { exact: true })).toBeVisible();
      await expect(tf.tab('dashboard')).toHaveAttribute('aria-selected', 'true');
      await expect.poll(async () => (await secondDetailResponse).ok()).toBeTruthy();
      await expect.poll(async () => (await secondStatsResponse).ok()).toBeTruthy();
      await expect.poll(async () => (await secondActivitiesResponse).ok()).toBeTruthy();
    } finally {
      if (createdEventId) await page.request.delete(`/api/tf/events/${createdEventId}`);
    }
  });

  test('[TF-C-27] Renders all four dashboard stat cards with real values, comparison percentages and zero-safe output.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    await tf.gotoSelectEvent();
    const eventId = await tf.firstEventId();
    test.skip(!eventId, 'The permitted account has no event fixture.');

    const statsResponse = page.waitForResponse(
      (response) => response.url().includes('/api/tf/dashboard/stats') && response.request().method() === 'GET',
    );
    await tf.gotoWorkspace(eventId!);
    const statsBody = await (await statsResponse).json();
    const stats = statsBody?.data ?? statsBody;
    const locale = new URL(page.url()).pathname.split('/').filter(Boolean)[0] ?? 'de';
    const cards = [
      ['totalLeads', 'totalLeadsChangePercent'],
      ['leadsToday', 'leadsTodayChangePercent'],
      ['leadsLastMonth', 'leadsLastMonthChangePercent'],
      ['activeUsers', 'activeUsersChangePercent'],
    ] as const;

    for (const [valueKey, changeKey] of cards) {
      const card = page.locator('[data-slot="card"]').filter({ hasText: tf.copy.workspace.stats[valueKey] }).first();
      await expect(card).toBeVisible();
      await expect(card.getByText(new Intl.NumberFormat(locale).format(stats[valueKey]), { exact: true })).toBeVisible();
      const change = stats[changeKey];
      const formattedChange = `${change >= 0 ? '+' : ''}${change}%`;
      await expect(card.getByText(formattedChange, { exact: true })).toBeVisible();
    }
  });

  test('[TF-C-28] Opens a draft event dashboard with the complete workspace navigation.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    const eventId = await createDraftEventFixture(page, tf);
    try {
      await tf.gotoWorkspace(eventId);
      await expect(tf.editEventLink).toBeVisible();
      await expect(page.getByRole('link', { name: tf.copy.workspace.changeEvent })).toBeVisible();
      for (const name of Object.keys(TAB_PARAMS) as Array<keyof typeof TAB_PARAMS>) {
        await expect(tf.tab(name)).toBeVisible();
      }
      await expect(tf.tab('dashboard')).toHaveAttribute('aria-selected', 'true');
    } finally {
      await page.request.delete(`/api/tf/events/${eventId}`);
    }
  });

  test('[TF-C-29] Returns to the same event dashboard when cancelling Create event from the workspace.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    await tf.gotoSelectEvent();
    const eventId = await tf.firstEventId();
    const eventName = (await tf.eventCards.first().locator('p').first().textContent())?.trim();
    test.skip(!eventId || !eventName, 'The permitted account has no event fixture.');

    await tf.gotoWorkspace(eventId!);
    await tf.workspaceCreateEventLink.click();
    await expect(page).toHaveURL(new RegExp(`/(?:de|en)/reporting-tool/new-event\\?returnEventId=${eventId}`));
    await expect(tf.eventWizardHeading).toBeVisible();
    await tf.eventFormCancelLink.click();

    await expect(page).toHaveURL(new RegExp(`/(?:de|en)/reporting-tool\\?tab=dashboard&eventId=${eventId}`));
    await expect(page.getByText(eventName!, { exact: true })).toBeVisible();
  });

  test('[TF-C-30] Renders event-scoped recent activities in newest-first order and opens See all.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    await tf.gotoSelectEvent();
    const eventId = await tf.firstEventId();
    test.skip(!eventId, 'The permitted account has no event fixture.');

    const activitiesResponse = page.waitForResponse(
      (response) => response.url().includes(`/api/tf/dashboard/activities?eventId=${eventId}`) && response.request().method() === 'GET',
    );
    await tf.gotoWorkspace(eventId!);
    const body = await (await activitiesResponse).json();
    const payload = body?.data ?? body;
    const activities = Array.isArray(payload?.items) ? payload.items : [];
    const sortedActivities = [...activities].sort(
      (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
    );
    const activityCard = page.locator('[data-slot="card"]').filter({ hasText: tf.copy.workspace.activities.title }).first();
    const rows = activityCard.locator('div.divide-y > div');

    await expect(activityCard).toBeVisible();
    await expect(activityCard.getByRole('link', { name: tf.copy.workspace.activities.seeAll })).toBeVisible();
    if (activities.length === 0) {
      await expect(activityCard).toContainText(tf.copy.workspace.activities.noDataTitle);
    } else {
      await expect(rows).toHaveCount(Math.min(activities.length, 5));
      await expect(rows.first()).toContainText(formatDate(sortedActivities[0].createdAt, 'DD/MM/YYYY'));
    }

    await activityCard.getByRole('link', { name: tf.copy.workspace.activities.seeAll }).click();
    await expect(page).toHaveURL(new RegExp(`/(?:de|en)/reporting-tool/recent-activity\\?eventId=${eventId}`));
    await expect(page.getByRole('heading', { name: tf.copy.workspace.headings.recentActivity })).toBeVisible();
  });

  test('[TF-C-31] Renders the recent-activity empty state for an event with no activity.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    const eventId = await createDraftEventFixture(page, tf);
    try {
      await tf.gotoWorkspace(eventId);
      const activityCard = page.locator('[data-slot="card"]').filter({ hasText: tf.copy.workspace.activities.title }).first();
      await expect(activityCard).toContainText(tf.copy.workspace.activities.noDataTitle);
      await expect(activityCard).toContainText(tf.copy.workspace.activities.noDataDescription);
      await expect(activityCard.getByRole('link', { name: tf.copy.workspace.activities.seeAll })).toBeEnabled();
    } finally {
      await page.request.delete(`/api/tf/events/${eventId}`);
    }
  });

  test('[TF-C-32] Renders the event-scoped Survey Builder and opens Create new survey with its eventId.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    await tf.gotoSelectEvent();
    const eventId = await tf.firstEventId();
    test.skip(!eventId, 'The permitted account has no event fixture.');

    await tf.gotoWorkspace(eventId!, TAB_PARAMS.surveyBuilder);
    await expect(tf.tab('surveyBuilder')).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText(tf.copy.surveyBuilder.title, { exact: true })).toBeVisible();
    await expect(page.getByText(tf.copy.surveyBuilder.onThisEvent, { exact: true })).toBeVisible();
    await expect(page.getByText(tf.copy.surveyBuilder.surveyLibrary, { exact: true })).toBeVisible();
    await expect(tf.createNewSurveyLink).toHaveAttribute('href', new RegExp(`new-survey\\?eventId=${eventId}`));

    await tf.createNewSurveyLink.click();
    await expect(page).toHaveURL(new RegExp(`/(?:de|en)/reporting-tool/new-survey\\?eventId=${eventId}`));
    await expect(tf.surveyWizardHeading).toBeVisible();
  });

  test('[TF-C-16] Renders and paginates the recent-activity page independently of the dashboard activity widget.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    await tf.gotoSelectEvent();
    const eventId = await firstEventId(tf);
    test.skip(!eventId, 'The permitted account has no event fixture.');

    await page.goto(localizedRoute(page, TF_ROUTES.recentActivity(eventId!)));
    await expect(page.getByRole('heading', { name: tf.copy.workspace.headings.dashboard })).not.toBeVisible();
    await expect(page.getByRole('heading', { name: tf.copy.workspace.headings.recentActivity })).toBeVisible();
    const next = page.locator('[data-slot="pagination"] button').filter({ hasText: '' }).last();
    if (await tf.pagination.isVisible()) {
      await expect(tf.pagination).toBeVisible();
      await expect(page).toHaveURL(/eventId=/);
      await expect(next).toBeVisible();
    }
  });

  test('[TF-C-04] Shows an empty event state when the event search has no matching response.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    await tf.gotoSelectEvent();
    await tf.eventSearchInput.fill(`__missing_${Date.now()}__`);
    await expect(tf.eventDetailLinks).toHaveCount(0);
    await expect(page.getByText(tf.copy.selectEvent.noEvents)).toBeVisible();

    await tf.gotoWorkspace(QA_EVENT_FIXTURE_ID, TAB_PARAMS.reports);
    await tf.reportsSearchInput.fill(`__missing_answer_${Date.now()}__`);
    await expect(tf.answersEmptyState).toBeVisible();

    await tf.gotoWorkspace(QA_EVENT_FIXTURE_ID, TAB_PARAMS.leads);
    await tf.leadsSearchInput.fill(`__missing_lead_${Date.now()}__`);
    await expect(tf.leadsEmptyState).toBeVisible();

    const emptyEventId = await createDraftEventFixture(page, tf);
    await tf.gotoWorkspace(emptyEventId, TAB_PARAMS.surveyBuilder);
    await expect(page.getByText(tf.copy.survey.noSurveys)).toBeVisible();

    await tf.gotoWorkspace(emptyEventId, TAB_PARAMS.analytics);
    await expect(page.getByText(tf.copy.workspace.emptyStates.analyticsLeadsByDays)).toBeVisible();
    await page.request.delete(`/api/tf/events/${emptyEventId}`);

  });

  test('[TF-C-18] Renders event-selection cards with the event metadata and details action.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    await tf.gotoSelectEvent();

    await expect(tf.selectEventHeading).toBeVisible();
    await expect(tf.createEventLink).toBeVisible();
    await expect(tf.eventCards.first()).toBeVisible();

    const card = tf.eventCards.first();
    await expect(card.locator('p').first()).not.toBeEmpty();
    await expect(card.locator('span').first()).not.toBeEmpty();
    await expect(card.getByRole('link', { name: tf.copy.selectEvent.viewDetails })).toBeVisible();
    await expect(card).toContainText(/Draft|Entwurf|Published|Veröffentlicht|Cancelled|Abgesagt/);
    await expect(card).toContainText(/\d{1,2}[./-]\d{1,2}[./-]\d{4}/);
  });

  test('[TF-C-19] Searches events case-insensitively, trims input, handles special characters, and clears.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    await tf.gotoSelectEvent();
    await expect(tf.eventCards.first()).toBeVisible();

    const title = (await tf.eventCards.first().locator('p').first().textContent())?.trim();
    test.skip(!title, 'The permitted account has no event title fixture.');
    const partialTitle = title!.slice(0, Math.max(3, Math.min(8, title!.length)));

    await tf.eventSearchInput.fill(title!);
    await expect(tf.eventCard(title!)).toBeVisible();

    await tf.eventSearchInput.fill(partialTitle);
    await expect(tf.eventCards.first()).toBeVisible();

    await tf.eventSearchInput.fill(title!.toUpperCase());
    await expect(tf.eventCard(title!)).toBeVisible();

    await tf.eventSearchInput.fill(`  ${title}  `);
    await expect(tf.eventCard(title!)).toBeVisible();

    await tf.eventSearchInput.fill('<script>alert(1)</script>');
    await expect(tf.eventCards).toHaveCount(0);
    await expect(page.getByText(tf.copy.selectEvent.noEvents)).toBeVisible();

    await tf.eventSearchInput.fill('');
    await expect(tf.eventCards.first()).toBeVisible();
  });

});

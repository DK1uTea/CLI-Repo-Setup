import { expect, test } from '@playwright/test';

import { resumeSessionAt } from '../../shared/session';
import { FAR_FUTURE_DAYS_FROM_TODAY, uniqueEventFixture } from './events.data';
import { expectSuccessfulMutation } from './events.helpers';
import { EventFormPage } from './events.page';

/**
 * events — the create journey, walked through the real UI and real backend. This is one of
 * this module's two mandatory specs (create + edit — see
 * `.claude/skills/e2e-module-testing/SKILL.md`) — it proves the business flow still works
 * end to end, so a manual regression pass is not needed every time this module changes.
 *
 * Signs in via `resumeSessionAt` (a direct API call), not the real login form — no module
 * in this suite needs to walk the login UI itself; `login`'s own flow spec already covers
 * that. This also sidesteps the login form's locale/redirect behavior, which is unrelated to
 * this flow.
 *
 * Real backend rule confirmed live and by the product owner: a freshly created DRAFT Event
 * comes back `canEdit:false` for its own creator when its start date is within the
 * near-term deadline window, and `canEdit:true` once scheduled far enough out — see
 * `FAR_FUTURE_DAYS_FROM_TODAY` in events.data.ts. This journey schedules the Event that far
 * out specifically so Logistics stays editable after Overview creates the Event ID.
 *
 * Product Catalog selection comes from its live response and confirms the real mutation
 * succeeded before advancing, rather than hardcoding an unstable SKU.
 */

test('create event', async ({ page }) => {
  test.setTimeout(120_000);

  const form = new EventFormPage(page);
  const fixture = uniqueEventFixture();

  await resumeSessionAt(page, 'events');

  // Schedule the Event far enough out that the backend returns canEdit:true for its own
  // creator afterwards (see the file-level note above).
  const { eventStart, eventEnd } = await form.gotoNewAndScheduleFarFuture(
    fixture,
    FAR_FUTURE_DAYS_FROM_TODAY,
  );

  const overviewCreated = page.waitForResponse(
    (r) => r.url().includes('/api/etr/events/overview') && r.request().method() === 'POST',
  );
  await form.nextButton.click();
  const response = await overviewCreated;
  const body = await expectSuccessfulMutation(response);

  expect(response.status()).toBe(201);
  expect(body.data.id).toEqual(expect.any(String));

  // Stays on /new-event; only eventId/step change. Locale-agnostic — the signed-in
  // account's own preferredLanguage decides the locale segment, not this test.
  await expect(page).toHaveURL(/\/(de|en)\/events\/new-event\?eventId=.+&step=logistics/);
  await expect(form.stepCard('logistics')).toBeVisible();

  await form.fillRequiredLogisticsContact();
  await form.fixLogisticsDatesPastEventEnd(eventStart, eventEnd);

  const logisticsCreated = page.waitForResponse(
    (r) =>
      r.url().includes(`/api/etr/events/${body.data.id}/logistics`) &&
      r.request().method() === 'PATCH',
  );
  const catalogProductsLoaded = page.waitForResponse(
    (r) =>
      r.url().includes('/api/etr/event-products?') &&
      r.request().method() === 'GET',
  );
  await form.nextButton.click();
  await expectSuccessfulMutation(await logisticsCreated);

  await expect(page).toHaveURL(/step=product_catalog/);

  const catalogBody = await (await catalogProductsLoaded).json();
  const catalogItems = Array.isArray(catalogBody?.data?.items) ? catalogBody.data.items : [];
  if (catalogItems.length === 0) {
    throw new Error('The live product catalog returned no products for this Event.');
  }

  await form.addFirstPersistableCatalogProduct();

  await expect(page).toHaveURL(/step=helping_hand/);
  const helpingHandsSaved = page.waitForResponse(
    (r) =>
      r.url().includes(`/api/etr/events/${body.data.id}/helping-hands`) &&
      r.request().method() === 'PATCH',
  );
  await expect(form.nextButton).toBeEnabled();
  await form.nextButton.click();
  await expectSuccessfulMutation(await helpingHandsSaved);

  await expect(page).toHaveURL(/step=summary/);
  // Summary fetches its own step-detail data after the URL changes, and renders a
  // skeleton (no data-testid) until it resolves — a longer timeout absorbs that fetch.
  await expect(form.summaryStep).toBeVisible({ timeout: 20_000 });

  const published = page.waitForResponse(
    (r) => r.url().includes(`/api/etr/events/${body.data.id}/summary`) && r.request().method() === 'POST',
  );
  await form.submitButton.click();
  await expectSuccessfulMutation(await published);

  await expect(page).toHaveURL(/\/(de|en)\/events(\?|$)/);

  // Publish is terminal in this shared backend. The active Event is intentionally retained.
});

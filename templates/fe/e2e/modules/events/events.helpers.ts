import { expect } from '@playwright/test';

import { resumeSessionAt } from '../../shared/session';
import { FAR_FUTURE_DAYS_FROM_TODAY, uniqueEventFixture } from './events.data';
import { EventFormPage } from './events.page';

/**
 * Shared setup helpers for the events module's spec files. Playwright refuses to import one
 * spec file from another (each must run independently), so anything reused across
 * `create-event.spec.ts` / `edit-event.spec.ts` / `edit-active-event.spec.ts` lives
 * here instead.
 */

export async function expectSuccessfulMutation(response: import('@playwright/test').Response) {
  const body = await response.json();
  expect(response.ok()).toBeTruthy();
  expect(body.status).toBeGreaterThanOrEqual(200);
  expect(body.status).toBeLessThan(300);
  return body;
}

/**
 * Real backend rule confirmed live and by the product owner: a freshly created DRAFT Event
 * comes back `canEdit:false` for its own creator when its start date is within the
 * near-term deadline window, and `canEdit:true` once scheduled far enough out — see
 * `FAR_FUTURE_DAYS_FROM_TODAY` in events.data.ts. The setup Event is scheduled that far out
 * so every step stays editable afterwards.
 *
 * Walks Overview -> Logistics -> Product Catalog -> Helping Hands, leaving the caller on
 * Helping Hands (its own PATCH already confirmed) — Summary/publish is the caller's choice,
 * since some flows (e.g. edit-event.spec.ts) edit further before publishing, while others
 * (e.g. edit-active-event.spec.ts) publish immediately to reach an ACTIVE event.
 */
export async function createDraftForEditing(page: import('@playwright/test').Page, form: EventFormPage) {
  const fixture = uniqueEventFixture();
  await resumeSessionAt(page, 'events');
  const { eventStart, eventEnd } = await form.gotoNewAndScheduleFarFuture(
    fixture,
    FAR_FUTURE_DAYS_FROM_TODAY,
  );

  const overviewCreated = page.waitForResponse(
    (r) => r.url().includes('/api/etr/events/overview') && r.request().method() === 'POST',
  );
  await form.nextButton.click();
  const body = await expectSuccessfulMutation(await overviewCreated);

  await form.fillRequiredLogisticsContact();
  await form.fixLogisticsDatesPastEventEnd(eventStart, eventEnd);
  const logisticsCreated = page.waitForResponse(
    (r) =>
      r.url().includes(`/api/etr/events/${body.data.id}/logistics`) &&
      r.request().method() === 'PATCH',
  );
  const catalogProductsLoaded = page.waitForResponse(
    (r) => r.url().includes('/api/etr/event-products?') && r.request().method() === 'GET',
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

  return { eventId: body.data.id as string, fixture };
}

/** From Helping Hands (where createDraftForEditing leaves off), submits through to Summary and publishes. */
export async function publishToActive(page: import('@playwright/test').Page, form: EventFormPage, eventId: string) {
  await expect(page).toHaveURL(/step=summary/);
  // Summary fetches its own step-detail data after the URL changes, and renders a
  // skeleton (no data-testid) until it resolves — a longer timeout absorbs that fetch.
  await expect(form.summaryStep).toBeVisible({ timeout: 20_000 });

  const published = page.waitForResponse(
    (r) => r.url().includes(`/api/etr/events/${eventId}/summary`) && r.request().method() === 'POST',
  );
  await form.submitButton.click();
  await expectSuccessfulMutation(await published);

  await expect(page).toHaveURL(/\/(de|en)\/events(\?|$)/);
}

import { expect, test } from '@playwright/test';

import { createDraftForEditing, expectSuccessfulMutation } from './events.helpers';
import { EventFormPage } from './events.page';

/**
 * events — the edit journey, walked once through the real UI and real backend. This is one
 * of this module's mandatory specs (create + edit + edit-with-an-active-order — see
 * `.claude/skills/e2e-module-testing/SKILL.md`).
 *
 * A test file runs independently of every other spec file, so this creates its own draft
 * Event first (not the behaviour under test — see create-event.spec.ts for that) rather than
 * depending on state left behind by another file. Setup shared with
 * `edit-event-order-choice.spec.ts` lives in `events.helpers.ts` (Playwright refuses to
 * import one spec file from another).
 */

test('edit event', async ({ page }) => {
  test.setTimeout(120_000);

  const form = new EventFormPage(page);
  const { eventId, fixture } = await createDraftForEditing(page, form);

  await form.gotoUpdate(eventId, 'overview');
  await expect(form.eventTitleInput).toHaveValue(fixture.title);

  const editedTitle = `${fixture.title} aktualisiert`;
  await form.eventTitleInput.fill(editedTitle);
  const overviewUpdated = page.waitForResponse(
    (r) =>
      r.url().includes(`/api/etr/events/${eventId}/overview`) && r.request().method() === 'PATCH',
  );
  await form.nextButton.click();
  await expectSuccessfulMutation(await overviewUpdated);

  await expect(page).toHaveURL(/\/(de|en)\/events\/update-event\?eventId=.+&step=logistics/);
  await form.logisticsContactNameInput.fill('Logistik Kontakt aktualisiert');
  const logisticsUpdated = page.waitForResponse(
    (r) =>
      r.url().includes(`/api/etr/events/${eventId}/logistics`) && r.request().method() === 'PATCH',
  );
  // The shared cart (rendered by the always-mounted EventCartDrawer, not this step itself)
  // re-fetches from `GET /etr/event-products/cart/{eventId}` once Product Catalog mounts,
  // rather than reusing what create-event.spec.ts's own session added — Next stays disabled
  // (an empty-cart guard, EVT-P-03) until that request resolves. Armed before the click that
  // navigates there, or the response can arrive before this starts waiting for it.
  const cartLoaded = page.waitForResponse(
    (r) => r.url().includes(`/api/etr/event-products/cart/${eventId}`) && r.request().method() === 'GET',
  );
  await form.nextButton.click();
  await expectSuccessfulMutation(await logisticsUpdated);

  await expect(page).toHaveURL(/step=product_catalog/);
  await cartLoaded;
  await expect(form.nextButton).toBeEnabled();
  await form.nextButton.click();

  await expect(page).toHaveURL(/step=helping_hand/);
  const helpingHandsUpdated = page.waitForResponse(
    (r) =>
      r.url().includes(`/api/etr/events/${eventId}/helping-hands`) && r.request().method() === 'PATCH',
  );
  await form.nextButton.click();
  await expectSuccessfulMutation(await helpingHandsUpdated);

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

  // Publish is terminal in this shared backend. The active Event is intentionally retained.
});

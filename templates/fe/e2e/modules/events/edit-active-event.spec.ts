import { expect, test } from '@playwright/test';

import { createDraftForEditing, publishToActive } from './events.helpers';
import { EventFormPage } from './events.page';

test('edit active event with an existing order', async ({ page }) => {
  test.setTimeout(120_000);

  const form = new EventFormPage(page);
  const { eventId } = await createDraftForEditing(page, form);
  await publishToActive(page, form, eventId);

  const cancelOrderRequests: string[] = [];
  page.on('request', (request) => {
    const path = new URL(request.url()).pathname;
    if (request.method() === 'POST' && path === `/api/etr/event-orders/${eventId}/cancel`) {
      cancelOrderRequests.push(path);
    }
  });

  const activeCountLoaded = page.waitForResponse(
    (response) =>
      response.url().includes(`/api/etr/event-orders/${eventId}/active-count`) &&
      response.request().method() === 'GET',
  );
  await form.gotoUpdate(eventId, 'product_catalog');

  const activeCountBody = await (await activeCountLoaded).json();
  expect(activeCountBody?.data?.haveActive).toBe(true);
  await expect(form.catalogSearchInput.or(form.cartDrawer)).toBeVisible();
  await expect(form.cancelOrderConfirmButton).toHaveCount(0);

  await form.stepCard('helping_hand').click();
  await expect(page).toHaveURL(/step=helping_hand/);
  await expect(form.cancelOrderConfirmButton).toHaveCount(0);
  expect(cancelOrderRequests).toEqual([]);
});

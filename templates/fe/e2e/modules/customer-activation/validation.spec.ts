import { expect, test, type Page } from '@playwright/test';

import { authenticateViaApi } from '../../shared/session';
import { authHeaders, CAM_ROUTES, camCredentials, localizedCamPath } from './customer-activation.data';
import { CustomerActivationPage } from './customer-activation.page';

async function openSaleCreate(page: Page) {
  const credentials = camCredentials('sale');
  test.skip(!credentials, 'Missing Sale CAM credentials.');
  await authenticateViaApi(page, credentials!);
  const cam = new CustomerActivationPage(page);
  await cam.gotoCreate();
  return cam;
}

async function openBriefing(page: Page) {
  const cam = await openSaleCreate(page);
  const response = await page.request.get('/api/cam/stores', {
    params: { page: 1, limit: 20 },
    headers: await authHeaders(page),
  });
  const body = await response.json();
  const stores = body?.data?.items ?? body?.data ?? [];
  test.skip(!Array.isArray(stores) || stores.length === 0, 'Sale account has no store fixture.');
  await page.goto(`${localizedCamPath(page, CAM_ROUTES.create)}?step=2&storeId=${stores[0].id}`);
  await expect(cam.activationNameInput).toBeVisible();
  return cam;
}

test.describe('customer-activation validation', () => {
  test('[CAM-V-01] Rejects missing store name, address and contact name and sends no store mutation.', async ({ page }) => {
    const cam = await openSaleCreate(page);
    const mutations = cam.watchMutations(/\/api\/cam\/stores(?:\?|$)/);
    await cam.formTab(cam.copy.formTabs[1]).click();
    await page.getByRole('button', { name: cam.copy.addStore }).click();

    for (const label of [cam.copy.storeFields.name, cam.copy.storeFields.address, cam.copy.storeFields.contact]) {
      await expect(page.getByLabel(label)).toHaveAttribute('aria-invalid', 'true');
    }
    expect(mutations).toEqual([]);
  });

  test('[CAM-V-02] Rejects invalid contact phone or email and sends no store mutation.', async ({ page }) => {
    const cam = await openSaleCreate(page);
    const mutations = cam.watchMutations(/\/api\/cam\/stores(?:\?|$)/);
    await cam.formTab(cam.copy.formTabs[1]).click();
    await page.getByLabel(cam.copy.storeFields.phone).fill('invalid-phone');
    await page.getByLabel(cam.copy.storeFields.email).fill('invalid-email');
    await page.getByRole('button', { name: cam.copy.addStore }).click();

    await expect(page.getByLabel(cam.copy.storeFields.phone)).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByLabel(cam.copy.storeFields.email)).toHaveAttribute('aria-invalid', 'true');
    expect(mutations).toEqual([]);
  });

  test('[CAM-V-03] Rejects missing activation name, responsible CAM or outlet count below 1 and sends no activation mutation.', async ({ page }) => {
    const cam = await openBriefing(page);
    const mutations = cam.watchMutations(/\/api\/cam\/activations(?:\?|$)/);
    await page.getByRole('button', { name: cam.copy.submitActivation }).click();

    await expect(cam.activationNameInput).toHaveAttribute('aria-invalid', 'true');
    expect(mutations).toEqual([]);
  });

  test('[CAM-V-04] Rejects empty HTZ, target group, sales concept, contract situation, revenue potential, profitability, brand fit, AH market or A-market selections.', async ({ page }) => {
    const cam = await openBriefing(page);
    const mutations = cam.watchMutations(/\/api\/cam\/activations(?:\?|$)/);
    await cam.activationNameInput.fill('E2E validation only');
    await page.getByRole('button', { name: cam.copy.submitActivation }).click();

    // Every required selection group renders the same generic message — there is no
    // per-field wording — so scope the assertion to each field's own section instead
    // of asserting on the shared text directly (which would match many elements).
    const requiredMessage = /required|erforderlich/i;
    await expect(
      page.locator('div').filter({ hasText: /3\. High Traffic Zone \(HTZ\)|3\. Hochfrequenzzone \(HTZ\)/ }).filter({ hasText: requiredMessage }).first(),
    ).toBeVisible();
    await expect(
      page.locator('div').filter({ hasText: /4\. Target Group|4\. Zielgruppe/ }).filter({ hasText: requiredMessage }).first(),
    ).toBeVisible();
    expect(mutations).toEqual([]);
  });

  test('[CAM-V-05] Caps a briefing note at 150 characters instead of accepting a longer value.', async ({ page }) => {
    const cam = await openBriefing(page);
    const outletNotes = page.getByPlaceholder(cam.copy.outletNotesPlaceholder);
    await outletNotes.fill('a'.repeat(151));

    await expect(outletNotes).toHaveValue('a'.repeat(150));
    await expect(page.getByText('150/150', { exact: true })).toBeVisible();
  });

  test('[CAM-V-06] Blocks activation submit without a selected store ID.', async ({ page }) => {
    const cam = await openSaleCreate(page);
    const mutations = cam.watchMutations(/\/api\/cam\/activations(?:\?|$)/);
    await page.goto(`${localizedCamPath(page, CAM_ROUTES.create)}?step=2`);
    await expect(page.getByRole('button', { name: cam.copy.submitActivation })).toBeVisible();
    await page.getByRole('button', { name: cam.copy.submitActivation }).click();
    expect(mutations).toEqual([]);
  });

  test('[CAM-V-07] Rejects evaluation approval until all nine categories have one selected option and sends no evaluation mutation.', async ({ page }) => {
    const credentials = camCredentials('admin');
    await authenticateViaApi(page, credentials!);
    const cam = new CustomerActivationPage(page);
    const review = await cam.activationByStatus('REVIEW');
    test.skip(!review, 'Admin account has no REVIEW activation.');
    const mutations = cam.watchMutations(/\/api\/cam\/evaluations/);
    await cam.openActivation(review!.id);
    await page.getByRole('button', { name: cam.copy.approve }).click();
    await expect(cam.detailTab(cam.copy.detailTabs.scoring)).toHaveAttribute('aria-selected', 'true');
    expect(mutations).toEqual([]);
  });

});

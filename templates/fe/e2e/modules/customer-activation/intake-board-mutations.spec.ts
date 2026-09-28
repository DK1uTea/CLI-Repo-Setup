import { expect, test, type Locator, type Page } from '@playwright/test';

import { authenticateViaApi } from '../../shared/session';
import {
  authHeaders,
  camCredentials,
  destructiveFixtureReason,
  localizedCamPath,
  mutationFixturesEnabled,
  REQUIRED_CHOICES,
  uniqueActivationName,
  CAM_ROUTES,
} from './customer-activation.data';
import { CustomerActivationPage } from './customer-activation.page';

const statuses = ['DRAFT', 'READY', 'REVIEW', 'APPROVED', 'IN_PROGRESS', 'INSTALLATION', 'COMPLETED'] as const;

function skipMutationFixture() {
  test.skip(!mutationFixturesEnabled(), destructiveFixtureReason);
}

async function createDraft(page: Page) {
  const storesResponse = await page.request.get('/api/cam/stores', {
    params: { page: 1, limit: 20 }, headers: await authHeaders(page),
  });
  const stores = (await storesResponse.json())?.data?.items ?? [];
  if (!Array.isArray(stores) || !stores[0]?.id) throw new Error('Intake Board mutation needs one CAM store.');
  const name = uniqueActivationName();
  const response = await page.request.post('/api/cam/activations', {
    headers: await authHeaders(page),
    data: {
      storeId: stores[0].id, name, responsibleCam: REQUIRED_CHOICES.responsible, numberOfOutlets: 1,
      outletNotes: '', highTrafficZones: ['TRAIN_STATION'], highTrafficZoneNotes: '', targetGroups: ['TEENAGERS'],
      targetGroupNotes: '', salesConcepts: ['TAKE_AWAY'], salesConceptNotes: '', contractSituations: ['NO_CONTRACT'],
      contractSituationNotes: '', revenuePotentials: ['NEW_CUSTOMER_ACQUISITION'], ahMarket: ['ENTRANCE_AREA'],
      ahMarketMediaUrls: [], aMarket: ['REFRIGERATOR'], aMarketMediaUrls: [], brandFit: 'STANDARD',
      brandFitNotes: '', profitability: 'WITHIN_FRAMEWORK',
    },
  });
  const body = await response.json();
  expect(response.ok(), JSON.stringify(body)).toBeTruthy();
  const id = body?.data?.id ?? body?.data?._id ?? body?.id;
  expect(id).toEqual(expect.any(String));
  return { id: id as string, name };
}

async function openBoard(page: Page, cam: CustomerActivationPage) {
  await page.goto(`${localizedCamPath(page, CAM_ROUTES.main)}?tab=intake-board`);
  await expect(page.getByRole('region', { name: /activation board|aktivierungs-board/i })).toBeVisible();
  return cam;
}

function cardFor(page: Page, label: string, name: string): Locator {
  const column = page.getByRole('heading', { name: label, exact: true }).locator('../../..');
  return column.getByRole('link', { name, exact: true }).locator('..');
}

async function moveFromBoard(page: Page, cam: CustomerActivationPage, name: string, from: string, to: string) {
  const card = cardFor(page, from, name);
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: /more options|weitere optionen/i }).click();
  const mutation = page.waitForResponse((response) => response.url().includes('/api/cam/activations/') && response.url().endsWith('/status') && response.request().method() === 'PATCH');
  await page.getByRole('menuitem', { name: new RegExp(to, 'i') }).click();
  expect((await mutation).ok()).toBeTruthy();
  await openBoard(page, cam);
  await expect(cardFor(page, to, name)).toBeVisible();
}

async function patchStatus(page: Page, id: string, status: string) {
  const response = await page.request.patch(`/api/cam/activations/${id}/status`, {
    headers: await authHeaders(page), data: { status },
  });
  expect(response.ok()).toBeTruthy();
}

test('intake board status mutations', async ({ page }) => {
  skipMutationFixture();
  const credentials = camCredentials('admin');
  test.skip(!credentials, 'Missing Admin CAM credentials.');
  await authenticateViaApi(page, credentials!);
  const cam = new CustomerActivationPage(page);
  const activation = await createDraft(page);
  await openBoard(page, cam);

  await moveFromBoard(page, cam, activation.name, cam.copy.boardColumns[0], cam.copy.boardColumns[1]);
  await moveFromBoard(page, cam, activation.name, cam.copy.boardColumns[1], cam.copy.boardColumns[2]);

  const reviewCard = cardFor(page, cam.copy.boardColumns[2], activation.name);
  await reviewCard.getByRole('button', { name: /more options|weitere optionen/i }).click();
  await page.getByRole('menuitem', { name: new RegExp(cam.copy.boardColumns[4], 'i') }).click();
  await expect(page).toHaveURL(/activationTab=scoring/);
  await patchStatus(page, activation.id, 'REVIEW');
  const scores = ['HTZ', 'TARGET_GROUP', 'SALES_CONCEPT', 'CONTRACT_SITUATION', 'REVENUE_POTENTIAL', 'H_MARKT', 'AH_MARKT', 'BRAND_FIT', 'EFFICIENCY']
    .map((type) => ({ type, label: 'E2E', points: 1 }));
  const evaluation = await page.request.post('/api/cam/evaluations', {
    headers: await authHeaders(page), data: { activationId: activation.id, maxScore: 27, scores },
  });
  expect(evaluation.ok()).toBeTruthy();
  await openBoard(page, cam);
  await moveFromBoard(page, cam, activation.name, cam.copy.boardColumns[4], cam.copy.boardColumns[5]);
  await moveFromBoard(page, cam, activation.name, cam.copy.boardColumns[5], cam.copy.boardColumns[6]);
  await moveFromBoard(page, cam, activation.name, cam.copy.boardColumns[6], cam.copy.boardColumns[7]);
  expect(statuses).toContain('COMPLETED');
});

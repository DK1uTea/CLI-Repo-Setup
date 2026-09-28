import { expect, type Locator, type Page } from '@playwright/test';

import {
  authHeaders,
  CAM_ROUTES,
  localizedCamPath,
  REQUIRED_CHOICES,
  uniqueActivationName,
} from './customer-activation.data';

export async function createCounterActivation(page: Page) {
  const stores = await page.request.get('/api/cam/stores', {
    params: { page: 1, limit: 20 },
    headers: await authHeaders(page),
  });
  const store = (await stores.json())?.data?.items?.[0];
  if (!store?.id) throw new Error('Counter test requires one selectable CAM store.');

  const name = uniqueActivationName();
  const response = await page.request.post('/api/cam/activations', {
    headers: await authHeaders(page),
    data: {
      storeId: store.id,
      name,
      responsibleCam: REQUIRED_CHOICES.responsible,
      numberOfOutlets: 1,
      outletNotes: '',
      highTrafficZones: ['TRAIN_STATION'],
      highTrafficZoneNotes: '',
      targetGroups: ['TEENAGERS'],
      targetGroupNotes: '',
      salesConcepts: ['TAKE_AWAY'],
      salesConceptNotes: '',
      contractSituations: ['NO_CONTRACT'],
      contractSituationNotes: '',
      revenuePotentials: ['NEW_CUSTOMER_ACQUISITION'],
      ahMarket: ['ENTRANCE_AREA'],
      ahMarketMediaUrls: [],
      aMarket: ['REFRIGERATOR'],
      aMarketMediaUrls: [],
      brandFit: 'STANDARD',
      brandFitNotes: '',
      profitability: 'WITHIN_FRAMEWORK',
    },
  });
  const body = await response.json();
  expect(response.ok(), JSON.stringify(body)).toBeTruthy();
  return { id: body?.data?.id as string, name };
}

export async function openCounterBoard(page: Page) {
  await page.goto(`${localizedCamPath(page, CAM_ROUTES.main)}?tab=intake-board`);
  await expect(page.getByTestId('cam-intake-board')).toBeVisible();
}

export function counterCard(page: Page, name: string): Locator {
  return page.getByTestId('cam-intake-card').filter({ hasText: name }).first();
}

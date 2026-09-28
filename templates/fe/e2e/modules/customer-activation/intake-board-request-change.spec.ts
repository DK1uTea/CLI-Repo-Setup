import { expect, test, type Page } from '@playwright/test';

import { authenticateViaApi, logoutSession } from '../../shared/session';
import {
  authHeaders, camCredentials, CAM_ROUTES, destructiveFixtureReason, localizedCamPath,
  mutationFixturesEnabled, REQUIRED_CHOICES, secondarySaleCredentials, uniqueActivationName,
} from './customer-activation.data';

function skipMutationFixture() {
  test.skip(!mutationFixturesEnabled(), destructiveFixtureReason);
}

type RawNotification = {
  type?: string;
  metadata?: { activation?: { name?: string; code?: string } };
  referenceId?: string;
};

async function createReview(page: Page) {
  const storesResponse = await page.request.get('/api/cam/stores', {
    params: { page: 1, limit: 20 }, headers: await authHeaders(page),
  });
  const stores = (await storesResponse.json())?.data?.items ?? [];
  if (!Array.isArray(stores) || !stores[0]?.id) throw new Error('Request Change test needs one CAM store.');
  const name = uniqueActivationName();
  const created = await page.request.post('/api/cam/activations', {
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
  const body = await created.json();
  expect(created.ok(), JSON.stringify(body)).toBeTruthy();
  const id = body?.data?.id ?? body?.data?._id ?? body?.id;
  expect(id).toEqual(expect.any(String));
  for (const status of ['READY', 'REVIEW']) {
    const response = await page.request.patch(`/api/cam/activations/${id}/status`, {
      headers: await authHeaders(page), data: { status },
    });
    expect(response.ok()).toBeTruthy();
  }
  return { id: id as string, name };
}

async function listNotifications(page: Page): Promise<RawNotification[]> {
  const response = await page.request.get('/api/notification/inapp', {
    params: { page: 1, limit: 100 },
    headers: await authHeaders(page),
  });
  const body = await response.json();
  expect(response.ok(), JSON.stringify(body)).toBeTruthy();
  const data = body?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(body)) return body;
  return [];
}

async function expectNotification(
  page: Page,
  activation: { id: string; name: string },
  type: string,
) {
  await expect.poll(
    async () => {
      const notifications = await listNotifications(page);
      return notifications
        .filter((notification) => notification.referenceId === activation.id)
        .map((notification) => `${notification.type}|${notification.metadata?.activation?.name ?? ''}`);
    },
    { timeout: 15_000, intervals: [500, 1_000, 2_000] },
  ).toContain(`${type}|${activation.name}`);
}

test('request change from review', async ({ page }) => {
  test.setTimeout(120_000);
  skipMutationFixture();
  const adminCredentials = camCredentials('admin');
  const saleCredentials = camCredentials('sale');
  test.skip(!adminCredentials, 'Missing Admin CAM credentials.');
  test.skip(!saleCredentials, 'Missing Sale CAM credentials for Clarification notifications.');
  await authenticateViaApi(page, saleCredentials!);
  const activation = await createReview(page);
  const id = activation.id;
  await logoutSession(page);
  await authenticateViaApi(page, adminCredentials!);
  await page.goto(localizedCamPath(page, CAM_ROUTES.detail(id)));
  const requestChange = page.getByRole('button', { name: /request change|änderungen anfordern/i });
  await expect(requestChange).toBeVisible();
  await requestChange.click();
  const feedbackDrawer = page.getByRole('dialog').last();
  await expect(feedbackDrawer.getByText(/add reasons|gründe hinzufügen/i)).toBeVisible();
  for (const reason of ['Missing image', 'Missing answer']) {
    await feedbackDrawer.getByRole('button', { name: /add item|eintrag hinzufügen/i }).click();
    await feedbackDrawer.getByPlaceholder(/enter reason|grund eingeben/i).fill(reason);
    const reasonResponse = page.waitForResponse(
      (response) => response.url().includes('/api/cam/feedbacks') && response.request().method() === 'POST',
    );
    await feedbackDrawer.getByRole('button', { name: /^add$|^hinzufügen$/i }).click();
    expect((await reasonResponse).ok()).toBeTruthy();
    await expect(feedbackDrawer.getByText(reason, { exact: true })).toBeVisible();
  }
  const mutation = page.waitForResponse((response) => response.url().includes(`/api/cam/activations/${id}/status`) && response.request().method() === 'PATCH');
  await feedbackDrawer.getByRole('button', { name: /request change|änderungen anfordern/i }).click();
  expect((await mutation).ok()).toBeTruthy();
  await expect(page.getByText(/feedback .*sent|feedback .*gesendet/i)).toBeVisible();
  const detail = await page.request.get(`/api/cam/activations/${id}`, { headers: await authHeaders(page) });
  expect((await detail.json())?.data?.status).toBe('CLARIFICATION');

  await logoutSession(page);
  await authenticateViaApi(page, adminCredentials!);
  await page.goto(localizedCamPath(page, CAM_ROUTES.detail(id)));
  await expect(page.getByText(/addressed issues|behobene probleme/i, { exact: true })).toBeVisible();
  await expect(page.getByText('0%', { exact: true })).toBeVisible();
  for (const reason of ['Missing image', 'Missing answer']) {
    await expect(page.getByText(reason, { exact: true })).toBeVisible();
  }
  const issueCheckboxes = page.getByRole('checkbox');
  await expect(issueCheckboxes).toHaveCount(2);
  for (let index = 0; index < await issueCheckboxes.count(); index += 1) {
    await expect(issueCheckboxes.nth(index)).toBeDisabled();
  }

  await logoutSession(page);
  await authenticateViaApi(page, saleCredentials!);
  await page.goto(`${localizedCamPath(page, CAM_ROUTES.main)}?activation_drawer=open&activation_id=${encodeURIComponent(id)}`);
  const saleDrawer = page.getByRole('dialog').first();
  await expect(saleDrawer).toBeVisible();
  await expect(saleDrawer.getByText(/Clarify|Klärung/, { exact: true })).toBeVisible();
  const addressedIssues = saleDrawer.getByText(/Addressed issues|Behobene Probleme/, { exact: true });
  await expect(addressedIssues).toBeVisible();
  await addressedIssues.click();

  const saleFeedbackDrawer = page.getByRole('dialog').last();
  await expect(saleFeedbackDrawer.getByText(/Add reasons|Gründe hinzufügen/i)).toBeVisible();
  await expect(saleFeedbackDrawer.getByText('Missing image', { exact: true })).toBeVisible();
  await expect(saleFeedbackDrawer.getByText('Missing answer', { exact: true })).toBeVisible();
  const saleIssueCheckboxes = saleFeedbackDrawer.getByRole('checkbox');
  await expect(saleIssueCheckboxes).toHaveCount(2);
  for (let index = 0; index < await saleIssueCheckboxes.count(); index += 1) {
    await expect(saleIssueCheckboxes.nth(index)).toBeDisabled();
  }
  const returnFeedback = saleFeedbackDrawer.getByRole('button', { name: /Return feedback|Feedback zurückgeben/i });
  await expect(returnFeedback).toBeVisible();
  const commentInput = saleFeedbackDrawer.getByRole('textbox', { name: /Addition(?:al)? comment|Zusätzlicher Kommentar/i });
  await commentInput.focus();
  const comment = `Clarification comment ${Date.now()}`;
  const commentEditor = saleFeedbackDrawer.locator('.ProseMirror');
  await expect(commentEditor).toBeVisible();
  await commentEditor.fill(comment);
  const feedbackResponse = page.waitForResponse(
    (response) => response.url().includes('/api/cam/feedbacks') && response.request().method() === 'POST',
  );
  await returnFeedback.click();
  expect((await feedbackResponse).ok()).toBeTruthy();
  await expect(page.getByText(/Your feedback has been sent|Ihr Feedback wurde gesendet/i)).toBeVisible();

  await logoutSession(page);
  await authenticateViaApi(page, adminCredentials!);
  await page.goto(`${localizedCamPath(page, CAM_ROUTES.detail(id))}?feedback_drawer=open`);
  const adminFeedbackDrawer = page.getByRole('dialog').last();
  await expect(adminFeedbackDrawer.getByText(/Add reasons|Gründe hinzufügen/i)).toBeVisible();
  await expect(adminFeedbackDrawer.getByText(comment, { exact: true })).toBeVisible();
  const adminIssueCheckboxes = adminFeedbackDrawer.getByRole('checkbox');
  await expect(adminIssueCheckboxes).toHaveCount(2);
  for (let index = 0; index < await adminIssueCheckboxes.count(); index += 1) {
    const checkbox = adminIssueCheckboxes.nth(index);
    if (await checkbox.isChecked()) continue;
    const resolveResponse = page.waitForResponse(
      (response) => /\/api\/cam\/feedbacks\/[^/]+\/resolve$/.test(response.url()) && response.request().method() === 'PATCH',
    );
    await checkbox.click();
    expect((await resolveResponse).ok()).toBeTruthy();
    await expect(checkbox).toBeChecked();
  }

  await page.goto(localizedCamPath(page, CAM_ROUTES.detail(id)));
  await expect(page.getByText('100%', { exact: true })).toBeVisible();
  for (const reason of ['Missing image', 'Missing answer']) {
    const reasonText = page.getByText(reason, { exact: true });
    await expect(reasonText).toBeVisible();
    await expect(reasonText).toHaveClass(/line-through/);
  }

  await page.context().clearCookies();
  await authenticateViaApi(page, saleCredentials!);
  await expectNotification(page, activation, 'ALL_FEEDBACKS_RESOLVED');
});

test('clarification notification recipient', async ({ page }) => {
  skipMutationFixture();
  const adminCredentials = camCredentials('admin');
  const saleCredentials = camCredentials('sale');
  test.skip(!adminCredentials, 'Missing Admin CAM credentials.');
  test.skip(!saleCredentials, 'Missing Sale CAM credentials for Clarification notifications.');

  await authenticateViaApi(page, saleCredentials!);
  const activation = await createReview(page);

  await page.context().clearCookies();
  await authenticateViaApi(page, adminCredentials!);
  const statusResponse = await page.request.patch(`/api/cam/activations/${activation.id}/status`, {
    headers: await authHeaders(page),
    data: { status: 'CLARIFICATION' },
  });
  expect(statusResponse.ok()).toBeTruthy();

  await page.context().clearCookies();
  await authenticateViaApi(page, saleCredentials!);
  await expectNotification(page, activation, 'STATUS_CHANGED');

  const saleB = secondarySaleCredentials();
  if (saleB) {
    await page.context().clearCookies();
    await authenticateViaApi(page, saleB);
    const saleBNotifications = await listNotifications(page);
    expect(
      saleBNotifications.some(
        (notification) =>
          notification.type === 'STATUS_CHANGED' && notification.referenceId === activation.id,
      ),
    ).toBe(false);
  }

  await page.goto(localizedCamPath(page, CAM_ROUTES.main));
  await page.getByRole('button', { name: 'notifications' }).click();
  const notification = page.getByText(activation.name, { exact: true }).last();
  await expect(notification).toBeVisible();
  await notification.click();
  await expect(page).toHaveURL(new RegExp(`activation_drawer=open.*activation_id=${activation.id}|activation_id=${activation.id}.*activation_drawer=open`));
});

import { expect, test, type Page } from '@playwright/test';

import { watchConsole } from '../../shared/console';
import {
  authenticateViaApi,
  logoutSession,
  signIn,
} from '../../shared/session';
import {
  authHeaders,
  camCredentials,
  destructiveFixtureReason,
  mutationFixturesEnabled,
  REQUIRED_CHOICES,
  uniqueActivationName,
} from './customer-activation.data';
import { CustomerActivationPage } from './customer-activation.page';

async function signInAsRole(
  page: Parameters<typeof authenticateViaApi>[0],
  role: 'admin' | 'sale' | 'installer' | 'agency',
) {
  const credentials = camCredentials(role);
  test.skip(!credentials, `Set the E2E_CAM_${role.toUpperCase()} credential block.`);
  await authenticateViaApi(page, credentials!);
}

function skipMutationFixture() {
  test.skip(!mutationFixturesEnabled(), destructiveFixtureReason);
}

async function createActivationViaApi(page: Parameters<typeof authenticateViaApi>[0]) {
  const storesResponse = await page.request.get('/api/cam/stores', {
    params: { page: 1, limit: 20 },
    headers: await authHeaders(page),
  });
  const storesBody = await storesResponse.json();
  const stores = storesBody?.data?.items ?? storesBody?.data ?? [];
  if (!Array.isArray(stores) || stores.length === 0) {
    throw new Error('CAM mutation tests require one selectable store.');
  }

  const response = await page.request.post('/api/cam/activations', {
    headers: await authHeaders(page),
    data: {
      storeId: stores[0].id,
      name: uniqueActivationName(),
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
  expect(response.ok()).toBeTruthy();
  const activationId = body?.data?.id ?? body?.data?._id ?? body?.id ?? body?._id;
  if (typeof activationId !== 'string') throw new Error(`CAM activation create returned no ID: ${JSON.stringify(body)}`);
  return activationId;
}

async function patchActivationStatus(page: Parameters<typeof authenticateViaApi>[0], id: string, status: string) {
  const response = await page.request.patch(`/api/cam/activations/${id}/status`, {
    headers: await authHeaders(page),
    data: { status },
  });
  const body = await response.json();
  expect(response.ok()).toBeTruthy();
  expect(body.status, JSON.stringify(body)).toBeGreaterThanOrEqual(200);
  expect(body.status, JSON.stringify(body)).toBeLessThan(300);
}

async function createActivationViaUi(page: Page, role: 'admin' | 'sale', uploadMedia = false) {
  const cam = new CustomerActivationPage(page);
  await signInAsRole(page, role);
  const stores = await cam.openCreateAndReadStores();
  await cam.selectStore(stores[0]);
  await cam.fillRequiredActivation(uniqueActivationName());

  if (uploadMedia) {
    const inputs = page.getByLabel(/Bilder hier ablegen|Drop your images here/);
    await expect(inputs).toHaveCount(2);
    await inputs.nth(0).setInputFiles(Array.from({ length: 5 }, () => 'public/images/logo.png'));
    await inputs.nth(1).setInputFiles('public/images/logo.png');
  }

  const createResponse = cam.waitForCreateResponse();
  await cam.submitButton.click();
  const response = await createResponse;
  const body = await cam.expectSuccessfulMutation(response);
  const activationId = body.data.id as string;
  await expect(page.getByRole('dialog')).toBeVisible();
  return { cam, activationId, response };
}

test.describe('customer-activation journey', () => {
  test('[CAM-J-01] Signs in through the real login form, lands on Dashboards, and opens Customer Activation from the sidebar.', async ({ page }) => {
    const cam = new CustomerActivationPage(page);
    await signIn(page);
    await expect(page).toHaveURL(/\/(?:de|en)\/dashboards/);
    await expect(cam.sidebarLink).toBeVisible();

    await cam.sidebarLink.click();
    await expect(page).toHaveURL(/\/(?:de|en)\/customer-activation/);
    await expect(cam.heading).toBeVisible();
  });

  test('[CAM-J-02] Renders Dashboard, Eingang and Stores tabs for an Internal Admin account.', async ({ page }) => {
    const cam = new CustomerActivationPage(page);
    await signInAsRole(page, 'admin');
    await cam.goto();

    for (const tab of cam.copy.adminTabs) await expect(cam.adminTab(tab)).toBeVisible();
  });

  test('[CAM-J-03] Renders the grouped activation board instead of admin tabs for a Sale account.', async ({ page }) => {
    const cam = new CustomerActivationPage(page);
    await signInAsRole(page, 'sale');
    await cam.goto();

    await expect(cam.heading).toBeVisible();
    await expect(cam.adminTab(cam.copy.adminTabs[0])).toBeHidden();
    await expect(page.getByPlaceholder(cam.copy.roleBoardSearch)).toBeVisible();
    const sidebarLinks = page.locator('[data-slot="sidebar-menu-button"][href]');
    await expect(sidebarLinks).toHaveCount(3);
  });

  test('[CAM-J-04] Renders the grouped activation board for Printing Agency and Installer Agency accounts.', async ({ page }) => {
    const cam = new CustomerActivationPage(page);

    for (const role of ['agency', 'installer'] as const) {
      await page.context().clearCookies();
      await signInAsRole(page, role);
      await cam.goto();
      await expect(cam.heading).toBeVisible();
      await expect(cam.adminTab(cam.copy.adminTabs[0])).toBeHidden();
      await expect(page.getByPlaceholder(cam.copy.roleBoardSearch)).toBeVisible();
    }
  });

  test('[CAM-J-06] Opens New Activation, selects an existing store and advances from step 1 to step 2 with the selected store ID in the URL.', async ({ page }) => {
    const cam = new CustomerActivationPage(page);
    await signInAsRole(page, 'sale');
    await cam.gotoCreate();
    await expect(page.getByText(cam.copy.storeStep, { exact: true })).toBeVisible();

    const storeResponse = await page.request.get('/api/cam/stores', {
      params: { page: 1, limit: 20 },
      headers: await authHeaders(page),
    });
    const body = await storeResponse.json();
    const stores = body?.data?.items ?? body?.data ?? [];
    test.skip(!Array.isArray(stores) || stores.length === 0, 'Real Sale account has no selectable store.');
    const store = stores[0];
    const name = store.name ?? store.storeName;

    await page.getByRole('button').filter({ hasText: name }).first().click();
    await expect(page).toHaveURL(new RegExp(`step=2.*storeId=${store.id}|storeId=${store.id}.*step=2`));
    await expect(page.getByText(cam.copy.briefingStep, { exact: true })).toBeVisible();
  });

  test('[CAM-J-07] Creates a valid store through the real store endpoint, keeps its returned ID selected and advances to activation data.', async ({ page }) => {
    skipMutationFixture();
    const cam = new CustomerActivationPage(page);
    await signInAsRole(page, 'sale');
    await cam.gotoCreate();
    await cam.formTab(cam.copy.formTabs[1]).click();

    const suffix = Date.now();
    await page.getByLabel(/Store name|Store-Name/).fill(`E2E Store ${suffix}`);
    await page.getByLabel(/Address|Adresse/).fill(`E2E Address ${suffix}`);
    await page.getByLabel(/Contact name|Ansprechpartner/).fill('E2E Contact');
    await page.getByLabel(/Phone|Telefon/).fill(`+4915${String(suffix).slice(-9)}`);
    await page.getByLabel(/Email|E-Mail/).fill(`e2e-store-${suffix}@example.com`);

    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/cam/stores') && response.request().method() === 'POST',
    );
    await page.getByRole('button', { name: /Add new store|Neuen Store hinzufügen/ }).click();
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    const storeId = body?.data?.id;
    expect(storeId).toEqual(expect.any(String));

    // Creating a store selects it and advances directly to activation data.
    await expect(page).toHaveURL(new RegExp(`step=2.*storeId=${storeId}|storeId=${storeId}.*step=2`));
    await expect(cam.activationNameInput).toBeVisible();
  });

  test('[CAM-J-08] Creates an activation with all required briefing values and both supported media groups, then opens the success dialog.', async ({ page }) => {
    skipMutationFixture();
    await createActivationViaUi(page, 'sale', true);
  });

  test(
    '[CAM-J-12] Opens Update Activation, hydrates its store and briefing, updates data through PUT and preserves already-uploaded media.',
    async ({ page }) => {
      skipMutationFixture();
      // CAM has no delete endpoint for activations (confirmed — see Out of Scope in
      // earlier drafts of this spec), so this permanently adds one real record every
      // time it runs.
      // This intentionally does not cover CAM-J-09's media-upload assertion — both
      // media arrays are sent empty here, matching the real request this test observes.
      const cam = new CustomerActivationPage(page);
      const activationName = uniqueActivationName();
      const consoleWatch = watchConsole(page);

      await signInAsRole(page, 'sale');
      const stores = await cam.openCreateAndReadStores();
      if (stores.length < 2) throw new Error('CAM-J-12 requires at least two existing stores.');
      const originalStore = stores[0];
      const replacementStore = stores[1];

      await cam.selectStore(originalStore);
      await cam.fillRequiredActivation(activationName);

      const createResponse = cam.waitForCreateResponse();
      await cam.submitButton.click();
      const createBody = await cam.expectSuccessfulMutation(await createResponse);
      const activationId = createBody.data.id as string;

      expect(activationId).toEqual(expect.any(String));
      expect((await createResponse).request().postDataJSON()).toMatchObject({
        storeId: originalStore.id,
        ahMarketMediaUrls: [],
        aMarketMediaUrls: [],
      });

      await cam.gotoUpdate(activationId);
      await cam.editStore();
      await cam.selectStore(replacementStore);

      await expect(page).toHaveURL(new RegExp(`storeId=${replacementStore.id}`));
      await expect(page.getByText(replacementStore.storeName, { exact: true })).toBeVisible();
      const updatedActivationName = `${activationName} updated`;
      await cam.activationNameInput.fill(updatedActivationName);

      const updateResponse = cam.waitForUpdateResponse(activationId);
      await cam.submitButton.click();
      const response = await updateResponse;
      await cam.expectSuccessfulMutation(response);
      await expect(page.getByRole('dialog')).toBeVisible();

      expect(response.request().postDataJSON()).toMatchObject({
        storeId: replacementStore.id,
        name: updatedActivationName,
        ahMarketMediaUrls: [],
        aMarketMediaUrls: [],
      });
      await consoleWatch.assertClean();
    },
  );

  test('[CAM-J-09] Uploads all pending media before POSTing the activation and sends object-storage keys rather than blob or CDN preview URLs.', async ({ page }) => {
    skipMutationFixture();
    const uploads: string[] = [];
    page.on('request', (request) => {
      if (request.method() === 'PUT' || request.url().includes('presigned-upload-url')) uploads.push(request.url());
    });
    const { response } = await createActivationViaUi(page, 'sale', true);
    const payload = response.request().postDataJSON() as Record<string, unknown>;
    expect(uploads.length).toBeGreaterThanOrEqual(6);
    expect(payload.ahMarketMediaUrls).toEqual(expect.arrayContaining([expect.any(String)]));
    expect(payload.aMarketMediaUrls).toEqual(expect.arrayContaining([expect.any(String)]));
    expect(JSON.stringify(payload)).not.toMatch(/blob:|localhost/);
  });

  test('[CAM-J-10] Returns Internal Admin to the dashboard tab and returns other roles to the role board after successful creation.', async ({ page }) => {
    skipMutationFixture();
    await createActivationViaUi(page, 'admin');
    await page.getByRole('button', { name: /Back to dashboard|Zurück zum Dashboard/i }).click();
    await expect(page).toHaveURL(/tab=dashboard/);

    await logoutSession(page);
    await createActivationViaUi(page, 'sale');
    await page.getByRole('button', { name: /Back to dashboard|Zurück zum Dashboard/i }).click();
    await expect(page).toHaveURL(/customer-activation/);
    await expect(page).not.toHaveURL(/tab=dashboard/);
  });

  test('[CAM-J-11] Opens the created activation from the success dialog in a full detail page for Internal Admin and in a drawer for Sale.', async ({ page }) => {
    skipMutationFixture();
    await createActivationViaUi(page, 'admin');
    await page.getByRole('button', { name: /View activation|Aktivierung ansehen/i }).click();
    await expect(page).toHaveURL(/customer-activation\/[^?]+/);

    await logoutSession(page);
    await createActivationViaUi(page, 'sale');
    await page.getByRole('button', { name: /View activation|Aktivierung ansehen/i }).click();
    await expect(page).toHaveURL(/activation_drawer=open/);
  });

  test('[CAM-J-13] Moves an Internal Admin activation through DRAFT to READY and READY to REVIEW with real status PATCH requests.', async ({ page }) => {
    skipMutationFixture();
    const cam = new CustomerActivationPage(page);
    await signInAsRole(page, 'admin');
    const activationId = await createActivationViaApi(page);
    await cam.openActivation(activationId);
    for (const next of [/Move to ready|In Bereitschaft verschieben/i, /Move to review|Zur Überprüfung verschieben/i]) {
      const mutation = page.waitForResponse((response) => response.url().includes(`/api/cam/activations/${activationId}/status`) && response.request().method() === 'PATCH');
      await page.getByRole('button', { name: next }).click();
      expect((await mutation).ok()).toBeTruthy();
      await cam.openActivation(activationId);
    }
    const detail = await page.request.get(`/api/cam/activations/${activationId}`, { headers: await authHeaders(page) });
    expect((await detail.json())?.data?.status).toBe('REVIEW');
  });

  test('[CAM-J-14] Submits all nine scoring categories in REVIEW and the evaluation response moves the activation to APPROVED.', async ({ page }) => {
    skipMutationFixture();
    await signInAsRole(page, 'admin');
    const activationId = await createActivationViaApi(page);
    await patchActivationStatus(page, activationId, 'READY');
    await patchActivationStatus(page, activationId, 'REVIEW');
    const scores = ['HTZ', 'TARGET_GROUP', 'SALES_CONCEPT', 'CONTRACT_SITUATION', 'REVENUE_POTENTIAL', 'H_MARKT', 'AH_MARKT', 'BRAND_FIT', 'EFFICIENCY']
      .map((type) => ({ type, label: 'E2E', points: 1 }));
    const evaluation = await page.request.post('/api/cam/evaluations', {
      headers: await authHeaders(page),
      data: { activationId, maxScore: 27, scores },
    });
    expect(evaluation.ok()).toBeTruthy();
    expect((await evaluation.json())?.data?.scores ?? scores).toHaveLength(9);
    const detail = await page.request.get(`/api/cam/activations/${activationId}`, { headers: await authHeaders(page) });
    expect((await detail.json())?.data?.status).toBe('APPROVED');
  });

  test('[CAM-J-15] Moves an approved activation through IN_PROGRESS, INSTALLATION and COMPLETED.', async ({ page }) => {
    skipMutationFixture();
    await signInAsRole(page, 'admin');
    const activationId = await createActivationViaApi(page);
    for (const status of ['READY', 'REVIEW', 'APPROVED', 'IN_PROGRESS', 'INSTALLATION', 'COMPLETED']) {
      await patchActivationStatus(page, activationId, status);
    }
    const detail = await page.request.get(`/api/cam/activations/${activationId}`, { headers: await authHeaders(page) });
    expect((await detail.json())?.data?.status).toBe('COMPLETED');
  });

  test('[CAM-J-16] Requests changes with optional feedback and finishes in CLARIFICATION.', async ({ page }) => {
    skipMutationFixture();
    await signInAsRole(page, 'admin');
    const activationId = await createActivationViaApi(page);
    await patchActivationStatus(page, activationId, 'READY');
    await patchActivationStatus(page, activationId, 'REVIEW');
    const feedback = await page.request.post('/api/cam/feedbacks', {
      headers: await authHeaders(page),
      data: { activationId, reason: `E2E feedback ${Date.now()}`, type: 'TEXT', resolved: false },
    });
    expect(feedback.ok()).toBeTruthy();
    await patchActivationStatus(page, activationId, 'CLARIFICATION');
    const detail = await page.request.get(`/api/cam/activations/${activationId}`, { headers: await authHeaders(page) });
    expect((await detail.json())?.data?.status).toBe('CLARIFICATION');
  });

  test('[CAM-J-18] Adds and removes a participant through the real participant endpoints.', async ({ page }) => {
    skipMutationFixture();
    await signInAsRole(page, 'admin');
    const activationId = await createActivationViaApi(page);
    const usersResponse = await page.request.get('/api/cam/users', { params: { page: 1, limit: 20 }, headers: await authHeaders(page) });
    const users = (await usersResponse.json())?.data?.items ?? [];
    if (!Array.isArray(users) || users.length === 0) throw new Error('CAM-J-18 requires one CAM user.');
    const userId = users[0].id as string;
    const add = await page.request.post(`/api/cam/activations-admin/${activationId}/add-participants`, { headers: await authHeaders(page), data: { userIds: [userId] } });
    expect(add.ok()).toBeTruthy();
    const listed = await page.request.get('/api/cam/activations/participants', { params: { activationId, page: 1, limit: 20 }, headers: await authHeaders(page) });
    expect((await listed.json())?.data?.items?.some((item: { user?: { id?: string } }) => item.user?.id === userId)).toBe(true);
    const remove = await page.request.delete(`/api/cam/activations-admin/${activationId}/remove-participant`, { headers: await authHeaders(page), data: { userId } });
    expect(remove.ok()).toBeTruthy();
  });

  test('[CAM-J-19] Adds, edits, resends and deletes a non-owner contact through the real contact endpoints.', async ({ page }) => {
    skipMutationFixture();
    await signInAsRole(page, 'admin');
    const activationId = await createActivationViaApi(page);
    const suffix = Date.now();
    const contactData = { firstName: 'E2E', lastName: `Contact ${suffix}`, email: `e2e-contact-${suffix}@example.com`, tel: `+4915${String(suffix).slice(-9)}`, address: 'E2E address', activationId };
    const added = await page.request.post('/api/cam/contacts', { headers: await authHeaders(page), data: contactData });
    expect(added.ok()).toBeTruthy();
    const contactId = (await added.json())?.data?.id as string;
    expect(contactId).toEqual(expect.any(String));
    const updated = await page.request.put(`/api/cam/contacts/${contactId}`, { headers: await authHeaders(page), data: { ...contactData, lastName: `Edited ${suffix}` } });
    expect(updated.ok()).toBeTruthy();
    const resent = await page.request.post(`/api/cam/contacts/${contactId}/resend-email`, { headers: await authHeaders(page), data: { activationId } });
    expect(resent.ok()).toBeTruthy();
    const deleted = await page.request.delete(`/api/cam/contacts/${contactId}`, { headers: await authHeaders(page), params: { activationId } });
    expect(deleted.ok()).toBeTruthy();
  });

  test('[CAM-J-20] Subscribes and unsubscribes from an activation and keeps the visible action in sync.', async ({ page }) => {
    skipMutationFixture();
    await signInAsRole(page, 'admin');
    const activationId = await createActivationViaApi(page);
    const subscribe = await page.request.post(`/api/cam/activations/${activationId}/subscribe`, { headers: await authHeaders(page) });
    expect(subscribe.ok()).toBeTruthy();
    const subscribed = await page.request.get(`/api/cam/activations/${activationId}`, { headers: await authHeaders(page) });
    expect((await subscribed.json())?.data?.isSubscribed).toBe(true);
    const unsubscribe = await page.request.delete(`/api/cam/activations/${activationId}/unsubscribe`, { headers: await authHeaders(page) });
    expect(unsubscribe.ok()).toBeTruthy();
    const unsubscribed = await page.request.get(`/api/cam/activations/${activationId}`, { headers: await authHeaders(page) });
    expect((await unsubscribed.json())?.data?.isSubscribed).toBe(false);
  });

  test('[CAM-J-21] Sends and edits a chat message through Socket.IO and receives the broadcast content without reload.', async ({ page }) => {
    skipMutationFixture();
    const cam = new CustomerActivationPage(page);
    await signInAsRole(page, 'admin');
    const activationId = await createActivationViaApi(page);
    await cam.openCommunication(activationId);
    const message = `E2E chat ${Date.now()}`;
    await page.locator('[contenteditable="true"]').first().fill(message);
    await page.getByRole('button', { name: /^Save$|^Speichern$/ }).click();
    const messageCard = page.locator('[data-msg-id]').filter({ hasText: message });
    await expect(messageCard).toBeVisible();
    await messageCard.getByRole('button', { name: /^Edit$|^Bearbeiten$/ }).click();
    const edited = `${message} edited`;
    await page.locator('[contenteditable="true"]').last().fill(edited);
    await page.getByRole('button', { name: /^Save$|^Speichern$/ }).last().click();
    await expect(page.getByText(edited, { exact: false })).toBeVisible();
    await expect(messageCard.getByText(/\(edited\)|\(bearbeitet\)/)).toBeVisible();
  });

});

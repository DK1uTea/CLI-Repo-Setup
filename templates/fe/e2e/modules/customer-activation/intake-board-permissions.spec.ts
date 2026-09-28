import { expect, test, type Page } from '@playwright/test';

import { authenticateViaApi, logoutSession } from '../../shared/session';
import {
  authHeaders,
  camCredentials,
  camCopy,
  CAM_ROUTES,
  destructiveFixtureReason,
  localizedCamPath,
  mutationFixturesEnabled,
  REQUIRED_CHOICES,
  uniqueActivationName,
} from './customer-activation.data';
import { CustomerActivationPage } from './customer-activation.page';

function skipMutationFixture() {
  test.skip(!mutationFixturesEnabled(), destructiveFixtureReason);
}

async function createSaleDraft(page: Page) {
  const storesResponse = await page.request.get('/api/cam/stores', {
    params: { page: 1, limit: 20 }, headers: await authHeaders(page),
  });
  const stores = (await storesResponse.json())?.data?.items ?? [];
  if (!Array.isArray(stores) || !stores[0]?.id) throw new Error('Permission test needs one selectable CAM store.');
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

async function openBoard(page: Page, role: 'admin' | 'sale') {
  const credentials = camCredentials(role);
  test.skip(!credentials, `Missing ${role} CAM credentials.`);
  await authenticateViaApi(page, credentials!);
  const cam = new CustomerActivationPage(page);
  const path = `${localizedCamPath(page, CAM_ROUTES.main)}?tab=intake-board`;
  const board = page.getByRole('region', { name: /activation board|aktivierungs-board/i });
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try { await page.goto(path); } catch (error) { if (attempt === 1) throw error; }
    try { await expect(board).toBeVisible({ timeout: 15_000 }); return cam; } catch (error) { if (attempt === 1) throw error; await logoutSession(page); await authenticateViaApi(page, credentials!); }
  }
  return cam;
}

async function createActivationAssignedToRole(page: Page, assigneeEmail?: string, activationName = uniqueActivationName()) {
  const storesResponse = await page.request.get('/api/cam/stores', {
    params: { page: 1, limit: 20 }, headers: await authHeaders(page),
  });
  const stores = (await storesResponse.json())?.data?.items ?? [];
  if (!Array.isArray(stores) || !stores[0]?.id) throw new Error('Role permission test needs one CAM store.');

  const name = activationName;
  const response = await page.request.post('/api/cam/activations', {
    headers: await authHeaders(page),
    data: {
      storeId: stores[0].id, name, responsibleCam: REQUIRED_CHOICES.responsible,
      numberOfOutlets: 1, outletNotes: '', highTrafficZones: ['TRAIN_STATION'], highTrafficZoneNotes: '',
      targetGroups: ['TEENAGERS'], targetGroupNotes: '', salesConcepts: ['TAKE_AWAY'], salesConceptNotes: '',
      contractSituations: ['NO_CONTRACT'], contractSituationNotes: '', revenuePotentials: ['NEW_CUSTOMER_ACQUISITION'],
      ahMarket: ['ENTRANCE_AREA'], ahMarketMediaUrls: [], aMarket: ['REFRIGERATOR'], aMarketMediaUrls: [],
      brandFit: 'STANDARD', brandFitNotes: '', profitability: 'WITHIN_FRAMEWORK',
    },
  });
  const body = await response.json();
  expect(response.ok(), JSON.stringify(body)).toBeTruthy();
  const id = body?.data?.id ?? body?.data?._id ?? body?.id;
  expect(id).toEqual(expect.any(String));

  if (assigneeEmail) {
    const usersResponse = await page.request.get('/api/cam/users', {
      params: { page: 1, limit: 100 }, headers: await authHeaders(page),
    });
    const users = (await usersResponse.json())?.data?.items ?? [];
    const assignee = Array.isArray(users)
      ? users.find((user: { email?: string }) => user.email?.toLowerCase() === assigneeEmail.toLowerCase())
      : undefined;
    if (!assignee?.id) throw new Error(`Role permission test could not find ${assigneeEmail} in CAM users.`);

    const assign = await page.request.post(`/api/cam/activations-admin/${id}/add-participants`, {
      headers: await authHeaders(page), data: { userIds: [assignee.id] },
    });
    expect(assign.ok(), JSON.stringify(await assign.json())).toBeTruthy();
  }

  const ready = await page.request.patch(`/api/cam/activations/${id}/status`, {
    headers: await authHeaders(page), data: { status: 'READY' },
  });
  expect(ready.ok(), JSON.stringify(await ready.json())).toBeTruthy();
  return { id: id as string, name };
}

test('intake board draft visibility by role', async ({ page }) => {
  test.setTimeout(120_000);
  skipMutationFixture();
  await openBoard(page, 'sale');
  const activation = await createSaleDraft(page);
  await page.reload();
  await expect(page.getByText(activation.name, { exact: true })).toBeVisible();

  await logoutSession(page);
  await openBoard(page, 'admin');
  await expect(page.getByText(activation.name, { exact: true })).toHaveCount(0);

  await logoutSession(page);
  await openBoard(page, 'sale');
  const saleCardName = page.getByText(activation.name, { exact: true });
  const saleCardHeader = saleCardName.locator('..');
  await saleCardHeader.getByRole('button', { name: /more options|weitere optionen/i }).click();
  const mutation = page.waitForResponse((response) => response.url().includes(`/api/cam/activations/${activation.id}/status`) && response.request().method() === 'PATCH');
  await page.getByRole('menuitem', { name: new RegExp(camCopy(page).boardColumns[1], 'i') }).click();
  expect((await mutation).ok()).toBeTruthy();
  await page.reload();
  const saleReadyCard = page.getByText(activation.name, { exact: true }).locator('..');
  await expect(saleReadyCard.getByRole('button', { name: /more options|weitere optionen/i })).toHaveCount(0);

  await logoutSession(page);
  const adminCam = await openBoard(page, 'admin');
  await expect(page.getByText(activation.name, { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: adminCam.copy.boardColumns[1], exact: true })).toBeVisible();
  const adminCardName = page.getByText(activation.name, { exact: true });
  await adminCardName.locator('..').getByRole('button', { name: /more options|weitere optionen/i }).click();
  const adminMutation = page.waitForResponse((response) => response.url().includes(`/api/cam/activations/${activation.id}/status`) && response.request().method() === 'PATCH');
  await page.getByRole('menuitem', { name: new RegExp(adminCam.copy.boardColumns[2], 'i') }).click();
  expect((await adminMutation).ok()).toBeTruthy();
  await page.reload();
  await expect(page.getByText(activation.name, { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: adminCam.copy.boardColumns[2], exact: true })).toBeVisible();
});

test('agency assignment and read-only board status', async ({ page }) => {
  skipMutationFixture();
  const adminCredentials = camCredentials('admin');
  const saleCredentials = camCredentials('sale');
  const agencyCredentials = camCredentials('agency');
  test.skip(!adminCredentials, 'Missing Admin CAM credentials.');
  test.skip(!saleCredentials, 'Missing Sales Rep CAM credentials.');
  test.skip(!agencyCredentials, 'Missing Agency CAM credentials.');

  await authenticateViaApi(page, adminCredentials!);
  const activation = await createActivationAssignedToRole(page, agencyCredentials!.email);
  const usersResponse = await page.request.get('/api/cam/users', {
    params: { page: 1, limit: 100 }, headers: await authHeaders(page),
  });
  const users = (await usersResponse.json())?.data?.items ?? [];
  const currentParticipantsResponse = await page.request.get('/api/cam/activations/participants', {
    params: { activationId: activation.id, page: 1, limit: 20 }, headers: await authHeaders(page),
  });
  const currentParticipants = (await currentParticipantsResponse.json())?.data?.items ?? [];
  const existingParticipantIds = Array.isArray(currentParticipants)
    ? currentParticipants.map((item: { user?: { id?: string } }) => item.user?.id).filter((id): id is string => Boolean(id))
    : [];
  const participantIds = Array.isArray(users)
    ? users.map((user: { id?: string }) => user.id)
      .filter((id): id is string => typeof id === 'string' && !existingParticipantIds.includes(id))
      .slice(0, Math.max(0, 6 - existingParticipantIds.length))
    : [];
  expect(existingParticipantIds.length + participantIds.length).toBeGreaterThanOrEqual(6);
  if (participantIds.length > 0) {
    const participants = await page.request.post(`/api/cam/activations-admin/${activation.id}/add-participants`, {
      headers: await authHeaders(page), data: { userIds: participantIds },
    });
    expect(participants.ok(), JSON.stringify(await participants.json())).toBeTruthy();
  }
  await page.context().clearCookies();
  await authenticateViaApi(page, saleCredentials!);
  const unassigned = await createActivationAssignedToRole(page);
  await authenticateViaApi(page, agencyCredentials!);
  const cam = new CustomerActivationPage(page);
  await cam.goto();
  const board = page.getByRole('region', { name: /activation board|aktivierungs-board/i });
  await expect(board).toBeVisible();
  await expect(board.getByText(activation.name, { exact: true })).toBeVisible();
  await expect(board.getByText(unassigned.name, { exact: true })).toHaveCount(0);

  const agencyCard = board.getByTestId('cam-intake-card').filter({ hasText: activation.name }).first();
  await expect(agencyCard.getByRole('button', { name: /more options|weitere optionen/i })).toHaveCount(0);

  await page.context().clearCookies();
  await authenticateViaApi(page, adminCredentials!);
  const adminMutation = await page.request.patch(`/api/cam/activations/${activation.id}/status`, {
    headers: await authHeaders(page), data: { status: 'REVIEW' },
  });
  expect(adminMutation.ok(), JSON.stringify(await adminMutation.json())).toBeTruthy();

  await page.context().clearCookies();
  await authenticateViaApi(page, agencyCredentials!);
  await cam.goto();
  await expect(page.getByText(activation.name, { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: cam.copy.boardColumns[2], exact: true })).toBeVisible();

  const agencyCardAfterStatus = page.getByTestId('cam-intake-card').filter({ hasText: activation.name }).first();
  const chatCount = Number(await agencyCardAfterStatus.getByTestId('cam-intake-chat-count').textContent());
  const fileCount = Number(await agencyCardAfterStatus.getByTestId('cam-intake-file-count').textContent());
  await agencyCardAfterStatus.click();
  const detailDialog = page.getByRole('dialog').first();
  await expect(detailDialog).toBeVisible();
  await expect(detailDialog.getByText(/Participants|Teilnehmer/, { exact: false })).toBeVisible();
  await expect(detailDialog.getByText(/^\+\d+$/, { exact: true })).toBeVisible();

  await detailDialog.getByRole('tab', { name: cam.copy.detailTabs.communication }).click();
  await detailDialog.getByTestId('cam-chat-composer-trigger').click();
  const comment = `Agency counter ${Date.now()}`;
  await detailDialog.locator('[contenteditable="true"]').first().fill(comment);
  const groupedAfterComment = page.waitForResponse((value) => value.url().includes('/api/cam/activations/grouped'));
  await detailDialog.getByRole('button', { name: /^Save$|^Speichern$/i }).click();
  expect((await groupedAfterComment).ok()).toBeTruthy();
  await expect(detailDialog.locator('[data-msg-id]').filter({ hasText: comment })).toBeVisible();
  await expect(agencyCardAfterStatus.getByTestId('cam-intake-chat-count')).toHaveText(String(chatCount + 1));
  const messageCard = detailDialog.locator('[data-msg-id]').filter({ hasText: comment }).first();
  const messageId = await messageCard.getAttribute('data-msg-id');
  expect(messageId).toEqual(expect.any(String));
  const stableMessageCard = detailDialog.locator(`[data-msg-id="${messageId}"]`);
  await stableMessageCard.getByRole('button', { name: /^Edit$|^Bearbeiten$/i }).click();
  const editedComment = `${comment} edited`;
  await stableMessageCard.locator('[contenteditable="true"]').fill(editedComment);
  await stableMessageCard.getByRole('button', { name: /^Save$|^Speichern$/i }).click();
  await expect(stableMessageCard.getByText(editedComment, { exact: true })).toBeVisible();
  await stableMessageCard.getByRole('button', { name: /^Reply$|^Antworten$/i }).click();
  const reply = `Agency reply ${Date.now()}`;
  await stableMessageCard.locator('[contenteditable="true"]').fill(reply);
  await stableMessageCard.getByRole('button', { name: /^Save$|^Speichern$/i }).click();
  const replyCard = detailDialog.locator('[data-msg-id]').filter({ hasText: reply }).first();
  await expect(replyCard).toBeVisible();
  await expect(replyCard.getByText(editedComment, { exact: true })).toBeVisible();
  const chatCountBeforeFile = Number(await agencyCardAfterStatus.getByTestId('cam-intake-chat-count').textContent());

  await detailDialog.getByRole('tab', { name: cam.copy.detailTabs.overview }).click();
  await detailDialog.getByRole('button', { name: /^Add$|^Hinzufügen$/i }).click();
  const attachmentDialog = page.getByRole('dialog').last();
  await attachmentDialog.locator('input[type="file"]').setInputFiles('public/images/logo.png');
  const fileMutation = page.waitForResponse(
    (value) => value.url().includes('/api/cam/activations/') && value.url().endsWith('/media') && value.request().method() === 'PATCH',
  );
  const groupedAfterFile = page.waitForResponse((value) => value.url().includes('/api/cam/activations/grouped'));
  await attachmentDialog.getByRole('button', { name: /^Save$|^Speichern$/i }).click();
  expect((await fileMutation).ok()).toBeTruthy();
  expect((await groupedAfterFile).ok()).toBeTruthy();
  const attachedFileName = detailDialog
    .getByRole('tabpanel')
    .getByText(/\.(?:png|jpe?g|gif|webp|pdf|docx?|xlsx?)$/i, { exact: false })
    .last();
  await expect(attachedFileName).toBeVisible();
  const fileMenu = detailDialog.getByRole('button', { name: /More options|Weitere Optionen/ }).first();
  await fileMenu.click();
  await expect(page.getByRole('menuitem', { name: /Download|Herunterladen/ })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(agencyCardAfterStatus.getByTestId('cam-intake-chat-count')).toHaveText(String(chatCountBeforeFile));
  await expect(agencyCardAfterStatus.getByTestId('cam-intake-file-count')).toHaveText(String(fileCount + 1));

});

test('installer assignment, counters and read-only board flow', async ({ page }) => {
  skipMutationFixture();
  const adminCredentials = camCredentials('admin');
  const saleCredentials = camCredentials('sale');
  const installerCredentials = camCredentials('installer');
  test.skip(!adminCredentials, 'Missing Admin CAM credentials.');
  test.skip(!saleCredentials, 'Missing Sales Rep CAM credentials.');
  test.skip(!installerCredentials, 'Missing Installer CAM credentials.');

  const suffix = Date.now();
  await authenticateViaApi(page, adminCredentials!);
  const alpha = await createActivationAssignedToRole(
    page,
    installerCredentials!.email,
    `E2E Installer Alpha ${suffix}`,
  );
  const omega = await createActivationAssignedToRole(
    page,
    installerCredentials!.email,
    `E2E Installer Omega ${suffix}`,
  );

  await page.context().clearCookies();
  await authenticateViaApi(page, saleCredentials!);
  const hidden = await createActivationAssignedToRole(page, undefined, `E2E Installer Hidden ${suffix}`);

  await page.context().clearCookies();
  await authenticateViaApi(page, installerCredentials!);
  const cam = new CustomerActivationPage(page);
  await cam.goto();
  const board = page.getByRole('region', { name: /activation board|aktivierungs-board/i });
  await expect(board).toBeVisible();
  await expect(page.locator('[data-slot="sidebar-menu-button"][href]')).toHaveCount(3);
  await expect(board.getByRole('heading', { name: /Draft|EntwÃ¼rfe/, exact: true })).toHaveCount(0);

  const statuses = ['READY', 'REVIEW', 'CLARIFICATION', 'APPROVED', 'IN_PROGRESS', 'INSTALLATION', 'COMPLETED'] as const;
  for (const status of statuses) {
    const column = board.getByTestId(`cam-intake-column-${status.toLowerCase()}`).first();
    await expect(column).toBeVisible();
    await expect(column.getByTestId('cam-intake-column-count')).toBeVisible();
  }

  const alphaCard = board.getByTestId('cam-intake-card').filter({ hasText: alpha.name }).first();
  const omegaCard = board.getByTestId('cam-intake-card').filter({ hasText: omega.name }).first();
  await expect(alphaCard).toBeVisible();
  await expect(omegaCard).toBeVisible();
  await expect(board.getByText(hidden.name, { exact: true })).toHaveCount(0);
  await expect(alphaCard.getByTestId('cam-intake-chat-count')).toHaveText('0');
  await expect(alphaCard.getByTestId('cam-intake-file-count')).toHaveText('0');

  const search = page.getByTestId('cam-intake-board-search')
    .or(page.getByPlaceholder(cam.copy.roleBoardSearch)).first();
  await search.fill(alpha.name.toUpperCase());
  await expect(alphaCard).toBeVisible();
  await expect(board.getByTestId('cam-intake-card').filter({ hasText: omega.name })).toHaveCount(0);
  await search.fill(hidden.name.slice(0, 16));
  await expect(board.getByTestId('cam-intake-card')).toHaveCount(0);
  await search.fill('');
  await expect(alphaCard).toBeVisible();
  await expect(omegaCard).toBeVisible();

  const sort = page.getByRole('combobox', { name: /Sort|Sortieren/ });
  await expect(sort).toContainText(/A.?Z/i);
  await sort.click();
  await page.getByRole('option', { name: /A.?Z/i }).click();
  const ascSort = new URL(page.url()).searchParams.get('sortBy');
  expect(ascSort ?? 'NAME_ASC').toBe('NAME_ASC');
  const readyCards = board.getByTestId('cam-intake-column-ready').getByTestId('cam-intake-card');
  const ascNames = await readyCards.allTextContents();
  expect(ascNames.findIndex((text) => text.includes(alpha.name))).toBeLessThan(
    ascNames.findIndex((text) => text.includes(omega.name)),
  );

  await sort.click();
  await page.getByRole('option', { name: /Z.?A/i }).click();
  await expect(page).toHaveURL(/sortBy=NAME_DESC/);
  await expect(alphaCard).toBeVisible();
  await expect(omegaCard).toBeVisible();
  const descNames = await readyCards.allTextContents();
  expect(descNames.findIndex((text) => text.includes(omega.name))).toBeLessThan(
    descNames.findIndex((text) => text.includes(alpha.name)),
  );
  await search.fill('E2E INSTALLER ALPHA');
  await expect(board.getByTestId('cam-intake-card').filter({ hasText: alpha.name })).toHaveCount(1);

  await page.context().clearCookies();
  await authenticateViaApi(page, adminCredentials!);
  const moved = await page.request.patch(`/api/cam/activations/${alpha.id}/status`, {
    headers: await authHeaders(page), data: { status: 'REVIEW' },
  });
  expect(moved.ok(), JSON.stringify(await moved.json())).toBeTruthy();

  await page.context().clearCookies();
  await authenticateViaApi(page, installerCredentials!);
  await cam.goto();
  const reviewCard = page.getByTestId('cam-intake-card').filter({ hasText: alpha.name }).first();
  await expect(page.getByRole('heading', { name: cam.copy.boardColumns[2], exact: true })).toBeVisible();
  await expect(reviewCard).toBeVisible();
  await reviewCard.click();
  const detailDialog = page.getByRole('dialog').first();
  await expect(detailDialog).toBeVisible();
  await expect(detailDialog.locator('footer').getByRole('button')).toHaveCount(0);

  await detailDialog.getByRole('tab', { name: cam.copy.detailTabs.communication }).click();
  await cam.chatComposerTrigger.click();
  const comment = `Installer counter ${suffix}`;
  await detailDialog.locator('[contenteditable="true"]').first().fill(comment);
  const groupedAfterComment = page.waitForResponse((value) => value.url().includes('/api/cam/activations/grouped'));
  await detailDialog.getByRole('button', { name: /^Save$|^Speichern$/i }).click();
  expect((await groupedAfterComment).ok()).toBeTruthy();
  await expect(detailDialog.locator('[data-msg-id]').filter({ hasText: comment })).toBeVisible();
  await expect(reviewCard.getByTestId('cam-intake-chat-count')).toHaveText('1');

  await detailDialog.getByRole('tab', { name: cam.copy.detailTabs.overview }).click();
  await detailDialog.getByRole('button', { name: /^Add$|^HinzufÃ¼gen$/i }).click();
  const attachmentDialog = page.getByRole('dialog').last();
  await attachmentDialog.locator('input[type="file"]').setInputFiles('public/images/logo.png');
  const fileMutation = page.waitForResponse(
    (value) => value.url().includes('/api/cam/activations/') && value.url().endsWith('/media') && value.request().method() === 'PATCH',
  );
  const groupedAfterFile = page.waitForResponse((value) => value.url().includes('/api/cam/activations/grouped'));
  await attachmentDialog.getByRole('button', { name: /^Save$|^Speichern$/i }).click();
  expect((await fileMutation).ok()).toBeTruthy();
  expect((await groupedAfterFile).ok()).toBeTruthy();
  await expect(detailDialog.getByText(/\.(?:png|jpe?g|gif|webp|pdf|docx?|xlsx?)$/i, { exact: false }).last()).toBeVisible();
  await expect(reviewCard.getByTestId('cam-intake-file-count')).toHaveText('1');
});

test('agency and installer detail renders activity, participants, attachments and realtime communication', async ({ page, browser }) => {
  skipMutationFixture();
  const adminCredentials = camCredentials('admin');
  const agencyCredentials = camCredentials('agency');
  const installerCredentials = camCredentials('installer');
  test.skip(!adminCredentials, 'Missing Admin CAM credentials.');
  test.skip(!agencyCredentials, 'Missing Agency CAM credentials.');
  test.skip(!installerCredentials, 'Missing Installer CAM credentials.');

  await authenticateViaApi(page, adminCredentials!);
  const activation = await createActivationAssignedToRole(
    page,
    agencyCredentials!.email,
    `E2E Detail realtime ${Date.now()}`,
  );

  const usersResponse = await page.request.get('/api/cam/users', {
    params: { page: 1, limit: 100 }, headers: await authHeaders(page),
  });
  const users = (await usersResponse.json())?.data?.items ?? [];
  const installer = Array.isArray(users)
    ? users.find((user: { id?: string; email?: string; name?: string }) =>
      user.email?.toLowerCase() === installerCredentials!.email.toLowerCase())
    : undefined;
  expect(installer?.id, 'Installer must be available as an activation participant.').toEqual(expect.any(String));

  const currentResponse = await page.request.get('/api/cam/activations/participants', {
    params: { activationId: activation.id, page: 1, limit: 100 }, headers: await authHeaders(page),
  });
  const current = (await currentResponse.json())?.data?.items ?? [];
  const existingIds = Array.isArray(current)
    ? current.map((item: { user?: { id?: string } }) => item.user?.id).filter((id): id is string => Boolean(id))
    : [];
  const extraUsers = Array.isArray(users)
    ? users.filter((user: { id?: string }) => user.id && !existingIds.includes(user.id))
      .filter((user: { id?: string }) => user.id !== installer.id)
      .slice(0, 11)
    : [];
  test.skip(extraUsers.length < 10, 'Activity Load more needs at least ten additional CAM users.');

  const participantIds = [installer.id, ...extraUsers.map((user: { id: string }) => user.id)];
  const addParticipants = await page.request.post(`/api/cam/activations-admin/${activation.id}/add-participants`, {
    headers: await authHeaders(page), data: { userIds: participantIds },
  });
  expect(addParticipants.ok(), JSON.stringify(await addParticipants.json())).toBeTruthy();
  const removedParticipants = extraUsers.slice(1, 3);
  for (const participant of removedParticipants) {
    const response = await page.request.delete(`/api/cam/activations-admin/${activation.id}/remove-participant`, {
      headers: await authHeaders(page), data: { userId: participant.id },
    });
    expect(response.ok(), JSON.stringify(await response.json())).toBeTruthy();
  }
  const statusResponse = await page.request.patch(`/api/cam/activations/${activation.id}/status`, {
    headers: await authHeaders(page), data: { status: 'REVIEW' },
  });
  expect(statusResponse.ok(), JSON.stringify(await statusResponse.json())).toBeTruthy();

  await page.context().clearCookies();
  await authenticateViaApi(page, agencyCredentials!);
  const agencyCam = new CustomerActivationPage(page);
  await agencyCam.goto();
  const agencyCard = page.getByTestId('cam-intake-card').filter({ hasText: activation.name }).first();
  await expect(agencyCard).toBeVisible();
  await agencyCard.click();
  const agencyDetail = page.getByRole('dialog').first();
  await expect(agencyDetail).toBeVisible();

  const detailResponse = await page.request.get(`/api/cam/activations/${activation.id}`, {
    headers: await authHeaders(page),
  });
  expect(detailResponse.ok()).toBeTruthy();
  const detail = (await detailResponse.json())?.data;
  expect(detail?.code).toEqual(expect.any(String));
  expect(detail?.createdAt).toEqual(expect.any(String));
  await expect(agencyDetail.getByTestId('cam-case-id')).toHaveText(detail.code);
  await expect(agencyDetail.getByTestId('cam-case-id')).toHaveAttribute('aria-readonly', 'true');
  await expect(agencyDetail.getByTestId('cam-case-created')).toHaveAttribute('data-created-at', detail.createdAt);
  await expect(agencyDetail.getByTestId('cam-case-created')).toHaveText(/\d{2}[./-]\d{2}[./-]\d{4}/);
  const contactInfo = [detail.store?.contactName, detail.store?.contactPhone, detail.store?.contactEmail]
    .filter((value): value is string => Boolean(value)).join(', ');
  if (contactInfo) await expect(agencyDetail.getByTestId('cam-case-contact')).toHaveText(contactInfo);

  const avatars = agencyDetail.getByTestId('cam-participant-avatar');
  await expect(avatars).toHaveCount(3);
  await expect(agencyDetail.getByText(/^\+\d+$/, { exact: true })).toBeVisible();
  const firstParticipantName = await avatars.first().getAttribute('aria-label');
  expect(firstParticipantName).toEqual(expect.any(String));
  await avatars.first().hover();
  await expect(page.getByRole('tooltip')).toHaveText(firstParticipantName!);

  await agencyDetail.getByRole('tab', { name: agencyCam.copy.detailTabs.overview }).click();
  const attachedFileButton = agencyDetail.getByRole('button', { name: /^Add$|^Hinzufügen$/i });
  await attachedFileButton.click();
  const attachmentDialog = page.getByRole('dialog').last();
  await attachmentDialog.locator('input[type="file"]').setInputFiles([
    'public/images/logo.png',
    'public/images/logo_red.png',
  ]);
  const fileMutation = page.waitForResponse(
    (response) => response.url().includes('/api/cam/activations/') && response.url().endsWith('/media') && response.request().method() === 'PATCH',
  );
  await attachmentDialog.getByRole('button', { name: /^Save$|^Speichern$/i }).click();
  expect((await fileMutation).ok()).toBeTruthy();
  const attachedFile = agencyDetail.getByTestId('cam-attached-file').first();
  await expect(attachedFile).toBeVisible();
  await expect(attachedFile.getByTestId('cam-attached-file-name')).toHaveText(/\S+/);
  const fileDate = await attachedFile.getByTestId('cam-attached-file-date').getAttribute('data-created-at');
  expect(fileDate).toEqual(expect.any(String));
  expect(Date.parse(fileDate!)).not.toBeNaN();
  await attachedFile.click();
  await expect(page.locator('.cam-attached-file-lightbox')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.cam-attached-file-lightbox')).toBeHidden();
  const attachedFileName = await attachedFile.getByTestId('cam-attached-file-name').textContent();
  const attachedFileMenu = attachedFile.getByRole('button', { name: /More options|Weitere Optionen/ });
  await attachedFileMenu.click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('menuitem', { name: /Download|Herunterladen/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe(attachedFileName);

  await agencyDetail.getByRole('tab', { name: agencyCam.copy.detailTabs.activity }).click();
  const activities = agencyDetail.getByTestId('cam-activity-item');
  await expect(activities.first()).toBeVisible();
  const activityDates = await activities.evaluateAll((items) => items.map((item) => item.getAttribute('data-created-at')));
  expect(activityDates.every((date) => date && !Number.isNaN(Date.parse(date)))).toBeTruthy();
  for (let index = 1; index < activityDates.length; index += 1) {
    expect(Date.parse(activityDates[index - 1]!), `activity ${index - 1} should be newer`).toBeGreaterThanOrEqual(Date.parse(activityDates[index]!));
  }
  await expect(agencyDetail.getByTestId('cam-activity-timestamp').first()).toHaveText(/\S+/);
  await expect(agencyDetail.getByTestId('cam-activity-actor').first()).not.toBeEmpty();
  await expect(agencyDetail.getByTestId('cam-activity-description').first()).not.toBeEmpty();
  await expect(agencyDetail.locator('[data-testid="cam-activity-item"][data-activity-type="STATUS_UPDATED"]')).toHaveCount(2);
  await expect(agencyDetail.getByTestId('cam-activity-item').filter({ hasText: camCopy(page).boardColumns[1] })).toBeVisible();
  await expect(agencyDetail.getByTestId('cam-activity-item').filter({ hasText: camCopy(page).boardColumns[2] })).toBeVisible();
  await expect(agencyDetail.getByTestId('cam-activity-item').filter({ hasText: extraUsers[extraUsers.length - 1].name })).toBeVisible();
  for (const participant of removedParticipants) {
    await expect(agencyDetail.getByTestId('cam-activity-item').filter({ hasText: participant.name })).toBeVisible();
  }
  const activityCountBeforeLoad = await activities.count();
  const loadMore = agencyDetail.getByTestId('cam-activity-load-more');
  await expect(loadMore).toBeVisible();
  await loadMore.click();
  await expect.poll(() => activities.count()).toBeGreaterThan(activityCountBeforeLoad);
  const allActivityDates = await activities.evaluateAll((items) => items.map((item) => item.getAttribute('data-created-at')));
  for (let index = 1; index < allActivityDates.length; index += 1) {
    expect(Date.parse(allActivityDates[index - 1]!), `activity ${index - 1} should be newer after loading more`).toBeGreaterThanOrEqual(Date.parse(allActivityDates[index]!));
  }

  const installerContext = await browser.newContext();
  const installerPage = await installerContext.newPage();
  try {
    await authenticateViaApi(installerPage, installerCredentials!);
    const installerCam = new CustomerActivationPage(installerPage);
    await installerCam.goto();
    const installerCard = installerPage.getByTestId('cam-intake-card').filter({ hasText: activation.name }).first();
    await expect(installerCard).toBeVisible();
    await installerCard.click();
    const installerDetail = installerPage.getByRole('dialog').first();
    await expect(installerDetail).toBeVisible();
    await expect(installerDetail.getByText(activation.name, { exact: true })).toBeVisible();
    await expect(installerDetail.getByText(/E2E Address \d+/, { exact: false })).toBeVisible();
    await expect(installerDetail.getByText(installerCam.copy.boardColumns[2], { exact: true })).toBeVisible();
    await expect(installerDetail.getByRole('tab', { name: installerCam.copy.detailTabs.overview })).toHaveAttribute('aria-selected', 'true');
    await expect(installerDetail.getByTestId('cam-participant-avatar')).toHaveCount(3);
    await expect(installerDetail.getByText(/^\+\d+$/, { exact: true })).toBeVisible();
    await expect(installerDetail.getByTestId('cam-attached-file')).toHaveCount(2);
    const installerFile = installerDetail.getByTestId('cam-attached-file').first();
    await expect(installerFile.getByTestId('cam-attached-file-name')).toHaveText(/\S+/);
    const installerFileDate = await installerFile.getByTestId('cam-attached-file-date').getAttribute('data-created-at');
    expect(installerFileDate).toEqual(expect.any(String));
    expect(Date.parse(installerFileDate!)).not.toBeNaN();
    await installerFile.click();
    await expect(installerPage.locator('.cam-attached-file-lightbox')).toBeVisible();
    await installerPage.keyboard.press('Escape');
    await expect(installerPage.locator('.cam-attached-file-lightbox')).toBeHidden();
    await installerFile.getByRole('button', { name: /More options|Weitere Optionen/ }).click();
    const installerDownloadPromise = installerPage.waitForEvent('download');
    await expect(installerPage.getByRole('menuitem', { name: /Download|Herunterladen/ })).toBeVisible();
    await installerPage.getByRole('menuitem', { name: /Download|Herunterladen/ }).click();
    const installerDownload = await installerDownloadPromise;
    expect(installerDownload.suggestedFilename()).toBe(await installerFile.getByTestId('cam-attached-file-name').textContent());
    const slideDots = installerDetail.locator('button[aria-label^="Go to slide"]');
    await expect(slideDots).toHaveCount(2);
    await expect(slideDots.first()).toHaveAttribute('aria-current', 'true');
    await slideDots.nth(1).click();
    await expect(slideDots.nth(1)).toHaveAttribute('aria-current', 'true');

    await installerDetail.getByRole('tab', { name: installerCam.copy.detailTabs.activity }).click();
    await expect(installerDetail.getByRole('tab', { name: installerCam.copy.detailTabs.activity })).toHaveAttribute('aria-selected', 'true');
    const installerActivities = installerDetail.getByTestId('cam-activity-item');
    await expect(installerActivities.first()).toBeVisible();
    await expect(installerDetail.getByTestId('cam-activity-timestamp').first()).toHaveText(/\S+/);
    const activityUrl = installerPage.url();
    await installerActivities.first().click();
    await expect(installerPage).toHaveURL(activityUrl);
    await installerDetail.getByRole('tab', { name: installerCam.copy.detailTabs.overview }).click();
    await installerDetail.getByRole('tab', { name: installerCam.copy.detailTabs.communication }).click();

    await agencyDetail.getByRole('tab', { name: agencyCam.copy.detailTabs.communication }).click();
    await agencyDetail.getByTestId('cam-chat-composer-trigger').click();
    const editor = agencyDetail.locator('[contenteditable="true"]').first();
    const messageText = `Rich text realtime ${Date.now()}`;
    await expect(agencyDetail.getByTestId('cam-editor-bold')).toBeVisible();
    await expect(agencyDetail.getByTestId('cam-editor-italic')).toBeVisible();
    await expect(agencyDetail.getByTestId('cam-editor-underline')).toBeVisible();
    await expect(agencyDetail.getByTestId('cam-editor-paragraph-menu')).toBeVisible();
    await expect(agencyDetail.getByTestId('cam-editor-align-left')).toBeVisible();
    await expect(agencyDetail.getByTestId('cam-editor-align-center')).toBeVisible();
    await expect(agencyDetail.getByTestId('cam-editor-align-right')).toBeVisible();
    await expect(agencyDetail.getByTestId('cam-editor-align-justify')).toBeVisible();
    await editor.fill('toolbar formatting');
    await editor.press('Control+a');
    await agencyDetail.getByTestId('cam-editor-bold').click();
    await agencyDetail.getByTestId('cam-editor-italic').click();
    await agencyDetail.getByTestId('cam-editor-underline').click();
    await agencyDetail.getByTestId('cam-editor-align-center').click();
    await expect.poll(() => editor.innerHTML()).toMatch(/<(?:strong|b)>/i);
    await expect.poll(() => editor.innerHTML()).toMatch(/<(?:em|i)>/i);
    await expect.poll(() => editor.innerHTML()).toMatch(/<u>/i);
    await expect.poll(() => editor.innerHTML()).toContain('text-align: center');
    await agencyDetail.getByTestId('cam-editor-paragraph-menu').click();
    await agencyDetail.getByTestId('cam-editor-paragraph').click();
    await agencyCam.chatAttachmentInput.setInputFiles('public/images/logo.png');
    const outsiderName = `outsider-${Date.now()}`;
    await editor.fill(`@${outsiderName}`);
    await expect(agencyDetail.getByRole('button', { name: outsiderName, exact: true })).toHaveCount(0);
    await editor.fill('@');
    await editor.pressSequentially(installer.name.trim().split(/\s+/)[0].slice(0, 8));
    await expect(agencyDetail.getByRole('button', { name: installer.name, exact: true })).toBeVisible();
    await agencyDetail.getByRole('button', { name: installer.name, exact: true }).click();
    const secondMention = extraUsers[0];
    expect(secondMention?.name).toEqual(expect.any(String));
    await editor.pressSequentially(` @${secondMention.name.trim().split(/\s+/)[0].slice(0, 8)}`);
    await expect(agencyDetail.getByRole('button', { name: secondMention.name, exact: true })).toBeVisible();
    await agencyDetail.getByRole('button', { name: secondMention.name, exact: true }).click();
    await editor.pressSequentially(messageText);
    await editor.press('Control+a');
    await editor.press('Control+b');
    const editorHtml = await editor.innerHTML();
    expect(editorHtml).toContain(`mention://${installer.id}`);
    expect(editorHtml).toContain(`mention://${secondMention.id}`);
    expect(editorHtml).toMatch(/<(?:strong|b)>/i);
    await agencyDetail.getByRole('button', { name: /^Save$|^Speichern$/i }).click();

    const agencyMessage = page.getByTestId('cam-chat-message').filter({ hasText: messageText }).first();
    await expect(agencyMessage).toBeVisible();
    await expect(agencyMessage.locator('[href="mention://' + installer.id + '"]')).toBeVisible();
    await expect(agencyMessage.locator('[href="mention://' + secondMention.id + '"]')).toBeVisible();
    await expect(agencyMessage.locator('strong, b')).toBeVisible();
    await expect(agencyMessage.getByRole('button', { name: /logo\.png.*(?:preview|anzeigen)/i })).toBeVisible();
    const installerMessage = installerPage.getByTestId('cam-chat-message').filter({ hasText: messageText }).first();
    await expect(installerMessage).toBeVisible({ timeout: 15_000 });
    await expect(installerMessage.locator('[href="mention://' + installer.id + '"]')).toBeVisible();
    await expect(installerMessage.locator('[href="mention://' + secondMention.id + '"]')).toBeVisible();
    await expect(installerMessage.getByRole('button', { name: /logo\.png.*(?:preview|anzeigen)/i })).toBeVisible();
    await expect(installerMessage.getByRole('button', { name: /Edit|Bearbeiten/ })).toHaveCount(0);
    await installerMessage.getByRole('button', { name: /logo\.png.*(?:preview|anzeigen)/i }).click();
    await expect(installerPage.getByRole('dialog')).toBeVisible();
    await installerPage.keyboard.press('Escape');

    const messageId = await agencyMessage.getAttribute('data-msg-id');
    expect(messageId).toEqual(expect.any(String));
    await expect.poll(async () => {
      const response = await installerPage.request.get('/api/notification/inapp', {
        params: { page: 1, limit: 50 }, headers: await authHeaders(installerPage),
      });
      const body = await response.json();
      const notifications = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];
      return notifications.some((notification: { type?: string; metadata?: { messageId?: string; messageContent?: string } }) =>
        notification.type === 'MENTION' &&
        (notification.metadata?.messageId === messageId || notification.metadata?.messageContent?.includes(messageText)));
    }, { timeout: 15_000 }).toBe(true);
    await installerPage.getByRole('button', { name: 'notifications' }).click();
    await expect(installerPage.getByText(installerCam.copy.notificationTitle, { exact: true })).toBeVisible();
    await installerPage.goto(`${localizedCamPath(installerPage, CAM_ROUTES.main)}?activation_drawer=open&activation_id=${encodeURIComponent(activation.id)}&activationTab=communication&jump_to_message=${encodeURIComponent(messageId!)}`);
    const highlightedMessage = installerPage.getByTestId('cam-chat-message').filter({ hasText: messageText }).first();
    await expect(highlightedMessage).toHaveAttribute('data-highlighted', 'true', { timeout: 15_000 });

    await installerDetail.getByTestId('cam-chat-composer-trigger').click();
    const installerEditor = installerDetail.locator('[contenteditable="true"]').first();
    const replyText = `Installer realtime ${Date.now()}`;
    await installerEditor.fill(replyText);
    await installerDetail.getByRole('button', { name: /^Save$|^Speichern$/i }).click();
    const replyMessage = page.getByTestId('cam-chat-message').filter({ hasText: replyText }).first();
    await expect(replyMessage).toBeVisible({ timeout: 15_000 });
    await expect(replyMessage.getByText(messageText, { exact: false })).toBeVisible();
    await installerDetail.locator('button').first().click();
    await expect(installerDetail).toBeHidden();
    await expect(installerPage).not.toHaveURL(/activation_drawer=open/);
  } finally {
    await installerContext.close();
  }
});

test('installer cannot open an unassigned activation through a direct URL', async ({ page }) => {
  skipMutationFixture();
  const adminCredentials = camCredentials('admin');
  const agencyCredentials = camCredentials('agency');
  const installerCredentials = camCredentials('installer');
  test.skip(!adminCredentials, 'Missing Admin CAM credentials.');
  test.skip(!agencyCredentials, 'Missing Agency CAM credentials.');
  test.skip(!installerCredentials, 'Missing Installer CAM credentials.');

  await authenticateViaApi(page, adminCredentials!);
  const activation = await createActivationAssignedToRole(page, agencyCredentials!.email);

  await page.context().clearCookies();
  await authenticateViaApi(page, installerCredentials!);
  await page.goto(
    `${localizedCamPath(page, CAM_ROUTES.main)}?activation_drawer=open&activation_id=${encodeURIComponent(activation.id)}`,
  );
  await expect(page.getByRole('heading', { name: new CustomerActivationPage(page).copy.maintenanceTitle })).toBeVisible();
});

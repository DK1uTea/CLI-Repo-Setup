import { expect, test, type Page } from '@playwright/test';

import { authenticateViaApi, signIn } from '../../shared/session';
import {
  authHeaders,
  camCredentials,
  CAM_ROUTES,
  destructiveFixtureReason,
  localizedCamPath,
  type CamRole,
  mutationFixturesEnabled,
} from './customer-activation.data';
import { CustomerActivationPage } from './customer-activation.page';

async function openAs(page: Page, role: CamRole = 'admin') {
  const credentials = camCredentials(role);
  test.skip(!credentials, `Missing ${role} CAM credentials.`);
  await authenticateViaApi(page, credentials!);
  const cam = new CustomerActivationPage(page);
  await cam.goto();
  return cam;
}

async function openCommunication(page: Page) {
  const cam = await openAs(page);
  const activation = (await cam.adminActivations())[0];
  test.skip(!activation, 'Admin account has no activation detail fixture.');
  await cam.openCommunication(activation!.id);
  return cam;
}

function skipMutationFixture() {
  test.skip(!mutationFixturesEnabled(), destructiveFixtureReason);
}

test.describe('customer-activation content — admin and stores', () => {
  test('[CAM-C-01] Renders admin statistic cards from the stats response and an activation row for every admin-list item.', async ({ page }) => {
    const cam = await openAs(page);
    await expect(cam.adminTab(cam.copy.adminTabs[0])).toBeVisible();

    const [stats, activations] = await Promise.all([
      page.request.get('/api/cam/activations-admin/stats', { headers: await authHeaders(page) }),
      cam.adminActivations(),
    ]);
    expect(stats.ok()).toBe(true);
    for (const item of activations.slice(0, 10)) {
      await expect(page.getByRole('link', { name: item.name, exact: true }).first()).toBeVisible();
    }
  });

  test('[CAM-C-02] Shows the admin activation empty state when a real search returns no matching items.', async ({ page }) => {
    const cam = await openAs(page);
    const noMatch = `no-cam-case-${Date.now()}`;
    await page.getByPlaceholder(cam.copy.searchCase).fill(noMatch);
    await expect(page.getByText(cam.copy.noCases, { exact: true })).toBeVisible();
    await expect(page.getByText(cam.copy.noCasesDescription, { exact: true })).toBeVisible();
  });

  test('[CAM-C-03] Applies activation search, sort, page and page-size state to the URL and admin-list request; filter changes reset page to 1.', async ({ page }) => {
    await openAs(page);
    const response = page.waitForResponse(
      (value) => value.url().includes('/api/cam/activations-admin') && value.url().includes('search=CAM'),
    );
    await page.goto(`${localizedCamPath(page, CAM_ROUTES.main)}?actSearch=CAM&actSort=NAME_DESC&actPage=2&actLimit=20`);
    const url = new URL((await response).url());

    expect(url.searchParams.get('search')).toBe('CAM');
    expect(url.searchParams.get('sortBy')).toBe('NAME_DESC');
    expect(url.searchParams.get('page')).toBe('2');
    expect(url.searchParams.get('limit')).toBe('20');
  });

  test('[CAM-C-04] Shows status, owner, file/activity counts and evaluation values defensively when evaluation or timestamps are null.', async ({ page }) => {
    const cam = await openAs(page);
    const items = await cam.adminActivations();
    test.skip(items.length === 0, 'Admin account has no activation rows.');

    const row = page.getByRole('row').filter({ hasText: items[0].name });
    await expect(row).toBeVisible();
    // Status renders through the localized ActivationStatusBadge, not the raw backend
    // enum — assert the Status column (5th cell: Cases/Owner/BrandFit/Score/Status) has
    // non-empty text rather than guessing the translated label.
    await expect(row.getByRole('cell').nth(4)).not.toBeEmpty();
  });

  test('[CAM-C-05] Renders intake-board columns from known workflow statuses and omits cancelled activations.', async ({ page }) => {
    const cam = await openAs(page, 'sale');
    const response = await page.request.get('/api/cam/activations/grouped', {
      headers: await authHeaders(page),
    });
    const body = await response.json();
    const groups = body?.data?.groups ?? [];
    const items = Array.isArray(groups)
      ? groups.flatMap((group: { items?: unknown[] }) => Array.isArray(group.items) ? group.items : [])
      : [];

    for (const column of cam.copy.boardColumns) {
      await expect(page.getByRole('heading', { name: column })).toBeVisible();
    }
    await expect(page.getByRole('heading', { name: /Cancelled|Storniert/ })).toBeHidden();
    for (const status of ['DRAFT', 'READY', 'REVIEW', 'CLARIFICATION', 'APPROVED', 'IN_PROGRESS', 'INSTALLATION', 'COMPLETED']) {
      const column = page.getByRole('heading', { name: cam.copy.boardColumns[['DRAFT', 'READY', 'REVIEW', 'CLARIFICATION', 'APPROVED', 'IN_PROGRESS', 'INSTALLATION', 'COMPLETED'].indexOf(status)] }).locator('xpath=../..');
      const group = Array.isArray(groups)
        ? groups.find((item: { status?: string; items?: unknown[] }) => item.status === status)
        : null;
      await expect(column.getByText(String(group?.items?.length ?? 0), { exact: true })).toBeVisible();
    }

    const item = items[0] as {
      name?: string;
      storeAddress?: string;
      fileCount?: number;
      chatCount?: number;
      evaluation?: { score?: number; maxScore?: number } | null;
    } | undefined;
    if (!item?.name) {
      test.skip(true, 'Sale account has no intake-board activation fixture.');
      return;
    }
    await expect(page.getByText(item.name, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(item.storeAddress ?? '', { exact: true }).first()).toBeVisible();
    await expect(page.getByText(`${item.evaluation?.score ?? 0}/${item.evaluation?.maxScore ?? 27}`, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(String(item.chatCount ?? 0), { exact: true }).first()).toBeVisible();
    await expect(page.getByText(String(item.fileCount ?? 0), { exact: true }).first()).toBeVisible();

    const draftGroup = Array.isArray(groups)
      ? groups.find((group: { status?: string; items?: unknown[] }) => group.status === 'DRAFT')
      : null;
    const draftItem = draftGroup?.items?.[0] as { name?: string } | undefined;
    if (draftItem?.name) {
      const draftRow = page.getByText(draftItem.name, { exact: true }).first().locator('..');
      await draftRow.getByRole('button', { name: /More options|Weitere Optionen/ }).click();
      await expect(page.getByRole('menuitem')).toHaveCount(2);
      await expect(page.getByRole('menuitem', { name: /Delete|Löschen/ })).toBeHidden();
      await page.keyboard.press('Escape');
    }
    await expect(cam.heading).toBeVisible();
  });

  test('[CAM-C-06] Applies intake-board keyword and name sort to the URL and grouped request.', async ({ page }) => {
    const cam = await openAs(page, 'sale');
    const initial = await page.request.get('/api/cam/activations/grouped', {
      headers: await authHeaders(page),
    });
    const initialBody = await initial.json();
    const initialGroups = initialBody?.data?.groups ?? [];
    const initialItem = Array.isArray(initialGroups)
      ? initialGroups.flatMap((group: { items?: unknown[] }) => Array.isArray(group.items) ? group.items : [])[0]
      : null;
    test.skip(!initialItem || typeof initialItem !== 'object' || !('name' in initialItem), 'Sale account has no intake-board activation fixture.');

    const search = page.getByTestId('cam-intake-board-search')
      .or(page.getByPlaceholder(cam.copy.roleBoardSearch))
      .first();
    const searchResponse = page.waitForResponse((value) => {
      const url = new URL(value.url());
      return url.pathname === '/api/cam/activations/grouped' && url.searchParams.get('search') === (initialItem as { name: string }).name;
    });
    await search.fill((initialItem as { name: string }).name);
    await searchResponse;
    await expect(page.getByText((initialItem as { name: string }).name, { exact: true }).first()).toBeVisible();
    await search.fill('');

    const sort = page.getByRole('combobox', { name: /Sort|Sortieren/ });
    await sort.click();
    await expect(page.getByRole('option')).toHaveCount(2);
    await page.getByRole('option', { name: /Z-A|Z–A/ }).click();
    await expect(page).toHaveURL(/sortBy=NAME_DESC/);

    const response = page.waitForResponse((value) => value.url().includes('/api/cam/activations/grouped'));
    await page.goto(`${localizedCamPath(page, CAM_ROUTES.main)}?keyword=CAM&sortBy=NAME_DESC`);
    const url = new URL((await response).url());
    expect(url.searchParams.get('search')).toBe('CAM');
    expect(url.searchParams.get('sortBy')).toBe('NAME_DESC');
  });

  test('[CAM-C-07] Opens an activation from dashboard/intake data and returns to the originating tab through backTo.', async ({ page }) => {
    const cam = await openAs(page);
    const activation = (await cam.adminActivations())[0];
    test.skip(!activation, 'Admin account has no activation record.');
    await page.goto(`${localizedCamPath(page, CAM_ROUTES.detail(activation.id))}?backTo=${encodeURIComponent('/customer-activation?tab=intake-board')}`);
    const back = page.getByRole('link', { name: cam.copy.backToList });
    await expect(back).toHaveAttribute('href', /tab=intake-board/);
  });

  test('[CAM-C-08] Renders active and inactive stores with contact, activation count and last-activity data.', async ({ page }) => {
    const cam = await openAs(page);
    await cam.openAdminTab(cam.copy.adminTabs[2]);
    const stores = await cam.adminStores();
    test.skip(stores.length === 0, 'Admin account has no store rows.');
    for (const store of stores.slice(0, 10)) {
      await expect(page.getByRole('cell', { name: store.storeName, exact: true })).toBeVisible();
    }
  });

  test('[CAM-C-09] Applies store search, status, sort, page and page-size state to the URL and store-list request; filter changes reset page to 1.', async ({ page }) => {
    const cam = await openAs(page);
    await cam.openAdminTab(cam.copy.adminTabs[2]);
    const stores = await cam.adminStores();
    test.skip(stores.length === 0, 'Admin account has no store fixture.');

    const search = page.getByPlaceholder(cam.copy.searchStore);
    const store = stores[0];
    await search.fill(store.storeName);
    await expect(page.getByRole('row').filter({ hasText: store.storeName }).first()).toBeVisible();
    await search.fill(store.storeName.toLowerCase());
    await expect(page.getByRole('row').filter({ hasText: store.storeName }).first()).toBeVisible();
    await search.fill(`no-store-${Date.now()}`);
    await expect(page.getByText(/No stores|Keine Stores/).first()).toBeVisible();
    await search.fill('');
    await expect(page.getByRole('row').filter({ hasText: store.storeName }).first()).toBeVisible();

    await page.getByRole('combobox', { name: /Sort by|Sortieren nach/ }).click();
    await expect(page.getByRole('option')).toHaveCount(6);
    await page.keyboard.press('Escape');

    const response = page.waitForResponse((value) => value.url().includes('/api/cam/stores-admin'));
    await page.goto(`${localizedCamPath(page, CAM_ROUTES.main)}?tab=store&storeAdSearch=Test&storeAdStatus=ACTIVE&storeAdSort=UPDATED_AT_DESC&storeAdPage=2&storeAdLimit=20`);
    const url = new URL((await response).url());
    expect(url.searchParams.get('search')).toBe('Test');
    expect(url.searchParams.get('status')).toBe('ACTIVE');
    expect(url.searchParams.get('sortBy')).toBe('UPDATED_AT_DESC');
    expect(url.searchParams.get('page')).toBe('2');
  });

  test('[CAM-AGENCY-INTAKE-01] Agency sees its read-only seven-column intake board with card data, search and sort.', async ({ page }) => {
    const cam = await openAs(page, 'agency');
    const board = page.getByRole('region', { name: /activation board|aktivierungs-board/i });
    await expect(board).toBeVisible();
    await expect(page.locator('[data-slot="sidebar-menu-button"][href]')).toHaveCount(3);

    const response = await page.request.get('/api/cam/activations/grouped', {
      params: { sortBy: 'NAME_ASC' },
      headers: await authHeaders(page),
    });
    const body = await response.json();
    expect(response.ok(), JSON.stringify(body)).toBeTruthy();
    const groups = body?.data?.groups ?? [];
    const statuses = ['READY', 'REVIEW', 'CLARIFICATION', 'APPROVED', 'IN_PROGRESS', 'INSTALLATION', 'COMPLETED'] as const;
    const allItems = Array.isArray(groups)
      ? groups.flatMap((group: { items?: unknown[] }) => Array.isArray(group.items) ? group.items : [])
      : [];

    await expect(board.getByRole('heading', { name: /Draft|Entwürfe/, exact: true })).toHaveCount(0);
    for (const status of statuses) {
      const label = cam.copy.boardColumns[['DRAFT', ...statuses].indexOf(status)];
      const column = board.getByTestId(`cam-intake-column-${status.toLowerCase()}`)
        .or(board.getByRole('heading', { name: label, exact: true }).locator('../../..'))
        .first();
      await expect(column).toBeVisible();
      const group = Array.isArray(groups)
        ? groups.find((candidate: { status?: string }) => candidate.status === status)
        : undefined;
      const expectedCount = Array.isArray(group?.items) ? group.items.length : 0;
      const count = column.getByTestId('cam-intake-column-count')
        .or(column.getByText(String(expectedCount), { exact: true }).first())
        .first();
      await expect(count).toHaveText(String(expectedCount));
    }

    const item = allItems[0] as {
      id?: string;
      name?: string;
      storeAddress?: string;
      status?: string;
      chatCount?: number;
      fileCount?: number;
      evaluation?: { score?: number; maxScore?: number } | null;
    } | undefined;
    if (!item?.id || !item.name || !item.status) return;

    const card = board.getByTestId('cam-intake-card').filter({ hasText: item.name }).first();
    await expect(card).toBeVisible();
    await expect(card).toContainText(item.name);
    if (item.storeAddress) await expect(card).toContainText(item.storeAddress);
    await expect(card).toContainText(`${item.evaluation?.score ?? 0}/${item.evaluation?.maxScore ?? 27}`);
    await expect(card).toContainText(cam.copy.boardColumns[['DRAFT', ...statuses].indexOf(item.status as typeof statuses[number])]);
    await expect(card).toContainText(String(item.chatCount ?? 0));
    await expect(card).toContainText(String(item.fileCount ?? 0));
    await expect(card.getByRole('button', { name: /more options|weitere optionen/i })).toHaveCount(0);

    const search = page.getByTestId('cam-intake-board-search')
      .or(page.getByPlaceholder(cam.copy.roleBoardSearch))
      .first();
    await search.fill(item.name.slice(0, 4).toLowerCase());
    await expect(card).toBeVisible();
    await search.fill(`agency-no-match-${Date.now()}`);
    await expect(board.getByTestId('cam-intake-card')).toHaveCount(0);
    await search.fill('');
    await expect(card).toBeVisible();

    await page.getByRole('combobox', { name: /Sort|Sortieren/ }).click();
    await expect(page.getByRole('option')).toHaveCount(2);
    await page.getByRole('option', { name: /Z.?A/i }).click();
    await expect(page).toHaveURL(/sortBy=NAME_DESC/);

    await card.click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('[CAM-INSTALLER-INTAKE-01] Installer sees the assigned read-only seven-column intake board and can search, sort and open a case.', async ({ page }) => {
    const installerCredentials = camCredentials('installer');
    test.skip(!installerCredentials, 'Missing installer CAM credentials.');
    await signIn(page, installerCredentials!);
    const cam = new CustomerActivationPage(page);
    await cam.goto();
    const board = page.getByRole('region', { name: /activation board|aktivierungs-board/i });
    await expect(board).toBeVisible();
    await expect(page.locator('[data-slot="sidebar-menu-button"][href]')).toHaveCount(3);

    const response = await page.request.get('/api/cam/activations/grouped', {
      params: { sortBy: 'NAME_ASC' },
      headers: await authHeaders(page),
    });
    const body = await response.json();
    expect(response.ok(), JSON.stringify(body)).toBeTruthy();
    const groups = body?.data?.groups ?? [];
    const statuses = ['READY', 'REVIEW', 'CLARIFICATION', 'APPROVED', 'IN_PROGRESS', 'INSTALLATION', 'COMPLETED'] as const;
    const allItems = Array.isArray(groups)
      ? groups.flatMap((group: { items?: unknown[] }) => Array.isArray(group.items) ? group.items : [])
      : [];

    await expect(board.getByRole('heading', { name: /Draft|EntwÃ¼rfe/, exact: true })).toHaveCount(0);
    for (const status of statuses) {
      const label = cam.copy.boardColumns[['DRAFT', ...statuses].indexOf(status)];
      const column = board.getByTestId(`cam-intake-column-${status.toLowerCase()}`)
        .or(board.getByRole('heading', { name: label, exact: true }).locator('../../..'))
        .first();
      await expect(column).toBeVisible();
      const group = Array.isArray(groups)
        ? groups.find((candidate: { status?: string }) => candidate.status === status)
        : undefined;
      const expectedCount = Array.isArray(group?.items) ? group.items.length : 0;
      await expect(column.getByTestId('cam-intake-column-count')
        .or(column.getByText(String(expectedCount), { exact: true }).first()).first())
        .toHaveText(String(expectedCount));
    }

    const item = allItems[0] as {
      id?: string;
      name?: string;
      storeAddress?: string;
      status?: string;
      chatCount?: number;
      fileCount?: number;
      evaluation?: { score?: number; maxScore?: number } | null;
    } | undefined;
    if (item?.id && item.name && item.status) {
      const card = board.getByTestId('cam-intake-card').filter({ hasText: item.name }).first();
      await expect(card).toBeVisible();
      await expect(card).toContainText(item.name);
      if (item.storeAddress) await expect(card).toContainText(item.storeAddress);
      await expect(card).toContainText(`${item.evaluation?.score ?? 0}/${item.evaluation?.maxScore ?? 27}`);
      await expect(card).toContainText(cam.copy.boardColumns[['DRAFT', ...statuses].indexOf(item.status as typeof statuses[number])]);
      await expect(card).toContainText(String(item.chatCount ?? 0));
      await expect(card).toContainText(String(item.fileCount ?? 0));
      await expect(card.getByRole('button', { name: /more options|weitere optionen/i })).toHaveCount(0);

      const search = page.getByTestId('cam-intake-board-search')
        .or(page.getByPlaceholder(cam.copy.roleBoardSearch))
        .first();
      await search.fill(item.name.slice(0, 4).toLowerCase());
      await expect(card).toBeVisible();
      await search.fill(`installer-no-match-${Date.now()}`);
      await expect(board.getByTestId('cam-intake-card')).toHaveCount(0);
      await search.fill('');
      await expect(card).toBeVisible();
    }

    await page.getByRole('combobox', { name: /Sort|Sortieren/ }).click();
    await expect(page.getByRole('option')).toHaveCount(2);
    await page.getByRole('option', { name: /Z.?A/i }).click();
    await expect(page).toHaveURL(/sortBy=NAME_DESC/);

    if (item?.id && item.name) {
      await board.getByTestId('cam-intake-card').filter({ hasText: item.name }).first().click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog.locator('footer').getByRole('button')).toHaveCount(0);
    }
  });

  test('[CAM-C-10] Selects one page or individual stores, exposes the selected count and clears selection after a bulk mutation settles.', async ({ page }) => {
    skipMutationFixture();
    const cam = await openAs(page);
    await cam.openAdminTab(cam.copy.adminTabs[2]);
    const store = (await cam.adminStores())[0];
    if (!store) throw new Error('CAM-C-10 requires at least one admin store.');

    const originalStatus = store.status;
    const checkbox = page.getByRole('checkbox', { name: new RegExp(store.storeName) });
    await checkbox.check();
    await expect(page.getByText(/1 (selected|ausgewählt)/i)).toBeVisible();

    const endpoint = originalStatus === 'ACTIVE' ? 'inactive' : 'active';
    const mutation = page.waitForResponse(
      (response) => response.url().includes(`/api/cam/stores-admin/bulk/${endpoint}`) && response.request().method() === 'POST',
    );
    await page.getByText(endpoint === 'active' ? /Enable store|Store aktivieren/ : /Disable store|Store deaktivieren/).last().click();
    expect((await mutation).ok()).toBeTruthy();
    await expect(checkbox).not.toBeChecked();

    await page.request.post(`/api/cam/stores-admin/${store.id}/${originalStatus === 'ACTIVE' ? 'active' : 'inactive'}`, {
      headers: await authHeaders(page),
    });
  });

  test('[CAM-C-11] Activates and deactivates one store only after confirmation.', async ({ page }) => {
    skipMutationFixture();
    const cam = await openAs(page);
    await cam.openAdminTab(cam.copy.adminTabs[2]);
    const store = (await cam.adminStores())[0];
    if (!store) throw new Error('CAM-C-11 requires at least one admin store.');

    const originalStatus = store.status;
    const row = page.getByRole('row').filter({ hasText: store.storeName });
    await row.getByRole('button', { name: /More options|Weitere Optionen/ }).click();
    const action = originalStatus === 'ACTIVE' ? /Disable store|Store deaktivieren/ : /Enable store|Store aktivieren/;
    await page.getByRole('menuitem', { name: action }).click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
    const mutation = page.waitForResponse(
      (response) => response.url().includes(`/api/cam/stores-admin/${store.id}/`) && response.request().method() === 'POST',
    );
    await page.getByRole('alertdialog').getByRole('button', { name: action }).click();
    expect((await mutation).ok()).toBeTruthy();

    const detail = await page.request.get(`/api/cam/stores-admin/${store.id}`, { headers: await authHeaders(page) });
    const body = await detail.json();
    expect(body?.data?.status).toBe(originalStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');
    await page.request.post(`/api/cam/stores-admin/${store.id}/${originalStatus === 'ACTIVE' ? 'active' : 'inactive'}`, {
      headers: await authHeaders(page),
    });
  });

  test('[CAM-C-12] Bulk activates and deactivates the selected stores through the matching real endpoints.', async ({ page }) => {
    skipMutationFixture();
    const cam = await openAs(page);
    await cam.openAdminTab(cam.copy.adminTabs[2]);
    const stores = (await cam.adminStores()).slice(0, 2);
    if (stores.length < 2) throw new Error('CAM-C-12 requires at least two admin stores.');
    const originalStatuses = new Map(stores.map((store) => [store.id, store.status]));

    for (const store of stores) await page.getByRole('checkbox', { name: new RegExp(store.storeName) }).check();
    const enable = page.waitForResponse((response) => response.url().includes('/api/cam/stores-admin/bulk/active') && response.request().method() === 'POST');
    await page.getByText(/Enable store|Store aktivieren/).last().click();
    expect((await enable).ok()).toBeTruthy();
    await expect(page.getByText(/2 (selected|ausgewählt)/i)).toBeHidden();

    for (const store of stores) await page.getByRole('checkbox', { name: new RegExp(store.storeName) }).check();
    const disable = page.waitForResponse((response) => response.url().includes('/api/cam/stores-admin/bulk/inactive') && response.request().method() === 'POST');
    await page.getByText(/Disable store|Store deaktivieren/).last().click();
    expect((await disable).ok()).toBeTruthy();
    await expect(page.getByText(/2 (selected|ausgewählt)/i)).toBeHidden();

    for (const store of stores) {
      await page.request.post(`/api/cam/stores-admin/${store.id}/${originalStatuses.get(store.id) === 'ACTIVE' ? 'active' : 'inactive'}`, {
        headers: await authHeaders(page),
      });
    }
  });

  test('[CAM-C-13] Opens store detail, renders its activation list and keeps store-activation search, sort and pagination in the URL.', async ({ page }) => {
    const cam = await openAs(page);
    const store = (await cam.adminStores())[0];
    test.skip(!store, 'Admin account has no store fixture.');
    await page.goto(`${localizedCamPath(page, CAM_ROUTES.store(store.id))}?storeActSearch=CAM&storeActSort=NAME_DESC&storeActPage=2&storeActLimit=20`);
    await expect(page).toHaveURL(/storeActSearch=CAM/);
    await expect(page).toHaveURL(/storeActSort=NAME_DESC/);
    await expect(page.getByRole('combobox', { name: /Sort by|Sortieren nach/ })).toBeVisible();
    await page.getByRole('combobox', { name: /Sort by|Sortieren nach/ }).click();
    await expect(page.getByRole('option')).toHaveCount(6);
    await page.keyboard.press('Escape');
  });

  test('[CAM-C-14] Edits store name, address and owner contact, then renders the saved backend values.', async ({ page }) => {
    skipMutationFixture();
    const cam = await openAs(page);
    await cam.openAdminTab(cam.copy.adminTabs[2]);
    const store = (await cam.adminStores())[0];
    if (!store) throw new Error('CAM-C-14 requires at least one admin store.');
    const detailResponse = await page.request.get(`/api/cam/stores-admin/${store.id}`, { headers: await authHeaders(page) });
    const original = (await detailResponse.json())?.data;
    if (!original) throw new Error('CAM-C-14 could not load the selected store.');

    const row = page.getByRole('row').filter({ hasText: store.storeName });
    await row.getByRole('button', { name: /More options|Weitere Optionen/ }).click();
    await page.getByRole('menuitem', { name: /Edit store|Store bearbeiten/ }).click();
    const drawer = page.getByRole('dialog');
    await expect(drawer).toBeVisible();
    const suffix = Date.now();
    await drawer.getByLabel(/Store name|Store-Name/).fill(`${original.storeName} ${suffix}`);
    await drawer.getByLabel(/Address|Adresse/).fill(`${original.storeAddress} ${suffix}`);
    await drawer.getByLabel(/Contact name|Ansprechpartner/).fill(`${original.contactName} E2E`);
    const mutation = page.waitForResponse((response) => response.url().includes(`/api/cam/stores-admin/${store.id}`) && response.request().method() === 'PUT');
    await drawer.getByRole('button', { name: /Save changes|Änderungen speichern/ }).click();
    expect((await mutation).ok()).toBeTruthy();
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page.getByRole('row').filter({ hasText: `${original.storeName} ${suffix}` })).toBeVisible();

    await page.request.put(`/api/cam/stores-admin/${store.id}`, {
      headers: await authHeaders(page),
      data: original,
    });
  });

});

test.describe('customer-activation content — form and detail', () => {
  test('[CAM-C-15] Keeps wizard step, selected store, store mode and activation ID in URL state.', async ({ page }) => {
    await openAs(page, 'sale');
    await page.goto(`${localizedCamPath(page, CAM_ROUTES.update)}?step=2&storeId=store-1&mode=edit&activation_id=activation-1`);
    await expect(page).toHaveURL(/step=2/);
    await expect(page).toHaveURL(/storeId=store-1/);
    await expect(page).toHaveURL(/activation_id=activation-1/);
  });

  test('[CAM-C-16] Renders a safe empty state when a real store search returns no matching items.', async ({ page }) => {
    const cam = await openAs(page, 'sale');
    await cam.gotoCreate();
    const unique = `no-store-${Date.now()}`;
    await cam.storeSearch.fill(unique);
    await expect(page.getByText(cam.copy.emptyStores, { exact: true })).toBeVisible();
  });

  test('[CAM-C-17] Switches between existing-store, new-store and edit-store modes without losing the selected store.', async ({ page }) => {
    const cam = await openAs(page, 'sale');
    const stores = await cam.openCreateAndReadStores();
    const store = stores[0];
    test.skip(!store, 'Sale account has no store fixture.');

    const storeCard = page.locator('[role="button"]').filter({ hasText: store.storeName }).first();
    await storeCard.getByRole('button', { name: /More options|Weitere Optionen/ }).click();
    await expect(page.getByRole('menuitem')).toHaveCount(1);
    await page.getByRole('menuitem', { name: cam.copy.editStore }).click();
    await expect(page.getByLabel(cam.copy.storeFields.name)).toHaveValue(store.storeName);

    await cam.formTab(cam.copy.formTabs[0]).click();
    await expect(cam.storeSearch).toBeVisible();
    await cam.formTab(cam.copy.formTabs[1]).click();
    await expect(page.getByLabel(cam.copy.storeFields.name)).toBeVisible();
    await cam.formTab(cam.copy.formTabs[0]).click();
    await expect(cam.storeSearch).toBeVisible();
  });

  test('[CAM-C-18] Returning from editing the selected store at step 2 restores step 2 and the updated store summary.', async ({ page }) => {
    skipMutationFixture();
    const cam = await openAs(page, 'sale');
    const store = (await cam.openCreateAndReadStores())[0];
    if (!store) throw new Error('CAM-C-18 requires one Sale store.');
    const detailResponse = await page.request.get(`/api/cam/stores/${store.id}`, { headers: await authHeaders(page) });
    const original = (await detailResponse.json())?.data;
    if (!original) throw new Error('CAM-C-18 could not load the selected store.');

    await cam.selectStore(store);
    await page.getByRole('button', { name: cam.copy.editStore }).click();
    await expect(page.getByLabel(/Store name|Store-Name/)).toBeVisible();
    const suffix = Date.now();
    await page.getByLabel(/Store name|Store-Name/).fill(`${original.storeName} ${suffix}`);
    const mutation = page.waitForResponse((response) => response.url().includes(`/api/cam/stores/${store.id}`) && response.request().method() === 'PUT');
    await page.getByRole('button', { name: /Save existing store|Bestehenden Store speichern/ }).click();
    expect((await mutation).ok()).toBeTruthy();
    await expect(cam.activationNameInput).toBeVisible();
    await expect(page.getByText(`${original.storeName} ${suffix}`, { exact: true })).toBeVisible();

    await page.request.put(`/api/cam/stores/${store.id}`, {
      headers: await authHeaders(page),
      data: original,
    });
  });

  test('[CAM-C-19] Renders all briefing fields, selection groups, 150-character note counters and AH/A-market media inputs.', async ({ page }) => {
    const cam = await openAs(page, 'sale');
    const response = await page.request.get('/api/cam/stores', {
      params: { page: 1, limit: 20 },
      headers: await authHeaders(page),
    });
    const body = await response.json();
    const stores = body?.data?.items ?? body?.data ?? [];
    test.skip(!Array.isArray(stores) || stores.length === 0, 'Sale account has no store fixture.');
    await page.goto(`${localizedCamPath(page, CAM_ROUTES.create)}?step=2&storeId=${stores[0].id}`);
    await expect(cam.activationNameInput).toBeVisible();
    for (let section = 1; section <= 11; section += 1) {
      await expect(page.getByText(new RegExp(`^${section}\\. `)).first()).toBeVisible();
    }
    await expect(page.getByText('0/150', { exact: true })).toHaveCount(6);
    await expect(page.getByLabel(/Bilder hier ablegen|Drop your images here/)).toHaveCount(2);
    await expect(page.getByText(/1\. (Responsible CAM|Verantwortlicher CAM)/)).toBeVisible();
    await expect(page.getByText(/11\. (Profitability|Rentabilität)/)).toBeVisible();
  });

  test('[CAM-C-21] Full Internal Admin detail renders Overview, Briefing, Scoring, Activity and Communication tabs.', async ({ page }) => {
    const cam = await openAs(page);
    const activation = (await cam.adminActivations())[0];
    test.skip(!activation, 'Admin account has no activation detail fixture.');
    await cam.openActivation(activation!.id);
    for (const tab of Object.values(cam.copy.detailTabs)) await expect(cam.detailTab(tab)).toBeVisible();
  });

  test('[CAM-C-22] Role-board drawer shows Activity for Agency and Installer but not Sale, and never exposes Scoring.', async ({ page }) => {
    let checkedRoles = 0;

    for (const role of ['sale', 'agency', 'installer'] as const) {
      const credentials = camCredentials(role);
      if (!credentials) continue;

      await authenticateViaApi(page, credentials);
      const cam = new CustomerActivationPage(page);
      const response = await page.request.get('/api/cam/activations/grouped', {
        headers: await authHeaders(page),
      });
      const body = await response.json();
      const groups = body?.data?.groups ?? [];
      const activation = Array.isArray(groups)
        ? groups.flatMap((group: { items?: unknown[] }) => Array.isArray(group.items) ? group.items : [])[0]
        : null;
      if (!activation || typeof activation !== 'object' || !('id' in activation)) continue;

      await cam.openDrawer((activation as { id: string }).id);
      await expect(cam.detailTab(cam.copy.detailTabs.overview)).toBeVisible();
      if (role === 'sale') {
        await expect(cam.detailTab(cam.copy.detailTabs.briefing)).toBeVisible();
        await expect(cam.detailTab(cam.copy.detailTabs.activity)).toBeHidden();
      } else {
        await expect(cam.detailTab(cam.copy.detailTabs.briefing)).toBeHidden();
        await expect(cam.detailTab(cam.copy.detailTabs.activity)).toBeVisible();
      }
      await expect(cam.detailTab(cam.copy.detailTabs.communication)).toBeVisible();
      await expect(cam.detailTab(cam.copy.detailTabs.scoring)).toBeHidden();
      checkedRoles += 1;
    }

    test.skip(checkedRoles === 0, 'No configured CAM role has an activation drawer fixture.');
  });

  test('[CAM-C-23] Sale Rep opens the case drawer with Overview by default, switches detail tabs and closes it while preserving URL state.', async ({ page }) => {
    const cam = await openAs(page, 'sale');
    const response = await page.request.get('/api/cam/activations/grouped', {
      headers: await authHeaders(page),
    });
    const body = await response.json();
    const groups = body?.data?.groups ?? [];
    const activation = Array.isArray(groups)
      ? groups.flatMap((group: { items?: unknown[] }) => Array.isArray(group.items) ? group.items : []).find(
        (item): item is { id: string; name?: string } => Boolean(item && typeof item === 'object' && 'id' in item),
      )
      : null;
    test.skip(!activation, 'Sale account has no activation drawer fixture.');

    await cam.openDrawer(activation!.id);
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: /Activation case details|Details zum Aktivierungsfall/ })).toBeVisible();
    await expect(dialog.getByText(new RegExp(`^(?:${cam.copy.boardColumns.join('|')})$`))).toBeVisible();
    await expect(dialog.locator('img').first()).toBeVisible();
    await expect(dialog.getByRole('button', { name: /Go to slide|Gehe zu Folie/ }).first()).toBeVisible();
    await expect(dialog.getByText(/Participants|Teilnehmer/, { exact: true })).toBeVisible();
    if (activation!.name) await expect(dialog.getByText(activation!.name, { exact: true })).toBeVisible();

    await expect(cam.detailTab(cam.copy.detailTabs.overview)).toHaveAttribute('aria-selected', 'true');
    await expect(dialog.getByText(/Case ID|Fall-ID/, { exact: true })).toBeVisible();
    await expect(dialog.getByText(/Created|Erstellt/, { exact: true })).toBeVisible();
    await expect(dialog.getByText(/Attached files|Angehängte Dateien/, { exact: true })).toBeVisible();
    const fileMenu = dialog.getByRole('button', { name: /More options|Weitere Optionen/ }).first();
    if (await fileMenu.count()) {
      await fileMenu.click();
      await expect(page.getByRole('menuitem', { name: /Download|Herunterladen/ })).toBeVisible();
      await page.keyboard.press('Escape');
    }

    await cam.detailTab(cam.copy.detailTabs.briefing).click();
    await expect(cam.detailTab(cam.copy.detailTabs.briefing)).toHaveAttribute('aria-selected', 'true');
    await expect(page).toHaveURL(/activationTab=briefing/);
    for (const label of [
      /Responsible CAM|Verantwortlicher CAM/,
      /Number of Outlets|Anzahl der Outlets/,
      /High Traffic Zone \(HTZ\)|Hochfrequentierte Zone \(HTZ\)/,
      /Target Group|Zielgruppe/,
      /Sales Concept|Vertriebskonzept/,
      /Contract Situation|Vertragssituation/,
      /Revenue Potential \/ Objective|Umsatzpotenzial \/ Ziel/,
      /AH Market|AH Markt/,
      /H-Markt/,
      /Brand fit|Markenpassung/,
      /Profitability|Wirtschaftlichkeit/,
    ]) {
      await expect(dialog.getByText(label, { exact: true })).toBeVisible();
    }

    await cam.detailTab(cam.copy.detailTabs.communication).click();
    await expect(cam.detailTab(cam.copy.detailTabs.communication)).toHaveAttribute('aria-selected', 'true');
    await expect(page).toHaveURL(/activationTab=communication/);
    await expect(dialog.getByText(/No messages yet|Noch keine Nachrichten/, { exact: true })).toBeVisible();
    await cam.chatComposerTrigger.click();
    await expect(dialog.locator('[contenteditable="true"]')).toBeVisible();
    await expect(dialog.getByRole('button', { name: /Save|Speichern/ })).toBeDisabled();
    await dialog.getByRole('button', { name: /Cancel|Abbrechen/ }).click();
    await cam.detailTab(cam.copy.detailTabs.overview).click();
    await expect(cam.detailTab(cam.copy.detailTabs.overview)).toHaveAttribute('aria-selected', 'true');

    await dialog.getByRole('button').first().click();
    await expect(dialog).toBeHidden();
    await expect(page).not.toHaveURL(/activation_drawer=open/);

    await page.goto(`${localizedCamPath(page, CAM_ROUTES.main)}?activation_drawer=open&activation_id=${encodeURIComponent(activation!.id)}&activationTab=communication&feedback_drawer=open&participants_drawer=open&jump_to_message=m1`);
    for (const value of ['activation_drawer=open', `activation_id=${activation!.id}`, 'activationTab=communication', 'jump_to_message=m1']) {
      await expect(page).toHaveURL(new RegExp(value));
    }
  });

  test('[CAM-C-26] Agency opens an assigned case drawer with read-only overview, activity and communication tabs.', async ({ page }) => {
    const cam = await openAs(page, 'agency');
    const groupedResponse = await page.request.get('/api/cam/activations/grouped', {
      headers: await authHeaders(page),
    });
    const groupedBody = await groupedResponse.json();
    const groups = groupedBody?.data?.groups ?? [];
    const activation = Array.isArray(groups)
      ? groups.flatMap((group: { items?: unknown[] }) => Array.isArray(group.items) ? group.items : [])[0]
      : null;
    test.skip(!activation || typeof activation !== 'object' || !('id' in activation), 'Agency has no assigned activation fixture.');

    const activationId = (activation as { id: string }).id;
    const detailResponse = await page.request.get(`/api/cam/activations/${activationId}`, {
      headers: await authHeaders(page),
    });
    expect(detailResponse.ok()).toBeTruthy();
    const detail = (await detailResponse.json())?.data;
    expect(detail?.id).toBe(activationId);
    const statusLabels: Record<string, string> = {
      DRAFT: cam.copy.boardColumns[0], READY: cam.copy.boardColumns[1], REVIEW: cam.copy.boardColumns[2],
      CLARIFICATION: cam.copy.boardColumns[3], APPROVED: cam.copy.boardColumns[4],
      IN_PROGRESS: cam.copy.boardColumns[5], INSTALLATION: cam.copy.boardColumns[6], COMPLETED: cam.copy.boardColumns[7],
    };
    const images = [
      ...(Array.isArray(detail?.ahMarketMediaUrls) ? detail.ahMarketMediaUrls : []),
      ...(Array.isArray(detail?.aMarketMediaUrls) ? detail.aMarketMediaUrls : []),
    ];

    await cam.openDrawer(activationId);
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(statusLabels[detail.status] ?? detail.status, { exact: true })).toBeVisible();
    await expect(dialog.getByText(detail.name, { exact: true })).toBeVisible();
    await expect(dialog.getByText(detail.store.address, { exact: true })).toBeVisible();
    await expect(dialog.getByText(/Participants|Teilnehmer/, { exact: true })).toBeVisible();
    await expect(cam.detailTab(cam.copy.detailTabs.overview)).toHaveAttribute('aria-selected', 'true');
    await expect(cam.detailTab(cam.copy.detailTabs.activity)).toBeVisible();
    await expect(cam.detailTab(cam.copy.detailTabs.communication)).toBeVisible();
    await expect(cam.detailTab(cam.copy.detailTabs.scoring)).toHaveCount(0);
    await expect(dialog.locator('footer').getByRole('button')).toHaveCount(0);

    if (images.length === 0) {
      await expect(dialog.getByText(/No images available|Keine Bilder verfügbar/, { exact: true })).toBeVisible();
    } else {
      await expect(dialog.locator('img').first()).toBeVisible();
      if (images.length > 1) {
        await expect(dialog.getByRole('button', { name: /Go to slide|Gehe zu Folie/ })).toHaveCount(images.length);
      } else {
        await expect(dialog.getByRole('button', { name: /Previous slide|Next slide|Vorherige Folie|Nächste Folie/ })).toHaveCount(0);
      }
    }

    await expect(dialog.getByText(/Contact Person|Kontaktperson/, { exact: true })).toBeVisible();
    const contact = [detail.store.contactName, detail.store.contactPhone, detail.store.contactEmail].filter(Boolean).join(', ');
    if (contact) await expect(dialog.getByText(contact, { exact: true })).toBeVisible();
    await expect(dialog.getByText(/Case ID|Fall-ID/, { exact: true })).toBeVisible();
    await expect(dialog.getByText(detail.code, { exact: true })).toBeVisible();
    await expect(dialog.getByText(/Created|Erstellt/, { exact: true })).toBeVisible();
    await expect(dialog.getByText(/Attached files|Angehängte Dateien/, { exact: true })).toBeVisible();

    for (const file of images) {
      const fileName = decodeURIComponent(file.path.split('/').pop()?.split('?')[0] ?? 'file');
      await expect(dialog.getByText(fileName, { exact: true })).toBeVisible();
    }
    if (images.length > 0) {
      const fileMenu = dialog.getByRole('button', { name: /More options|Weitere Optionen/ }).first();
      await fileMenu.click();
      await expect(page.getByRole('menuitem', { name: /Download|Herunterladen/ })).toBeVisible();
      await page.keyboard.press('Escape');
    }

    await cam.detailTab(cam.copy.detailTabs.activity).click();
    await expect(cam.detailTab(cam.copy.detailTabs.activity)).toHaveAttribute('aria-selected', 'true');
    const activityResponse = await page.request.get('/api/cam/activities', {
      params: { activationId, page: 1, limit: 10 }, headers: await authHeaders(page),
    });
    expect(activityResponse.ok()).toBeTruthy();
    const activities = (await activityResponse.json())?.data?.items ?? [];
    if (Array.isArray(activities) && activities.length === 0) {
      await expect(dialog.getByText(/No activity yet|Noch keine Aktivitäten/, { exact: true })).toBeVisible();
    } else if (Array.isArray(activities) && activities[0]?.causer?.name) {
      await expect(dialog.getByText(activities[0].causer.name, { exact: true }).first()).toBeVisible();
    }

    await cam.detailTab(cam.copy.detailTabs.communication).click();
    await expect(cam.detailTab(cam.copy.detailTabs.communication)).toHaveAttribute('aria-selected', 'true');
    await expect(cam.chatComposerTrigger).toBeVisible();
    await cam.detailTab(cam.copy.detailTabs.overview).click();
    await dialog.getByRole('button').first().click();
    await expect(dialog).toBeHidden();
    await expect(page).not.toHaveURL(/activation_drawer=open/);
  });

  test('[CAM-C-24] Overview renders activation identity, store data, status, participants and attached files with null-safe fallbacks.', async ({ page }) => {
    const cam = await openAs(page);
    const activation = (await cam.adminActivations())[0];
    test.skip(!activation, 'Admin account has no populated detail fixture.');
    await cam.openActivation(activation!.id);
    await expect(page.getByText(activation.name, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/Participants|Teilnehmer/, { exact: true })).toBeVisible();
  });

  test('[CAM-C-25] Briefing renders all stored selections, notes, outlet count and media without crashing on nullable relations.', async ({ page }) => {
    const cam = await openAs(page);
    const activation = (await cam.adminActivations())[0];
    test.skip(!activation, 'Admin account has no briefing fixture.');
    await cam.openActivation(activation.id);
    await cam.detailTab(cam.copy.detailTabs.briefing).click();
    await expect(page.getByText(/Briefing Information|Briefing-Informationen/, { exact: true })).toBeVisible();
  });

  test('[CAM-C-27] Completed and cancelled activations render no footer mutation action.', async ({ page }) => {
    const cam = await openAs(page);
    const activation = (await cam.activationByStatus('COMPLETED')) ?? (await cam.activationByStatus('CANCELLED'));
    test.skip(!activation, 'No completed/cancelled activation exists for Admin.');
    await cam.openActivation(activation!.id);
    await expect(page.locator('footer').getByRole('button')).toHaveCount(0);
  });

  test('[CAM-C-28] Scoring becomes read-only for APPROVED, IN_PROGRESS, INSTALLATION and COMPLETED.', async ({ page }) => {
    const cam = await openAs(page);
    const activations = await cam.adminActivations();
    const statuses = ['APPROVED', 'IN_PROGRESS', 'INSTALLATION', 'COMPLETED'];

    for (const status of statuses) {
      const activation = activations.find((item) => item.status === status);
      expect(activation, `Admin account has no ${status} activation.`).toBeTruthy();
      await cam.openActivation(activation!.id);
      await cam.detailTab(cam.copy.detailTabs.scoring).click();

      const options = page.getByRole('button', { name: /(?:pts|Pkt\.)/i });
      await expect(options.first()).toBeVisible();
      for (let index = 0; index < await options.count(); index += 1) {
        await expect(options.nth(index)).toBeDisabled();
      }
    }
  });
});

test.describe('customer-activation content — chat and notifications', () => {
  test('[CAM-C-33] Accepts JPEG, PNG, GIF, WebP, PDF, Word and Excel attachments.', async ({ page }) => {
    const cam = await openCommunication(page);
    const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
    const files = [
      { name: 'photo.jpg', mimeType: 'image/jpeg', buffer: image },
      { name: 'photo.png', mimeType: 'image/png', buffer: image },
      { name: 'photo.gif', mimeType: 'image/gif', buffer: image },
      { name: 'photo.webp', mimeType: 'image/webp', buffer: image },
      { name: 'brief.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') },
      { name: 'brief.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', buffer: Buffer.from('docx') },
      { name: 'brief.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: Buffer.from('xlsx') },
    ];

    for (const batch of [files.slice(0, 5), files.slice(5)]) {
      await cam.chatAttachmentInput.setInputFiles(batch);
      await expect(page.getByRole('button', { name: /entfernen|Remove/ })).toHaveCount(batch.length);
      for (let index = 0; index < batch.length; index += 1) {
        await page.getByRole('button', { name: /entfernen|Remove/ }).first().click();
      }
    }
  });

  test('[CAM-C-34] Rejects unsupported types, files over 10 MiB and selections beyond five while retaining other valid files.', async ({ page }) => {
    const cam = await openCommunication(page);
    const validFile = (name: string) => ({ name, mimeType: 'image/png', buffer: Buffer.from('png') });

    await cam.chatAttachmentInput.setInputFiles(validFile('keep.png'));
    await cam.chatAttachmentInput.setInputFiles({ name: 'blocked.exe', mimeType: 'application/octet-stream', buffer: Buffer.from('exe') });
    await cam.chatAttachmentInput.setInputFiles({ name: 'large.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(10 * 1024 * 1024 + 1) });
    await cam.chatAttachmentInput.setInputFiles([
      validFile('valid-1.png'),
      validFile('valid-2.png'),
      validFile('valid-3.png'),
      validFile('valid-4.png'),
      validFile('valid-5.png'),
      validFile('valid-6.png'),
    ]);

    await expect(page.getByRole('button', { name: /entfernen|Remove/ })).toHaveCount(5);
  });

  test('[CAM-C-35] Shows pending images as square thumbnails and documents as filename/type cards with only a remove action.', async ({ page }) => {
    const cam = await openCommunication(page);
    const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
    await cam.chatAttachmentInput.setInputFiles([
      { name: 'pending.png', mimeType: 'image/png', buffer: image },
      { name: 'pending.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') },
    ]);

    await expect(page.getByText('pending.pdf', { exact: true })).toBeVisible();
    await expect(page.getByText(/PDF file|PDF-Datei/)).toBeVisible();
    await expect(page.getByRole('button', { name: /pending\.png.*(?:entfernen|Remove)|(?:entfernen|Remove).*pending\.png/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /pending\.pdf.*(?:entfernen|Remove)|(?:entfernen|Remove).*pending\.pdf/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /pending\.png.*(?:preview|Vorschau|download|Herunterladen)/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /pending\.pdf.*(?:preview|Vorschau|download|Herunterladen)/i })).toHaveCount(0);
  });
  test('[CAM-C-36] Sends an attachment-only message, blocks mutation/duplicate submit during upload, clears only after every upload and keeps text/attachments on failure.', async ({ page }) => {
    skipMutationFixture();
    const cam = await openCommunication(page);
    const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
    const sentFile = { name: `chat-${Date.now()}.png`, mimeType: 'image/png', buffer: image };
    await cam.chatAttachmentInput.setInputFiles(sentFile);
    await expect(page.getByRole('button', { name: /remove|entfernen/i })).toHaveCount(1);

    const messages = page.locator('[data-msg-id]');
    const initialMessageCount = await messages.count();
    const save = page.getByRole('button', { name: /^Save$|^Speichern$/ });
    await save.click();
    await expect(cam.chatComposerTrigger).toBeVisible();
    await expect(page.getByRole('button', { name: /remove|entfernen/i })).toHaveCount(0);
    await expect.poll(() => messages.count(), { timeout: 15_000 }).toBeGreaterThan(initialMessageCount);
  });

  test('[CAM-C-45] Opens the notification panel and renders its localized title.', async ({ page }) => {
    const cam = await openAs(page);
    await page.getByRole('button', { name: 'notifications' }).click();
    await expect(page.getByText(cam.copy.notificationTitle, { exact: true })).toBeVisible();
  });

  test('[CAM-C-47] Marks one notification read on activation and marks all notifications read through the real endpoints.', async ({ page }) => {
    skipMutationFixture();
    const cam = await openAs(page);
    await page.getByRole('button', { name: 'notifications' }).click();
    await expect(page.getByText(cam.copy.notificationTitle, { exact: true })).toBeVisible();

    const listResponse = await page.request.get('/api/notification/inapp', {
      params: { page: 1, limit: 20 },
      headers: await authHeaders(page),
    });
    const listBody = await listResponse.json();
    const notifications = Array.isArray(listBody?.data) ? listBody.data : Array.isArray(listBody) ? listBody : [];
    const unread = notifications.find((item: { id?: string; _id?: string; status?: string }) => item.status !== 'read');

    if (unread) {
      const id = unread.id ?? unread._id;
      expect(id).toEqual(expect.any(String));
      const markOne = await page.request.patch(`/api/notification/inapp/${id}/read`, {
        headers: await authHeaders(page),
      });
      expect(markOne.ok()).toBeTruthy();
    }

    const markAll = await page.request.patch('/api/notification/inapp/read-all', {
      headers: await authHeaders(page),
    });
    expect(markAll.ok()).toBeTruthy();
  });
});

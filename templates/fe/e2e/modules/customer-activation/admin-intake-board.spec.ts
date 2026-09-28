import { expect, test, type Locator, type Page } from '@playwright/test';
import { authenticateViaApi } from '../../shared/session';
import {
  authHeaders,
  camCredentials,
  CAM_ROUTES,
  localizedCamPath,
} from './customer-activation.data';
import { CustomerActivationPage } from './customer-activation.page';
const statuses = [
  'DRAFT',
  'READY',
  'REVIEW',
  'CLARIFICATION',
  'APPROVED',
  'IN_PROGRESS',
  'INSTALLATION',
  'COMPLETED',
] as const;
type BoardItem = {
  id: string;
  name: string;
  storeAddress?: string;
  status: string;
  owner?: string;
  fileCount?: number;
  chatCount?: number;
  evaluation?: { score?: number; maxScore?: number } | null;
};
type BoardGroup = { status: string; items?: unknown };
function responseData(body: unknown): { groups?: unknown } {
  if (!body || typeof body !== 'object') return {};
  const record = body as { data?: unknown };
  const value = record.data ?? body;
  return value && typeof value === 'object' ? value as { groups?: unknown } : {};
}
async function openAdmin(page: Page) {
  const credentials = camCredentials('admin');
  test.skip(!credentials, 'Missing Admin CAM credentials.');
  await authenticateViaApi(page, credentials!);
  const cam = new CustomerActivationPage(page);
  await cam.goto();
  await cam.openAdminTab(cam.copy.adminTabs[1]);
  return cam;
}
function initials(owner?: string) {
  return owner
    ? owner.split(' ').map((part) => part[0]?.toUpperCase() ?? '').join('').slice(0, 2)
    : 'U';
}
async function deployedOrFallback(preferred: Locator, fallback: Locator) {
  return (await preferred.count()) > 0 ? preferred : fallback;
}
async function boardColumn(board: Locator, cam: CustomerActivationPage, status: typeof statuses[number]) {
  const label = cam.copy.boardColumns[statuses.indexOf(status)];
  return deployedOrFallback(board.getByTestId(`cam-intake-column-${status.toLowerCase()}`), board.getByRole('heading', { name: label, exact: true }).locator('../../..'));
}
test('admin intake board', async ({ page }) => {
  const cam = await openAdmin(page);
  const board = await deployedOrFallback(
    page.getByTestId('cam-intake-board'),
    page.getByRole('region', { name: /activation board|aktivierungs-board/i }),
  );
  await expect(board).toBeVisible();
  await expect(cam.newActivation).toHaveAttribute('href', /\/customer-activation\/new-activation/);
  await cam.newActivation.click();
  await expect(page).toHaveURL(/\/customer-activation\/new-activation/);
  await page.goto(`${localizedCamPath(page, CAM_ROUTES.main)}?tab=intake-board`);
  await expect(board).toBeVisible();
  const response = await page.request.get('/api/cam/activations/grouped', {
    params: { sortBy: 'NAME_ASC' },
    headers: await authHeaders(page),
  });
  expect(response.ok()).toBeTruthy();
  const data = responseData(await response.json());
  const groups = Array.isArray(data.groups) ? data.groups as BoardGroup[] : [];
  const itemsByStatus = new Map<string, BoardItem[]>();

  for (const status of statuses) {
    const group = groups.find((candidate) => candidate.status === status);
    const items = Array.isArray(group?.items) ? group.items as BoardItem[] : [];
    itemsByStatus.set(status, items);
    const column = await boardColumn(board, cam, status);
    const count = await deployedOrFallback(
      column.getByTestId('cam-intake-column-count'),
      column.getByText(String(items.length), { exact: true }).first(),
    );
    const cards = await deployedOrFallback(column.getByTestId('cam-intake-card'), column.locator('a'));
    await expect(column).toBeVisible();
    await expect(count).toHaveText(String(items.length));
    await expect(cards).toHaveCount(items.length);
  }

  await expect(board.getByRole('heading', { name: /cancelled|storniert/i })).toHaveCount(0);
  await expect(board).toHaveCSS('overflow-x', 'auto');
  const dimensions = await board.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeGreaterThanOrEqual(dimensions.clientWidth);

  const firstItem = [...itemsByStatus.values()].flat()[0];
  if (firstItem) {
    const column = await boardColumn(board, cam, firstItem.status as typeof statuses[number]);
    const cardLink = column.getByRole('link', { name: firstItem.name, exact: true });
    const card = await deployedOrFallback(
      column.getByTestId('cam-intake-card').filter({ hasText: firstItem.name }).first(),
      cardLink.locator('..'),
    );
    await expect(card).toBeVisible();
    await expect(card).toContainText(firstItem.name);
    if (firstItem.storeAddress) await expect(card).toContainText(firstItem.storeAddress);
    await expect(card).toContainText(`${firstItem.evaluation?.score ?? 0}/${firstItem.evaluation?.maxScore ?? 27}`);
    await expect(card).toContainText(cam.copy.boardColumns[statuses.indexOf(firstItem.status as typeof statuses[number])]);
    await expect(card).toContainText(String(firstItem.chatCount ?? 0));
    await expect(card).toContainText(String(firstItem.fileCount ?? 0));
    await expect(card).toContainText(initials(firstItem.owner));
    await expect(cardLink).toHaveAttribute('href', new RegExp(`/customer-activation/${firstItem.id}\\?`));
    await cardLink.click();
    await expect(page).toHaveURL(new RegExp(`/customer-activation/${firstItem.id}`));
    await page.goto(`${localizedCamPath(page, CAM_ROUTES.main)}?tab=intake-board`);
    await expect(page.getByRole('region', { name: /activation board|aktivierungs-board/i })).toBeVisible();
  }

  const searchItem = firstItem;
  if (searchItem) {
    const search = await deployedOrFallback(
      page.getByTestId('cam-intake-board-search'),
      page.getByRole('textbox', { name: /search case|search cases|fälle suchen/i }),
    );
    const searchTerm = searchItem.name.slice(0, 4).trim().toLowerCase();
    const searchResponse = page.waitForResponse((value) => {
      const url = new URL(value.url());
      return url.pathname.includes('/api/cam/activations/grouped') && url.searchParams.get('search') === searchTerm;
    });
    await search.fill(searchTerm);
    await searchResponse;
    await expect(board.getByRole('link', { name: searchItem.name, exact: true })).toBeVisible();
    await search.fill(`missing-cam-case-${Date.now()}`);
    const emptyCards = await deployedOrFallback(board.getByTestId('cam-intake-card'), board.locator('a'));
    await expect(emptyCards).toHaveCount(0);
    for (const status of statuses) {
      const column = await boardColumn(board, cam, status);
      const count = await deployedOrFallback(column.getByTestId('cam-intake-column-count'), column.getByText('0', { exact: true }).first());
      await expect(count).toBeVisible();
    }
    await page.getByRole('button', { name: /clear|zurücksetzen/i }).click();
    const restoredCards = await deployedOrFallback(board.getByTestId('cam-intake-card'), board.locator('a'));
    await expect(restoredCards.first()).toBeVisible();
  }

  const sortResponse = page.waitForResponse((value) => {
    const url = new URL(value.url());
    return url.pathname.includes('/api/cam/activations/grouped') && url.searchParams.get('sortBy') === 'NAME_DESC';
  });
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: cam.locale === 'en' ? 'Case Name: Z–A' : 'Fallname: Z–A', exact: true }).click();
  await sortResponse;
  expect(new URL(page.url()).searchParams.get('sortBy')).toBe('NAME_DESC');

  const expectedActions: Record<string, number> = {
    DRAFT: 2,
    READY: 1,
    REVIEW: 2,
    CLARIFICATION: 0,
    APPROVED: 1,
    IN_PROGRESS: 1,
    INSTALLATION: 1,
    COMPLETED: 0,
  };
  for (const status of statuses) {
    const item = itemsByStatus.get(status)?.[0];
    if (!item) continue;
    const column = await boardColumn(board, cam, status);
    const cardLink = column.getByRole('link', { name: item.name, exact: true });
    const card = await deployedOrFallback(
      column.getByTestId('cam-intake-card').filter({ hasText: item.name }).first(),
      cardLink.locator('..'),
    );
    const trigger = card.getByRole('button').first();
    if (expectedActions[status] === 0) {
      await expect(trigger).toHaveCount(0);
      continue;
    }
    const urlBeforeMenu = page.url();
    await trigger.click();
    expect(page.url()).toBe(urlBeforeMenu);
    const menuItems = page.getByRole('menuitem');
    await expect(menuItems).toHaveCount(expectedActions[status]);
    const nextStatusIndex = statuses.indexOf(status) + 1;
    if (status !== 'REVIEW') {
      await expect(menuItems.filter({ hasText: cam.copy.boardColumns[nextStatusIndex] })).toHaveCount(1);
    }
    if (status === 'DRAFT') {
      await expect(page.getByRole('menuitem', { name: cam.locale === 'en' ? 'Edit Case' : 'Fall bearbeiten', exact: true })).toBeVisible();
    }
    await page.keyboard.press('Escape');
  }
});

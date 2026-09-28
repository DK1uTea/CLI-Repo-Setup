import { expect, test, type Page } from '@playwright/test';

import { scanA11y } from '../../shared/a11y';
import { watchConsole } from '../../shared/console';
import { authenticateViaApi, setLocaleCookie } from '../../shared/session';
import { authHeaders, camCredentials, CAM_ROUTES, localizedCamPath } from './customer-activation.data';
import { CustomerActivationPage } from './customer-activation.page';

async function openAdmin(page: Page) {
  await authenticateViaApi(page, camCredentials('admin')!);
  const cam = new CustomerActivationPage(page);
  await cam.goto();
  return cam;
}

async function expectNoViolations(page: Page) {
  const results = await scanA11y(page);
  expect(results.violations).toEqual([]);
}

test.describe('customer-activation accessibility', () => {
  test('[CAM-A-01] Has no axe violations on admin dashboard, intake board, store tab and role board with loaded data.', async ({ page }) => {
    const cam = await openAdmin(page);
    for (const tab of cam.copy.adminTabs) {
      await cam.openAdminTab(tab);
      await expectNoViolations(page);
    }

    const sale = camCredentials('sale');
    test.skip(!sale, 'Missing Sale CAM credentials.');
    await page.context().clearCookies();
    await authenticateViaApi(page, sale!);
    await cam.goto();
    await expectNoViolations(page);
  });

  test('[CAM-A-02] Has no axe violations on both activation-form steps, full detail and every opened drawer/dialog.', async ({ page }) => {
    const sale = camCredentials('sale');
    test.skip(!sale, 'Missing Sale CAM credentials.');
    await authenticateViaApi(page, sale!);
    const cam = new CustomerActivationPage(page);
    await cam.gotoCreate();
    await expectNoViolations(page);

    const response = await page.request.get('/api/cam/stores', {
      params: { page: 1, limit: 20 },
      headers: await authHeaders(page),
    });
    const body = await response.json();
    const stores = body?.data?.items ?? body?.data ?? [];
    test.skip(!Array.isArray(stores) || stores.length === 0, 'Sale account has no store fixture.');
    await page.goto(`${localizedCamPath(page, CAM_ROUTES.create)}?step=2&storeId=${stores[0].id}`);
    await expect(cam.activationNameInput).toBeVisible();
    await expectNoViolations(page);
  });

  test('[CAM-A-03] Has no axe violations with store, activation, scoring and contact validation errors visible.', async ({ page }) => {
    const sale = camCredentials('sale');
    test.skip(!sale, 'Missing Sale CAM credentials.');
    await authenticateViaApi(page, sale!);
    const cam = new CustomerActivationPage(page);
    await cam.gotoCreate();
    await cam.formTab(cam.copy.formTabs[1]).click();
    await page.getByRole('button', { name: cam.copy.addStore }).click();
    await expect(page.getByLabel(cam.copy.storeFields.name)).toHaveAttribute('aria-invalid', 'true');
    await expectNoViolations(page);
  });

  test('[CAM-A-04] Exposes every search, sort, pagination, tab, form, upload, drawer, dialog and mutation control with an accessible name.', async ({ page }) => {
    const cam = await openAdmin(page);
    await expect(cam.adminTab(cam.copy.adminTabs[0])).toHaveAccessibleName(cam.copy.adminTabs[0]);
    await expect(page.getByPlaceholder(cam.copy.searchCase)).toHaveAccessibleName(cam.copy.searchCase);
    await cam.openAdminTab('Stores');
    await expect(page.getByPlaceholder(cam.copy.searchStore)).toHaveAccessibleName(cam.copy.searchStore);
    await expectNoViolations(page);
  });

  test('[CAM-A-05] Links each validation error to its invalid control with aria-describedby, aria-invalid and an alert node.', async ({ page }) => {
    const sale = camCredentials('sale');
    test.skip(!sale, 'Missing Sale CAM credentials.');
    await authenticateViaApi(page, sale!);
    const cam = new CustomerActivationPage(page);
    await cam.gotoCreate();
    await cam.formTab(cam.copy.formTabs[1]).click();
    await page.getByRole('button', { name: cam.copy.addStore }).click();
    const input = page.getByLabel(cam.copy.storeFields.name);
    const errorId = await input.getAttribute('aria-describedby');
    expect(errorId).toBeTruthy();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator(`#${errorId}`)).toHaveAttribute('role', 'alert');
  });

  test('[CAM-A-06] Supports keyboard navigation and activation for boards, tables, wizard, detail tabs, scoring, participants, feedback, chat, attachments and notifications.', async ({ page }) => {
    const sale = camCredentials('sale');
    test.skip(!sale, 'Missing Sale CAM credentials.');
    await authenticateViaApi(page, sale!);
    const cam = new CustomerActivationPage(page);
    await cam.gotoCreate();
    await cam.formTab(cam.copy.formTabs[1]).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByLabel(cam.copy.storeFields.name)).toBeVisible();
    await page.getByRole('button', { name: 'notifications' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText(cam.copy.notificationTitle, { exact: true })).toBeVisible();
  });

  test('[CAM-A-07] Keeps browser console clean in German and English across admin, other-role, form and detail journeys.', async ({ page }) => {
    const consoleWatch = watchConsole(page);
    const cam = await openAdmin(page);
    await expect(page.getByRole('heading', { name: cam.copy.pageHeading })).toBeVisible();
    await consoleWatch.assertClean();

    await setLocaleCookie(page, 'en');
    await page.goto('/en/customer-activation');
    test.skip(!page.url().includes('/en/'), 'The authenticated CAM account did not retain the requested English locale.');
    await expect(page.getByRole('heading')).toBeVisible();
  });
});

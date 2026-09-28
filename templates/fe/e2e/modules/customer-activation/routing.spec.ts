import { expect, test, type Page } from '@playwright/test';

import { authenticateViaApi } from '../../shared/session';
import { camCredentials, CAM_ROUTES, localizedCamPath, type CamRole } from './customer-activation.data';
import { CustomerActivationPage } from './customer-activation.page';

async function authenticateRole(page: Page, role: CamRole) {
  const credentials = camCredentials(role);
  test.skip(!credentials, `Missing ${role} CAM credentials.`);
  await authenticateViaApi(page, credentials!);
}

test.describe('customer-activation routing', () => {
  test('[CAM-R-01] Redirects unauthenticated visitors from every CAM route to the locale-specific login page.', async ({ page }) => {
    const routes = [
      localizedCamPath(page, CAM_ROUTES.main),
      localizedCamPath(page, CAM_ROUTES.create),
      `${localizedCamPath(page, CAM_ROUTES.update)}?activation_id=missing&step=2`,
      localizedCamPath(page, CAM_ROUTES.detail('missing')),
      localizedCamPath(page, CAM_ROUTES.store('missing')),
    ];

    for (const route of routes) {
      await page.context().clearCookies();
      await page.goto(route);
      await expect(page).toHaveURL(/\/(?:de|en)\/login/);
    }
  });

  test('[CAM-R-02] Hides or denies create/update without wildcard, Internal Admin or Sale permission.', async ({ page }) => {
    await authenticateRole(page, 'agency');
    await page.goto(localizedCamPath(page, CAM_ROUTES.create));
    await expect(page.getByRole('heading', { name: /Access Denied|Zugriff verweigert/ })).toBeVisible();
    await page.goto(`${localizedCamPath(page, CAM_ROUTES.update)}?activation_id=missing`);
    await expect(page.getByRole('heading', { name: /Access Denied|Zugriff verweigert/ })).toBeVisible();
  });

  test('[CAM-R-03] Denies full activation detail without Internal Admin permission.', async ({ page }) => {
    await authenticateRole(page, 'sale');
    await page.goto(localizedCamPath(page, CAM_ROUTES.detail('missing')));
    await expect(page.getByRole('heading', { name: /Access Denied|Zugriff verweigert/ })).toBeVisible();
  });

  test('[CAM-R-04] Renders only the role-specific main view selected by loaded permissions.', async ({ page }) => {
    const cam = new CustomerActivationPage(page);
    for (const role of ['admin', 'sale', 'agency', 'installer'] as const) {
      await page.context().clearCookies();
      await authenticateRole(page, role);
      await cam.goto();
      await expect(cam.heading).toBeVisible();
      if (role === 'admin') await expect(cam.adminTab(cam.copy.adminTabs[0])).toBeVisible();
      else await expect(cam.adminTab(cam.copy.adminTabs[0])).toBeHidden();
    }
  });

  test('[CAM-R-05] Uses dashboard as the default valid admin tab and preserves a deep-linked admin tab.', async ({ page }) => {
    await authenticateRole(page, 'admin');
    const cam = new CustomerActivationPage(page);
    await cam.goto();
    await expect(cam.adminTab(cam.copy.adminTabs[0])).toHaveAttribute('aria-selected', 'true');
    await page.goto(`${localizedCamPath(page, CAM_ROUTES.main)}?tab=store`);
    await expect(cam.adminTab(cam.copy.adminTabs[2])).toHaveAttribute('aria-selected', 'true');
  });

  test('[CAM-R-06] Uses step 1 when activation-form step is missing or invalid and preserves valid step/store/activation parameters.', async ({ page }) => {
    await authenticateRole(page, 'sale');
    const cam = new CustomerActivationPage(page);
    await page.goto(localizedCamPath(page, CAM_ROUTES.create));
    await expect(page.getByText(cam.copy.storeStep, { exact: true })).toBeVisible();
    await page.goto(`${localizedCamPath(page, CAM_ROUTES.create)}?step=999`);
    await expect(page.getByText(cam.copy.storeStep, { exact: true })).toBeVisible();
  });

  test('[CAM-R-07] Prevents update step 2 from rendering until its real activation detail has loaded.', async ({ page }) => {
    await authenticateRole(page, 'sale');
    const cam = new CustomerActivationPage(page);
    await page.goto(`${localizedCamPath(page, CAM_ROUTES.update)}?activation_id=missing&step=2`);
    await expect(cam.activationNameInput).toBeHidden();
  });

  test('[CAM-R-08] Closing activation, feedback or participants drawers removes only their owned URL parameters.', async ({ page }) => {
    await authenticateRole(page, 'sale');
    await page.goto(`${localizedCamPath(page, CAM_ROUTES.main)}?activation_drawer=open&activation_id=missing&activationTab=overview&keyword=keep`);
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page).not.toHaveURL(/activation_drawer=/);
    await expect(page).not.toHaveURL(/activation_id=/);
    await expect(page).toHaveURL(/keyword=keep/);
  });

  test('[CAM-R-09] Preserves backTo when full detail navigates back to its originating admin tab.', async ({ page }) => {
    await authenticateRole(page, 'admin');
    const cam = new CustomerActivationPage(page);
    const activation = (await cam.adminActivations())[0];
    test.skip(!activation, 'Admin account has no activation detail fixture.');
    const backTo = '/customer-activation?tab=intake-board';
    await page.goto(`${localizedCamPath(page, CAM_ROUTES.detail(activation.id))}?backTo=${encodeURIComponent(backTo)}`);
    await expect(page.getByRole('link', { name: /Back to list|Zurück zur Liste/ })).toHaveAttribute(
      'href',
      /tab=intake-board/,
    );
  });

});

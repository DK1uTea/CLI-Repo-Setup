import { expect, test } from '@playwright/test';

import { authenticateViaApi } from '../../shared/session';
import { CAM_ROUTES, camCredentials, localizedCamPath } from './customer-activation.data';
import { CustomerActivationPage } from './customer-activation.page';

test.describe('customer-activation errors', () => {
  test('[CAM-E-01] Renders the module maintenance state when the activation detail is unavailable.', async ({ page }) => {
    await authenticateViaApi(page, camCredentials('admin')!);
    const cam = new CustomerActivationPage(page);
    await page.goto(localizedCamPath(page, CAM_ROUTES.detail('00000000-0000-0000-0000-000000000000')));
    await expect(page.getByRole('heading', { name: cam.copy.maintenanceTitle })).toBeVisible();
  });
});

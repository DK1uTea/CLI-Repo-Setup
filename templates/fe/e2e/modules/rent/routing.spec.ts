import { expect, test } from '@playwright/test';

import { resumeSessionAt } from '../../shared/session';
import { localizedRentPath, RentPage } from './rent.page';

test.describe('rent product routing', () => {
  test('[RP-R-01] A missing product slug renders the localized unavailable-page fallback.', async ({ page }) => {
    await resumeSessionAt(page, 'rent');
    const rent = new RentPage(page);
    await page.goto(localizedRentPath(page, '/rent/does-not-exist'));

    await expect(page.getByRole('heading', { name: rent.copy.unavailableHeading })).toBeVisible();
    await expect(page.getByText(rent.copy.unavailableDescription)).toBeVisible();
  });

  test('[RP-R-02] The product detail keeps the selected availability tab in the URL.', async ({ page }) => {
    await resumeSessionAt(page, 'rent');
    const rent = new RentPage(page);
    await rent.openFirstAvailableProduct();
    await rent.availabilityTab.click();

    await expect(page).toHaveURL(/tab=availability/);
    await expect(rent.availabilityTab).toHaveAttribute('aria-selected', 'true');
  });
});

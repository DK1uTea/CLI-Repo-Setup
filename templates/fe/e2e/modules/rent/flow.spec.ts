import { expect, test } from '@playwright/test';

import { authenticateViaApi } from '../../shared/session';
import { rentSidebarLink, RentPage } from './rent.page';

test.describe('rent product flow', () => {
  test('[RP-F-01] An authenticated user can open the Rent Product catalogue and navigate to an available product detail page.', async ({ page }) => {
    // The Login module owns the browser sign-in journey. This module starts from the
    // shared real-session API helper so the rental flow is not coupled to CAPTCHA scoring.
    await authenticateViaApi(page);
    await page.goto('/de/dashboards');
    await rentSidebarLink(page).click();
    await page.waitForURL(/\/(?:de|en)\/rent/);

    const rent = new RentPage(page);
    await expect(rent.catalogueTab).toBeVisible();
    await expect(rentSidebarLink(page)).toHaveAttribute('data-active', 'true');
    await rent.openFirstAvailableProduct();

    await expect(rent.detailHeading).toBeVisible();
    await expect(page).toHaveURL(/\/(?:de|en)\/rent\/[^?]+\?start_date=[^&]+&end_date=/);
  });

  test('[RP-F-02] An authenticated user can switch to Rent Orders and see the order list with its table columns and pagination.', async ({ page }) => {
    await authenticateViaApi(page);
    await page.goto('/de/rent');

    const rent = new RentPage(page);
    await rent.ordersTab.click();

    await expect(rent.ordersTab).toHaveAttribute('aria-selected', 'true');
    await expect(page).toHaveURL(/tab=rented/);
    await expect(page.getByRole('columnheader', { name: rent.copy.orderId })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: rent.copy.recipient })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: rent.copy.totalAmount })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: rent.copy.status })).toBeVisible();
    await expect(page.getByRole('navigation', { name: rent.copy.pagination })).toBeVisible();
  });

  test('[RP-F-03] Selecting an order opens its detail page with rental items, totals, and customer information.', async ({ page }) => {
    await authenticateViaApi(page);
    await page.goto('/de/rent?tab=rented');

    const rent = new RentPage(page);
    const firstOrder = rent.orderLinks.first();
    await firstOrder.waitFor({ state: 'visible' });
    await firstOrder.click();

    await expect(page).toHaveURL(/\/(?:de|en)\/rent\/order\?order_id=\d+/);
    await expect(rent.orderDetailNumber).toBeVisible();
    await expect(page.getByText(rent.copy.subtotal)).toBeVisible();
    await expect(page.getByText(rent.copy.total, { exact: true })).toBeVisible();
    await expect(rent.customerInformationHeading).toBeVisible();
  });
});

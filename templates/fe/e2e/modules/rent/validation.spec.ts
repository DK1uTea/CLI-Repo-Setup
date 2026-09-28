import { expect, test } from '@playwright/test';

import { resumeSessionAt } from '../../shared/session';
import { localizedRentPath, RentPage } from './rent.page';

test.describe('rent product validation', () => {
  test('[RP-D-01] The rental date picker disables past dates and only enables Apply for a complete valid range.', async ({ page }) => {
    await resumeSessionAt(page, 'rent');
    const rent = new RentPage(page);
    await rent.dateRangeButton.click();

    await expect(rent.datePickerStartInput).toBeVisible();
    await expect(rent.datePickerEndInput).toBeVisible();
    await expect(rent.datePickerResetButton).toBeVisible();
    await expect(rent.datePickerApplyButton).toBeDisabled();
    expect(await rent.disabledDateCells.count()).toBeGreaterThan(0);

    const firstEnabledDate = rent.enabledDateCells.first();
    await firstEnabledDate.click();
    await expect(rent.datePickerApplyButton).toBeDisabled();
    await firstEnabledDate.click();
    await expect(rent.datePickerApplyButton).toBeEnabled();

    const monthBefore = await page.getByTestId('mini-calendar-view-month').getAttribute('data-view-month');
    await rent.datePickerMonthNavigationButtons.nth(1).click();
    await expect(page.getByTestId('mini-calendar-view-month')).not.toHaveAttribute('data-view-month', monthBefore ?? '');

    await rent.datePickerResetButton.click();
    await expect(page).not.toHaveURL(/start_date=|end_date=/);
  });

  test('[RP-D-02] Applying a selected date range updates the catalogue and Reset clears the range.', async ({ page }) => {
    await resumeSessionAt(page, 'rent');
    const rent = new RentPage(page);
    await rent.dateRangeButton.click();

    const firstEnabledDate = rent.enabledDateCells.first();
    await firstEnabledDate.click();
    await firstEnabledDate.click();
    await expect(rent.datePickerApplyButton).toBeEnabled();
    await rent.datePickerApplyButton.click({ force: true });

    await expect(page).toHaveURL(/start_date=[^&]+&end_date=/);
    await rent.dateRangeButton.click();
    await rent.datePickerResetButton.click();
    await expect(page).not.toHaveURL(/start_date=|end_date=/);
  });

  test('[RP-D-03] Product detail shows and applies its rental date range.', async ({ page }) => {
    await resumeSessionAt(page, 'rent');
    await page.setViewportSize({ width: 1280, height: 1400 });
    const rent = new RentPage(page);
    await rent.openFirstAvailableProduct();
    await expect(rent.rentalDateRangeButton).toContainText(/\d{2}[./]\d{2}[./]\d{4}/);
    await rent.rentalDateRangeButton.click();
    const firstEnabledDate = rent.enabledDateCells.first();
    await firstEnabledDate.click();
    await firstEnabledDate.click();
    await expect(rent.datePickerApplyButton).toBeEnabled();
    await rent.datePickerApplyButton.click({ force: true });
    await expect(page).toHaveURL(/start_date=[^&]+&end_date=/);
    await expect(rent.detailAvailability).toBeVisible();
    await expect(rent.detailQuantity).toBeVisible();
  });

  test('[RP-V-01] Invalid rental date parameters show the localized validation message and are replaced with the default valid range.', async ({ page }) => {
    await resumeSessionAt(page, 'rent');
    const rent = new RentPage(page);
    await page.goto(localizedRentPath(page, '/rent?start_date=not-a-date&end_date=still-not-a-date'));

    await expect(page.getByText(rent.copy.invalidDateRange).first()).toBeVisible();
    await expect(page).toHaveURL(/\/(?:de|en)\/rent\?start_date=\d{4}-\d{2}-\d{2}T[^&]+&end_date=\d{4}-\d{2}-\d{2}T/);
  });

  test('[RP-V-02] A product detail opened without a rental date range is populated with the default range without showing a validation error.', async ({ page }) => {
    await resumeSessionAt(page, 'rent');
    const rent = new RentPage(page);
    const slug = await rent.firstAvailableProductSlug();
    await page.goto(localizedRentPath(page, `/rent/${slug}`));

    await expect(rent.detailHeading).toBeVisible();
    await expect(rent.rentalDateRangeButton).toBeVisible();
    await expect(page).toHaveURL(/start_date=\d{4}-\d{2}-\d{2}T[^&]+&end_date=\d{4}-\d{2}-\d{2}T/);
    await expect(page.getByText(rent.copy.invalidDateRange)).not.toBeVisible();
  });
});

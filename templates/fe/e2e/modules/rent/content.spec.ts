import { expect, test } from '@playwright/test';
import { resumeSessionAt } from '../../shared/session';
import { localizedRentPath, rentSidebarLink, RentPage } from './rent.page';
async function updateProductList(page: import('@playwright/test').Page, action: () => Promise<void>) {
  const response = page.waitForResponse((value) => new URL(value.url()).pathname.endsWith('/api/etr/products') && value.request().method() === 'GET');
  await action(); await response;
}
async function openRent(page: import('@playwright/test').Page) {
  await resumeSessionAt(page, 'rent'); return new RentPage(page);
}
test.describe('rent product content', () => {
  test('[RP-C-01] A product detail page displays description, rental availability, related products, and the PDF download action.', async ({ page }) => {
    const rent = await openRent(page);
    await rent.openFirstAvailableProduct();
    const productName = (await rent.detailHeading.textContent())?.trim();
    expect(productName).toBeTruthy();
    await expect(rent.detailBreadcrumb).toContainText(productName!.toUpperCase());
    await expect(rentSidebarLink(page)).toHaveAttribute('data-active', 'true');
    await expect(rent.detailImages.first()).toBeVisible();
    await expect(rent.detailAvailability).toBeVisible();
    await expect(rent.detailQuantity).toBeVisible();
    await expect(rent.detailPrice).toBeVisible();
    await expect(rent.detailProductDetails).toBeVisible();
    await expect(rent.productImageThumbnails.first()).toHaveAttribute('aria-current', 'true');
    const thumbnailCount = await rent.productImageThumbnails.count();
    if (thumbnailCount > 1) {
      await rent.productImageThumbnails.nth(1).click();
      await expect(rent.productImageThumbnails.nth(1)).toHaveAttribute('aria-current', 'true');
      await expect(rent.previousImageButton).toBeVisible();
      await expect(rent.nextImageButton).toBeVisible();
      await rent.previousImageButton.click();
      await expect(rent.productImageThumbnails.first()).toHaveAttribute('aria-current', 'true');
      await rent.nextImageButton.click();
      await expect(rent.productImageThumbnails.nth(1)).toHaveAttribute('aria-current', 'true');
    } else {
      await expect(rent.previousImageButton).toHaveCount(0);
      await expect(rent.nextImageButton).toHaveCount(0);
    }
    await expect(rent.descriptionTab).toBeVisible();
    await expect(rent.availabilityTab).toBeVisible();
    await expect(rent.downloadPdfButton).toBeVisible();
    await expect(page.getByRole('heading', { name: rent.copy.similarProducts })).toBeVisible();
    await expect(rent.rentalDateRangeButton).toBeVisible();
    await rentSidebarLink(page).click();
    await page.waitForURL(/\/(?:de|en)\/rent(?:\?|$)/);
    await expect(rent.headerTitle).toBeVisible();
  });
  test('[RP-C-02] The product detail PDF action downloads a PDF file.', async ({ page }) => {
    const rent = await openRent(page);
    await rent.openFirstAvailableProduct();
    const downloadPromise = page.waitForEvent('download');
    await rent.downloadPdfButton.click();
    const download = await downloadPromise;
    await expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
  });
  test('[RP-C-03] Selecting the availability tab loads and displays the product\'s monthly availability calendar.', async ({ page }) => {
    const rent = await openRent(page);
    await rent.openFirstAvailableProduct();
    await rent.availabilityTab.click();
    await expect(rent.availabilityTab).toHaveAttribute('aria-selected', 'true');
    await expect(rent.availabilityMonthButton).toBeVisible();
    await expect(page.getByText(/\d{2}\/\d{4}/).first()).toBeVisible();
    await expect(page).toHaveURL(/tab=availability/);
  });
  test('[RP-C-09] Product detail documents render grouped attachments and download the selected file.', async ({ page }) => {
    const attachmentsResponse = page.waitForResponse((value) => {
      const pathname = new URL(value.url()).pathname;
      return value.request().method() === 'GET' && /\/api\/etr\/products\/[^/]+\/attachments$/.test(pathname);
    });
    const rent = await openRent(page);
    await rent.openFirstAvailableProduct();
    await rent.documentsTab.click();
    await expect(rent.documentsTab).toHaveAttribute('aria-selected', 'true');

    const response = await attachmentsResponse;
    expect(response.status()).toBe(200);
    const body = await response.json();
    const items = body?.data?.items;
    expect(Array.isArray(items)).toBe(true);

    await expect(rent.assemblyInstructionsHeading).toBeVisible();
    await expect(rent.manufacturerDataHeading).toBeVisible();

    const firstDocument = (items as Array<{ fileName?: string }>).find((item) => item.fileName);
    test.skip(!firstDocument?.fileName, 'The live product has no document fixture.');

    const fileName = firstDocument!.fileName!;
    await expect(rent.documentDownloadButton(fileName)).toBeVisible();

    const proxyResponse = page.waitForResponse((value) => {
      return new URL(value.url()).pathname === '/api/proxy-download' && value.request().method() === 'GET';
    });
    const download = page.waitForEvent('download');
    await rent.documentFileName(fileName).click();

    expect((await proxyResponse).ok()).toBe(true);
    expect((await download).suggestedFilename()).toBe(fileName);
  });
  test('[RP-BUNDLE-01] A bundle product Description tab lists its children, quantities, and explanation tooltip.', async ({ page }) => {
    const listResponse = page.waitForResponse((value) => new URL(value.url()).pathname.endsWith('/api/etr/products') && value.request().method() === 'GET');
    const rent = await openRent(page); const list = await (await listResponse).json();
    const item = list?.data?.items?.find((value: { productType?: string; slug?: string }) => value.productType === 'bundle' && value.slug);
    test.skip(!item, 'The live catalogue has no bundle product fixture.');
    const detailResponse = page.waitForResponse((value) => new URL(value.url()).pathname.endsWith(`/api/etr/products/${item.slug}`)); await page.goto(localizedRentPath(page, `/rent/${item.slug}`));
    const detail = (await (await detailResponse).json())?.data; test.skip(!detail || !Array.isArray(detail.children) || !detail.children.length, 'The bundle detail has no child fixture.');
    await expect(rent.descriptionTab).toHaveAttribute('aria-selected', 'true');
    await expect(rent.bundleSection).toBeVisible(); await expect(rent.bundleInfoButton).toBeVisible();
    await expect(rent.bundleItems).toHaveCount(detail.children.length); for (const child of detail.children) await expect(rent.bundleItems.filter({ hasText: child.name })).toContainText(`X ${child.requiredQty}`);
    await rent.bundleInfoButton.hover(); await expect(page.getByRole('tooltip')).toHaveText(rent.copy.bundleProductInfo);
  });
  test('[RP-C-04] Catalogue search synchronizes its value to the URL and refreshes the product list.', async ({ page }) => {
    const rent = await openRent(page);
    await expect(rent.searchInput).toBeVisible();
    await rent.searchInput.fill('Coca-Cola');
    await expect(page).toHaveURL(/keyword=Coca-Cola/);
    await expect(rent.searchInput).toHaveValue('Coca-Cola');
    await expect(rent.productCards.first()).toBeVisible();
  });
  test('[RP-C-05] The default catalogue loads 20 more categories when the user selects the load-more action.', async ({ page }) => {
    const rent = await openRent(page);
    await expect(rent.catalogueTab).toBeVisible();
    await expect(rent.loadMoreCategoriesButton).toBeVisible();
    const categoriesBefore = await rent.categoryButtons.count();
    await rent.loadMoreCategoriesButton.click();
    await expect(rent.categoryButtons).toHaveCount(categoriesBefore + 20);
    await expect(rent.loadMoreCategoriesButton).toBeVisible();
  });
  test('[RP-C-06] Rent Orders search synchronizes its value to the URL and refreshes the order list.', async ({ page }) => {
    const rent = await openRent(page);
    await rent.ordersTab.click();
    await expect(rent.ordersSearchInput).toBeVisible();
    await rent.ordersSearchInput.fill('200000');
    await expect(page).toHaveURL(/tab=rented.*search=200000/);
    await expect(rent.ordersSearchInput).toHaveValue('200000');
    await expect(rent.orderRows.first()).toBeVisible();
  });
  test('[RP-C-07] Rent Orders status and sort filters update the URL and refresh the order list.', async ({ page }) => {
    const rent = await openRent(page);
    await rent.ordersTab.click();
    await rent.ordersStatusCombobox.click();
    await page.getByRole('option', { name: rent.copy.pending }).click();
    await expect(page).toHaveURL(/tab=rented.*status=pending/);
    await rent.ordersSortCombobox.click();
    await page.getByRole('option', { name: rent.copy.sortOrderIdDescending }).click();
    await expect(page).toHaveURL(/tab=rented.*status=pending.*sort=entity_id_desc/);
    await expect(rent.ordersStatusCombobox).toBeVisible();
  });
  test('[RP-C-08] Rent Orders pagination changes the page in the URL and displays the selected page.', async ({ page }) => {
    const rent = await openRent(page);
    await rent.ordersTab.click();
    const secondPage = page.getByRole('button', { name: rent.copy.goToPage.replace('{page}', '2') });
    await expect(secondPage).toBeVisible();
    await secondPage.click();
    await expect(page).toHaveURL(/tab=rented.*page=2/);
    await expect(page.getByRole('button', { name: rent.copy.currentPage.replace('{page}', '2') })).toBeVisible();
    await expect(rent.orderRows.first()).toBeVisible();
  });
  test('[RP-L-01] The catalogue renders its localized header, filters, product grid, and view-only cards.', async ({ page }) => {
    const rent = await openRent(page);
    await expect(rent.headerTitle).toBeVisible();
    await expect(rent.dateRangeButton).toBeVisible();
    await expect(rent.catalogueTab).toHaveAttribute('aria-selected', 'true');
    await expect(rent.searchInput).toBeVisible();
    await expect(rent.categoryButtons.first()).toBeVisible();
    await expect(rent.firstProductCard).toBeVisible();
    await expect(rent.firstProductCardImage).toBeVisible();
    await expect(rent.firstProductCard).toContainText(/\d+\.\d{2} €/);
    await expect(rent.firstProductCard).toContainText(rent.productAvailabilityText);
    await expect(rent.firstProductCard).toContainText(rent.productQuantityText);
    await expect(rent.productCardActions).toHaveCount(0);
    await expect(rent.unavailableProductCards.first()).toBeVisible();
  });
  test('[RP-S-01] Product search is case-insensitive, returns matching names, and can be cleared.', async ({ page }) => {
    const rent = await openRent(page);
    await expect(rent.firstProductCard).toBeVisible();
    const initialCount = await rent.productCards.count();
    const productName = (await rent.productNames.first().textContent())?.trim();
    expect(productName).toBeTruthy();
    await updateProductList(page, () => rent.searchInput.fill(productName!));
    const exactResults = await rent.productNames.allTextContents();
    expect(exactResults.length).toBeGreaterThan(0);
    expect(exactResults.join(' ')).toContain(productName!);
    await updateProductList(page, () => rent.searchInput.fill(productName!.toUpperCase()));
    expect(await rent.productNames.allTextContents()).toEqual(exactResults);
    await rent.clearSearchButton.click();
    await expect(page).not.toHaveURL(/keyword=/);
    await expect(rent.productCards).toHaveCount(initialCount);
  });
  test('[RP-S-02] A product search with no matches renders the localized empty state without an error.', async ({ page }) => {
    const rent = await openRent(page);
    const searchTerm = `e2e-no-product-${Date.now()}`;
    await updateProductList(page, () => rent.searchInput.fill(searchTerm));
    await expect(rent.noProductsTitle).toBeVisible();
    await expect(rent.productCards).toHaveCount(0);
  });
  test('[RP-S-03] Product search matches a distinct product SKU.', async ({ page }) => {
    const productsResponse = page.waitForResponse((value) => new URL(value.url()).pathname.endsWith('/api/etr/products') && value.request().method() === 'GET');
    const rent = await openRent(page);
    const body = await (await productsResponse).json();
    const product = body?.data?.items?.find((item: { name?: string; sku?: string }) => item.name && item.sku && item.name !== item.sku);
    test.skip(!product, 'The live product response has no distinct SKU fixture.');
    await updateProductList(page, () => rent.searchInput.fill(product.sku));
    await expect(rent.productCards).toHaveCount(1);
    await expect(rent.productNames).toContainText(product.name);
  });
  test('[RP-CAT-01] Selecting and deselecting one category updates the product filter and selected state.', async ({ page }) => {
    const rent = await openRent(page);
    const category = rent.categoryButtons.first();
    await updateProductList(page, () => category.click());
    await expect(page).toHaveURL(/category=[^&]+/);
    await expect(category).toHaveAttribute('data-variant', 'default');
    await updateProductList(page, () => category.click());
    await expect(page).not.toHaveURL(/category=/);
    await expect(category).toHaveAttribute('data-variant', 'outline');
  });
  test('[RP-P-01] Catalogue pagination changes product data and supports first, previous, next, and last page controls.', async ({ page }) => {
    const rent = await openRent(page);
    await expect(rent.cataloguePagination).toBeVisible();
    await expect(rent.catalogueFirstPageButton).toBeDisabled();
    await expect(rent.cataloguePreviousPageButton).toBeDisabled();
    await rent.catalogueGoToPage(2).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(rent.catalogueCurrentPage(2)).toBeVisible();
    await expect(rent.productCards.first()).toBeVisible();
    await rent.cataloguePreviousPageButton.click();
    await expect(page).not.toHaveURL(/page=2/);
    await rent.catalogueNextPageButton.click();
    await expect(page).toHaveURL(/page=2/);
    await rent.catalogueLastPageButton.click();
    await expect(rent.catalogueLastPageButton).toBeDisabled();
    await rent.catalogueFirstPageButton.click();
    await expect(rent.catalogueFirstPageButton).toBeDisabled();
  });
});

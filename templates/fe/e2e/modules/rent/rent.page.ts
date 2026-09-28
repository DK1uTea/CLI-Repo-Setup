import type { Locator, Page } from '@playwright/test';

import { COPY, pageLocale, type RentCopy, type RentLocale } from './rent.data';

export { localizedRentPath, rentSidebarLink } from './rent.data';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class RentPage {
  readonly page: Page;
  readonly locale: RentLocale;
  readonly copy: RentCopy;
  constructor(page: Page) {
    this.page = page;
    this.locale = pageLocale(page);
    this.copy = COPY[this.locale];
  }
  get headerTitle() { return this.page.getByRole('heading', { name: this.copy.headerTitle }); }
  get dateRangeButton() { return this.page.getByRole('button', { name: this.copy.dateRange }); }
  get catalogueTab() { return this.page.getByRole('tab', { name: this.copy.catalogueTab }); }
  get ordersTab() { return this.page.getByRole('tab', { name: this.copy.ordersTab }); }
  get searchInput() { return this.page.getByRole('textbox', { name: this.copy.searchPlaceholder }); }
  get clearSearchButton() { return this.page.getByRole('button', { name: this.copy.clearSearch }); }
  get loadMoreCategoriesButton() { return this.page.getByRole('button', { name: this.copy.loadMore }); }
  get categoryButtons() {
    return this.page.getByRole('tabpanel', { name: this.copy.catalogueTab })
      .getByRole('button').filter({ hasNotText: this.copy.loadMore });
  }
  get productCards() { return this.page.locator(`a[href^="/${this.locale}/rent/"]`); }
  get availableProductCards() {
    return this.productCards.filter({ hasText: new RegExp(`${escapeRegExp(this.copy.productAvailability)}:\\s*[1-9]\\d*`) });
  }
  get productNames() { return this.productCards.locator('p').first(); }
  get productCardActions() { return this.productCards.first().getByRole('button'); }
  get firstProductCard() { return this.productCards.first(); }
  get firstProductCardImage() { return this.firstProductCard.locator('img'); }
  get unavailableProductCards() {
    return this.productCards.filter({ hasText: new RegExp(`${escapeRegExp(this.copy.productAvailability)}:\\s*0`) });
  }
  get productAvailabilityText() { return new RegExp(`${escapeRegExp(this.copy.productAvailability)}:\\s*\\d+`); }
  get productQuantityText() { return new RegExp(`${escapeRegExp(this.copy.quantity)}:\\s*\\d+`); }
  get noProductsTitle() { return this.page.getByText(this.copy.noProducts, { exact: true }); }
  get detailHeading() { return this.page.getByRole('heading', { level: 1 }); }
  get detailBreadcrumb() { return this.page.getByRole('navigation', { name: 'breadcrumb' }); }
  get detailImages() { return this.page.getByRole('img', { name: /(?:image|bild) \d+$/i }); }
  get productImageThumbnails() { return this.page.getByRole('button', { name: new RegExp(escapeRegExp(this.copy.showProductImage)) }); }
  get previousImageButton() { return this.page.getByRole('button', { name: this.copy.previousImage }).first(); }
  get nextImageButton() { return this.page.getByRole('button', { name: this.copy.nextImage }).first(); }
  get detailAvailability() { return this.page.getByText(new RegExp(`${escapeRegExp(this.copy.productAvailability)}:\\s*\\d+`)).first(); }
  get detailQuantity() { return this.page.getByText(new RegExp(`${escapeRegExp(this.copy.quantity)}:\\s*\\d+`)).first(); }
  get detailPrice() { return this.page.getByText(/\d+\.\d{2}\s*€|€\s*\d+\.\d{2}/).first(); }
  get detailProductDetails() { return this.page.getByRole('paragraph').filter({ hasText: this.copy.productDetails }); }
  get bundleSection() { return this.page.getByRole('heading', { name: this.copy.bundleProduct }); }
  get bundleInfoButton() { return this.page.getByRole('button', { name: this.copy.bundleProductInfo }); }
  get bundleItems() { return this.page.getByRole('list', { name: this.copy.bundleProduct }).getByRole('listitem'); }
  get detailShortDescription() { return this.page.getByText(this.copy.shortDescription, { exact: true }); }
  get detailDescriptionDimensions() {
    return this.page.getByText(new RegExp(`^(?:${this.copy.weight}|${this.copy.length}|${this.copy.width}|${this.copy.height})$`));
  }
  get descriptionTab() { return this.page.getByRole('tab', { name: this.copy.descriptionTab }); }
  get availabilityTab() { return this.page.getByRole('tab', { name: this.copy.availabilityTab }); }
  get documentsTab() { return this.page.getByRole('tab', { name: this.copy.documentsTab }); }
  get assemblyInstructionsHeading() { return this.page.getByRole('heading', { name: this.copy.assemblyInstructions }); }
  get manufacturerDataHeading() { return this.page.getByRole('heading', { name: this.copy.manufacturerData }); }
  get noDocumentsAvailable() { return this.page.getByText(this.copy.noDocumentsAvailable, { exact: true }); }
  documentDownloadButton(fileName: string) {
    return this.page.getByRole('button', { name: this.copy.downloadDocument.replace('{name}', fileName) });
  }
  documentFileName(fileName: string) {
    return this.documentDownloadButton(fileName).getByText(fileName, { exact: true });
  }
  get availabilityMonthButton() { return this.page.getByRole('button', { name: this.copy.month }); }
  get downloadPdfButton() { return this.page.getByRole('button', { name: this.copy.downloadPdf }); }
  get rentalDateRangeButton() {
    return this.page.getByRole('button', { name: new RegExp(`${escapeRegExp(this.copy.rentFrom)}.*${escapeRegExp(this.copy.rentTo)}`) });
  }
  get datePickerStartInput() { return this.page.getByRole('textbox', { name: this.copy.startDate }); }
  get datePickerEndInput() { return this.page.getByRole('textbox', { name: this.copy.endDate }); }
  get datePickerResetButton() { return this.page.getByRole('button', { name: this.copy.reset }); }
  get datePickerApplyButton() { return this.page.getByRole('button', { name: this.copy.apply }); }
  get enabledDateCells() { return this.page.locator('button[data-testid="date-day-cell"]:not([disabled])'); }
  get disabledDateCells() { return this.page.locator('button[data-testid="date-day-cell"][disabled]'); }
  get datePickerMonthNavigationButtons() { return this.page.getByTestId('mini-calendar-view-month').locator('..').getByRole('button'); }
  get cataloguePagination() { return this.page.getByRole('navigation', { name: this.copy.pagination }); }
  catalogueGoToPage(page: number) { return this.cataloguePagination.getByRole('button', { name: this.copy.goToPage.replace('{page}', String(page)) }); }
  catalogueCurrentPage(page: number) { return this.cataloguePagination.getByRole('button', { name: this.copy.currentPage.replace('{page}', String(page)) }); }
  get catalogueFirstPageButton() { return this.cataloguePagination.getByRole('button', { name: this.copy.firstPage }); }
  get cataloguePreviousPageButton() { return this.cataloguePagination.getByRole('button', { name: this.copy.previousPage }); }
  get catalogueNextPageButton() { return this.cataloguePagination.getByRole('button', { name: this.copy.nextPage }); }
  get catalogueLastPageButton() { return this.cataloguePagination.getByRole('button', { name: this.copy.lastPage }); }
  get ordersSearchInput() { return this.page.getByRole('textbox', { name: this.copy.searchPlaceholder }); }
  get ordersSortCombobox() { return this.page.getByRole('combobox', { name: this.copy.sort }); }
  get ordersStatusCombobox() { return this.page.getByRole('combobox', { name: this.copy.status }); }
  get orderRows() { return this.page.locator('table tbody tr'); }
  get orderLinks() { return this.page.locator(`table tbody tr a[href*="/${this.locale}/rent/order?order_id="]`); }
  get orderDetailNumber() { return this.page.getByText(new RegExp(`^${escapeRegExp(this.copy.orderNumberPrefix)}\\d+$`)).last(); }
  get customerInformationHeading() { return this.page.getByRole('heading', { name: this.copy.customerInformation }); }
  async firstAvailableProduct(): Promise<Locator> {
    const product = this.availableProductCards.first();
    await product.waitFor({ state: 'visible' });
    return product;
  }
  async firstAvailableProductSlug() {
    const href = await (await this.firstAvailableProduct()).getAttribute('href');
    if (!href) throw new Error('The Rent catalogue returned no available product href.');
    return href.split('/').pop()?.split('?')[0] ?? '';
  }
  async openFirstAvailableProduct() {
    await (await this.firstAvailableProduct()).click();
    await this.detailHeading.waitFor({ state: 'visible' });
  }
}

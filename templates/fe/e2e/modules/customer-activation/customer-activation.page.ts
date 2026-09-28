import { expect, type Locator, type Page, type Response } from '@playwright/test';

import { authHeaders, camCopy, CAM_ROUTES, localizedCamPath, REQUIRED_CHOICES, pageLocale, type CamCopy, type CamStatus } from './customer-activation.data';

type AdminActivation = {
  id: string;
  name: string;
  status: string;
  owner?: string;
  evaluation?: { maxScore: number; score: number } | null;
};

type AdminStore = {
  id: string;
  storeName: string;
  storeAddress?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  status: string;
};

export type ExistingStore = {
  id: string;
  storeName: string;
  storeAddress: string;
};

function envelopeData<T>(body: unknown): T | null {
  if (!body || typeof body !== 'object') return null;
  const record = body as { data?: unknown };
  return (record.data ?? body) as T;
}

export class CustomerActivationPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly newActivation: Locator;
  readonly storeSearch: Locator;
  readonly activationNameInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /My activations|Meine Aktivierungen/ });
    this.newActivation = page.getByRole('link', { name: /New Activation|Neue Aktivierung/ });
    this.storeSearch = page.getByPlaceholder(/Search store or city|Store oder Stadt suchen/);
    this.activationNameInput = page.getByLabel(/Activation name|Aktivierungsname/);
    this.submitButton = page.getByRole('button', { name: /Submit activation|Aktivierung einreichen|Save changes|Änderungen speichern/ });
  }

  get copy(): CamCopy { return camCopy(this.page); }
  get locale() { return pageLocale(this.page); }
  get sidebarLink() {
    return this.page.locator('[data-slot="sidebar-menu-button"][href$="/customer-activation"]').first();
  }
  get chatAttachmentInput() {
    return this.page.getByLabel(camCopy(this.page).chatAttachment).first();
  }
  get chatComposerTrigger() {
    return this.page
      .getByTestId('cam-chat-composer-trigger')
      .or(this.page.getByRole('button', { name: camCopy(this.page).chatComment }))
      .first();
  }

  adminTab(name: string) {
    return this.page.getByRole('tab', { name });
  }

  formTab(name: string) {
    return this.page.getByRole('tab', { name });
  }

  detailTab(name: string) {
    return this.page.getByRole('tab', { name });
  }

  async goto() {
    await this.page.goto(localizedCamPath(this.page, CAM_ROUTES.main));
  }

  async gotoCreate() {
    await this.page.goto(localizedCamPath(this.page, CAM_ROUTES.create));
  }

  async openAdminTab(name: string) {
    await this.adminTab(name).click();
    await expect(this.adminTab(name)).toHaveAttribute('aria-selected', 'true');
  }

  async adminActivations(): Promise<AdminActivation[]> {
    const response = await this.page.request.get('/api/cam/activations-admin', {
      params: { page: 1, limit: 100, sortBy: 'NAME_ASC' },
      headers: await authHeaders(this.page),
    });
    if (!response.ok()) return [];

    const data = envelopeData<{ items?: unknown }>(await response.json());
    return Array.isArray(data?.items) ? (data.items as AdminActivation[]) : [];
  }

  async activationByStatus(status: CamStatus): Promise<AdminActivation | null> {
    return (await this.adminActivations()).find((item) => item.status === status) ?? null;
  }

  async adminStores(): Promise<AdminStore[]> {
    const response = await this.page.request.get('/api/cam/stores-admin', {
      params: { page: 1, limit: 100 },
      headers: await authHeaders(this.page),
    });
    if (!response.ok()) return [];

    const data = envelopeData<{ items?: unknown }>(await response.json());
    return Array.isArray(data?.items) ? (data.items as AdminStore[]) : [];
  }

  async openActivation(id: string) {
    await this.page.goto(localizedCamPath(this.page, CAM_ROUTES.detail(id)));
  }

  async openDrawer(id: string) {
    await this.page.goto(
      `${localizedCamPath(this.page, CAM_ROUTES.main)}?activation_drawer=open&activation_id=${encodeURIComponent(id)}`,
    );
  }

  watchMutations(pattern: RegExp) {
    const calls: string[] = [];
    this.page.on('request', (request) => {
      if (pattern.test(request.url()) && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method())) {
        calls.push(`${request.method()} ${request.url()}`);
      }
    });
    return calls;
  }

  async submitEmptyStore() {
    await this.gotoCreate();
    await this.formTab(this.copy.formTabs[1]).click();
    await this.page.getByRole('button', { name: this.copy.addStore }).click();
  }

  // ---- Create -> update-with-different-store journey (CAM-J-06..12) --------

  private isStoreListResponse(response: Response) {
    const url = new URL(response.url());
    return url.pathname === '/api/cam/stores' && response.request().method() === 'GET';
  }

  /** Opens the create wizard and reads the real store list from the browser's own request. */
  async openCreateAndReadStores(): Promise<ExistingStore[]> {
    const storesLoaded = this.page.waitForResponse((response) => this.isStoreListResponse(response));
    await this.gotoCreate();
    const body = await (await storesLoaded).json();
    const stores = Array.isArray(body?.data?.items) ? body.data.items : [];

    if (stores.length === 0) {
      throw new Error('customer-activation E2E requires at least one existing store.');
    }

    await expect(this.page.getByText(this.copy.storeStep, { exact: true })).toBeVisible();
    return stores;
  }

  async selectStore(store: ExistingStore) {
    await this.page.getByText(store.storeName, { exact: false }).first().click();
    await expect(this.activationNameInput).toBeVisible();
  }

  async openCommunication(id: string) {
    await this.openActivation(id);
    await this.detailTab(this.copy.detailTabs.communication).click();
    await this.chatComposerTrigger.click();
    await expect(this.chatAttachmentInput).toBeAttached();
  }

  async fillRequiredActivation(name: string) {
    await this.activationNameInput.fill(name);

    await this.page.getByRole('radio', { name: REQUIRED_CHOICES.responsible }).click();
    await this.page.getByRole('radio', { name: REQUIRED_CHOICES.outlets }).click();
    await this.page.getByRole('checkbox', { name: REQUIRED_CHOICES.highTrafficZone }).click();
    await this.page.getByRole('checkbox', { name: REQUIRED_CHOICES.targetGroup }).click();
    await this.page.getByRole('checkbox', { name: REQUIRED_CHOICES.salesConcept }).click();
    await this.page.getByRole('checkbox', { name: REQUIRED_CHOICES.contractSituation }).click();
    await this.page.getByRole('checkbox', { name: REQUIRED_CHOICES.revenuePotential }).click();
    await this.page.getByRole('checkbox', { name: REQUIRED_CHOICES.ahMarket }).click();
    await this.page.getByRole('checkbox', { name: REQUIRED_CHOICES.hMarket }).click();
    await this.page.getByRole('radio', { name: REQUIRED_CHOICES.brandFit }).click();
    await this.page.getByRole('radio', { name: REQUIRED_CHOICES.profitability }).click();
  }

  waitForCreateResponse() {
    return this.page.waitForResponse(
      (response) => response.url().includes('/api/cam/activations') && response.request().method() === 'POST',
    );
  }

  waitForUpdateResponse(activationId: string) {
    return this.page.waitForResponse(
      (response) =>
        response.url().includes(`/api/cam/activations/${activationId}`) &&
        response.request().method() === 'PUT',
    );
  }

  async gotoUpdate(activationId: string) {
    await this.page.goto(`${localizedCamPath(this.page, CAM_ROUTES.update)}?activation_id=${activationId}`);
    await expect(this.activationNameInput).toBeVisible();
  }

  async editStore() {
    await this.page.getByRole('button', { name: this.copy.editStore }).click();
    await this.formTab(this.copy.formTabs[0]).click();
  }

  async expectSuccessfulMutation(response: Response) {
    const body = await response.json();
    expect(response.ok()).toBeTruthy();
    expect(body.status).toBeGreaterThanOrEqual(200);
    expect(body.status).toBeLessThan(300);
    return body;
  }
}

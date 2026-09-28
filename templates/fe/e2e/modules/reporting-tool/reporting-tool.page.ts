import { expect, type Page } from '@playwright/test';
import {
  COPY,
  localizedRoute,
  TF_ROUTES,
  type ReportingToolCopy,
  type ReportingToolTab,
  uniqueSurveyFixture,
} from './reporting-tool.data';

/**
 * Page object for the reporting-tool (Trade Fair) workspace. Locators were read off the
 * live accessibility tree (Playwright MCP against a real signed-in session, 2026-07-31),
 * not guessed.
 */
export class ReportingToolPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get copy(): ReportingToolCopy {
    const locale = new URL(this.page.url()).pathname.split('/').filter(Boolean)[0];
    return COPY[locale === 'en' ? 'en' : 'de'];
  }

  get reportingToolSidebarLink() {
    return this.page.locator('[data-slot="sidebar-menu-button"]').filter({ hasText: this.copy.sidebarLabel }).first();
  }

  async openFromSidebar() {
    await this.reportingToolSidebarLink.click();
    await this.page.waitForURL(/\/(?:de|en)\/reporting-tool(?:\/|$)/);
  }

  async gotoRoot() {
    await this.page.goto(localizedRoute(this.page, TF_ROUTES.root));
  }

  async gotoSelectEvent() {
    await this.page.goto(localizedRoute(this.page, TF_ROUTES.selectEvent));
  }

  async firstEventId() {
    const href = await this.eventDetailLinks.first().getAttribute('href');
    return href ? new URL(href, 'http://localhost').searchParams.get('eventId') : null;
  }

  async draftEventId() {
    await this.gotoSelectEvent();
    await expect(this.eventDetailLinks.first()).toBeVisible();
    const drafts = await this.page.locator('[data-slot="card"]').evaluateAll((cards) => cards.map((card) => ({
      href: card.querySelector('a[href*="eventId="]')?.getAttribute('href'),
      text: card.textContent ?? '',
    })).filter((card) => /Entwurf|Draft/i.test(card.text)));

    for (const draft of drafts) {
      if (!draft.href) continue;
      const eventId = new URL(draft.href, 'http://localhost').searchParams.get('eventId');
      if (!eventId) continue;
      const response = await this.page.request.get(`/api/tf/events/${eventId}`);
      if (!response.ok()) continue;
      const body = await response.json();
      const event = body?.data ?? body;
      if (event?.status !== 'DRAFT') continue;
      if (event?.endDate && new Date(event.endDate).getTime() < Date.now()) continue;
      return eventId;
    }
    return null;
  }

  async findEventWithDetail(tab: string, detailPath: string) {
    await this.gotoSelectEvent();
    const hrefs = await this.eventDetailLinks.evaluateAll((links) => (
      links.map((link) => link.getAttribute('href')).filter(Boolean) as string[]
    ));
    for (const href of hrefs.slice(0, 20)) {
      const eventId = new URL(href, 'http://localhost').searchParams.get('eventId');
      if (!eventId) continue;
      await this.gotoWorkspace(eventId, tab);
      if (await this.page.locator(`a[href*="${detailPath}"]`).count()) return eventId;
    }
    return null;
  }

  async gotoWorkspace(eventId: string, tab?: string) {
    await this.page.goto(localizedRoute(this.page, TF_ROUTES.workspace(eventId, tab)));
  }

  async gotoNewEvent() {
    await this.page.goto(localizedRoute(this.page, TF_ROUTES.newEvent));
  }

  async createSurveyFixture(eventId: string) {
    await this.page.goto(localizedRoute(this.page, TF_ROUTES.newSurvey(eventId)));
    await expect(this.surveyWizardHeading).toBeVisible();
    await this.surveyNameInput.fill(uniqueSurveyFixture());
    const assigned = this.page.waitForResponse(
      (response) => response.url().includes(`/api/tf/events/${eventId}/assign-surveys`) && response.request().method() === 'POST',
    );
    const created = this.page.waitForResponse(
      (response) => response.url().includes('/api/tf/surveys') && response.request().method() === 'POST',
    );
    await this.page.getByRole('button', { name: this.copy.survey.saveSurvey }).click();
    const body = await (await created).json();
    expect((await assigned).ok()).toBeTruthy();
    return body?.data?.id as string | undefined;
  }

  async createSurveyTemplate() {
    await this.page.goto(localizedRoute(this.page, TF_ROUTES.newSurveyTemplate));
    await expect(this.surveyWizardHeading).toBeVisible();
    await this.surveyNameInput.fill(uniqueSurveyFixture());
    const created = this.page.waitForResponse(
      (response) => response.url().includes('/api/tf/surveys') && response.request().method() === 'POST',
    );
    await this.page.getByRole('button', { name: this.copy.survey.saveSurvey }).click();
    const body = await (await created).json();
    return body?.data?.id as string | undefined;
  }

  // ---- Select event ------------------------------------------------------

  get selectEventHeading() {
    return this.page.getByRole('heading', { name: this.copy.selectEvent.heading });
  }

  get eventSearchInput() {
    return this.page.getByPlaceholder(this.copy.selectEvent.searchPlaceholder);
  }

  get createEventLink() {
    return this.page.getByRole('link', { name: this.copy.selectEvent.createEvent });
  }

  get eventCards() {
    return this.page.locator('[data-slot="card"]');
  }

  eventCard(name: string) {
    return this.eventCards.filter({ hasText: name }).first();
  }

  /** Event-card links carry the event-scoped workspace id and are more stable than copy. */
  get eventDetailLinks() {
    return this.page.locator('a[href*="eventId="]');
  }

  // ---- Workspace tabs ------------------------------------------------------

  tab(name: ReportingToolTab) {
    return this.page.getByRole('tab', { name: this.copy.workspace.tabs[name] });
  }

  async openTab(name: ReportingToolTab) {
    await this.tab(name).click();
  }

  get reportsSearchInput() {
    return this.page.getByPlaceholder(this.copy.reports.searchPlaceholder);
  }

  get leadsSearchInput() {
    return this.page.getByPlaceholder(this.copy.leads.searchPlaceholder);
  }

  get exportButton() {
    return this.page.getByRole('button', { name: this.copy.reports.export });
  }

  get pagination() {
    return this.page.locator('[data-slot="pagination"]');
  }

  get answerDetailLinks() {
    return this.page.locator('a[href*="/reporting-tool/report?id="]');
  }

  get answerRows() {
    return this.page.locator('tbody [data-slot="table-row"]');
  }

  get answerEditLinks() {
    return this.page.getByRole('link', { name: this.copy.reports.edit });
  }

  get answerDeleteButtons() {
    return this.page.getByRole('button', { name: this.copy.reports.delete });
  }

  get answersEmptyState() { return this.page.getByText(this.copy.reports.emptyState, { exact: true }); }

  get leadDetailLinks() {
    return this.page.locator('a[href*="/reporting-tool/lead?id="]');
  }

  get leadRows() {
    return this.page.locator('tbody [data-slot="table-row"]');
  }

  get leadsEmptyState() { return this.page.getByText(this.copy.leads.emptyState, { exact: true }); }

  get filterComboboxes() {
    return this.page.getByRole('combobox');
  }

  // ---- Survey team assignment --------------------------------------------

  get addUserButton() {
    return this.page.getByRole('button', { name: this.copy.assignTeam.addUser });
  }

  get assignUsersButton() {
    return this.page.getByRole('button', { name: this.copy.assignTeam.assignUsers });
  }

  get addUserFirstName() {
    return this.page.locator('#add-user-first-name');
  }

  get addUserLastName() {
    return this.page.locator('#add-user-last-name');
  }

  get addUserEmail() {
    return this.page.locator('#add-user-email');
  }

  get addUserSubmit() {
    return this.page.getByRole('dialog').getByRole('button', { name: this.copy.assignTeam.submitUser });
  }

  get userRows() {
    return this.page.getByRole('row');
  }

  removeUserButton(firstName: string, lastName: string) {
    return this.page.getByRole('button', {
      name: new RegExp(`${this.copy.assignTeam.remove} ${firstName} ${lastName}|${firstName} ${lastName} ${this.copy.assignTeam.remove}`),
    });
  }

  get forbiddenHeading() {
    return this.page.getByRole('heading', { name: this.copy.forbidden.title });
  }

  // ---- New event wizard, step 1 --------------------------------------------

  get eventTitleInput() { return this.page.getByRole('textbox', { name: this.copy.eventWizard.fields.title }); }

  get eventModeCombobox() { return this.page.locator('[data-field="eventMode"] [role="combobox"]'); }
  get targetAudienceCombobox() { return this.page.locator('[data-field="targetAudience"] [role="combobox"]'); }
  get eventTypeCombobox() { return this.page.locator('[data-field="eventType"] [role="combobox"]'); }
  get participationCombobox() { return this.page.locator('[data-field="participation"] [role="combobox"]'); }
  get venueNameInput() { return this.page.getByRole('textbox', { name: this.copy.eventWizard.fields.venueName }); }
  get streetInput() { return this.page.getByRole('textbox', { name: this.copy.eventWizard.fields.street }); }
  get zipCodeInput() { return this.page.getByRole('textbox', { name: this.copy.eventWizard.fields.zipCode }); }
  get cityInput() { return this.page.getByRole('textbox', { name: this.copy.eventWizard.fields.city }); }
  get imageFileInput() { return this.page.locator('input[type="file"]'); }
  get startDateButton() { return this.page.locator('[data-field="startDate"] button'); }
  get endDateButton() { return this.page.locator('[data-field="endDate"] button'); }

  get eventWizardHeading() {
    return this.page.getByRole('heading', {
      name: new RegExp(`${this.copy.eventWizard.createHeading}|${this.copy.eventWizard.updateHeading}`),
    });
  }

  get previousButton() {
    return this.page.getByRole('button', { name: this.copy.eventWizard.actions.back }).last();
  }

  get surveyWizardHeading() {
    return this.page.getByRole('heading', { name: this.copy.survey.heading });
  }

  get createNewSurveyLink() {
    return this.page.getByRole('link', { name: this.copy.surveyBuilder.createNewSurvey });
  }

  get surveyNameInput() {
    return this.page.getByPlaceholder(this.copy.survey.surveyNamePlaceholder);
  }

  get surveyPreviewButton() {
    return this.page.getByRole('button', { name: this.copy.survey.preview });
  }

  get surveySaveButton() {
    return this.page.getByRole('button', { name: this.copy.survey.saveSurvey });
  }

  get eventIdInput() {
    return this.page.getByRole('textbox', { name: this.copy.eventWizard.fields.eventId });
  }

  get descriptionInput() {
    return this.page.getByRole('textbox', { name: this.copy.eventWizard.fields.descriptionPlaceholder });
  }

  get saveAsDraftButton() {
    return this.page.getByRole('button', { name: this.copy.eventWizard.actions.saveAsDraft });
  }

  get nextStepButton() {
    return this.page.getByRole('button', { name: this.copy.eventWizard.actions.nextStep }).last();
  }

  get saveAndLaunchButton() {
    return this.page.getByRole('button', { name: this.copy.eventWizard.actions.saveAndLaunch }).last();
  }

  get editEventLink() {
    return this.page.getByRole('link', { name: this.copy.workspace.editEvent });
  }

  get workspaceCreateEventLink() {
    return this.page.getByRole('link', { name: this.copy.workspace.createEventLink });
  }

  get eventFormCancelLink() {
    return this.page.locator('aside').filter({ has: this.eventWizardHeading }).locator('a').first();
  }

  get reviewEventTable() { return this.page.getByRole('table').first(); }

  get eventSurveyRadios() {
    return this.page.locator('[data-field="surveys"] [role="radio"]');
  }

  get surveyCards() {
    return this.page.locator('[data-field="surveys"] [data-slot="card"]');
  }

  get unselectedEventSurveyRadio() {
    return this.page.locator('[data-field="surveys"] [role="radio"][aria-checked="false"]').first();
  }

  get unselectedEventSurveyCard() {
    return this.page.locator('[data-field="surveys"] [data-slot="card"]:has([role="radio"][aria-checked="false"])').first();
  }

  wizardStep(name: string) {
    return this.page.getByText(name, { exact: true }).last();
  }
}

import type { Locator, Page } from '@playwright/test';
import { dayjs } from '@/lib/date-utils';

dayjs.locale('de');

/**
 * Page object for the Event wizard (`/events/new-event`, `/events/update-event`).
 *
 * Locators use `data-testid` (see `.claude/skills/e2e-module-testing/SKILL.md`) rather than
 * role/text — a role/text version of this page object broke in practice when the rendered
 * copy for one field (Veranstaltungsmodus) turned out to be English inside an iframe-wrapped
 * dropdown while the rest of the page was German, with no change to the underlying feature.
 * `data-testid` survives that class of drift.
 */

export const DE = {
  sidebarLabel: 'Event-Navigator',
} as const;

export class EventFormPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async gotoNew() {
    // No locale prefix — `src/proxy.ts` rewrites to whichever locale the signed-in
    // account's own preferredLanguage resolves to, and this suite must not assume `de`.
    await this.page.goto('/events/new-event');
  }

  async gotoUpdate(eventId: string, step?: string) {
    const search = step ? `?eventId=${eventId}&step=${step}` : `?eventId=${eventId}`;
    await this.page.goto(`/events/update-event${search}`);
  }

  // ---- Footer --------------------------------------------------------------

  // The footer renders both a mobile (`sm:hidden`) and a desktop (`hidden sm:flex`) block
  // with the same data-testid — .last() is the desktop one, which is visible at the
  // Playwright default viewport.
  get nextButton() {
    return this.page.getByTestId('event-form-next-button').last();
  }

  get deleteButton() {
    return this.page.getByTestId('event-form-delete-button').last();
  }

  async confirmDelete() {
    await this.deleteButton.click();
    await this.page.getByTestId('event-form-confirm-delete-button').click();
  }

  stepCard(step: 'overview' | 'logistics' | 'product_catalog' | 'helping_hand' | 'summary') {
    return this.page.getByTestId(`event-form-step-${step}`);
  }

  // ---- Overview step ---------------------------------------------------

  get eventTitleInput() {
    return this.page.getByTestId('event-title-input');
  }

  get eventModeSelect() {
    return this.page.getByTestId('event-mode-select');
  }

  get eventModeFaceToFaceOption() {
    return this.page.getByTestId('event-mode-option-FACE_TO_FACE');
  }

  get targetAudienceSelect() {
    return this.page.getByTestId('event-target-audience-select');
  }

  get eventTypeSelect() {
    return this.page.getByTestId('event-type-select');
  }

  get descriptionTextarea() {
    return this.page.getByTestId('event-description-textarea');
  }

  get participationSelect() {
    return this.page.getByTestId('event-participation-select');
  }

  get participationPersonalInvitationOption() {
    return this.page.getByTestId('event-participation-option-PERSONAL_INVITATION');
  }

  get venueNameInput() {
    return this.page.getByTestId('event-venue-name-input');
  }

  get streetInput() {
    return this.page.getByTestId('event-street-input');
  }

  get postalCodeInput() {
    return this.page.getByTestId('event-postal-code-input');
  }

  get cityInput() {
    return this.page.getByTestId('event-city-input');
  }

  get adminFirstNameInput() {
    return this.page.getByTestId('event-admin-first-name-input');
  }

  get adminLastNameInput() {
    return this.page.getByTestId('event-admin-last-name-input');
  }

  get adminEmailInput() {
    return this.page.getByTestId('event-admin-email-input');
  }

  get adminPhoneInput() {
    return this.page.getByTestId('event-admin-phone-input');
  }

  partnershipCheckbox(key: 'EXHIBITION' | 'PRODUCT_PARTNER' | 'KEYNOTE_SPEAKER' | 'JURY_MEMBER' | 'MEDIA_PARTNER') {
    return this.page.getByTestId(`event-partnership-checkbox-${key}`);
  }

  get eventStartDateButton() {
    return this.page.getByTestId('event-start-date-button');
  }

  get eventEndDateButton() {
    return this.page.getByTestId('event-end-date-button');
  }

  get overviewImageInput() {
    return this.page.locator('[data-field="images"] input[type="file"]');
  }

  get cropSaveButton() {
    return this.page.getByTestId('crop-save-button');
  }

  /** Fills the required Overview fields with valid data. Leaves dates untouched. */
  async fillRequiredOverview(opts: { title: string; description: string }) {
    await this.eventTitleInput.fill(opts.title);

    await this.eventModeSelect.click();
    await this.eventModeFaceToFaceOption.click();

    // Zielgruppe is a multi-select menu — selecting one item does not close the dropdown by
    // itself, and it stays open through its own exit animation. Only one target-audience
    // option is wired with a data-testid-free label lookup avoided entirely here: the first
    // menuitemcheckbox in the now-open menu is used positionally instead of by translated
    // name, since this suite no longer locates elements by copy.
    await this.targetAudienceSelect.click();
    await this.page.getByRole('menuitemcheckbox').first().click();
    await this.page.keyboard.press('Escape');
    await this.page.getByRole('menu').waitFor({ state: 'hidden' });

    await this.eventTypeSelect.click();
    await this.page.getByRole('option').first().click();

    await this.descriptionTextarea.fill(opts.description);

    await this.participationSelect.click();
    await this.participationPersonalInvitationOption.click();

    await this.venueNameInput.fill('Test Arena');
    await this.streetInput.fill('Teststraße 1');
    await this.postalCodeInput.fill('80331');
    await this.cityInput.fill('München');

    await this.adminFirstNameInput.fill('Max');
    await this.adminLastNameInput.fill('Mustermann');
    await this.adminEmailInput.fill('max.mustermann@example.com');
    await this.adminPhoneInput.fill('+491701234567');

    await this.partnershipCheckbox('EXHIBITION').click();

    await this.overviewImageInput.setInputFiles('public/images/logo.png');
    await this.cropSaveButton.click();
    await this.cropSaveButton.waitFor({ state: 'hidden' });
  }

  /**
   * Navigates to Create Event, reads the real live deadline, fills required Overview
   * fields, and moves the Event start date `daysFromDeadline` days past that deadline —
   * confirmed live: a freshly created DRAFT Event comes back `canEdit:false` for its own
   * creator when scheduled within the near-term deadline window, and `canEdit:true` once
   * scheduled far enough out. See `FAR_FUTURE_DAYS_FROM_TODAY` in events.data.ts.
   *
   * Returns the real deadline string so callers can build further date assertions from it.
   */
  async gotoNewAndScheduleFarFuture(
    fixture: { title: string; description: string },
    daysFromDeadline: number,
  ) {
    const deadlineResponse = this.page.waitForResponse((r) =>
      r.url().includes('/api/etr/holidays/deadline'),
    );
    await this.gotoNew();
    const deadlineBody = await (await deadlineResponse).json();
    await this.fillRequiredOverview(fixture);

    const deadline = deadlineBody.data.deadline as string;
    const deadlineDate = new Date(`${deadline}T00:00:00.000Z`);
    const eventStart = new Date(deadlineDate);
    eventStart.setUTCDate(eventStart.getUTCDate() + daysFromDeadline);
    await this.pickDate(this.eventStartDateButton, eventStart);

    // Event end defaults to start + 1 day (unaffected by moving start via the picker).
    const eventEnd = new Date(eventStart);
    eventEnd.setUTCDate(eventEnd.getUTCDate() + 1);

    return {
      deadline,
      eventStart,
      eventEnd,
    };
  }

  /**
   * Opens the shared `DateTimePicker` dialog for a given trigger button, navigates
   * forward/back until the header's `data-view-month` (`YYYY-MM`, locale-independent) matches
   * `target`'s month, clicks the day cell whose `data-date` matches `target` (an exact date
   * match — no index arithmetic needed now that `MiniCalendar` carries `data-date` on every
   * cell), then clicks Apply.
   *
   * The header's visible text (`MiniCalendar`'s
   * `dayjs.utc(viewDate).locale(locale).format('MMM YYYY')`) renders in whichever locale the
   * app session is actually in (`de` or `en`), which this page object cannot assume —
   * comparing against a hardcoded locale's month name silently never matches and spins
   * through all 60 "next month" clicks. `data-view-month` sidesteps that entirely.
   */
  async pickDate(trigger: Locator, target: Date) {
    const targetDate = dayjs.utc(target).format('YYYY-MM-DD');
    const targetMonth = dayjs.utc(target).format('YYYY-MM');

    await trigger.click();
    const dialog = this.page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible' });
    const nextMonthButton = dialog.getByRole('button').nth(1);
    const viewMonthLabel = dialog.getByTestId('mini-calendar-view-month');

    for (let guard = 0; guard < 60; guard++) {
      const currentMonth = await viewMonthLabel.getAttribute('data-view-month');
      if (currentMonth === targetMonth) break;
      await nextMonthButton.click();
    }

    await dialog.locator(`[data-testid="date-day-cell"][data-date="${targetDate}"]`).click();

    const applyButton = this.page.getByTestId('date-picker-apply-button');
    if (await applyButton.isEnabled()) {
      await applyButton.click();
    } else {
      // Already the field's current value (e.g. auto-bumped there already) — nothing to
      // apply; close without changing anything.
      await this.page.keyboard.press('Escape');
    }

    // Radix Dialog animates out (data-closed:animate-out duration-100) rather than
    // unmounting instantly — without waiting for it to fully close, the next pickDate() call
    // (this method is called back-to-back up to 4 times, e.g. from
    // fixLogisticsDatesPastEventEnd) can click its trigger while this dialog is still
    // present, leaving two [role="dialog"] elements in the DOM at once. Every subsequent
    // dialog.getByTestId(...)/dialog.locator(...) call then matches two elements, and
    // Playwright's actionability retry silently spins until the action's timeout instead of
    // failing fast with a clear strict-mode error.
    await dialog.waitFor({ state: 'hidden' });
  }

  // ---- Logistics step ----------------------------------------------------

  get warehouseSelect() {
    return this.page.getByTestId('logistics-warehouse-select');
  }

  get logisticsContactNameInput() {
    return this.page.getByTestId('logistics-contact-name-input');
  }

  get logisticsContactEmailInput() {
    return this.page.getByTestId('logistics-contact-email-input');
  }

  get logisticsContactPhoneInput() {
    return this.page.getByTestId('logistics-contact-phone-input');
  }

  async fillRequiredLogisticsContact() {
    await this.logisticsContactNameInput.fill('Logistik Kontakt');
    await this.logisticsContactEmailInput.fill('logistik@example.com');
    await this.logisticsContactPhoneInput.fill('+491701234599');
  }

  /**
   * Moves Setup start/end to two consecutive days *before* `eventStartDate`, and Teardown
   * start/end to two consecutive days *after* `eventEndDate`. Confirmed live against the
   * real backend: two rules undocumented in the frontend zod schema —
   * `EVENTS.TEARDOWN_BEFORE_EVENT_END` (Teardown must not end at/before the Event ends) and
   * `EVENTS.SETUP_AFTER_EVENT_START` (Setup must not start after the Event starts). Setup/
   * Teardown default to the deadline, not the Event's own start date, and that default is
   * never re-derived when the Event date moves later in the same create session — so any
   * journey rescheduling the Event away from the deadline needs this before a successful
   * Logistics submission.
   */
  async fixLogisticsDatesPastEventEnd(eventStartDate: Date, eventEndDate: Date) {
    const setupEnd = new Date(eventStartDate);
    setupEnd.setUTCDate(setupEnd.getUTCDate() - 1);
    const setupStart = new Date(setupEnd);
    setupStart.setUTCDate(setupStart.getUTCDate() - 1);
    await this.pickDate(this.page.getByTestId('logistics-setup-start-date-button'), setupStart);
    await this.pickDate(this.page.getByTestId('logistics-setup-end-date-button'), setupEnd);

    const teardownStart = new Date(eventEndDate);
    teardownStart.setUTCDate(teardownStart.getUTCDate() + 1);
    const teardownEnd = new Date(teardownStart);
    teardownEnd.setUTCDate(teardownEnd.getUTCDate() + 1);
    await this.pickDate(this.page.getByTestId('logistics-teardown-start-date-button'), teardownStart);
    await this.pickDate(this.page.getByTestId('logistics-teardown-end-date-button'), teardownEnd);
  }

  // ---- Product Catalog / Helping Hands ----------------------------------

  get productDetailLinks() {
    // Structural href-substring selector, not translated copy — stable across locale.
    return this.page.locator('a[href*="/events/product-detail"]');
  }

  get catalogSearchInput() {
    return this.page.getByTestId('product-catalog-search-input');
  }

  get productDetailAddButton() {
    return this.page.getByTestId('product-detail-add-to-event-button');
  }

  get productDetailCancelButton() {
    return this.page.getByTestId('product-detail-cancel-button');
  }

  get productDetailContinueButton() {
    return this.page.getByTestId('product-detail-continue-button');
  }

  async addFirstPersistableCatalogProduct() {
    const productCount = await this.productDetailLinks.count();

    for (let index = 0; index < productCount; index += 1) {
      const productDetailLoaded = this.page.waitForResponse((response) => {
        const path = new URL(response.url()).pathname;
        return (
          path.startsWith('/api/etr/event-products/') &&
          path !== '/api/etr/event-products/filter-config' &&
          response.request().method() === 'GET'
        );
      });
      const productDetailOpened = this.page.waitForURL(/\/(de|en)\/events\/product-detail/);
      await this.productDetailLinks.nth(index).click();
      await productDetailOpened;

      const productDetailBody = await (await productDetailLoaded).json();
      if (!productDetailBody?.data?.product) {
        await this.productDetailCancelButton.click();
        await this.catalogSearchInput.waitFor({ state: 'visible' });
        continue;
      }

      await this.productDetailAddButton.waitFor({ state: 'visible' });
      const isBundle = productDetailBody?.data?.product?.productType === 'bundle';
      if (isBundle || !(await this.productDetailAddButton.isEnabled())) {
        await this.productDetailCancelButton.click();
        await this.catalogSearchInput.waitFor({ state: 'visible' });
        continue;
      }

      const productAdded = this.page.waitForResponse(
        (response) =>
          response.url().includes('/api/etr/event-products/add-to-event') &&
          response.request().method() === 'POST',
      );
      await this.productDetailAddButton.click();

      const response = await productAdded;
      const body = await response.json();
      if (response.ok() && body?.status >= 200 && body.status < 300 && body.data !== undefined) {
        await this.cartDrawer.waitFor({ state: 'visible' });
        await this.page.keyboard.press('Escape');
        await this.cartDrawer.waitFor({ state: 'hidden' });
        await this.productDetailContinueButton.click();
        return;
      }

      await this.productDetailCancelButton.click();
      await this.catalogSearchInput.waitFor({ state: 'visible' });
    }

    throw new Error('The live product catalog returned no product that could be added to this Event.');
  }

  get cartDrawer() {
    return this.page.getByTestId('event-cart-drawer');
  }

  get cartNextButton() {
    return this.page.getByTestId('event-cart-next-button');
  }

  // ---- Summary step ----------------------------------------------------

  get summaryStep() {
    return this.page.getByTestId('event-form-summary-step');
  }

  get submitButton() {
    // Same physical element as nextButton — the footer relabels it on the last step — but
    // kept as a separate getter so a flow reads "submit" at the point that matters.
    return this.page.getByTestId('event-form-next-button').last();
  }

  // Regression sentinel: correct Active-event editing renders no cancel-order action.
  // Keeping this locator in the page object makes an accidental dialog reintroduction
  // observable without coupling the spec to translated copy or dialog structure.
  get cancelOrderConfirmButton() {
    return this.page.getByTestId('event-form-cancel-order-yes-button');
  }

  // ---- Missing-order choice dialog --------------------------------------

  /**
   * Shown when leaving an ACTIVE event that currently has no order, for example when an
   * order was cancelled outside this UI. "Create new order" pushes the current cart into
   * a brand-new order and lets the pending navigation through.
   */
  get createNewOrderButton() {
    return this.page.getByTestId('event-form-order-choice-create-button');
  }
}

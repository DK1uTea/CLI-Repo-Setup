import { expect, test } from '@playwright/test';

import { dayjs } from '@/lib/date-utils';
import { authenticateViaApi } from '../../shared/session';
import { EventFormPage } from '../events/events.page';
import { localizedRoute, permittedCredentials, TF_ROUTES, uniqueEventFixture } from './reporting-tool.data';
import { ReportingToolPage } from './reporting-tool.page';

test.describe('reporting-tool create event', () => {
  test('[TF-C-20] Renders the General Info step, generated Event ID, steps, and footer actions.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    await tf.gotoNewEvent();

    await expect(tf.eventWizardHeading).toBeVisible();
    for (const step of [/General Info|Allgemeine Informationen/i, /^Survey$|^Umfrage$/i, /Assign Team|Team zuweisen/i, /Review & Launch|Starten/i]) {
      await expect(page.getByText(step).first()).toBeVisible();
    }
    await expect(tf.eventIdInput).toHaveValue(/EVENT-\d{7}/);
    await expect(tf.previousButton).toBeDisabled();
    await expect(tf.saveAsDraftButton).toBeVisible();
    await expect(tf.nextStepButton).toBeVisible();
  });

  test('[TF-V-02] Blocks Step 1 when required event fields are empty.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    await tf.gotoNewEvent();
    await tf.nextStepButton.click();

    await expect(page).not.toHaveURL(/step=survey/);
    await expect(tf.eventTitleInput).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText(/required|erforderlich/i).first()).toBeVisible();
  });

  test('[TF-C-21] Allows optional General Info fields to remain empty when advancing.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    const form = new EventFormPage(page);
    const fixture = uniqueEventFixture();
    await tf.gotoNewEvent();
    await tf.eventTitleInput.fill(fixture.title);
    await tf.eventTypeCombobox.click();
    await page.getByRole('option').first().click();
    await tf.imageFileInput.setInputFiles('public/images/logo.png');
    await tf.venueNameInput.fill('QA Test Arena');
    await tf.streetInput.fill('TeststraÃŸe 1');
    await tf.zipCodeInput.fill('80331');
    await tf.cityInput.fill('MÃ¼nchen');
    const start = dayjs.utc().add(30, 'day').startOf('day').add(10, 'hour').toDate();
    await form.pickDate(tf.startDateButton, start);
    await form.pickDate(tf.endDateButton, dayjs.utc(start).add(1, 'day').toDate());

    const create = page.waitForResponse((response) => response.url().endsWith('/api/tf/events') && response.request().method() === 'POST');
    await tf.nextStepButton.click();
    await expect(page).toHaveURL(/step=survey/);
    const body = await (await create).json();
    const eventId = body?.data?.id ?? body?.data?.event?.id ?? body?.data?.eventId ?? body?.id;
    expect(eventId).toBeTruthy();
    await page.request.delete(`/api/tf/events/${eventId}`);
  });

  test('[TF-C-22] Returns to event selection from Step 1 without creating an event.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    await tf.gotoNewEvent();
    await tf.eventTitleInput.fill('This event must not be created');
    await page.locator('a[href$="/reporting-tool"]').first().click();
    await page.getByRole('button', { name: /Leave without saving|Ohne Speichern verlassen/i }).click();

    await expect(page).toHaveURL(new RegExp(`${localizedRoute(page, TF_ROUTES.selectEvent).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\?|$)`));
    await expect(tf.selectEventHeading).toBeVisible();
  });
});

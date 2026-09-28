import { expect, type Page } from '@playwright/test';
import { dayjs } from '@/lib/date-utils';
import { EventFormPage } from '../events/events.page';
import { uniqueEventFixture } from './reporting-tool.data';
import { ReportingToolPage } from './reporting-tool.page';

/** Creates a real future draft so launch coverage never depends on shared QA data. */
export async function createDraftEventFixture(page: Page, tf: ReportingToolPage) {
  await tf.gotoNewEvent();
  await expect(tf.eventWizardHeading).toBeVisible();
  const fixture = uniqueEventFixture();
  await tf.eventTitleInput.fill(fixture.title);
  for (const combobox of [tf.eventModeCombobox, tf.targetAudienceCombobox, tf.eventTypeCombobox, tf.participationCombobox]) {
    await combobox.click();
    await page.getByRole('option').first().click();
  }
  await page.locator('textarea[name="description"]').fill(fixture.description);
  await tf.venueNameInput.fill('QA Test Arena');
  await tf.streetInput.fill('Teststraße 1');
  await tf.zipCodeInput.fill('80331');
  await tf.cityInput.fill('München');
  await tf.imageFileInput.setInputFiles('public/images/logo.png');
  const form = new EventFormPage(page);
  const start = dayjs.utc().add(30, 'day').startOf('day').add(10, 'hour').toDate();
  await form.pickDate(tf.startDateButton, start);
  await form.pickDate(tf.endDateButton, dayjs.utc(start).add(1, 'day').toDate());
  const create = page.waitForResponse((response) => response.url().endsWith('/api/tf/events') && response.request().method() === 'POST');
  await tf.nextStepButton.click();
  const body = await (await create).json();
  const eventId = body?.data?.id ?? body?.data?.event?.id ?? body?.data?.eventId ?? body?.id;
  expect(eventId, `Unexpected create-event response: ${JSON.stringify(body)}`).toBeTruthy();
  return eventId as string;
}

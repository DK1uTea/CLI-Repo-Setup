import { expect, test, type Page } from '@playwright/test';

import { authenticateViaApi } from '../../shared/session';
import { createDraftEventFixture } from './reporting-tool.fixtures';
import { localizedRoute, permittedCredentials, TF_ROUTES } from './reporting-tool.data';
import { ReportingToolPage } from './reporting-tool.page';

async function openSurveyStep(tf: ReportingToolPage, eventId: string) {
  await tf.page.goto(`${localizedRoute(tf.page, TF_ROUTES.updateEvent(eventId))}&step=survey`);
  await expect(tf.eventWizardHeading).toBeVisible();
  await expect(tf.eventSurveyRadios.first()).toBeVisible();
}

async function cleanup(page: Page, urls: string[]) {
  for (const url of urls) {
    try {
      await page.request.delete(url, { timeout: 5_000 });
    } catch (error) {
      console.warn(`Fixture cleanup failed for ${url}:`, error);
    }
  }
}

test.describe('reporting-tool survey step', () => {
  test('[TF-V-04] Blocks the next step when no survey is selected.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    const eventId = await createDraftEventFixture(page, tf);
    const surveyId = await tf.createSurveyTemplate();
    expect(surveyId).toBeTruthy();

    try {
      await openSurveyStep(tf, eventId);
      await tf.nextStepButton.click();
      await expect(page).toHaveURL(/step=survey/);
      await expect(tf.page.locator('[data-field="surveys"]')).toContainText(/required|erforderlich/i);
    } finally {
      await cleanup(page, [`/api/tf/surveys/${surveyId}`, `/api/tf/events/${eventId}`]);
    }
  });

  test('[TF-C-23] Allows multiple surveys and preserves them when returning from Assign Team.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    const eventId = await createDraftEventFixture(page, tf);
    const surveyIds = [await tf.createSurveyTemplate(), await tf.createSurveyTemplate()];
    expect(surveyIds.every(Boolean)).toBeTruthy();

    try {
      await openSurveyStep(tf, eventId);
      await expect.poll(() => tf.eventSurveyRadios.count(), {
        timeout: 15_000,
        message: 'The survey library did not load two selectable survey fixtures.',
      }).toBeGreaterThanOrEqual(2);
      const first = tf.eventSurveyRadios.nth(0);
      const second = tf.eventSurveyRadios.nth(1);
      const assignRequest = page.waitForResponse(
        (response) => response.url().includes(`/api/tf/events/${eventId}/assign-surveys`) && response.request().method() === 'POST',
      );
      await first.click({ force: true });
      await expect(first).toHaveAttribute('aria-checked', 'true');
      await second.click({ force: true });
      await expect(second).toHaveAttribute('aria-checked', 'true');
      await tf.nextStepButton.click();
      const response = await assignRequest;
      expect(response.ok()).toBeTruthy();
      await expect(page).toHaveURL(/step=assign-team/);

      await tf.previousButton.click();
      await expect(page).toHaveURL(/step=survey/);
      await expect(tf.eventSurveyRadios.nth(0)).toHaveAttribute('aria-checked', 'true');
      await expect(tf.eventSurveyRadios.nth(1)).toHaveAttribute('aria-checked', 'true');
    } finally {
      await cleanup(page, [
        ...surveyIds.filter((surveyId): surveyId is string => Boolean(surveyId)).map((surveyId) => `/api/tf/surveys/${surveyId}`),
        `/api/tf/events/${eventId}`,
      ]);
    }
  });

  test('[TF-C-24] Shows the survey action menu and closes it without changing selection.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    const eventId = await createDraftEventFixture(page, tf);
    const surveyId = await tf.createSurveyTemplate();
    expect(surveyId).toBeTruthy();

    await openSurveyStep(tf, eventId);
    const firstCard = tf.surveyCards.first();
    const actionMenu = firstCard.getByRole('button', { name: /Open survey actions|Umfrageaktionen/i });
    await actionMenu.click();
    for (const action of [/Preview|Vorschau/i, /Edit|Bearbeiten/i, /Duplicate|Duplizieren/i, /Delete|LÃ¶schen/i]) {
      await expect(page.getByRole('menuitem', { name: action })).toBeVisible();
    }
    await tf.eventWizardHeading.click();
    await expect(page.getByRole('menuitem', { name: /Preview|Vorschau/i })).not.toBeVisible();

    await page.request.delete(`/api/tf/surveys/${surveyId}`);
    await page.request.delete(`/api/tf/events/${eventId}`);
  });
});

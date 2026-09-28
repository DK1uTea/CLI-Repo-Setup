import { expect, test } from '@playwright/test';

import { authenticateViaApi } from '../../shared/session';
import { createDraftEventFixture } from './reporting-tool.fixtures';
import { permittedCredentials, TAB_PARAMS } from './reporting-tool.data';
import { ReportingToolPage } from './reporting-tool.page';

test.describe('reporting-tool survey builder mutations', () => {
  test('[TF-C-37] Adds a library survey to the event and can unassign it again.', async ({ page }) => {
    test.setTimeout(60_000);
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    const eventId = await createDraftEventFixture(page, tf);
    const surveyId = await tf.createSurveyTemplate();
    expect(surveyId).toBeTruthy();

    try {
      await tf.gotoWorkspace(eventId, TAB_PARAMS.surveyBuilder);
      const libraryCard = page.getByRole('button', { name: tf.copy.surveyBuilder.addToEvent })
        .first()
        .locator('xpath=ancestor::*[@data-slot="card"][1]');
      await expect(libraryCard).toBeVisible();

      await libraryCard.getByRole('button', { name: tf.copy.surveyBuilder.addToEvent }).first().click();
      const assignDialog = page.getByRole('alertdialog');
      await expect(assignDialog).toContainText(/Add survey to event|Umfrage zum Event hinzufügen/i);
      await assignDialog.getByRole('button', { name: tf.copy.surveyBuilder.addToEvent }).click();
      await expect(page.getByRole('button', { name: tf.copy.surveyBuilder.unassignSurvey }).first()).toBeVisible();

      const unassignButton = page.getByRole('button', { name: tf.copy.surveyBuilder.unassignSurvey }).first();
      await unassignButton.click();
      const unassignDialog = page.getByRole('alertdialog');
      await expect(unassignDialog).toContainText(/Unassign survey|Umfrage entfernen/i);
      await unassignDialog.getByRole('button', { name: /Cancel|Abbrechen/i }).click();
      await expect(unassignButton).toBeVisible();

      await unassignButton.click();
      const confirmedUnassignDialog = page.getByRole('alertdialog');
      const unassignRequest = page.waitForResponse(
        (response) => response.url().includes('/api/tf/event-surveys/') && response.request().method() === 'DELETE',
      );
      await confirmedUnassignDialog.getByRole('button', { name: /Unassign|Entfernen/i }).click();
      expect((await unassignRequest).ok()).toBeTruthy();
      await expect(unassignButton).toHaveCount(0);
      await expect(page.getByRole('button', { name: tf.copy.surveyBuilder.addToEvent }).first()).toBeVisible();
    } finally {
      for (const url of [`/api/tf/surveys/${surveyId}`, `/api/tf/events/${eventId}`]) {
        try {
          await page.request.delete(url, { timeout: 5_000 });
        } catch (error) {
          console.warn(`Fixture cleanup failed for ${url}:`, error);
        }
      }
    }
  });
});

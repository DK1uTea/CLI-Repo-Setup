import { expect, test } from '@playwright/test';

import { authenticateViaApi } from '../../shared/session';
import { createDraftEventFixture } from './reporting-tool.fixtures';
import { permittedCredentials, TAB_PARAMS } from './reporting-tool.data';
import { ReportingToolPage } from './reporting-tool.page';

test.describe('reporting-tool survey builder library mutations', () => {
  test('[TF-C-39] Duplicates a library survey and deletes the duplicate successfully.', async ({ page }) => {
    test.setTimeout(60_000);
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    const eventId = await createDraftEventFixture(page, tf);
    const surveyId = await tf.createSurveyTemplate();
    expect(surveyId).toBeTruthy();
    let duplicateId: string | undefined;

    try {
      await tf.gotoWorkspace(eventId, TAB_PARAMS.surveyBuilder);
      const libraryCard = page.getByRole('button', { name: tf.copy.surveyBuilder.addToEvent })
        .first()
        .locator('xpath=ancestor::*[@data-slot="card"][1]');
      const originalName = (await libraryCard.locator('p').first().textContent())?.trim();
      expect(originalName).toBeTruthy();

      await libraryCard.getByRole('button', { name: /Open survey actions|Umfrageaktionen/i }).click();
      await page.getByRole('menuitem', { name: /Duplicate|Duplizieren/i }).click();
      const duplicateDialog = page.getByRole('alertdialog');
      const duplicateRequest = page.waitForResponse(
        (response) => response.url().includes('/api/tf/surveys/') && response.url().includes('/duplicate') && response.request().method() === 'POST',
      );
      await duplicateDialog.getByRole('button', { name: /Duplicate|Duplizieren/i }).click();
      const duplicateResponse = await duplicateRequest;
      expect(duplicateResponse.ok()).toBeTruthy();
      const duplicateBody = await duplicateResponse.json();
      duplicateId = duplicateBody?.data?.id;
      expect(duplicateId).toBeTruthy();
      const copiedCard = page.getByText(`${originalName} (Copy)`, { exact: true })
        .last()
        .locator('xpath=ancestor::*[@data-slot="card"][1]');
      await expect(copiedCard).toBeVisible();

      await copiedCard.getByRole('button', { name: /Open survey actions|Umfrageaktionen/i }).click();
      await page.getByRole('menuitem', { name: /Delete|Löschen/i }).click();
      const deleteDialog = page.getByRole('alertdialog');
      const deleteRequest = page.waitForResponse(
        (response) => response.url().includes(`/api/tf/surveys/${duplicateId}`) && response.request().method() === 'DELETE',
      );
      await deleteDialog.getByRole('button', { name: /Delete|Löschen/i }).click();
      expect((await deleteRequest).ok()).toBeTruthy();
      await expect(copiedCard).toHaveCount(0);
    } finally {
      for (const id of [duplicateId, surveyId]) {
        if (!id || id === duplicateId && id === surveyId) continue;
        try {
          await page.request.delete(`/api/tf/surveys/${id}`, { timeout: 5_000 });
        } catch (error) {
          console.warn(`Fixture cleanup failed for survey ${id}:`, error);
        }
      }
      try {
        await page.request.delete(`/api/tf/events/${eventId}`, { timeout: 5_000 });
      } catch (error) {
        console.warn(`Fixture cleanup failed for event ${eventId}:`, error);
      }
    }
  });
});

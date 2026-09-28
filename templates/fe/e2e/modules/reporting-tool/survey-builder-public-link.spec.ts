import { expect, test } from '@playwright/test';

import { authenticateViaApi } from '../../shared/session';
import { createDraftEventFixture } from './reporting-tool.fixtures';
import { permittedCredentials, TAB_PARAMS } from './reporting-tool.data';
import { ReportingToolPage } from './reporting-tool.page';

test.describe('reporting-tool survey builder public link', () => {
  test('[TF-C-38] Opens and copies the public link for a public event survey.', async ({ page }) => {
    test.setTimeout(60_000);
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    const eventId = await createDraftEventFixture(page, tf);
    const surveyId = await tf.createSurveyFixture(eventId);
    expect(surveyId).toBeTruthy();

    try {
      await tf.gotoWorkspace(eventId, TAB_PARAMS.surveyBuilder);
      const publicToggle = page.getByRole('button', { name: /Allow access without login|Zugriff ohne Anmeldung erlauben/i }).first();
      await publicToggle.click();
      const enableDialog = page.getByRole('alertdialog');
      const enableRequest = page.waitForResponse(
        (response) => response.url().includes('/api/tf/event-surveys/') && response.url().includes('/required-login') && response.request().method() === 'PATCH',
      );
      await enableDialog.getByRole('button', { name: /Confirm|Bestätigen/i }).click();
      expect((await enableRequest).ok()).toBeTruthy();

      const publicLinkButton = page.getByRole('button', { name: /Public Link|Öffentlicher Link/i }).first();
      await expect(publicLinkButton).toBeVisible();
      await publicLinkButton.click();
      const publicLinkDialog = page.getByRole('dialog').last();
      await expect(publicLinkDialog.getByRole('heading', { name: /Share public link|Öffentlichen Link teilen/i })).toBeVisible();
      const publicLinkInput = publicLinkDialog.locator('#share-invite-link');
      await expect(publicLinkInput).toHaveValue(/signup\?token=/, { timeout: 15_000 });
      await expect(publicLinkDialog.getByRole('button', { name: /Copy link|Link kopieren/i })).toBeEnabled();

      await page.context().grantPermissions(['clipboard-read', 'clipboard-write'], {
        origin: new URL(page.url()).origin,
      });
      await publicLinkDialog.getByRole('button', { name: /Copy link|Link kopieren/i }).click();
      await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(await publicLinkInput.inputValue());
      await publicLinkDialog.getByRole('button', { name: /Cancel|Abbrechen/i }).click();
      await expect(page.getByRole('heading', { name: /Share public link|Öffentlichen Link teilen/i })).not.toBeVisible();
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

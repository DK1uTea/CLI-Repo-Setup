import { expect, test } from '@playwright/test';

import { authenticateViaApi } from '../../shared/session';
import { localizedRoute, permittedCredentials, TF_ROUTES } from './reporting-tool.data';
import { ReportingToolPage } from './reporting-tool.page';

test.describe('reporting-tool create survey', () => {
  test('[TF-C-40] Renders the default survey structure, validates the name, and saves a new step.', async ({ page }) => {
    test.setTimeout(60_000);
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    let surveyId: string | undefined;

    try {
      await page.goto(localizedRoute(page, TF_ROUTES.newSurveyTemplate));
      await expect(tf.surveyWizardHeading).toBeVisible();
      await expect(tf.surveyNameInput).toHaveAttribute('placeholder', tf.copy.survey.surveyNamePlaceholder);
      await expect(page.getByRole('textbox', { name: /Enter step title|Schritttitel eingeben/i }).first()).toHaveValue(/General Information|Allgemeine Informationen/i);
      await expect(page.getByRole('textbox', { name: /Enter group title|Gruppentitel eingeben/i }).first()).toHaveValue(/Contact Information|Kontaktinformationen/i);
      await expect(page.getByText(/Vorname|First name/i).first()).toBeVisible();
      await expect(page.getByText(/\* Required|\* Erforderlich/i).first()).toBeVisible();

      await tf.surveySaveButton.click();
      await expect(page).toHaveURL(/\/new-survey(?:\?|$)/);
      await tf.surveyNameInput.fill('   ');
      await tf.surveySaveButton.click();
      await expect(page).toHaveURL(/\/new-survey(?:\?|$)/);

      await tf.surveyNameInput.fill(`TF E2E Survey ${Date.now().toString().slice(-8)}`);
      await page.getByRole('button', { name: /Add new step|Neuen Schritt hinzufügen/i }).click();
      await expect(page.getByText(/2 (steps|Schritte)/i)).toBeVisible();
      await expect(page.getByText(/^(Question|Frage)$/i).last()).toBeVisible();

      const createRequest = page.waitForResponse(
        (response) => response.url().includes('/api/tf/surveys') && response.request().method() === 'POST',
      );
      await tf.surveySaveButton.click();
      const createResponse = await createRequest;
      expect(createResponse.ok()).toBeTruthy();
      const body = await createResponse.json();
      surveyId = body?.data?.id;
      expect(surveyId).toBeTruthy();
      await expect(page).toHaveURL(new RegExp(`id=${surveyId}.*step=assign-users`));
    } finally {
      if (surveyId) {
        try {
          await page.request.delete(`/api/tf/surveys/${surveyId}`, { timeout: 5_000 });
        } catch (error) {
          console.warn(`Fixture cleanup failed for survey ${surveyId}:`, error);
        }
      }
    }
  });
});

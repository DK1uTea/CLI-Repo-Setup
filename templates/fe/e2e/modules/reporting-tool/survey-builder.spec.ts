import { expect, test } from '@playwright/test';

import { authenticateViaApi } from '../../shared/session';
import { createDraftEventFixture } from './reporting-tool.fixtures';
import { permittedCredentials, TAB_PARAMS } from './reporting-tool.data';
import { ReportingToolPage } from './reporting-tool.page';

test.describe('reporting-tool survey builder', () => {
  test('[TF-C-33] Opens and closes Assign users with an empty user table for a new event survey.', async ({ page }) => {
    test.setTimeout(60_000);
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    const eventId = await createDraftEventFixture(page, tf);
    const surveyId = await tf.createSurveyFixture(eventId);
    expect(surveyId).toBeTruthy();

    try {
      await tf.gotoWorkspace(eventId, TAB_PARAMS.surveyBuilder);
      const assignUsersButton = page.getByRole('button', { name: tf.copy.surveyBuilder.assignUsers }).first();
      await expect(assignUsersButton).toBeVisible();
      await assignUsersButton.click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole('button', { name: tf.copy.assignTeam.shareInviteLink })).toBeVisible();
      await expect(dialog.getByRole('button', { name: tf.copy.assignTeam.importUsers })).toBeVisible();
      await expect(dialog.getByRole('button', { name: tf.copy.assignTeam.addUser })).toBeVisible();
      await expect(dialog).toContainText(tf.copy.assignTeam.noDataAvailable);

      await dialog.getByRole('button', { name: 'Close' }).click();
      await expect(dialog).not.toBeVisible();
      await expect(page).toHaveURL(new RegExp(`/(?:de|en)/reporting-tool\\?eventId=${eventId}.*tab=${TAB_PARAMS.surveyBuilder}`));
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

  test('[TF-C-34] Opens the survey library action menu, previews a survey, and cancels delete safely.', async ({ page }) => {
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

      await libraryCard.getByRole('button', { name: /Open survey actions|Umfrageaktionen/i }).click();
      for (const action of [/Preview|Vorschau/i, /Edit|Bearbeiten/i, /Duplicate|Duplizieren/i, /Delete|Löschen/i]) {
        await expect(page.getByRole('menuitem', { name: action })).toBeVisible();
      }

      await page.getByRole('menuitem', { name: /Preview|Vorschau/i }).click();
      const preview = page.getByRole('dialog');
      await expect(preview).toBeVisible();
      await preview.getByRole('button', { name: 'Close' }).click();
      await expect(preview).not.toBeVisible();

      await libraryCard.getByRole('button', { name: /Open survey actions|Umfrageaktionen/i }).click();
      await page.getByRole('menuitem', { name: /Delete|Löschen/i }).click();
      const deleteDialog = page.getByRole('alertdialog');
      await expect(deleteDialog).toBeVisible();
      await deleteDialog.getByRole('button', { name: /Cancel|Abbrechen/i }).click();
      await expect(deleteDialog).not.toBeVisible();
      await expect(libraryCard).toBeVisible();
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

  test('[TF-C-35] Toggles an assigned survey between private and public states with confirmation.', async ({ page }) => {
    test.setTimeout(60_000);
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    const eventId = await createDraftEventFixture(page, tf);
    const surveyId = await tf.createSurveyFixture(eventId);
    expect(surveyId).toBeTruthy();

    try {
      await tf.gotoWorkspace(eventId, TAB_PARAMS.surveyBuilder);
      const allowWithoutLogin = page.getByRole('button', { name: /Allow access without login|Zugriff ohne Anmeldung erlauben/i }).first();
      await expect(allowWithoutLogin).toBeVisible();
      await allowWithoutLogin.click();

      const enablePublicDialog = page.getByRole('alertdialog');
      await expect(enablePublicDialog).toContainText(/Allow access without login|Zugriff ohne Anmeldung erlauben/i);
      const enableRequest = page.waitForResponse(
        (response) => response.url().includes('/api/tf/event-surveys/') && response.url().includes('/required-login') && response.request().method() === 'PATCH',
      );
      await enablePublicDialog.getByRole('button', { name: /Confirm|Bestätigen/i }).click();
      expect((await enableRequest).ok()).toBeTruthy();
      await expect(page.getByRole('button', { name: /Require login|Anmeldung erforderlich/i }).first()).toBeVisible();
      await expect(page.getByRole('button', { name: /Public Link|Öffentlicher Link/i }).first()).toBeVisible();

      await page.getByRole('button', { name: /Require login|Anmeldung erforderlich/i }).first().click();
      const disablePublicDialog = page.getByRole('alertdialog');
      await expect(disablePublicDialog).toContainText(/Require login for this survey|Anmeldung für diese Umfrage erforderlich/i);
      const disableRequest = page.waitForResponse(
        (response) => response.url().includes('/api/tf/event-surveys/') && response.url().includes('/required-login') && response.request().method() === 'PATCH',
      );
      await disablePublicDialog.getByRole('button', { name: /Confirm|Bestätigen/i }).click();
      expect((await disableRequest).ok()).toBeTruthy();
      await expect(page.getByRole('button', { name: /Assign users|Benutzer zuweisen/i }).first()).toBeVisible();
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

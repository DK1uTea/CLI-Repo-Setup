import { expect, test } from '@playwright/test';

import { authenticateViaApi } from '../../shared/session';
import { createDraftEventFixture } from './reporting-tool.fixtures';
import { permittedCredentials, TAB_PARAMS } from './reporting-tool.data';
import { createImportFixtures, type ImportFile } from './reporting-tool-import-fixtures';
import { ReportingToolPage } from './reporting-tool.page';

async function cleanup(page: import('@playwright/test').Page, urls: string[]) {
  for (const url of urls) {
    try {
      await page.request.delete(url, { timeout: 5_000 });
    } catch (error) {
      console.warn(`Fixture cleanup failed for ${url}:`, error);
    }
  }
}

test.describe('reporting-tool survey builder assignment dialogs', () => {
  test('[TF-C-36] Verifies Share link, Import users, and Add user dialogs with a real upload.', async ({ page }) => {
    test.setTimeout(75_000);
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    const eventId = await createDraftEventFixture(page, tf);
    const surveyId = await tf.createSurveyFixture(eventId);
    expect(surveyId).toBeTruthy();
    const stamp = Date.now().toString().slice(-8);
    const fixtures = createImportFixtures(stamp);
    const importFiles: Array<{ format: 'xlsx' | 'xls' | 'csv'; file: ImportFile }> = [
      { format: 'xlsx', file: process.env.E2E_TF_IMPORT_XLSX_FILE ?? fixtures.xlsx },
      { format: 'xls', file: process.env.E2E_TF_IMPORT_XLS_FILE ?? fixtures.xls },
      { format: 'csv', file: process.env.E2E_TF_IMPORT_CSV_FILE ?? fixtures.csv },
    ];

    try {
      await tf.gotoWorkspace(eventId, TAB_PARAMS.surveyBuilder);
      await tf.assignUsersButton.first().click();
      const assignDialog = page.getByRole('dialog').last();

      await assignDialog.getByRole('button', { name: tf.copy.assignTeam.shareInviteLink }).click();
      const shareDialog = page.getByRole('dialog').last();
      const inviteInput = shareDialog.locator('#share-invite-link');
      await expect(inviteInput).toHaveValue(/signup\?token=/, { timeout: 15_000 });
      const roles = shareDialog.getByRole('radio');
      expect(await roles.count()).toBe(3);
      await expect.poll(() => roles.evaluateAll((items) => items.filter((item) => item.getAttribute('aria-checked') === 'true').length)).toBe(1);
      await expect(shareDialog.getByRole('radio', { name: /Promoter/i })).toHaveAttribute('aria-checked', 'true');
      await shareDialog.getByRole('radio', { name: /Sales Rep/i }).click();
      await expect(shareDialog.getByRole('radio', { name: /Sales Rep/i })).toHaveAttribute('aria-checked', 'true');
      await page.context().grantPermissions(['clipboard-read', 'clipboard-write'], {
        origin: new URL(page.url()).origin,
      });
      await shareDialog.getByRole('button', { name: /Copy link|Link kopieren/i }).click();
      await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(await inviteInput.inputValue());
      await shareDialog.getByRole('button', { name: /Cancel|Abbrechen/i }).click();

      await assignDialog.getByRole('button', { name: tf.copy.assignTeam.importUsers }).click();
      const initialImportDialog = page.getByRole('dialog').last();
      await expect(initialImportDialog).toContainText(/Required fields|Pflichtfelder/i);
      const initialImportButton = initialImportDialog.getByRole('button', { name: /Import users|Benutzer importieren/i });
      await expect(initialImportButton).toBeDisabled();

      const failures: string[] = [];
      let importDialog = initialImportDialog;
      for (const [index, importCase] of importFiles.entries()) {
        if (index > 0) {
          await assignDialog.getByRole('button', { name: tf.copy.assignTeam.importUsers }).click();
          importDialog = page.getByRole('dialog').last();
        }
        const importButton = importDialog.getByRole('button', { name: /Import users|Benutzer importieren/i });
        await importDialog.locator('input[type="file"]').setInputFiles(importCase.file);
        await expect(importButton).toBeEnabled();
        const importRequest = page.waitForResponse(
          (response) => response.url().includes('/api/tf/users/import-users/') && response.request().method() === 'POST',
        );
        await importButton.click();
        const importResponse = await importRequest;
        const importBody = await importResponse.json();
        const status = importBody?.status;
        const validRows = importBody?.data?.validRows;
        if (typeof status !== 'number' || status < 200 || status >= 300) {
          failures.push(`${importCase.format}: status=${String(status)} message=${JSON.stringify(importBody?.message)}`);
        } else if (typeof validRows !== 'number' || validRows < 1) {
          failures.push(`${importCase.format}: validRows=${String(validRows)}`);
        }
        await expect(page.getByRole('heading', { name: /Import users|Benutzer importieren/i })).not.toBeVisible();
      }

      await assignDialog.getByRole('button', { name: tf.copy.assignTeam.addUser }).click();
      const addDialog = page.getByRole('dialog').last();
      const addButton = addDialog.getByRole('button', { name: tf.copy.assignTeam.submitUser });
      await expect(addButton).toBeDisabled();
      await addDialog.locator('#add-user-first-name').fill('Add');
      await addDialog.locator('#add-user-last-name').fill('User');
      await addDialog.locator('#add-user-email').fill(`tf.add.${stamp}@example.com`);
      await expect(addButton).toBeEnabled();
      await addDialog.getByRole('button', { name: /Cancel|Abbrechen/i }).click();

      expect(failures, `Import format failures: ${failures.join('; ')}`).toEqual([]);
    } finally {
      await cleanup(page, [`/api/tf/surveys/${surveyId}`, `/api/tf/events/${eventId}`]);
    }
  });
});

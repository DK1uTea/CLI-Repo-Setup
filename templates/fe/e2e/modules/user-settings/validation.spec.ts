import { expect, test } from '@playwright/test';

import { resumeSessionAt } from '../../shared/session';
import { UserSettingsPage } from './user-settings.page';

/**
 * user-settings — client-side validation.
 *
 * Every test also asserts the mutation was never sent — see
 * docs/specs/user-settings.md's Out of Scope: no real password change, avatar change, or
 * invite is sent from this suite; every case here keeps the request client-side rejected.
 *
 * Confirmed live (Playwright MCP): the profile form validates on submit (not on change),
 * profileSchema (`profile-schema.ts`) requires `firstName`/`lastName` 2-100 chars, and
 * the invite form's email field uses the shared email validator seen elsewhere in the app.
 */

test.describe('user-settings validation — Profile', () => {
  test('rejects a first name shorter than 2 characters and does not save', async ({ page }) => {
    let saveCalled = false;
    page.on('request', (request) => {
      if (request.url().includes('/api/user/profile') && request.method() === 'PUT') {
        saveCalled = true;
      }
    });

    const profileResponse = page.waitForResponse(
      (r) => r.url().includes('/api/user/profile') && r.request().method() === 'GET',
    );
    await resumeSessionAt(page, 'userSettings');
    const settings = new UserSettingsPage(page);
    await profileResponse;

    // Wait for RHF's `reset()` to hydrate the form from the real profile response before
    // overwriting it — filling immediately after the GET resolves can race the form reset,
    // so the field briefly holds "H" only to be wiped back to the loaded value right after.
    await expect(settings.firstNameInput).not.toHaveValue('');
    await settings.firstNameInput.fill('H');
    await settings.saveProfileButton.click();

    await expect(settings.fieldError('Muss mindestens 2 Zeichen lang sein')).toBeVisible();
    await expect(settings.firstNameInput).toHaveAttribute('aria-invalid', 'true');
    expect(saveCalled).toBe(false);
  });

  test('rejects a last name shorter than 2 characters and does not save', async ({ page }) => {
    let saveCalled = false;
    page.on('request', (request) => {
      if (request.url().includes('/api/user/profile') && request.method() === 'PUT') {
        saveCalled = true;
      }
    });

    const profileResponse = page.waitForResponse(
      (r) => r.url().includes('/api/user/profile') && r.request().method() === 'GET',
    );
    await resumeSessionAt(page, 'userSettings');
    const settings = new UserSettingsPage(page);
    await profileResponse;

    await expect(settings.lastNameInput).not.toHaveValue('');
    await settings.lastNameInput.fill('H');
    await settings.saveProfileButton.click();

    await expect(settings.fieldError('Muss mindestens 2 Zeichen lang sein')).toBeVisible();
    await expect(settings.lastNameInput).toHaveAttribute('aria-invalid', 'true');
    expect(saveCalled).toBe(false);
  });

  test('blocks saving an address with a cleared required field and never calls the profile save', async ({
    page,
  }) => {
    let saveCalled = false;
    page.on('request', (request) => {
      if (request.url().includes('/api/user/profile') && request.method() === 'PUT') {
        saveCalled = true;
      }
    });

    await resumeSessionAt(page, 'userSettings');
    const settings = new UserSettingsPage(page);

    await settings.addressInput('primary').click();
    // The address dialog opens with the real current address already loaded; clear one
    // required field and try to save — the dialog itself blocks it (see
    // setting-address-dialog.tsx's handleSave/REQUIRED_FIELDS), so the profile PUT is never
    // reached and the shared account's real address is never touched.
    const cityField = page.getByLabel('Stadt');
    await cityField.fill('');
    await page.getByRole('button', { name: 'Speichern Adresse' }).click();

    await expect(page.getByText('Dieses Feld ist erforderlich').first()).toBeVisible();
    expect(saveCalled).toBe(false);
  });
});

test.describe('user-settings validation — Security & Privacy', () => {
  test('rejects a new-password/confirmation mismatch and does not call the API', async ({
    page,
  }) => {
    let changeCalled = false;
    page.on('request', (request) => {
      if (request.url().includes('/api/user/change-password')) {
        changeCalled = true;
      }
    });

    await resumeSessionAt(page, 'userSettings');
    const settings = new UserSettingsPage(page);
    await settings.tab('Sicherheit & Datenschutz').click();

    await settings.currentPasswordInput.fill('dummy-current');
    await settings.newPasswordInput.fill('NewPassw0rd!');
    await settings.confirmNewPasswordInput.fill('Mismatch1!');
    await settings.changePasswordButton.click();

    // Confirmed live: this branch's error message is untranslated ("Invalid input", the
    // zod default) rather than a localized German string — a real i18n gap, asserted as
    // observed rather than "fixed" to the German copy this test almost guessed at.
    await expect(settings.confirmNewPasswordInput).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Invalid input', { exact: true })).toBeVisible();
    expect(changeCalled).toBe(false);
  });
});

test.describe('user-settings validation — Invite User', () => {
  test('rejects an empty email and does not send the invite', async ({ page }) => {
    let inviteCalled = false;
    page.on('request', (request) => {
      if (request.url().includes('/api/user/invite-user')) {
        inviteCalled = true;
      }
    });

    await resumeSessionAt(page, 'userSettings');
    const settings = new UserSettingsPage(page);
    await settings.inviteUserLink.click();
    await page.waitForURL(/\/user-settings\/invite-user/);

    await settings.inviteSubmitButton.click();

    await expect(page.getByText('Bitte gib eine gültige E-Mail-Adresse ein')).toBeVisible();
    expect(inviteCalled).toBe(false);
  });

  test('rejects an invalid email format and does not send the invite', async ({ page }) => {
    let inviteCalled = false;
    page.on('request', (request) => {
      if (request.url().includes('/api/user/invite-user')) {
        inviteCalled = true;
      }
    });

    await resumeSessionAt(page, 'userSettings');
    const settings = new UserSettingsPage(page);
    await settings.inviteUserLink.click();
    await page.waitForURL(/\/user-settings\/invite-user/);

    await settings.inviteEmailInput.fill('not-an-email');
    await settings.inviteSubmitButton.click();

    await expect(page.getByText('Bitte gib eine gültige E-Mail-Adresse ein')).toBeVisible();
    expect(inviteCalled).toBe(false);
  });
});

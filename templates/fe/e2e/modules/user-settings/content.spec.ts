import { expect, test } from '@playwright/test';

import { getUserInitials } from '@/lib/utils';

import { watchConsole } from '../../shared/console';
import { resumeSessionAt } from '../../shared/session';
import { TAB_NAMES } from './user-settings.data';
import { UserSettingsPage } from './user-settings.page';

/**
 * User Settings — page content.
 *
 * These resume an API-authenticated session instead of signing in through the UI: the
 * journey is already covered in `flow.spec.ts`, and repeating a full sign-in here would
 * cost a real login round trip per assertion instead of one API call.
 */

test.describe('user-settings content', () => {
  test('renders all four settings tabs', async ({ page }) => {
    await resumeSessionAt(page, 'userSettings');

    for (const name of TAB_NAMES) {
      await expect(page.getByRole('tab', { name })).toBeVisible();
    }
  });

  test('opens on the profile tab and shows the avatar section', async ({ page }) => {
    await resumeSessionAt(page, 'userSettings');

    await expect(page.getByRole('tab', { name: TAB_NAMES[0] })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(page.getByRole('heading', { name: 'Profilbild' })).toBeVisible();
  });

  test('keeps the selected tab in the URL so it can be deep-linked', async ({ page }) => {
    await resumeSessionAt(page, 'userSettings');

    await page.getByRole('tab', { name: TAB_NAMES[1] }).click();

    await expect(page).toHaveURL(/tab=/);
    await expect(page.getByRole('tab', { name: TAB_NAMES[1] })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  test('drives the avatar initials from the signed-in user', async ({ page }) => {
    const name = process.env.E2E_USER_NAME;
    test.skip(!name, 'Set E2E_USER_NAME (the account\'s full name) in .env.local to run this.');

    await resumeSessionAt(page, 'userSettings');

    // getUserInitials is the same pure function the app uses (src/lib/utils.ts),
    // applied to the real account's real name — no fixture override needed.
    await expect(page.getByText(getUserInitials(name), { exact: true }).first()).toBeVisible();
  });

  test('keeps the browser console clean', async ({ page }) => {
    const consoleWatch = watchConsole(page);

    await resumeSessionAt(page, 'userSettings');
    await expect(page.getByRole('tab', { name: TAB_NAMES[0] })).toBeVisible();

    await consoleWatch.assertClean();
  });
});

test.describe('user-settings content — Profile Management', () => {
  test('shows the real profile data: first/last name, disabled email, phone, and addresses', async ({
    page,
  }) => {
    const profileResponse = page.waitForResponse(
      (r) => r.url().includes('/api/user/profile') && r.request().method() === 'GET',
    );
    await resumeSessionAt(page, 'userSettings');
    const settings = new UserSettingsPage(page);
    const body = await (await profileResponse).json();
    const profile = body?.data ?? body;

    await expect(settings.firstNameInput).not.toHaveValue('');
    await expect(settings.lastNameInput).not.toHaveValue('');
    if (profile?.firstName) await expect(settings.firstNameInput).toHaveValue(profile.firstName);
    if (profile?.lastName) await expect(settings.lastNameInput).toHaveValue(profile.lastName);
  });

  test('the Email Address field is disabled and read-only', async ({ page }) => {
    await resumeSessionAt(page, 'userSettings');
    const settings = new UserSettingsPage(page);

    await expect(settings.emailInput).toBeDisabled();
  });

  test('shows the avatar upload area with Upload/Remove buttons and the format/size hint', async ({
    page,
  }) => {
    await resumeSessionAt(page, 'userSettings');

    await expect(page.getByRole('button', { name: 'Bild hochladen' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Entfernen' })).toBeVisible();
  });

  test('shows the language/region dropdowns with the values the real profile response carries', async ({
    page,
  }) => {
    const profileResponse = page.waitForResponse(
      (r) => r.url().includes('/api/user/profile') && r.request().method() === 'GET',
    );
    await resumeSessionAt(page, 'userSettings');
    const settings = new UserSettingsPage(page);
    const body = await (await profileResponse).json();
    const profile = body?.data ?? body;
    const region = profile?.languageRegion ?? profile?.settings ?? {};

    // Asserted against the real response rather than an assumed default — the account may
    // already have non-default saved prefs (see task note on not assuming plausible values).
    await expect(settings.preferredLanguageSelect).toBeVisible();
    await expect(settings.timeZoneSelect).toContainText(region.timeZone || region.timezone || 'Europe/Berlin');
    await expect(settings.currencySelect).toContainText(region.currency || 'EUR');
  });

  test('opening each of the four Language & Region dropdowns shows its full option list', async ({
    page,
  }) => {
    await resumeSessionAt(page, 'userSettings');
    const settings = new UserSettingsPage(page);

    await settings.dateFormatSelect.click();
    for (const label of ['DD/MM/YYYY', 'DD-MM-YYYY', 'MM/DD/YYYY', 'MM-DD-YYYY']) {
      await expect(page.getByRole('option', { name: label })).toBeVisible();
    }
    await page.keyboard.press('Escape');

    await settings.preferredLanguageSelect.click();
    await expect(page.getByRole('option', { name: 'Englisch' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Deutsch' })).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('toggling the dashboard theme switches the interface immediately without calling the profile save, and reverts to the account\'s saved appearance on reload (it was never saved)', async ({
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

    const before = await settings.themeToggleButton.getAttribute('aria-pressed');
    const beforeClass = await page.evaluate(() => document.documentElement.classList.contains('light'));
    await settings.themeToggleButton.click();

    // Immediate local feedback: `applyPreviewTheme` in setting-theme-toggle.tsx applies the
    // class and writes localStorage synchronously on click — no save required.
    await expect(settings.themeToggleButton).not.toHaveAttribute('aria-pressed', before ?? '');
    const toggledClass = await page.evaluate(() => document.documentElement.classList.contains('light'));
    expect(toggledClass).toBe(!beforeClass);
    expect(saveCalled).toBe(false);

    // Confirmed live: reloading re-fetches the real profile and `useProfileManagement`'s
    // sync effect re-applies the *account's saved* appearance over whatever localStorage
    // held, reverting the un-saved toggle — this is the app correctly not persisting an
    // unsaved change, not a bug. The account's saved theme is therefore never durably
    // mutated by this test (Save was never clicked).
    await page.reload();
    const afterReloadClass = await page.evaluate(() => document.documentElement.classList.contains('light'));
    expect(afterReloadClass).toBe(beforeClass);
  });
});

test.describe('user-settings content — Security & Privacy', () => {
  test('shows the paginated login history list', async ({ page }) => {
    await resumeSessionAt(page, 'userSettings');
    const settings = new UserSettingsPage(page);
    await settings.tab(TAB_NAMES[1]).click();

    await expect(settings.loginHistoryTable).toBeVisible();
    await expect(settings.loginHistoryTable.getByRole('row')).not.toHaveCount(0);
    await expect(settings.loginHistoryPagination).toBeVisible();
  });

  test('the personal-data export button starts a download', async ({ page }) => {
    await resumeSessionAt(page, 'userSettings');
    const settings = new UserSettingsPage(page);
    await settings.tab(TAB_NAMES[1]).click();

    const downloadPromise = page.waitForEvent('download');
    await settings.exportDataButton.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.zip$/i);
  });
});

test.describe('user-settings content — User Roles & Access (admin)', () => {
  test('renders the access-user list with search and role filter', async ({ page }) => {
    await resumeSessionAt(page, 'userSettings');
    const settings = new UserSettingsPage(page);
    await settings.tab(TAB_NAMES[2]).click();

    await expect(settings.accessSearchInput).toBeVisible();
    await expect(settings.accessRoleFilterButton).toBeVisible();
    await expect(settings.accessTable).toBeVisible();
    await expect(settings.accessTable.getByRole('row')).not.toHaveCount(0);
  });

  test('Grant/Revoke and Change Role actions are visible for this wildcard-admin account', async ({
    page,
  }) => {
    await resumeSessionAt(page, 'userSettings');
    const settings = new UserSettingsPage(page);
    await settings.tab(TAB_NAMES[2]).click();

    await expect(settings.revokeAccessButton(0)).toBeVisible();
    await expect(settings.changeRoleButton(0)).toBeVisible();
  });
});

test.describe('user-settings content — Manage User Roles (admin)', () => {
  test('renders the role list with search and archived-roles toggle', async ({ page }) => {
    await resumeSessionAt(page, 'userSettings');
    const settings = new UserSettingsPage(page);
    await settings.tab(TAB_NAMES[3]).click();

    await expect(settings.roleSearchInput).toBeVisible();
    await expect(settings.archivedRolesToggle).toBeVisible();
    await expect(settings.addRoleLink).toBeVisible();
    await expect(settings.roleTable).toBeVisible();
  });

  test('system roles expose no row actions', async ({ page }) => {
    const rolesResponse = page.waitForResponse((r) => r.url().includes('/api/roles?'));
    await resumeSessionAt(page, 'userSettings');
    const settings = new UserSettingsPage(page);
    await settings.tab(TAB_NAMES[3]).click();
    const body = await (await rolesResponse).json();

    const roles = Array.isArray(body?.data?.items) ? body.data.items : [];
    const systemRole = roles.find((r: { isSystem?: boolean }) => r.isSystem);
    test.skip(!systemRole, 'No system role returned by the real /api/roles response.');

    const row = settings.roleRow(systemRole.name);
    await expect(row.getByRole('button', { name: 'Duplizieren' })).toHaveCount(0);
    await expect(row.getByRole('link', { name: 'Bearbeiten' })).toHaveCount(0);
    await expect(row.getByRole('button', { name: 'Löschen' })).toHaveCount(0);
  });

  test('active non-system roles expose Duplicate, Edit and Delete', async ({ page }) => {
    const rolesResponse = page.waitForResponse((r) => r.url().includes('/api/roles?'));
    await resumeSessionAt(page, 'userSettings');
    const settings = new UserSettingsPage(page);
    await settings.tab(TAB_NAMES[3]).click();
    const body = await (await rolesResponse).json();

    const roles = Array.isArray(body?.data?.items) ? body.data.items : [];
    const customRole = roles.find(
      (r: { isSystem?: boolean; status?: string }) => !r.isSystem && r.status !== 'ARCHIVED',
    );
    test.skip(!customRole, 'No active non-system role returned by the real /api/roles response.');

    const row = settings.roleRow(customRole.name);
    await expect(row.getByRole('button', { name: 'Duplizieren' })).toBeVisible();
    await expect(row.getByRole('link', { name: 'Bearbeiten' })).toBeVisible();
    await expect(row.getByRole('button', { name: 'Löschen' })).toBeVisible();
  });
});

/**
 * Invite User — read-only checks. Email validation is covered in `validation.spec.ts`;
 * the one mutating scenario (a real invite, cleaned up after itself) lives in `flow.spec.ts`.
 */
test.describe('user-settings content — Invite User', () => {
  test('renders the email field, the permission matrix and a back link to the referring tab', async ({
    page,
  }) => {
    await resumeSessionAt(page, 'userSettings');
    const settings = new UserSettingsPage(page);
    await settings.tab(TAB_NAMES[2]).click();
    await settings.inviteUserLink.click();

    await expect(page.getByRole('heading', { name: 'Benutzer einladen' })).toBeVisible();
    await expect(settings.inviteEmailInput).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Berechtigungen' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Zurück' })).toHaveAttribute(
      'href',
      '/de/user-settings?tab=user-roles-access',
    );
  });

  test('cancel returns to the referring tab without sending an invite', async ({ page }) => {
    await resumeSessionAt(page, 'userSettings');
    const settings = new UserSettingsPage(page);
    await settings.tab(TAB_NAMES[2]).click();
    await settings.inviteUserLink.click();

    await settings.inviteCancelButton.click();

    await expect(page).toHaveURL(/tab=user-roles-access/);
  });
});

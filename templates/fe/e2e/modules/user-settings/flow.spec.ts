import { expect, test } from '@playwright/test';

import { MODULES, openModule, resumeSessionAt, restrictedCredentials, sidebarLink, signIn } from '../../shared/session';
import { TAB_NAMES } from './user-settings.data';

/**
 * User Settings — reaching the module.
 *
 * Walks the whole journey: sign in, get redirected, click the sidebar entry. That covers
 * the middleware guard, the locale rewrite and the app shell, none of which a spec that
 * jumps straight to the URL would exercise. Signs in against the real backend — see
 * `e2e/shared/session.ts`.
 */

test.describe('user-settings journey', () => {
  test('signs in, lands on the dashboard, then opens User Settings from the sidebar', async ({
    page,
  }) => {
    await signIn(page);

    await expect(page).toHaveURL(/\/de\/dashboards/);
    await expect(sidebarLink(page, 'userSettings')).toBeVisible();

    await openModule(page, 'userSettings');

    await expect(page).toHaveURL(/\/de\/user-settings/);
    await expect(page.getByRole('heading', { name: 'Benutzereinstellungen' })).toBeVisible();
  });

  test('offers every module in the sidebar once signed in', async ({ page }) => {
    await signIn(page);

    for (const name of Object.keys(MODULES) as (keyof typeof MODULES)[]) {
      await expect(sidebarLink(page, name)).toHaveAttribute('href', MODULES[name].href);
    }
  });

  test('sends an unauthenticated visitor to login instead', async ({ page }) => {
    await page.goto(MODULES.userSettings.href);

    await expect(page).toHaveURL(/\/de\/login/);
  });

  test('hides modules the user has no navbar entry for', async ({ page }) => {
    const restricted = restrictedCredentials();
    test.skip(
      !restricted,
      'Set E2E_RESTRICTED_USER_EMAIL / _PASSWORD / _MODULES in .env.local to run this.',
    );

    await signIn(page, restricted!);

    for (const name of Object.keys(MODULES) as (keyof typeof MODULES)[]) {
      const shouldBeVisible = restricted!.visibleModules.includes(name);
      if (shouldBeVisible) {
        await expect(sidebarLink(page, name)).toBeVisible();
      } else {
        await expect(sidebarLink(page, name)).toBeHidden();
      }
    }
  });
});

/**
 * Manage User Roles has a real delete endpoint (unlike CAM activations), so a
 * duplicate-then-delete round trip is self-cleaning — no leftover fixture, no
 * mutation-opt-in flag needed. `DELETE /roles/{id}` only archives; the duplicate is
 * permanently removed via `DELETE /roles/{id}/primary` in archived mode (see CONTEXT.md).
 */
test.describe('manage-user-roles mutation', () => {
  test('duplicates a role, then permanently deletes the duplicate', async ({ page }) => {
    await resumeSessionAt(page, 'userSettings');
    await page.getByRole('tab', { name: TAB_NAMES[3] }).click();

    const sourceRow = page
      .getByRole('row')
      .filter({ has: page.getByRole('cell', { name: 'Event Admin', exact: true }) });
    await expect(sourceRow).toBeVisible();
    await sourceRow.getByRole('button', { name: 'Duplizieren' }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Duplizieren' }).click();

    // Confirming navigates straight to the duplicate's edit page (see CONTEXT.md); read its
    // generated name back from there, then return to the list to clean it up.
    await expect(page).toHaveURL(/\/de\/user-settings\/edit-user-role\//);
    const duplicateName = await page.getByRole('textbox', { name: /Rollenname/ }).inputValue();
    await page.getByRole('link', { name: 'Abbrechen' }).click();
    await expect(page).toHaveURL(/tab=manage-user-roles/);

    const duplicateRow = page
      .getByRole('row')
      .filter({ has: page.getByRole('cell', { name: duplicateName, exact: true }) });
    await expect(duplicateRow).toBeVisible();

    // Soft-delete: moves the duplicate to the archived list.
    await duplicateRow.getByRole('button', { name: 'Löschen' }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Löschen' }).click();
    await expect(page.getByRole('cell', { name: duplicateName, exact: true })).toBeHidden();

    // Permanently delete it from the archived list so no residue is left behind.
    await page.getByRole('button', { name: 'Archivierte Rollen anzeigen' }).click();
    const archivedRow = page
      .getByRole('row')
      .filter({ has: page.getByRole('cell', { name: duplicateName, exact: true }) });
    await expect(archivedRow).toBeVisible();
    await archivedRow.getByRole('button', { name: 'Löschen' }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Löschen' }).click();

    await expect(page.getByRole('cell', { name: duplicateName, exact: true })).toBeHidden();
  });
});

/**
 * Invite User — self-cleaning: the invitation is deleted from Roles & Access at the end
 * so no pending invite is left behind on the shared account.
 */
test.describe('invite-user mutation', () => {
  test('invites a user with a selected role, then deletes the invitation', async ({ page }) => {
    await resumeSessionAt(page, 'userSettings');
    await page.getByRole('tab', { name: TAB_NAMES[2] }).click();
    await page.getByRole('link', { name: 'Benutzer einladen' }).click();
    await expect(page).toHaveURL(/\/de\/user-settings\/invite-user/);

    const email = `e2e-invite-${Date.now()}@example.com`;
    await page.getByRole('textbox', { name: 'E-Mail-Adresse' }).fill(email);
    await page.getByRole('button', { name: 'Sales Rep' }).click();
    await page.getByRole('button', { name: 'Benutzer einladen' }).click();

    await expect(page).toHaveURL(/tab=user-roles-access/);
    await page.getByPlaceholder('Suche Benutzer...').fill(email);
    const invitedRow = page.getByRole('row').filter({ has: page.getByRole('cell', { name: email, exact: true }) });
    await expect(invitedRow).toBeVisible();
    await expect(invitedRow.getByText('Eingeladen')).toBeVisible();

    await invitedRow.getByRole('button', { name: 'Löschen' }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Löschen' }).click();

    await expect(page.getByRole('cell', { name: email, exact: true })).toBeHidden();
  });

  test('requires a role before an invite can be submitted', async ({ page }) => {
    await resumeSessionAt(page, 'userSettings');
    await page.getByRole('tab', { name: TAB_NAMES[2] }).click();
    await page.getByRole('link', { name: 'Benutzer einladen' }).click();
    await expect(page).toHaveURL(/\/de\/user-settings\/invite-user/);

    await page.getByRole('textbox', { name: 'E-Mail-Adresse' }).fill(`e2e-invite-${Date.now()}@example.com`);
    await page.getByRole('button', { name: 'Benutzer einladen' }).click();

    // No role selected — stays on the invite page, nothing is sent.
    await expect(page).toHaveURL(/\/de\/user-settings\/invite-user/);
  });
});

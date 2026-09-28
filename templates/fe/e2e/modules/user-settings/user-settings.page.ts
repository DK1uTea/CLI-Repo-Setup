import type { Page } from '@playwright/test';

/**
 * user-settings — locators, read off the live accessibility tree (Playwright MCP against
 * a real signed-in session), not guessed.
 *
 * Two things confirmed live worth flagging:
 * - The profile form validates on submit, not on change — an error only appears after
 *   clicking "Einstellungen speichern" once, not while typing.
 * - Editing the profile form marks it dirty and a native `beforeunload` confirmation
 * fires on any subsequent navigation away — tests that dirty a field must not navigate
 *   without either resetting it or accepting that dialog.
 */
export class UserSettingsPage {
  constructor(private readonly page: Page) {}

  tab(name: string) {
    return this.page.getByRole('tab', { name });
  }

  get inviteUserLink() {
    return this.page.getByRole('link', { name: 'Benutzer einladen' });
  }

  // ---- Profile tab --------------------------------------------------------

  get firstNameInput() {
    return this.page.getByRole('textbox', { name: 'Vorname' });
  }

  get lastNameInput() {
    return this.page.getByRole('textbox', { name: 'Nachname' });
  }

  get phoneInput() {
    return this.page.getByRole('textbox', { name: 'Telefonnummer' });
  }

  get saveProfileButton() {
    return this.page.getByRole('button', { name: 'Einstellungen speichern' });
  }

  fieldError(message: string) {
    return this.page.getByText(message, { exact: true });
  }

  get emailInput() {
    return this.page.getByRole('textbox', { name: 'E-Mail-Adresse' });
  }

  addressInput(type: 'primary' | 'billing' | 'shipping') {
    const labelMap = {
      primary: 'Primäre Adresse',
      billing: 'Rechnungsadresse',
      shipping: 'Lieferadresse',
    } as const;
    return this.page.getByRole('textbox', { name: labelMap[type] });
  }

  get preferredLanguageSelect() {
    return this.page.getByRole('combobox', { name: 'Bevorzugte Sprache' });
  }

  get timeZoneSelect() {
    return this.page.getByRole('combobox', { name: 'Zeitzone' });
  }

  get currencySelect() {
    return this.page.getByRole('combobox', { name: 'Währung' });
  }

  get dateFormatSelect() {
    return this.page.getByRole('combobox', { name: 'Datumsformat' });
  }

  get themeToggleButton() {
    return this.page.getByRole('button', { name: 'Thema' });
  }

  // ---- Security & Privacy tab ---------------------------------------------

  get currentPasswordInput() {
    return this.page.getByRole('textbox', { name: 'Aktuell Passwort' });
  }

  get newPasswordInput() {
    return this.page.getByRole('textbox', { name: 'Neu Passwort', exact: true });
  }

  get confirmNewPasswordInput() {
    return this.page.getByRole('textbox', { name: 'Bestätigen Neu Passwort' });
  }

  get changePasswordButton() {
    return this.page.getByRole('button', { name: 'Passwort ändern' });
  }

  get loginHistoryTable() {
    return this.page.getByRole('table');
  }

  get loginHistoryPagination() {
    return this.page.getByRole('navigation', { name: 'Seitennavigation' });
  }

  get exportDataButton() {
    return this.page.getByRole('button', { name: 'Exportieren' });
  }

  // ---- User Roles & Access tab (admin) ------------------------------------

  get accessSearchInput() {
    return this.page.getByRole('textbox', { name: 'Suche Benutzer...' });
  }

  get accessRoleFilterButton() {
    return this.page.getByRole('button', { name: 'Alle Rollen' });
  }

  get accessTable() {
    return this.page.getByRole('table');
  }

  accessTableColumnSort(name: string) {
    return this.accessTable.getByRole('button', { name, exact: true });
  }

  revokeAccessButton(rowIndex: number) {
    return this.accessTable
      .getByRole('row')
      .nth(rowIndex + 1) // +1 skips the header row
      .getByRole('button', { name: 'Zugriff widerrufen' });
  }

  changeRoleButton(rowIndex: number) {
    return this.accessTable
      .getByRole('row')
      .nth(rowIndex + 1)
      .getByRole('button', { name: 'Rolle ändern' });
  }

  // ---- Manage User Roles tab (admin) --------------------------------------

  get roleSearchInput() {
    return this.page.getByRole('textbox', { name: 'Rolle suchen...' });
  }

  get archivedRolesToggle() {
    return this.page.getByRole('button', { name: 'Archivierte Rollen anzeigen' });
  }

  get addRoleLink() {
    return this.page.getByRole('link', { name: 'Benutzerrolle hinzufügen' });
  }

  get roleTable() {
    return this.page.getByRole('table');
  }

  roleRow(roleName: string) {
    return this.roleTable.getByRole('row').filter({ hasText: roleName }).first();
  }

  // ---- Invite user page ----------------------------------------------------

  get inviteEmailInput() {
    return this.page.getByRole('textbox', { name: 'E-Mail-Adresse' });
  }

  get inviteSubmitButton() {
    return this.page.getByRole('button', { name: 'Benutzer einladen' });
  }

  get inviteCancelButton() {
    return this.page.getByRole('button', { name: 'Abbrechen' });
  }

  inviteRoleColumnButton(roleName: string) {
    return this.page.getByRole('button', { name: roleName, exact: true });
  }
}

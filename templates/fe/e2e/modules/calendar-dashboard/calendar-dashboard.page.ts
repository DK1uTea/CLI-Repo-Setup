import type { Page } from '@playwright/test';

/**
 * calendar-dashboard (Event-Katalog) — locators.
 *
 * Read off the live accessibility tree (Playwright MCP against a real signed-in session),
 * not guessed. Two things confirmed live that are easy to get wrong from the code alone:
 *
 * - The `Card`'s "Events" title (`calendar-dashboard-main.tsx`) is a plain `generic` node,
 *   not a heading — `CardTitle` renders a `div`. There is no semantic h-level heading on
 *   this page's card at all.
 * - `CalendarListSelectFilter`'s trigger shows the *currently selected option's label*,
 *   not the filter's own name, once a value is set — Status defaults to "Alle" (its own
 *   `status=all` option) and Zeitrahmen defaults to "Upcoming" (backend-provided copy,
 *   verbatim). Only Event-Typ, Partnerschaft, Event Manager, Zielgruppe and Anzahl start
 *   with no selection and so show their static label. This locates Status/Zeitrahmen by
 *   position within the filter row instead, since that row's button order is fixed JSX
 *   (`calendar-list-main.tsx`): Event-Typ, Status, Zeitrahmen, Datum, Partnerschaft,
 *   Meine Events, Event Manager, Zielgruppe, Anzahl.
 */
export class CalendarDashboardPage {
  constructor(private readonly page: Page) {}

  get cardTitle() {
    return this.page.getByText('Events', { exact: true });
  }

  get createEventButton() {
    return this.page.getByRole('link', { name: /Event erstellen/i });
  }

  get searchInput() {
    return this.page.getByPlaceholder('Suche nach einem Event');
  }

  /** The filter row, anchored on "Partnerschaft" — the one filter whose label never changes. */
  get filterBar() {
    return this.page.getByRole('button', { name: 'Partnerschaft' }).locator('..');
  }

  get eventTypeFilterButton() {
    return this.filterBar.getByRole('button', { name: 'Filtern' });
  }

  get statusFilterButton() {
    return this.filterBar.getByRole('button').nth(1);
  }

  get timeFrameFilterButton() {
    return this.filterBar.getByRole('button').nth(2);
  }

  get dateFilterButton() {
    return this.filterBar.getByRole('button', { name: 'Datum' });
  }

  get partnershipFilterButton() {
    return this.filterBar.getByRole('button', { name: 'Partnerschaft' });
  }

  get myEventButton() {
    return this.page.getByRole('button', { name: 'Meine Events' });
  }

  get eventManagerFilterButton() {
    return this.filterBar.getByRole('button', { name: 'Event Manager' });
  }

  get targetAudienceFilterButton() {
    return this.filterBar.getByRole('button', { name: 'Zielgruppe' });
  }

  /**
   * "Anzahl" — like Status/Zeitrahmen, its trigger shows the picked value once one is
   * set ("20 pro Seite"), not the static label. It is the last button in the filter row.
   */
  get takeFilterButton() {
    return this.filterBar.getByRole('button').last();
  }

  /** Any open `DropdownMenu`/`LazyDropdown` content — Radix's default `role="menu"`. */
  get openFilterMenu() {
    return this.page.getByRole('menu');
  }

  get filterMenuResetButton() {
    return this.openFilterMenu.getByRole('button', { name: 'Zurücksetzen' });
  }

  get filterMenuApplyButton() {
    return this.openFilterMenu.getByRole('button', { name: 'Anwenden' });
  }

  get exportToExcelButton() {
    return this.page.getByRole('button', { name: 'Excel exportieren' });
  }

  /** Visibility-only text match — for content assertions, not for clicking (use `eventCard`). */
  eventCardText(title: string) {
    return this.page.getByText(title, { exact: true }).first();
  }

  /**
   * The whole calendar list item's link — its accessible name concatenates day/month,
   * title, event type, dates and organizer (`calendar-list-item.tsx`), so this matches on
   * the title as a substring rather than the full name. Clicking a plain text match inside
   * this link (confirmed live) does not reliably trigger the Next.js `Link` navigation —
   * always click through this role-based locator instead.
   */
  eventCard(title: string) {
    return this.page.getByRole('link', { name: new RegExp(escapeRegExp(title)) });
  }

  /**
   * Edit/Delete render as a sibling row next to the link, not inside it
   * (`calendar-list-item.tsx`'s desktop layout: the Link is row 1, the visible Edit/Delete
   * buttons are row 1's next sibling `div`) — confirmed live at desktop viewport width.
   */
  eventCardEditButton(title: string) {
    return this.eventCard(title)
      .locator('..')
      .locator('xpath=following-sibling::div[1]')
      .getByRole('link', { name: 'Bearbeiten' });
  }

  eventCardDeleteButton(title: string) {
    return this.eventCard(title)
      .locator('..')
      .locator('xpath=following-sibling::div[1]')
      .getByRole('button', { name: 'Löschen' });
  }

  get monthGroupHeadings() {
    return this.page.getByRole('heading', { level: 3 });
  }

  /** Shared `EventListDeleteDialog` (events.list namespace) — reused verbatim by calendar. */
  get deleteDialog() {
    return this.page.getByRole('alertdialog', { name: 'In den Papierkorb verschieben?' });
  }

  get deleteDialogCancelButton() {
    return this.deleteDialog.getByRole('button', { name: 'Abbrechen' });
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

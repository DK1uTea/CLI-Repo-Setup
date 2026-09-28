import { describe, expect, it } from 'vitest';

import { buildCalendarExportParams } from '@/features/calendar/calendar-list/(hooks)/use-export-calendar-to-excel';

describe('buildCalendarExportParams', () => {
  it('always scopes the shared export endpoint to calendar events', () => {
    const params = buildCalendarExportParams({});

    expect(params.isCalendarEvent).toBe(true);
    expect(params.sort).toBe('createdAt:desc');
  });

  it('maps the calendar list filters onto the export query params', () => {
    const params = buildCalendarExportParams({
      keyword: 'Munich',
      status: 'ACTIVE',
      eventTypeId: 'type-1',
      timeFrame: 'UPCOMING_ASC',
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      partnershipTypes: ['EXHIBITION'],
      productPartnerCategories: ['SOFTDRINKS', 'WATER'],
      targetAudience: ['CONSUMER'],
      onlyMine: true,
    });

    expect(params).toMatchObject({
      search: 'Munich',
      status: 'ACTIVE',
      eventTypeId: 'type-1',
      timeFrame: 'UPCOMING_ASC',
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      partnershipTypes: ['EXHIBITION'],
      productPartnerCategories: ['SOFTDRINKS', 'WATER'],
      targetAudience: ['CONSUMER'],
      onlyMine: true,
    });
  });

  it('omits "all" sentinel filter values instead of sending them literally', () => {
    const params = buildCalendarExportParams({ status: 'all', eventTypeId: 'all', timeFrame: 'all' });

    expect(params.status).toBeUndefined();
    expect(params.eventTypeId).toBeUndefined();
    expect(params.timeFrame).toBeUndefined();
  });

  it('only sends yearScope when the requested year is the current year', () => {
    const currentYear = new Date().getFullYear();

    const currentYearParams = buildCalendarExportParams({}, { year: currentYear, yearScope: 'PAST' });
    expect(currentYearParams.year).toBe(currentYear);
    expect(currentYearParams.yearScope).toBe('PAST');

    const pastYearParams = buildCalendarExportParams({}, { year: currentYear - 1, yearScope: 'PAST' });
    expect(pastYearParams.year).toBe(currentYear - 1);
    expect(pastYearParams.yearScope).toBeUndefined();
  });

  // Sheet #23 ("Option Export ưu tiên hơn filter") — verified against the real
  // payload-building code, not assumed from the sheet's wording. The export
  // popover's own scope is ADDITIVE on top of the active list filters, not an
  // override: the active list's `timeFrame` is still sent verbatim alongside
  // the popover's `yearScope`, and nothing here ever strips/replaces the list
  // filters because the popover's own option was picked. "Priority" only
  // manifests in the one place the code actually branches on it — `yearScope`
  // is sent at all only when the requested year equals the current year
  // (see the test above); for a past year it is dropped regardless of what
  // the popover selected. This test documents that real behavior so a future
  // change to it is a deliberate one.
  it('sends the active list filter alongside the export scope — the popover option does not remove/override other list filters', () => {
    const currentYear = new Date().getFullYear();
    const params = buildCalendarExportParams(
      { timeFrame: 'UPCOMING_ASC', onlyMine: true },
      { year: currentYear, yearScope: 'PAST' },
    );

    expect(params.timeFrame).toBe('UPCOMING_ASC');
    expect(params.onlyMine).toBe(true);
    expect(params.yearScope).toBe('PAST');
  });
});

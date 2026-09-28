import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CalendarListExportFilter } from '@/features/calendar/calendar-list/(components)/calendar-list-export-filter';

const { exportEventsMock } = vi.hoisted(() => ({ exportEventsMock: vi.fn() }));

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('@/features/calendar/calendar-list/(hooks)/use-export-calendar-to-excel', () => ({
  useExportCalendarToExcel: () => ({ exportEvents: exportEventsMock, isExporting: false }),
}));

describe('CalendarListExportFilter', () => {
  it('exports with the default scope (ALL) and current year when confirmed', async () => {
    const user = userEvent.setup();
    render(<CalendarListExportFilter />);

    await user.click(screen.getByRole('button', { name: 'exportToExcel' }));
    await user.click(screen.getByRole('button', { name: 'export' }));

    expect(exportEventsMock).toHaveBeenCalledWith({
      year: new Date().getFullYear(),
      yearScope: 'ALL',
    });
  });

  // Sheet #22: selecting "Past Event" scope exports only past events.
  it('exports with the Past Event scope once selected', async () => {
    const user = userEvent.setup();
    render(<CalendarListExportFilter />);

    await user.click(screen.getByRole('button', { name: 'exportToExcel' }));
    await user.click(screen.getByRole('radio', { name: 'exportPast' }));
    await user.click(screen.getByRole('button', { name: 'export' }));

    expect(exportEventsMock).toHaveBeenCalledWith({
      year: new Date().getFullYear(),
      yearScope: 'PAST',
    });
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import RentalAvailabilityMonthPicker from '@/features/rent/product-detail/(components)/rental-availability-month-picker';

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => key,
}));

describe('RentalAvailabilityMonthPicker', () => {
  it('always opens in a start-aligned popover', async () => {
    const user = userEvent.setup();
    render(
      <RentalAvailabilityMonthPicker
        value={new Date('2026-08-01T00:00:00Z')}
        onChangeAction={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'month' }));

    expect(document.querySelector('[data-slot="popover-content"]')).toHaveAttribute(
      'data-align',
      'start',
    );
    expect(document.querySelector('[data-slot="dialog-content"]')).not.toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { describe, expect, it, vi } from 'vitest';

import messages from '@/messages/en.json';
import RentalCategories from '@/features/rent/catalogue/(components)/rental-categories';

const TWO_CATEGORIES = [
  { id: '1', name: 'Thekenbundle', slug: 'thekenbundle' },
  { id: '2', name: 'Klapptheken', slug: 'klapptheken' },
];

const { useRentalCategoryMock } = vi.hoisted(() => ({
  useRentalCategoryMock: vi.fn(() => ({ data: TWO_CATEGORIES, isLoading: false })),
}));

vi.mock('@/features/rent/catalogue/(hooks)/use-rental-category', () => ({
  useRentalCategory: useRentalCategoryMock,
}));

function renderCategories(searchParams = '?category=thekenbundle') {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <NuqsTestingAdapter searchParams={searchParams}>
        <RentalCategories />
      </NuqsTestingAdapter>
    </NextIntlClientProvider>,
  );
}

describe('RentalCategories', () => {
  it('clears the selected category when the selected chip is clicked again', async () => {
    const user = userEvent.setup();
    renderCategories();

    const selected = screen.getByRole('button', { name: 'Thekenbundle' });
    expect(selected).toHaveAttribute('data-variant', 'default');

    await user.click(selected);

    expect(selected).toHaveAttribute('data-variant', 'outline');
  });

  // testcase/rent/list-product.md case 21 (corrected 2026-09-08): the filter is
  // single-select — picking a different chip replaces the current selection instead of
  // adding to it (rental-categories.tsx uses one `category` string in the URL, not an array).
  it('replaces the current selection instead of combining chips when a different one is clicked', async () => {
    const user = userEvent.setup();
    renderCategories();

    expect(screen.getByRole('button', { name: 'Thekenbundle' })).toHaveAttribute('data-variant', 'default');
    expect(screen.getByRole('button', { name: 'Klapptheken' })).toHaveAttribute('data-variant', 'outline');

    await user.click(screen.getByRole('button', { name: 'Klapptheken' }));

    expect(screen.getByRole('button', { name: 'Thekenbundle' })).toHaveAttribute('data-variant', 'outline');
    expect(screen.getByRole('button', { name: 'Klapptheken' })).toHaveAttribute('data-variant', 'default');
  });

  it('shows no chip selected by default when no category is applied', () => {
    renderCategories('');

    expect(screen.getByRole('button', { name: 'Thekenbundle' })).toHaveAttribute('data-variant', 'outline');
    expect(screen.getByRole('button', { name: 'Klapptheken' })).toHaveAttribute('data-variant', 'outline');
  });
});

describe('RentalCategories — Load more', () => {
  it('shows only the first 20 categories and a Load more button when there are more', async () => {
    useRentalCategoryMock.mockReturnValue({
      data: Array.from({ length: 25 }, (_, i) => ({ id: `${i}`, name: `Category ${i}`, slug: `category-${i}` })),
      isLoading: false,
    });
    const user = userEvent.setup();

    renderCategories('');

    expect(screen.getAllByRole('button', { name: /Category \d+/ })).toHaveLength(20);
    const loadMore = screen.getByRole('button', { name: 'Load more' });

    await user.click(loadMore);

    expect(screen.getAllByRole('button', { name: /Category \d+/ })).toHaveLength(25);
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument();

    useRentalCategoryMock.mockReturnValue({ data: TWO_CATEGORIES, isLoading: false });
  });

  it('hides the Load more button when there are 20 or fewer categories', () => {
    renderCategories('');

    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
  });
});

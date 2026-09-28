import { describe, expect, it } from 'vitest';

import { areSavedFiltersEqual } from '@/features/events/event-list/(helpers)/saved-filter-comparison';

describe('areSavedFiltersEqual', () => {
  it('treats reordered arrays and missing empty arrays as the same filters', () => {
    expect(areSavedFiltersEqual(
      {
        timeFrame: 'UPCOMING',
        onlyMine: true,
        partnershipTypes: ['EXHIBITION', 'PRODUCT_PARTNER'],
        targetAudience: [],
      },
      {
        timeFrame: 'UPCOMING',
        onlyMine: true,
        partnershipTypes: ['PRODUCT_PARTNER', 'EXHIBITION'],
      },
    )).toBe(true);
  });

  it('detects a changed scalar filter', () => {
    expect(areSavedFiltersEqual(
      { timeFrame: 'UPCOMING', onlyMine: true },
      { timeFrame: 'PAST', onlyMine: true },
    )).toBe(false);
  });

  it('detects a changed calendar view, so Save enables after switching Month/Week/Day', () => {
    expect(areSavedFiltersEqual(
      { timeFrame: 'UPCOMING', onlyMine: true, view: 'month' },
      { timeFrame: 'UPCOMING', onlyMine: true, view: 'week' },
    )).toBe(false);
  });
});

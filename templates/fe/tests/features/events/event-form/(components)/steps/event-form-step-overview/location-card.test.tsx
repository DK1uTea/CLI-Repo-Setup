import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { LocationCard } from '@/features/events/event-form/(components)/steps/event-form-step-overview/location-card';
import type { EventFormDto } from '@/features/events/event-form/(helpers)/event-form-schema';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const labels: Record<string, string> = {
      'overview.locationTitle': 'Event location',
      'overview.locationSubtitle': 'Place or location of this event.',
      'overview.selectLocation': 'Select location',
      'overview.venueName': 'Venue name',
      'overview.street': 'Street',
      'overview.postalCode': 'Postal code',
      'overview.city': 'City',
      'overview.saveAddress': 'Save an address',
      'overview.noLocations': 'No locations found',
      'overview.noLocationsDescription': 'Try adjusting your search.',
      clear: 'Clear',
      showOptions: 'Show options',
    };
    return labels[key] ?? key;
  },
}));

vi.mock('nuqs', () => ({
  parseAsString: {},
  useQueryState: () => [null, vi.fn()],
}));

vi.mock('@/features/events/(stores)/use-event-detail-store', () => ({
  useEventDetailStore: (selector: (state: { canEdit: boolean; isOverviewLocked: boolean }) => unknown) =>
    selector({ canEdit: true, isOverviewLocked: false }),
}));

const { locationsState } = vi.hoisted(() => ({
  locationsState: {
    locations: [] as { id: string; name: string; street: string; postalCode: string; city: string }[],
  },
}));

vi.mock('@/features/events/event-form/(hooks)/use-event-location', () => ({
  useEventLocation: () => ({
    locations: locationsState.locations,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
  }),
}));

function LocationCardHarness() {
  const methods = useForm<EventFormDto>({
    defaultValues: {
      locationId: '',
      address: '',
      street: '',
      zipCode: '',
      city: '',
      isSaveAddress: false,
    } as Partial<EventFormDto>,
  });

  return (
    <FormProvider {...methods}>
      <LocationCard />
    </FormProvider>
  );
}

describe('LocationCard', () => {
  it('renders an empty state when the saved location query returns no locations', async () => {
    locationsState.locations = [];
    const user = userEvent.setup();
    render(<LocationCardHarness />);

    await user.click(screen.getByRole('combobox', { name: 'Select location' }));

    expect(await screen.findByText('No locations found')).toBeVisible();
  });

  it('lists saved locations and hides the empty state once results come back', async () => {
    locationsState.locations = [
      { id: 'loc-1', name: 'Munich Arena', street: 'Street 1', postalCode: '80331', city: 'Munich' },
      { id: 'loc-2', name: 'Berlin Hall', street: 'Street 2', postalCode: '10115', city: 'Berlin' },
    ];
    const user = userEvent.setup();
    render(<LocationCardHarness />);

    await user.click(screen.getByRole('combobox', { name: 'Select location' }));

    expect(await screen.findByText('Munich Arena')).toBeVisible();
    expect(screen.getByText('Berlin Hall')).toBeVisible();
    expect(screen.queryByText('No locations found')).not.toBeInTheDocument();
  });
});

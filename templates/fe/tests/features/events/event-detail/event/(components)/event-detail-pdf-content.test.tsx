import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EventDetailPdfContent } from '@/features/events/event-detail/event/(components)/event-detail-pdf-content';
import type { EventDetail } from '@/features/events/event-form/(hooks)/use-event-step-detail';

const t = (key: string) => key;

const BASE_EVENT: EventDetail = {
  general: { id: 'event-1', name: 'Test Event', startTime: '2026-08-01T09:00:00Z' },
  overview: {
    id: 'event-1',
    title: 'Test Event',
    mode: 'FACE_TO_FACE',
    targetAudience: [],
    customEventId: 'EVENT-1000001',
    eventTypeId: 'type-1',
    shortDescription: '',
    participation: 'NOT_POSSIBLE',
    link: null,
    images: [],
    startDate: '2026-08-01',
    endDate: '2026-08-02',
    locationId: null,
    location: null,
    adminContact: { firstName: 'Max', lastName: 'Mustermann', email: 'max@example.com', phone: '+491234' },
    isPrivate: false,
    isCalendarEvent: false,
    partnershipTypes: [],
    productPartnerCategories: [],
  },
  logistics: undefined,
  productCatalog: [],
} as unknown as EventDetail;

describe('EventDetailPdfContent cost rows', () => {
  it('renders the total weight above the schedule', () => {
    render(
      <EventDetailPdfContent
        event={{ ...BASE_EVENT, general: { ...BASE_EVENT.general, totalWeight: 125 } }}
        dateFormat="DD/MM/YYYY"
        currencySymbol="€"
        showPrice={false}
        printedAt="31/07/2026 09:20"
        t={t}
      />,
    );

    expect(screen.getByText('pdf.weight:')).toBeInTheDocument();
    expect(screen.getByText('125 kg')).toBeInTheDocument();
  });

  it('renders zero kilograms when total weight is missing', () => {
    render(
      <EventDetailPdfContent
        event={BASE_EVENT}
        dateFormat="DD/MM/YYYY"
        currencySymbol="€"
        showPrice={false}
        printedAt="31/07/2026 09:20"
        t={t}
      />,
    );

    expect(screen.getByText('0 kg')).toBeInTheDocument();
  });

  it('renders the order id and uppercased status in one row', () => {
    render(
      <EventDetailPdfContent
        event={{ ...BASE_EVENT, order: { id: 'ORDER-42', status: 'draft' } }}
        dateFormat="DD/MM/YYYY"
        currencySymbol="€"
        showPrice={false}
        printedAt="31/07/2026 09:20"
        t={t}
      />,
    );

    expect(screen.getByText('pdf.orderId : ORDER-42 - DRAFT')).toBeInTheDocument();
  });

  it('renders dashes when order id and status are missing', () => {
    render(
      <EventDetailPdfContent
        event={{ ...BASE_EVENT, order: {} } as EventDetail}
        dateFormat="DD/MM/YYYY"
        currencySymbol="€"
        showPrice={false}
        printedAt="31/07/2026 09:20"
        t={t}
      />,
    );

    expect(screen.getByText('pdf.orderId : - - -')).toBeInTheDocument();
  });

  it('hides zero-value cost rows but always shows the total', () => {
    render(
      <EventDetailPdfContent
        event={{
          ...BASE_EVENT,
          costSummary: {
            equipmentRental: 4430.5,
            purchasedItems: 0,
            services: 0,
            transportCosts: 4194.7,
            pmCost: 70,
            totalEventCost: 8695.2,
          },
        }}
        dateFormat="DD/MM/YYYY"
        currencySymbol="€"
        showPrice
        printedAt="31/07/2026 09:20"
        t={t}
      />,
    );

    expect(screen.getByText('pdf.rentalCost:')).toBeInTheDocument();
    expect(screen.getByText('pdf.transportCosts:')).toBeInTheDocument();
    expect(screen.getByText('pdf.pmCost:')).toBeInTheDocument();
    expect(screen.getByText('pdf.total:')).toBeInTheDocument();
    expect(screen.queryByText('pdf.purchaseCost:')).not.toBeInTheDocument();
    expect(screen.queryByText('pdf.services:')).not.toBeInTheDocument();
  });

  it('shows every cost row when all values are non-zero', () => {
    render(
      <EventDetailPdfContent
        event={{
          ...BASE_EVENT,
          costSummary: {
            equipmentRental: 99,
            purchasedItems: 10,
            services: 5,
            transportCosts: 1605.31,
            pmCost: 70,
            totalEventCost: 1789.31,
          },
        }}
        dateFormat="DD/MM/YYYY"
        currencySymbol="€"
        showPrice
        printedAt="31/07/2026 09:20"
        t={t}
      />,
    );

    expect(screen.getByText('pdf.rentalCost:')).toBeInTheDocument();
    expect(screen.getByText('pdf.purchaseCost:')).toBeInTheDocument();
    expect(screen.getByText('pdf.services:')).toBeInTheDocument();
    expect(screen.getByText('pdf.transportCosts:')).toBeInTheDocument();
    expect(screen.getByText('pdf.pmCost:')).toBeInTheDocument();
    expect(screen.getByText('pdf.total:')).toBeInTheDocument();
  });
});

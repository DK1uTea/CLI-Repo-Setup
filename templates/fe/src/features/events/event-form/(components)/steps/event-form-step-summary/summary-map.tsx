'use client';

import { EventMap } from '@/features/events/(components)/event-map';

type Props = {
    lat?: number | null;
    lng?: number | null;
    title?: string;
    address?: string;
    organizer?: string;
};

export function SummaryMap(props: Props) {
    return <EventMap {...props} />;
}

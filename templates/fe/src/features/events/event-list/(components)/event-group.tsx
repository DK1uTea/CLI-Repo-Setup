'use client'

import { Card } from '@/shared/components/ui/card'
import { EventListItem } from './event-list-item'
import type { EventItem } from '../(hooks)/use-event-list-data'

type Props = {
  monthYear: string
  events: EventItem[]
  onDeleteClickAction: (event: EventItem) => void
}

export function EventGroup({ monthYear, events, onDeleteClickAction }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-bold">{monthYear}</h3>
      <Card className="gap-0 py-0">
        {events.map((event, i) => (
          <div key={event.id}>
            <EventListItem event={event} onDeleteClickAction={onDeleteClickAction} />
            {i < events.length - 1 && <div className="h-px bg-border" />}
          </div>
        ))}
      </Card>
    </div>
  )
}

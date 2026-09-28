'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useFloating, autoUpdate, flip, shift, offset } from '@floating-ui/react-dom'
import { X } from 'lucide-react'
import { useLocale } from 'next-intl'
import { dayjs } from '@/lib/date-utils'
import type { CalendarEvent } from '@/features/events/event-calendar/(hooks)/use-event-calendar-data'

const POPOVER_WIDTH = 240

type Props = {
  date: Date
  events: CalendarEvent[]
  anchorEl: HTMLElement
  onClose: () => void
  onSelectEvent: (event: CalendarEvent) => void
}

export function EventCalendarMorePopover({ date, events, anchorEl, onClose, onSelectEvent }: Props) {
  const locale = useLocale()

  const { refs, floatingStyles } = useFloating({
    elements: { reference: anchorEl },
    placement: 'bottom',
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const floating = refs.floating.current
      if (floating && !floating.contains(e.target as Node)) onClose()
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, refs.floating])

  const d = dayjs.utc(date).locale(locale === 'de' ? 'de' : 'en')
  const dateLabel = locale === 'de' ? d.format('D. MMMM YYYY') : d.format('D MMMM YYYY')

  return createPortal(
    <div
      ref={refs.setFloating}
      style={{ ...floatingStyles, width: POPOVER_WIDTH, zIndex: 9999 }}
      className="rounded-lg border bg-card shadow-lg"
    >
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-sm font-semibold">{dateLabel}</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <div className="max-h-72 overflow-y-auto py-1 _custom-scroll">
        {events.map((event) => (
          <button
            key={event.id}
            type="button"
            onClick={() => {
              onSelectEvent(event)
              onClose()
            }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-muted/50"
          >
            <span className="size-1.5 shrink-0 rounded-full bg-primary" />
            <span className="truncate text-foreground">{event.title}</span>
          </button>
        ))}
      </div>
    </div>,
    document.body,
  )
}

'use client'

import { useInfiniteQuery } from '@tanstack/react-query'

export type EventManager = {
  id: string
  firstName: string
  lastName: string
}

type EventManagerPage = {
  managers: EventManager[]
  nextOffset?: number
}

// TODO: replace with real API call when backend is ready
const MOCK_MANAGERS: EventManager[] = [
  { id: '1', firstName: 'Simone', lastName: 'Wendt' },
  { id: '2', firstName: 'Marcus', lastName: 'Thiele' },
  { id: '3', firstName: 'Sarah', lastName: 'Sieb' },
  { id: '4', firstName: 'Lars', lastName: 'Detlefsen' },
  { id: '5', firstName: 'Max', lastName: 'Mustermann' },
  { id: '6', firstName: 'Thomas', lastName: 'Weber' },
  { id: '7', firstName: 'Maria', lastName: 'Koch' },
  { id: '8', firstName: 'Anna', lastName: 'Schmidt' },
  { id: '9', firstName: 'Jan', lastName: 'Fischer' },
  { id: '10', firstName: 'Klaus', lastName: 'Müller' },
  { id: '11', firstName: 'Lisa', lastName: 'Hoffmann' },
  { id: '12', firstName: 'Hans', lastName: 'Klein' },
]

const PAGE_SIZE = 5

export function useEventManagerData() {
  return useInfiniteQuery({
    queryKey: ['event-managers'],
    queryFn: async ({ pageParam }): Promise<EventManagerPage> => {
      const start = pageParam as number
      const slice = MOCK_MANAGERS.slice(start, start + PAGE_SIZE)
      return {
        managers: slice,
        nextOffset: start + PAGE_SIZE < MOCK_MANAGERS.length ? start + PAGE_SIZE : undefined,
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    initialPageParam: 0,
  })
}

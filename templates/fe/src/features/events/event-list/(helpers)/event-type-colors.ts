const EVENT_TYPE_COLORS = [
  { bgColor: '#FF1900', color: '#FFFFFF' },
  { bgColor: '#FF8D7E', color: '#FFFFFF' },
  { bgColor: '#C1F9FF', color: '#240000' },
  { bgColor: '#FFCE00', color: '#240000' },
  { bgColor: '#00CCA2', color: '#240000' },
  { bgColor: '#463CC8', color: '#FFFFFF' },
  { bgColor: '#FF9BFA', color: '#240000' },
  { bgColor: '#8C8C8C', color: '#FFFFFF' },
  { bgColor: '#000000', color: '#FFFFFF' },
]

export function getEventTypeColor(eventType: string | undefined, eventTypes: { label?: string }[]) {
  const typeIndex = eventTypes.findIndex(({ label }) => label === eventType)

  return typeIndex !== -1
    ? EVENT_TYPE_COLORS[typeIndex % EVENT_TYPE_COLORS.length]
    : EVENT_TYPE_COLORS[0]
}

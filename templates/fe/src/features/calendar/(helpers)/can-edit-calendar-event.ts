type CalendarEventOwnership = {
  isOwner?: boolean;
} | null | undefined;

export function canEditCalendarEvent(
  event: CalendarEventOwnership,
  isCalendarAdmin: boolean,
) {
  return isCalendarAdmin || !!event?.isOwner;
}

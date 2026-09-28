# Calendar feature context

This file is the business/API source of truth for `src/features/calendar`. Read it
before changing calendar behaviour and update it in the same change when the
contract changes.

## Scope, routes, and permissions

- `/[locale]/calendar-dashboard`: list; requires `Calendar.Management` and
  `Calendar.List`.
- `/[locale]/calendar-dashboard/new-calendar-event`: create; requires
  `Calendar.Management` and `Calendar.Create`.
- `/[locale]/calendar-dashboard/update-calendar-event?eventId=...`: update;
  requires `Calendar.Management` and `Calendar.Update`.
- `/[locale]/calendar-event-detail/[id]`: detail; requires
  `Calendar.Management` and `Calendar.List`.

The detail page's PDF action loads the event `summary` step only after the user
clicks Download PDF, then uses the same `EventDetailPdfContent` as the Events
detail page. The export therefore includes the same header, address, schedule,
weight, order, products, and price-permission-gated cost breakdown.

Create/update reuse `src/features/events/event-form`, but calendar owns its form
state, detail mapper, schema, payload, and submit lifecycle.
The shared unsaved-changes dialog deactivates its dirty-form navigation guard
before replaying navigation after **Leave without saving**, preventing the
dialog from immediately reopening while the form is still dirty.

## List and navigation behaviour

- The list uses `useInfiniteQuery` with key `["calendar-list", params]`; it starts
  at API page `1`, defaults to a batch limit of `10`, and loads the next page from
  a bottom intersection sentinel only while `hasNextPage` is true. `take` remains
  the user-selectable infinite-scroll batch size.
- URL filters are `keyword`, `status` (`ACTIVE`, `DRAFT`, `DELETED`),
  `eventTypeId`, `timeFrame` (`UPCOMING_ASC`, `NEXT_3_MONTHS`,
  `NEXT_9_MONTHS`, `UPCOMING_DESC`, `PAST`), date range,
  `partnershipTypes`, `productPartnerCategories`, `targetAudience`, `onlyMine`,
  and `take`.
- Defaults match the events variant: `status` defaults to no filter (All),
  `timeFrame` defaults to `UPCOMING` (the backend's list endpoint only accepts
  `UPCOMING`, `NEXT_9_MONTHS`, `ALL_FUTURE`, `UPCOMING_TO_FARTHEST`, `PAST`, `ALL`),
  and `onlyMine` ("My Events")
  defaults to `true`. Toggling "My Events" off sets an explicit `onlyMine:
  false` rather than clearing the param — clearing would collapse back to
  the `true` default via nuqs's `withDefault`.
- The empty state's "Show Me All" action writes an explicit `timeFrame=all`
  URL state so the list refetches without a timeframe restriction.
- Filter option lists (status, timeFrame, eventTypeId, partnershipTypes,
  targetAudience) come from the same shared `GET /api/etr/events/filter-config`
  the events variant uses (`useEventFilterConfig`, same `['event-filter-config']`
  query cache) — calendar no longer hardcodes its own `eventTypeId` fetch
  (previously `useGetEventType` / `GET /etr/event-types`) or its own
  `CALENDAR_PARTNERSHIP_TYPE_OPTIONS` / `CALENDAR_TARGET_AUDIENCE_OPTIONS`
  constants (removed from `(helpers)/calendar-constants.ts`, now deleted).
  `CalendarListPartnershipFilter` receives partnership options (including
  Product Partner categories) from the shared config loaded by the list, while
  `CalendarListTargetAudienceFilter` calls `useEventFilterConfig` directly.
- `CalendarListManagerFilter` ("Event Manager", `userId` filter → `createdBy`
  query param) is always rendered and lazy-loads paginated choices from
  `GET /api/etr/users/ownership-transfer-candidates` only while its dropdown
  is open, matching the events variant. It no longer reads `config.createdBy`.
- `GET /api/etr/calendar` groups events by month itself — `data.items` is an
  array of `{ month: "YYYY-MM", total, events }`, not a flat event list. The FE
  no longer derives the grouping; it only formats `month` for display
  (`dayjs.utc(\`${month}-01\`).format('MMMM YYYY')`) and merges groups sharing
  the same `month` across pages (`mergeCalendarEventGroups`), since pagination
  can split one month's events across two pages/two group entries.
- "Export Excel" (`CalendarListExportFilter`, `useExportCalendarToExcel`) is visible only
  to White Card wildcard administrators; Calendar Managers do not see it. It reuses
  the shared events export endpoint — same `GET /api/etr/events/export` blob
  download as the events variant — scoped to calendar events via
  `isCalendarEvent: true` (the same flag the overview submit payload sends,
  see events `CONTEXT.md`). It maps the current calendar list filters
  (`keyword→search`, `status`/`eventTypeId`/`timeFrame` dropped when `all`,
  `startDate`/`endDate`, `partnershipTypes`/`productPartnerCategories`/`targetAudience` arrays,
  `onlyMine`) plus a year + scope (`ALL`/`PAST`/`FUTURE`) picked in the export
  popover; `yearScope` is only sent when the picked year is the current year.
  Calendar list and export serialize array filters as repeated query keys without
  brackets, matching the shared Events list/export contract.
- "Save Filter" uses the shared `EventListSaveFilter` against
  `GET/PUT /api/etr/user-filter-preferences/EVENT_CALENDAR_LIST`. Save persists the
  current URL filters (`status`, `timeFrame`, `onlyMine`, partnership / category /
  audience arrays, `eventTypeId`, `userId`); reset writes
  `{ timeFrame: "UPCOMING", onlyMine: true }` and clears the URL. Saved prefs
  apply only when the URL has no active filters. Preference queries use
  `staleTime: 0`, `gcTime: 0`, and `refetchOnMount: "always"`. Save and Reset are
  disabled while current normalized filters equal the cached saved snapshot; any semantic
  change enables Save. Reset remains enabled unless a mutation is pending. Successful Save
  or Reset replaces that cache snapshot without a reload. Array order and missing versus
  empty arrays do not count as changes. The list waits until prefs are applied before
  fetching; the events list/calendar tab use the same component with
  `EVENT_NAVIGATOR_LIST`/`EVENT_NAVIGATOR_CALENDAR` and the same saved-snapshot action
  state. `EVENT_CALENDAR_LIST` was previously named `EVENT_CALENDAR` and collided with the
  Event Navigator's Calendar tab, which saved/read under the same key — see events
  `CONTEXT.md`. Renamed 2026-09-10.
- Edit is unavailable for `DELETED` events. It also requires the update
  component permission and either wildcard permission or `event.isOwner`.
- Calendar-list Edit renders as a full button from `md` upward. Below `md`, it
  appears as a pencil-icon option in a menu kept beside the calendar details in
  the card's primary row.
- Calendar-list Delete follows the same responsive layout, using a trash icon
  below `md`. It is available to the event owner or a user with
  `Calendar.Delete` (including wildcard administrators), opens the shared event
  deletion confirmation, calls `DELETE /api/etr/events/{id}`, and invalidates
  `['calendar-list']` after success.
- Transfer Event on the calendar detail header is visible only to wildcard
  administrators, without an additional component-permission guard; event
  ownership alone does not expose the action.
- Opening a calendar card leads to the shared calendar-event detail route.

## Create/update business rules

- Only the overview step is shown. Participation and event-only logistics,
  products, helping hands, and summary steps are not part of calendar creation.
- Create (no `eventId`) fetches `GET /api/etr/holidays/deadline` and blocks
  submit until it resolves, same as the events variant — `useEventDeadline`'s
  `enabled` gate no longer special-cases the calendar variant. The returned
  `deadline` also becomes `DateCard`'s `minDate`, so the calendar event's start
  date cannot be picked before the reference deadline.
- A new custom ID is `EVENT-` plus eight random digits.
- Default start/end date is no longer a fixed today+10 days offset — once the
  deadline resolves, `useCalendarEventForm` defaults `startDate`/`startTime` to
  the deadline's reference date and `endDate` to the day after (mirrors
  `getEventDatesFromDeadline`, same as the events variant), and never
  overwrites a date already present (edit mode, or a value the user already
  typed).
- Required fields include title, mode, at least one target audience, event type,
  short description, start/end, location, and administrative contact.
- Short description is limited to 5,000 characters; end must be after start.
- Partnership type itself may be empty. If `PRODUCT_PARTNER` is selected,
  product-partner categories become required.
- Event and Calendar share the event-type privacy behaviour: selecting
  Dauerleihgabe checks "Do not publish" by default but leaves it editable;
  selecting Permanent Loan checks it and disables the checkbox. These rules
  identify the selected event type by its normalized name rather than its ID.
- Payload maps `doNotPublish` to `isPrivate`, includes `isSaveAddress`,
  location/admin contact/other contacts, and serializes times as
  `${date}T${time}:00Z`.
- Create and update hydrate API `images: string[]` into uploaded-file objects
  for the shared dropzone. New images are presigned/uploaded to the `event`
  folder before submit, then both `POST /etr/calendar` and
  `PATCH /etr/calendar/{id}` send `images` as `string[]` object keys, matching
  Event Overview.
- Update first loads the detail and redirects to the dashboard if the current
  user is neither wildcard admin nor owner.
- Update hydration preserves `isPrivate` as `doNotPublish`, derives
  `isSaveAddress` from the existing `locationId` like the Events form, and
  restores `productPartnerCategories` defensively when the API returns an array.
- Editability uses the same Calendar ownership rule in the route layout, shared
  form body, and detail header: wildcard administrator or `event.isOwner`.

## API contracts and effects

| Method | Browser path | Inputs and effect |
| --- | --- | --- |
| GET | `/api/etr/calendar` | List using the URL filters/pagination above. |
| GET | `/api/etr/calendar/{eventId}` | Load detail used by detail and update. |
| POST | `/api/etr/calendar` | Create from the mapped overview payload. |
| PATCH | `/api/etr/calendar/{eventId}` | Update the existing calendar event. |
| DELETE | `/api/etr/events/{eventId}` | Move a calendar event to trash from the calendar list; shared with Events. |
| GET | `/api/etr/holidays/deadline` | Create-mode reference deadline; blocks submit and sets `DateCard`'s `minDate`, same as the events variant. |
| GET | `/api/etr/events/export` | Filtered Excel blob for the calendar list — shared with events, scoped via `isCalendarEvent: true`. |
| GET | `/api/etr/events/filter-config` | Shared with events; source of the calendar list's status/timeFrame/eventTypeId/partnershipTypes/targetAudience filter options. |

The `etr` prefix is stripped by the catch-all proxy and routed to the ETR
backend. Successful create/update invalidates `["calendar-list"]` and
`["calendar-event-detail", eventId]`, then returns to
`/[locale]/calendar-dashboard`.

## Test anchors

- Cover permission/ownership gating and deleted-event edit suppression.
- Cover every URL filter, infinite-page loading, UTC grouping, invalid dates, and empty
  list responses.
- Cover defaults, conditional product-partner validation, create/update payload,
  cache invalidation, and redirect.
- Cover preservation of privacy, saved-address state, and Product Partner
  categories when hydrating an existing Calendar event.

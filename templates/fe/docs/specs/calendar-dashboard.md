# Module: calendar-dashboard

## Route

| | |
|---|---|
| Path | `/de/calendar-dashboard` |
| Sidebar label (German) | `Event-Katalog` |
| Behind auth | yes |
| Permission-gated | Route needs `Calendar.Management` + `Calendar.List`. Create needs `Calendar.Management` + `Calendar.Create`. Edit needs `Calendar.Update` and (wildcard admin or `event.isOwner`). Delete needs (event owner) or `Calendar.Delete`. Export Excel is wildcard-admin only. Transfer Event (detail page) is wildcard-admin only. |

## Purpose

Lists calendar events (grouped by month), lets a permitted user filter/search them, create
a new calendar event (overview-only form, unlike the multi-step Events form), edit/delete
one they own or are admin for, and open a shared calendar-event detail page.

## Data

| Endpoint | Method | Used for |
|---|---|---|
| `/api/etr/calendar` | GET | List, grouped server-side by month (`data.items: [{month, total, events}]`) |
| `/api/etr/calendar/{eventId}` | GET | Detail / update hydration |
| `/api/etr/calendar` | POST | Create |
| `/api/etr/calendar/{eventId}` | PATCH | Update |
| `/api/etr/events/{eventId}` | DELETE | Delete (shared with Events) |
| `/api/etr/holidays/deadline` | GET | Create-mode reference deadline; blocks submit |
| `/api/etr/events/filter-config` | GET | Shared filter option lists (status/timeFrame/eventTypeId/partnershipTypes/targetAudience) |

- `data.items` groups can be empty; month groups split across pages must merge, not duplicate.
- List filters: `keyword`, `status`, `eventTypeId`, `timeFrame`, `startDate`/`endDate`,
  `partnershipTypes`, `productPartnerCategories`, `targetAudience`, `onlyMine` (default
  `true`), `userId`, `take`.

## Behaviour — Critical flows only (this pass)

### Journey — Create (`create-calendar-event.spec.ts`)
- Creates a calendar Event with all required Overview values through the real
  `POST /api/etr/calendar` and deletes it afterward. Gated behind
  `E2E_CALENDAR_ALLOW_MUTATIONS=true` (see .env.example) since it persists a
  real row in the shared backend — skips itself with a stated reason when unset.
- Reuses `EventFormPage.fillRequiredOverview` from `e2e/modules/events/events.page.ts`
  rather than duplicating locators: `EventFormBody` renders the identical
  `EventFormStepOverview` component for both `variant="events"` and
  `variant="calendar"` (`src/features/calendar/CONTEXT.md`), so the same
  `data-testid`s apply unchanged.

### Journey (`flow.spec.ts`)
- Signs in and opens Event-Katalog from the sidebar
- Sends an unauthenticated visitor to login instead
- Clicking a calendar event card navigates to its calendar-event detail page
- Clicking Edit on an editable event navigates to the update page
- Clicking Delete opens the confirmation dialog without deleting anything (cancelled, never confirmed — see Out of Scope)

### Content (`content.spec.ts`)
- Renders the real list grouped by month, or the empty state when there are no events for the current filters
- Typing a search term and pressing Enter filters the list by keyword
- "My Events" (`onlyMine`) is on by default and toggling it off updates the URL to `onlyMine=false` and refetches
- Changing the Status filter updates the URL and refetches
- Changing the Time Frame filter updates the URL and refetches
- Changing the Event Type filter updates the URL and refetches
- Changing the Anzahl (page size) filter updates the URL and refetches
- Picking a Zielgruppe (target audience) option and applying updates the URL and refetches
- Checking a Partnerschaft option and applying updates the URL and refetches
- Picking an Event Manager option updates the URL and refetches
- Edit button is visible only for an event the account owns or has admin rights to, and never for a `DELETED` event
- Delete button is visible only for the owner or an account with `Calendar.Delete`
- Export Excel is visible only to a wildcard-admin account

### Validation (`validation.spec.ts`)
- Rejects empty required fields (title, image) on create with the message the user sees
- Does not send the create request when the form is invalid
- Selecting the Product Partner partnership type makes Product Partner categories required

### Routing (`routing.spec.ts`)
- Keeps active filters in the URL so the list view is deep-linkable
- Keeps the sidebar Event-Katalog entry marked as the current page

## Out of Scope (this pass — flag for follow-up)

- Edit → delete round-trip on an existing calendar Event (only create → delete is covered
  so far — see Journey — Create above). Needs a provisioned editable fixture the same way
  `docs/specs/events.md` does for the Events wizard.
- Export Excel download content, Transfer Event, and PDF download on the detail page.
- Save Filter / Reset Filter persistence round-trip.
- The Datum (date range) filter — `DateRangePicker`'s "Anwenden" stays disabled until a day
  is actually picked from its calendar grid (typing into the Startdatum/Enddatum textboxes
  directly does not enable it, confirmed live); the grid-click logic needed mirrors
  `events.page.ts`'s `pickDate` helper and was judged not worth the effort for this pass.
- Non-`de` locale, infinite-scroll pagination edge cases (already covered by
  `docs/specs/event-calendar-infinite-scroll.md`'s Vitest suite, not E2E here).

## Open Questions

- Is there a wildcard-admin test account already available (for Export Excel / Transfer
  Event visibility)? If not, those bullets are skipped with a stated reason.

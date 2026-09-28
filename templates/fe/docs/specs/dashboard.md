# Module: dashboard

## Route

| | |
|---|---|
| Path | `/de/dashboards` |
| Sidebar label (German) | `Dashboards` |
| Behind auth | yes |
| Permission-gated | Create-event button: `Event.Management` + `Event.Create`. Calendar shortcut: `Event.Management` or (`Event.List.Active` or `Event.List.Draft`). Upcoming-event cards section: `Event.Management` or `Event.List.Active`. No route-level guard — the page itself has no permission gate. |

## Purpose

Landing page after login: a personalized greeting, quick actions (create event / go to
calendar), the user's and their team's upcoming events, and turnover charts.

## Data

| Endpoint | Method | Used for |
|---|---|---|
| `/api/etr/events/dashboard` | GET | `mine` and `everyone` event groups rendered as cards (query key `["dashboard-events"]`) |
| `/api/etr/analytics/turnover` | GET | Bar + donut chart data (`useEventAnalyticsTurnover`); params `from`/`to` (current year), `filter`, `includeFuture` |

- `mine` / `everyone` are normalized to `[]` when the backend returns a non-array.
- No dashboard mutations exist.
- **Correction to `src/features/dashboard/CONTEXT.md`, confirmed live (2026-09-03):** that
  doc describes the turnover charts as static placeholder data (fixed months array, fixed
  total `3239`, "Include Future Events" as a no-op). The live code
  (`use-event-analytics-turnover.ts`) calls the real `/etr/analytics/turnover` endpoint, and
  toggling "Include Future Events" sends a real `includeFuture=true` param and triggers a
  refetch. This is stale documentation, not current behaviour — flagged back to dev to
  update `CONTEXT.md`; QA does not edit files under `src/`.

## Behaviour

### Journey (`flow.spec.ts`)
- Signs in and lands on `/de/dashboards`
- Sends an unauthenticated visitor to login instead
- Clicking Create Event navigates to the new-event page
- Clicking Go to Calendar navigates to the calendar tab of the event navigator

### Content (`content.spec.ts`)
- Shows a name-based greeting when the user has a first/last name, otherwise the generic welcome text
- Shows the last-login timestamp line when the account has a `lastLoginAt` value
- Renders the create-event button only for a user with `Event.Management` + `Event.Create`
- Renders the go-to-calendar button only for a user with the required event-list permissions
- Renders the upcoming-events section only for a user with `Event.Management` or `Event.List.Active`
- Shows the empty state in "Your upcoming events" when the user has no upcoming events
- Shows the empty state in "Team upcoming events" when the team has no upcoming events
- Renders an event card with title, formatted start date/time, organizer and event type badge for each returned event
- Shows the "starting soon" warning banner on a personal event starting within 0-10 days, and not on one further out
- Does not show the "starting soon" warning banner on team events, even within the 0-10 day window
- Clicking an event card navigates to its event detail page
- Shows loading skeletons for the event lists while the dashboard-events request is in flight
- Shows loading skeletons for both chart cards while the turnover analytics request is in flight
- Toggling "Include Future Events" stays interactive and triggers a refetch with the new param

### Routing (`routing.spec.ts`)
- Keeps the sidebar's `Dashboards` entry marked as the current page

## Out of Scope

- Asserting exact chart values (bar/donut) — the charting library does not expose the
  underlying numbers as accessible text, so tests only confirm the cards render against
  the real response, not specific figures.
- The chart card's year dropdown menu item has no observed functional effect — not
  asserted either way in this pass.
- No dashboard mutation flows (nothing is created/edited/deleted from this page itself).

## Open Questions

- Permission-gated sections require a `restrictedCredentials()` account whose
  `E2E_RESTRICTED_USER_MODULES`/role lacks the relevant `Event.*` keys to exercise the
  "hidden" branch; if no such account is configured, those specific bullets are skipped
  with a stated reason rather than guessed at.
- `src/features/dashboard/CONTEXT.md` needs a dev update: it documents the turnover charts
  as static placeholders, but they are backend-driven (see the Data section's correction
  above). Flagged, not fixed here — QA does not edit files under `src/`.

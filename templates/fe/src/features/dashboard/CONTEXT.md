# Dashboard feature context

This file is the business/API source of truth for `src/features/dashboard`.

## Scope and permissions

The route is `/[locale]/dashboards`. It is private but has no additional
route-level permission guard.

- Create event is guarded by `Event.Management` + `Event.Create`.
- Open events is guarded by `Event.Management` or at least one of
  `Event.List.Draft`, `Event.List.Active`, or `Event.List.Deleted`.
- The calendar shortcut is guarded by `Event.Management` or
  `Event.List.Draft`/`Event.List.Active`; dashboard upcoming-event cards are
  guarded by `Event.Management` or `Event.List.Active`.

## Data-driven behaviour

`useDashboardEvents` calls `GET /api/etr/events/dashboard` with query key
`["dashboard-events"]`. The response is normalized so non-array `mine` or
`everyone` values become empty arrays before rendering. Cards display event
title/details, UTC start date, creator, and event type. Each card links to
`/event-detail/{id}`. A localized deadline reminder is shown only on the user's
upcoming-event list, for events starting in 0 to 10 calendar days inclusive; it is
hidden for team events, past events, and events more than 10 days away. There are no
dashboard mutations.

The greeting is derived locally from the current UTC hour/day and the user's
last-login timestamp. It does not come from the dashboard endpoint.

The turnover chart cards keep their headers visible and render fixed-height
skeletons in both chart content areas while the analytics query is loading.
The donut card keeps its Include Future Events checkbox mounted and operable
during loading; only the donut visualization is replaced by its skeleton.

## Static placeholder behaviour

The charts are currently presentation placeholders, not backend reporting:

- The bar chart has fixed Jan-Dec values
  `[100,150,180,240,270,200,250,100,90,330,360,400]` and formats them as EUR.
- The donut has a fixed total of `3239` and one fixed segment; only its currency
  symbol comes from user preferences.
- `includeFuture` changes local checkbox state but does not refetch or alter data.
- The year dropdown has no active selection/filter effect.

Tests must not imply these controls or charts are API-driven. Any change that
makes them functional is a business change and must update this file.

## API contract

| Method | Browser path | Effect |
| --- | --- | --- |
| GET | `/api/etr/events/dashboard` | Fetch `mine` and `everyone` event groups for cards. |

Calendar and event analytics reuse dashboard UI/chart primitives. A shared-prop
change must check those consumers.

## Test anchors

- Permission visibility for each navigation/create action.
- Array normalization and empty/error/loading card states.
- UTC greeting/date behaviour.
- Explicitly assert current static/no-op chart controls until real contracts are
  introduced.

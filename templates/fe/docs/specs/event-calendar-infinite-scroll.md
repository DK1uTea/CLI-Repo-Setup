# Event and Calendar Infinite Scroll

## Goal

Replace the Events list's numbered pagination with infinite scrolling and keep the
Calendar list on the same infinite-query contract.

## Scope

- Events list data hook and list rendering.
- Calendar list infinite-scroll behaviour and regression coverage.
- Event filter URL state affected by removing numbered pages.
- Unit/component tests for fetching, grouping, loading, and end-of-list behaviour.

## Behaviour

- [ECI-01] Events fetch page 1 initially and fetch the next page when the bottom sentinel
  enters the viewport and the API reports `hasNextPage`.
- [ECI-02] Events do not request another page while a next-page request is already running
  or after the final page has been reached.
- [ECI-03] Events from all fetched pages render in order, and month groups split across page
  boundaries are combined without losing events.
- [ECI-04] Changing any Event filter creates a fresh infinite query starting at page 1.
- [ECI-05] The Events list no longer renders numbered pagination or stores `page` in its URL
  filter state; an existing `page` query parameter is ignored.
- [ECI-06] The Event `limit` and Calendar `take` controls remain available and define the
  number of records requested per infinite-scroll batch.
- [ECI-07] Events and Calendar show their existing initial loading and empty states, and show
  a bottom loading indicator only while another page is being fetched.
- [ECI-08] Calendar continues to fetch and merge paginated API results through
  `useInfiniteQuery`, including month groups split across pages.

## Technical Contract

- `useEventListData` uses TanStack `useInfiniteQuery` with `initialPageParam: 1`.
- `getNextPageParam` returns `pagination.page + 1` only when
  `pagination.hasNextPage === true`.
- API arrays are guarded before iteration. Missing/invalid page data falls back to an empty
  group list and does not crash rendering.
- The shared `useInfiniteScroll` observer drives both list sentinels.
- Query invalidation keys remain `['event-list']` and `['calendar-list']`.

## Files Expected to Change

- Events list hook, filters, main/results components, and tests.
- The obsolete Events pagination component and its test are removed.
- Calendar tests or small rendering adjustments only where needed to enforce the shared
  behaviour; its existing infinite-query implementation remains the baseline.
- Events and Calendar `CONTEXT.md` files are updated to record the list-loading contract.

## Verification

- Targeted Vitest tests pass for Event and Calendar list hooks/components.
- `pnpm typecheck` passes.
- `pnpm lint` reports no new errors or warnings.
- Browser verification confirms that scrolling loads subsequent results without duplicate
  month headings and that changing filters restarts from page 1.

## Out of Scope

- API endpoint or response-shape changes.
- Virtualized rendering.
- Changing the available batch-size options.

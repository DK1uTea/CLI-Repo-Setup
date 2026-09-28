# Spec: Saved Filter Save Button State

## Objective

Prevent users from saving an unchanged filter configuration. Reset remains available so
users can explicitly restore defaults.

## Assumptions

- "Save button" and "Reset button" mean the two inner actions in the Save Filter popover.
  The outer **Save Filter** trigger remains enabled so the inner action state is visible.
- The requested screens are `/calendar-dashboard` (`CalendarListMain`), the Calendar tab on
  `/events` (`EventCalendarToolbar`), and the Event List tab (`EventListMain`). Each screen
  has its own distinct preference key: `EVENT_CALENDAR_LIST` for `/calendar-dashboard`,
  `EVENT_NAVIGATOR_CALENDAR` for the Event Navigator's Calendar tab, and
  `EVENT_NAVIGATOR_LIST` for its List tab. (These were previously two shared keys,
  `EVENT_CALENDAR`/`EVENT_LIST`, with `/calendar-dashboard` and the Calendar tab colliding
  on the same `EVENT_CALENDAR` key — renamed 2026-09-10.)
- Filter equality is semantic: missing and empty optional values are equivalent, and array
  filter order does not count as a change.

## Scope

- In scope: saved-snapshot comparison, Save and Reset disabled states, cache update after
  Save/Reset, and regression tests for all three surfaces.
- Out of scope: filter API payload changes, new translations, changing Reset behaviour, or
  changing how saved filters are initially applied to the URL.

## UX / Behaviour

- The Save action is disabled when current filters equal the saved preference.
- The Save action becomes enabled when any current filter differs from the saved preference.
- Reset remains enabled whenever no mutation is pending.
- A successful Save immediately establishes the submitted payload as the new saved snapshot.
- A successful Reset establishes `DEFAULT_SAVED_FILTERS` as the saved snapshot and updates the
  URL to those defaults.

## Data and Architecture

- Keep `GET/PUT /api/etr/user-filter-preferences/{screen}` unchanged.
- Store the successful mutation payload in the TanStack Query cache instead of removing the
  active preference query, so every consumer compares against the latest saved snapshot.
- Add a pure semantic equality helper beside the existing filter normalization helpers.
- Keep the disabled state on the existing native `Button`; no new ARIA strings are needed.

## Testing Strategy

- Unit-test semantic equality, including array-order and empty/missing equivalence.
- Component-test the Save action before changes, after changes, after Save, and after Reset.
- Cover the Event List and both calendar payload mappings through focused tests around the
  shared Save Filter component.

## Success Criteria

- Save and Reset cannot be activated for an unchanged saved payload.
- Changing one filter enables both actions.
- Saving or resetting disables both actions without requiring a page reload.
- `pnpm test`, `pnpm typecheck`, and `pnpm lint` introduce no new failures.

## Open Questions

- None.

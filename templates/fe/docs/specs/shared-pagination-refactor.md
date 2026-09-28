# Spec: Shared Pagination Refactor

## Objective

Replace feature-owned pagination compositions with one controlled shared Pagination
component. The default numbered presentation matches the supplied desktop reference, and
an optional compact variant matches the supplied condensed reference.

## Assumptions

- `variant="numbered"` is the default; `variant="compact"` is opt-in.
- Pagination owns page navigation only. Page-size selectors remain feature-owned.
- Existing consumers continue to own URL state and data fetching through `onPageChange`.
- The shared component uses buttons because every current consumer handles navigation with
  callbacks rather than meaningful page URLs.

## Scope

- In scope: shared page-range generation, numbered and compact presentations, localized
  accessible names, boundary states, component showcase, and migration of current consumers.
- Out of scope: API contracts, query-state behavior, page-size options, and feature business
  rules.

## UX / Behaviour

- [PAG-01] Numbered pagination is the default presentation.
- [PAG-02] Numbered pagination shows first, previous, page, next, and last controls.
- [PAG-03] Numbered pagination keeps five adjacent page numbers visible at either boundary
  and three around the current page in the middle, separated from the first and last page by
  ellipses when needed.
- [PAG-04] Compact pagination shows previous, the current page followed by localized
  `of total`, and next.
- [PAG-05] Navigation controls call `onPageChange` with the requested valid page.
- [PAG-06] Controls that would move outside the available page range are disabled.
- [PAG-07] Pagination does not render when there is one or fewer pages.
- [PAG-08] Every control has a localized accessible name and the selected page exposes
  `aria-current="page"`.

## Architecture

- `src/shared/components/ui/pagination.tsx` becomes the controlled shared component.
- A small shared helper owns the numbered page range so it can be unit-tested directly.
- Existing feature wrappers retain page-size selectors and pass their page state into the
  shared component.
- The component showcase renders both variants.
- Shared pagination messages are added to both `src/messages/en.json` and
  `src/messages/de.json`.

## Testing Strategy

- Unit-test page ranges for short, leading, middle, and trailing positions.
- Component-test both variants, boundary disabled states, callback results, hidden state,
  accessible names, and `aria-current` using real locale messages.
- Run the affected component tests followed by the full unit suite, typecheck, lint, and
  production build.
- Browser-verify both locales and themes, keyboard operation, visible focus, and a clean
  console.

## Boundaries

- Always: TDD each behavior, use semantic theme tokens, keep EN and DE messages in sync,
  preserve existing feature state ownership.
- Ask first: new dependencies or a change to page/query semantics.
- Never: hardcode user-facing labels in JSX, use fake `href="#"` links, remove keyboard
  focus, or alter unrelated worktree changes.

## Success Criteria

- All behaviours PAG-01 through PAG-08 are covered by tests.
- Current consumers use the shared controlled API without duplicated page-range logic.
- The component showcase demonstrates both variants.
- Required verification commands pass and browser verification finds no accessibility or
  console regressions.

## Open Questions

None. The implementation plan and assumptions were approved before this spec was written.

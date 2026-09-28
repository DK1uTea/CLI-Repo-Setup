# Public policy feature context

This file is the business source of truth for `src/features/policy`.

## Scope and routing

The dynamic public route is `/[locale]/[policy]`. Supported slugs are:

- `privacy-policy`
- `support`
- `impressum`
- `datenschutz`
- `agb`

The page validates the slug and calls `notFound()` for anything outside this
set. These routes are also listed as public in `src/proxy.ts`, so they do not
require a session. The copyright footer chooses policy links from the current
pathname.

## Content behaviour

Policy content is hardcoded in
`src/features/policy/(helpers)/policy-content-map.ts`; it is not loaded from a
CMS or API. Rendering is handled by `policy-main.tsx`,
`policy-copyright.tsx`, and `forward-button.tsx`. There are no mutations,
TanStack Query keys, or API side effects.

Adding, removing, or renaming a policy requires synchronizing:

1. The supported slug/content map.
2. `PUBLIC_ROUTES` in `src/proxy.ts`.
3. All navigation/copyright mappings that expose the policy.
4. Both `en.json` and `de.json` for translated UI labels.

Policy body changes must be reviewed as legal/content changes; agents must not
invent missing policy language.

## Test anchors

- Every supported slug renders its mapped content without authentication.
- Unsupported slugs return not found.
- Footer links resolve to valid locale-prefixed public routes.
- There are no accidental API calls for static policy rendering.

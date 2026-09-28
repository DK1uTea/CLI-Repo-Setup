# Module: <name>

> Copy this file to `docs/specs/<module-name>.md` and fill it in. `<module-name>` must match
> the route segment and the `e2e/modules/<module-name>/` folder, so `pnpm test:e2e <module-name>`
> filters to exactly this module.
>
> This document is the **input** an agent turns into test cases. Every bullet under
> "Behaviour" becomes one test name, verbatim. If a bullet cannot be turned into a test, it
> is not a requirement yet — sharpen it.

## Route

| | |
|---|---|
| Path | `/de/<module-name>` |
| Sidebar label (German) | `<the exact text a user clicks>` |
| Behind auth | yes / no |
| Permission-gated | which `navbarKeys` / permission keys, or "no" |

## Purpose

One or two sentences: who uses this module and what they accomplish here.

## Data

| Endpoint | Method | Used for |
|---|---|---|
| `/api/...` | GET | ... |

- Nullable relations: ...
- List fields that can come back as `{}` instead of `[]`: ...

## Behaviour

Each bullet becomes one test. Write them as statements of fact about what the user
observes — present tense, no "should".

### Journey (`flow.spec.ts`)
- Signs in, lands on the dashboard, then opens the module from the sidebar
- Sends an unauthenticated visitor to login instead
- ...

### Content (`content.spec.ts`)
- Renders <the specific thing> for <the specific state>
- Shows the empty state when the list is empty
- ...

### Validation (`validation.spec.ts`) — only if the module has a form
- Rejects <input> with <exact message the user sees>
- Does not send the request when the form is invalid
- ...

### Errors (`errors.spec.ts`) — only if the module has server error branches
- Shows <exact message> inline when the API returns `<ERROR_CODE>`
- ...

### Routing (`routing.spec.ts`) — only if the module has guards or deep links
- Keeps <state> in the URL so it can be deep-linked
- ...

## Out of Scope

What this module deliberately does **not** do. As important as the list above — it stops
an agent inventing tests for behaviour nobody asked for.

## Open Questions

Anything the agent must not guess at. A question left here blocks the affected test, not
the whole module.

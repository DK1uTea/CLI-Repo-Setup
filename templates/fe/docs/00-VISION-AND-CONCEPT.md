# 00 — Vision and Concept

## Stack Snapshot

> **Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS v4 · shadcn (radix-nova) · TanStack Query v5 · react-hook-form v7 · Zod v4 · next-intl v4 · nuqs v2 · Zustand v5**

---

## What MEP Dashboard Is

MEP Dashboard is a **multi-tenant, multi-locale enterprise dashboard** designed for the **Marketing Experience Platform (MEP)**. The frontend is a pure **Client-Side Rendered (CSR) SPA** embedded inside Next.js App Router, giving teams:

- **Tenant theming** — Each tenant ships its own CSS token set (brand colors, typography, radius) without touching component logic.
- **Locale-first routing** — Every URL carries an explicit locale prefix (`/de/…`, `/en/…`). Locale is the single source of truth for language, and the system can redirect users to their preferred locale automatically after login.
- **URL-as-state** — All filter, pagination, and search state lives in the URL, making every view deep-linkable and shareable with no extra effort.
- **Direct data layer** — Feature hooks call the backend directly via TanStack Query + Axios; there is no code-generation step between a hook and the API it calls.
- **Consistent error contract** — Every backend error carries a stable `error_code`; the frontend resolves it to a translated message through the `errors` namespace in `messages/en.json` / `de.json`, so error copy is never hand-typed at the call site.
- **Design system agnostic pages** — Pages and features only consume semantic color tokens and shared primitives, so swapping a tenant theme requires zero component changes.

## Core Principles

| Principle | Implementation |
|---|---|
| Logic in hooks, rendering in components | Components contain only JSX; all business logic lives in custom hooks |
| Single source of truth for URL state | nuqs `useQueryStates` — never `useState` for filters/pagination |
| Hooks own their API calls | No service indirection — a hook's fetcher calls `apiProxy` directly |
| Max 200 lines per file | Enforced via code review and skill guidance |
| Dark-mode safe by default | Semantic color tokens only — no `.dark:` overrides in component files |
| React Compiler on | No manual `useMemo`, `useCallback`, or `memo` anywhere |

---

*Next: `01-ARCHITECTURE.md`.*

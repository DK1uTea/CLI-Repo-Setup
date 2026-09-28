# Spec: Event Common Data Flow

## Objective

Move Event Detail and Calendar Event Detail API access behind TanStack Query hooks, and
convert the Documents controls into one validated React Hook Form without changing the
backend contract.

## Assumptions

- `POST /api/etr/event-tasks` continues to require `eventId` and `service`; `comment` and
  `files` remain optional at the API boundary.
- Comment submit creates a comment-only task and does not upload or clear selected files.
- Save uploads selected files to the `event` folder and includes a trimmed comment only
  when present.
- Existing interceptor-driven error toasts remain the error-reporting mechanism.

## Scope

- In scope: Event Common tasks, comments, ownership transfer, query-key invalidation,
  Documents form validation, and removal of direct runtime service calls from components.
- Out of scope: backend payload changes, visual redesign, permission changes, and changes
  to the standalone event comments API contract.

## UX / Behaviour

- Comment submit requires a service and a non-blank comment.
- Comment submit creates a task without files and preserves selected files and service on success.
- Save requires a service and at least one uploadable file.
- Save uploads files to the event folder and creates a task with file URLs and an optional trimmed comment.
- Failed uploads or mutations preserve the entered form values.
- Successful task mutations refresh the current event's task list through query invalidation.
- Successful comment mutations refresh the current event's comments through query invalidation.
- Successful ownership transfer refreshes the affected event detail data.

## Data and Architecture

- Components consume query/mutation hooks and do not call runtime service functions.
- Resource query-key factories are colocated with their hooks and reused for invalidation.
- Cursor comments use `useInfiniteQuery`; paged tasks use `useQuery`.
- The Documents schema uses a submit-mode discriminant so each button validates its own
  requirements while sharing one form.

## Testing Strategy

- Unit: Documents discriminated validation and comment tree helpers.
- Component/hook: submit modes, payloads, preserved/reset values, and query invalidation.
- Browser: both submit paths, validation errors, both locales, and clean console.

## Boundaries

- Follow the repository TDD, accessibility, i18n, defensive API, and reporting rules.
- Do not add dependencies or change backend endpoints.

## Success Criteria

- No Event/Calendar component directly calls a function from `event-common-service.ts`.
- Documents uses React Hook Form with schema-driven action-specific validation.
- `refreshToken` is removed and successful mutations refresh query-backed lists.
- Targeted tests, full tests, typecheck, lint, build, and browser verification succeed.

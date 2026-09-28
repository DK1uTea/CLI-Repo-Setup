# Module: reporting-tool (Trade Fair)

> Test-case specification for the complete Trade Fair workspace. Every item under
> **Behaviour** is a durable test name. E2E tests use the real backend; no `page.route()`.

## Route

| | |
| --- | --- |
| Paths | `/{locale}/reporting-tool`, `/{locale}/reporting-tool/select-event`, `/{locale}/reporting-tool/new-event`, `/{locale}/reporting-tool/update-event?id=...`, `/{locale}/reporting-tool/new-survey`, `/{locale}/reporting-tool/update-survey?id=...`, `/{locale}/reporting-tool/event-detail`, `/{locale}/reporting-tool/report`, `/{locale}/reporting-tool/lead`, `/{locale}/reporting-tool/recent-activity` |
| Sidebar label | `Event-Berichtstool` |
| Behind auth | Yes |
| Permission-gated | `ReportingTool.Management` + `ReportingTool.Manager` |

## Purpose

Trade Fair managers create and launch events, build and assign surveys, invite a field
team, inspect answers and leads, and review event analytics in one event-scoped workspace.

## Assumptions

- “Trade Fair module” means the complete `src/features/reporting-tool` feature and route,
  not only the event creation form.
- `eventId` is the shared workspace context and is preserved across all workspace tabs.
- E2E assertions support both `de` and `en`; the locale is read from the page URL after the
  account/session locale rewrite rather than assumed from the requested URL.
- Tests may create uniquely named draft records, but must clean up only records they create.
- The local browser can receive an S3 presigned URL but cannot complete the subsequent S3 PUT.
  Therefore the create-event happy path requires an upload-capable environment; local E2E must
  cover the upload-failure boundary and assert that event persistence does not start.
- CAM source, tests, docs, environment configuration, and E2E files are outside this scope.

## Data

| Endpoint family | Used for |
| --- | --- |
| `/api/tf/events`, `/locations`, `/events/presigned-urls` | Event selection, create/update, delete, attachments, launch |
| `/api/tf/surveys`, `/events/{id}/assign-surveys`, `/surveys/{id}/duplicate`, `/event-surveys/{id}/required-login` | Survey library, builder, assignment, duplication, no-login toggle |
| `/api/tf/users`, `/invite-link` | Team assignment, roles, removal, import, invitations |
| `/api/tf/dashboard` | Event overview and recent activity |
| `/api/tf/answers`, `/answer/export` | Reports, answer deletion, and answer export |
| `/api/tf/leads`, `/lead/export` | Leads and lead export |
| `/api/tf/analytics` | Stats and lead timeline |

- `attachments`, `surveys`, steps, groups, questions, answers, leads, and activities may
  arrive as non-arrays and must degrade to an empty state without crashing.
- Event location and other nested relations may be `null` despite static API types.

## Behaviour

### Journey (`flow.spec.ts`)

- [TF-F-01] Signs in through the real login form and opens Event-Berichtstool from the sidebar.
- [TF-F-02] Selects an event and opens the dashboard with its eventId in the workspace URL.
- [TF-F-03] Creates a draft event through General Information, keeps its returned id in the wizard URL, and shows the new event in Select event.
- [TF-F-04] Assigns at least one survey before advancing from the Survey step.
- [TF-F-05] Adds or imports event-survey users, changes an assigned user role, and removes an assigned user.
- [TF-F-06] Launches a valid draft event from Review and returns to the event workspace.
- [TF-F-07] Creates a survey with a step, group, and question and assigns it to the current event.
- [TF-F-08] Previews a survey locally without sending an answer mutation.
- [TF-F-09] Opens Reports, filters answers, and opens one answer detail.
- [TF-F-10] Opens Leads, filters leads, and opens one lead detail.
- [TF-F-11] Edits a draft event from the workspace and persists the updated General Information.

### Content (`content.spec.ts`)

- [TF-C-01] Maps event attachments and UTC dates into editable General Information values.
- [TF-C-02] Treats a non-array attachment response as an empty image list.
- [TF-C-03] Leaves location fields empty when an event has no location relation.
- [TF-C-04] Shows event, survey, report, lead, activity, and analytics empty states for empty responses.
- [TF-C-05] Keeps eventId while switching dashboard, survey-builder, reports, leads, and analytics tabs.
- [TF-C-06] Sends answer export with eventId and optional selected answer ids only.
- [TF-C-07] Sends lead export with event, keyword, status:eq filter, and current sort.
- [TF-C-08] Omits disabled survey groups and questions from preview values and submission.
- [TF-C-09] Uses PROMOTER for a no-login invite and defaults maximum uses to 100.
- [TF-C-10] Accepts one xlsx, xls, or csv team import and rejects unsupported files.
- [TF-C-11] Deletes an event through confirmation and returns to select-event.
- [TF-C-12] Deletes an answer through confirmation and removes it from the reports list.
- [TF-C-13] Duplicates a survey into an independent, separately editable library entry.
- [TF-C-14] Toggles no-login access per assigned survey and reflects the change immediately without reloading the tab.
- [TF-C-15] Forces a created invite's role to PROMOTER when the survey's no-login toggle is off, regardless of the role selected in the invite dialog.
- [TF-C-16] Renders and paginates the recent-activity page independently of the dashboard activity widget.
- [TF-C-17] Renders event-detail route content, including the same delete-event action available from the workspace tabs.
- [TF-C-18] Renders Select event cards with title, event type, status, date range, and View details action.
- [TF-C-19] Searches Select event by full, partial, case-insensitive, trimmed, and special-character input; clearing restores the list.
- [TF-C-20] Renders Create event General Info with a generated Event ID, step navigation, and footer actions.
- [TF-C-21] Allows optional General Info values to remain empty when advancing after required values are provided.
- [TF-C-22] Returns from a new event to Select event without creating a record.
- [TF-C-23] Allows multiple surveys and preserves them when returning from Assign Team.
- [TF-C-24] Shows the survey action menu and closes it without changing selection.
- [TF-C-25] Renders the selected event banner with real metadata and edit/change navigation.
- [TF-C-26] Changes the selected event and refreshes the dashboard banner and event-scoped context.
- [TF-C-27] Renders all four dashboard stat cards with real values, comparison percentages and zero-safe output.
- [TF-C-28] Opens an active draft event with the complete dashboard workspace navigation.
- [TF-C-29] Returns to the same event dashboard when Create event is cancelled from the workspace.
- [TF-C-30] Renders event-scoped recent activities in newest-first order and opens the full activity list.
- [TF-C-31] Renders the recent-activity empty state when an event has no activity.
- [TF-C-32] Renders the event-scoped Survey Builder and preserves eventId when opening Create new survey.
- [TF-C-33] Opens and closes Assign users with an empty user table for a new event survey.
- [TF-C-34] Opens the survey library action menu, previews a survey, and cancels delete safely.
- [TF-C-35] Toggles an assigned survey between private and public states with confirmation.
- [TF-C-36] Verifies Share link, Import users, and Add user dialogs with a real upload.
- [TF-C-37] Adds a library survey to the event and can unassign it again.
- [TF-C-38] Opens and copies the public link for a public event survey.
- [TF-C-39] Duplicates a library survey and deletes the duplicate successfully.
- [TF-C-40] Renders the default survey structure, validates the name, and saves a new step.
- [TF-C-41] Renders answer columns and real answer data, supports status/search/sort filters, exports a real file, and opens the selected answer detail; renders the empty state when the event has no answers.
- [TF-C-42] Renders lead columns and real lead data, supports status/search/sort filters, exports a real file, and opens the selected lead detail; renders the empty state when the event has no leads.

### Validation (`validation.spec.ts`)

- [TF-V-01] Rejects an event id outside the EVENT-digits format and sends no event mutation.
- [TF-V-02] Rejects missing required event title, type, image, dates, or address, while allowing empty mode, audience, description, and participation.
- [TF-V-03] Rejects an event end date-time at or before its start date-time.
- [TF-V-04] Rejects the Survey step with no selected survey.
- [TF-V-05] Rejects a survey with no name, no group in a step, or no question in a group.
- [TF-V-06] Rejects a CHECKBOX_GROUP without groups and options.
- [TF-V-07] Rejects duplicate CHECKBOX_GROUP option values across all groups.
- [TF-V-08] Validates required dynamic email, phone, yes-no, rating, choice, number, date, and text answers.
- [TF-V-09] Applies dynamic number minimum and maximum metadata and rating bounds one through five.
- [TF-V-10] Rejects an assigned user with a missing name, invalid email, or unsupported role.

### Errors (`errors.spec.ts`)

- [TF-E-01] Keeps the current event step and entered values when create or update fails.
- [TF-E-02] Stops event persistence when presigning or uploading an attachment fails.
- [TF-E-03] Keeps survey creation successful and shows a warning when auto-assignment fails.
- [TF-E-04] Keeps the desired survey list unchanged when assign-surveys fails.
- [TF-E-05] Keeps export controls usable after an answer or lead export error.
- [TF-E-06] Keeps the event, answer, survey, or assigned-user list unchanged when its delete, duplicate, or required-login toggle request fails.

### Routing (`routing.spec.ts`)

- [TF-R-01] Redirects an unauthenticated visitor from every reporting-tool route to login.
- [TF-R-02] Redirects the workspace to select-event when eventId is absent.
- [TF-R-03] Denies the module without ReportingTool Management and Manager permissions.
- [TF-R-06] Blocks a direct event dashboard URL and does not request event stats for a denied user.
- [TF-R-04] Preserves eventId and the active tab in a deep-linked workspace URL.
- [TF-R-05] Uses the first valid wizard step when the requested step is missing or invalid.

### Accessibility (`a11y.spec.ts`)

- [TF-A-01] Has no non-exempt axe violations on event selection and every workspace tab.
- [TF-A-02] Has no non-exempt axe violations on event and survey wizard steps.
- [TF-A-03] Gives every form control and icon-only action an accessible name.
- [TF-A-04] Links validation feedback to its invalid control and announces the error.
- [TF-A-05] Supports keyboard operation for tabs, wizards, dialogs, pickers, uploads, and menus.
- [TF-A-06] Keeps the browser console clean through the critical event and survey journeys.

## Test Strategy

- Unit: event schema/mapper, survey schema/mappers, dynamic preview schema/defaults,
  option helpers, assigned-user schema, and the delete/duplicate/toggle mutation hooks
  behind TF-C-11..15 (request shape and cache invalidation, mocked API — see
  `tests/features/reporting-tool/(hooks)/use-delete-event.test.tsx` and its siblings).
- Component: wizard step gating, empty states, query/export state, and mutation errors.
- E2E: one real-backend event draft journey, one survey journey, workspace navigation,
  permissions, routing, accessibility, and console health.

## Out of Scope

- CAM and all CAM-owned files.
- Pixel snapshots, Tailwind class assertions, backend calculation correctness, and
  destructive verification against records not created by the current test.

## Open Questions

1. ~~Which real account has both required Reporting Tool permissions...~~ Confirmed live
   (2026-07-31): the primary `E2E_USER_*` account already carries both
   `ReportingTool.Management` and `ReportingTool.Manager` — no dedicated account needed.
   `E2E_CAM_SALE_*` (a CAM-only role account) has neither permission and is reused as the
   denial fixture for TF-R-03.
2. May a launched test event be deleted, or must launch verification use a provisioned
   disposable record/reset endpoint? TF-C-11's delete-event coverage should use a test's own
   draft record either way, never a real/shared launched event.
3. Which reproducible backend states provide upload, assignment, export, delete, duplicate,
   and required-login-toggle error branches (TF-E-01 through TF-E-06)?

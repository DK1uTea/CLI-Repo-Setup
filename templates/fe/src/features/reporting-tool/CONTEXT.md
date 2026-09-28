# Reporting tool feature context

This file is the business/API source of truth for
`src/features/reporting-tool`. Read it before changing trade-fair events,
surveys, assignments, reports, leads, or analytics.

## Scope and routes

The workspace route is `/[locale]/reporting-tool?eventId=...&tab=...`, with tabs
`dashboard`, `survey-builder`, `reports`, `leads`, and `analytics`. Related routes:
`select-event`, `new-event`, `update-event?id=...`, `new-survey`,
`update-survey?id=...`, `event-detail`, `report?answerId=...`, `lead?leadId=...`,
and `recent-activity`.

Submodules: event selection/overview/detail/form, survey builder/form/preview,
assignment, answers, leads, analytics, and recent activity. `eventId` is the
shared workspace context and must be preserved by `TabsUrl`.

Every reporting-tool route requires `ReportingTool.Management` +
`ReportingTool.Manager`. The workspace server route redirects to
`select-event` when `eventId` is absent.

## Runtime flows

### Workspace

```text
GET /api/tf/events
  -> select event
  -> /reporting-tool?eventId={id}
  -> dashboard: stats + activities
  -> survey-builder: event surveys + assignment
  -> reports: answers
  -> leads: lead list
  -> analytics: stats + timeline
```

### Trade-fair event wizard

```text
general-info -> locations + presigned image URLs + direct file uploads
  -> POST event (draft) or PUT event/{id}
survey -> GET survey library -> POST assign-surveys
assign-team -> add/import users, role changes, invite links
review -> PATCH event/{id}/launch
```

`use-trade-fair-event-form.ts` owns form/step state; submit orchestration is in
`use-submit-trade-fair-event.ts`. `id` in the URL selects create/update.

General information requires a non-empty Event ID with no format restriction,
title, event type, at least one image, dates, and location; Event mode, Target
Audience, Description, and Participation are optional. End must be after start.
A survey selection is required before
advancing the survey step. Create always starts as `DRAFT`; launch is a separate
PATCH. Saving a draft persists the current step.
Changing Trade Fair Event steps with dirty form values opens the Unsaved Changes
dialog. Save & Leave submits the current General Info or Survey step before
navigating; Leave without saving restores the last persisted form baseline.
Sidebar navigation never submits automatically when the form is clean.

### Survey wizard and preview

```text
RHF steps -> groups -> questions
  -> local IDs for drag/edit
  -> POST/PUT survey
  -> optional assign users/invite
  -> preview dynamic field renderer and preview Zustand store
```

When adding a question type, update schema, default config, picker, editor,
preview renderer and API mapping.

Survey rules:

- A survey needs a name and steps. Each step needs at least one group; each group
  needs at least one question.
- Questions contain content, type, position, required, and disabled state.
  Disabled groups/questions are omitted from submission.
- `CHECKBOX_GROUP` requires groups/options and option values must be unique
  across all groups.
- Dynamic validation covers email, phone, required yes/no boolean, rating 1-5,
  single/dropdown choice, required multi-choice arrays, number min/max metadata,
  date, and text. Toggle defaults to false and is optional.
- The default survey includes fixed German “General Information” questions.
- Adding a new survey step creates one editable group with one default
  `SHORT_TEXT` question so the new step is structurally saveable.
- Preview is client-only, performs no submit API call, and appends a virtual
  review step.
- Creating a survey may auto-assign it to the current event with
  `requiredLogin: true`. If assignment fails, survey creation remains successful
  and shows a warning.
- Leaving the editable Survey step with dirty values, either through page
  navigation or the step sidebar, opens the Unsaved Changes dialog. Save & Leave
  submits the survey before navigating; Leave without saving restores the last
  persisted form baseline. The guard must activate again after subsequent edits.

Assignment rules:

- `assign-surveys` receives the complete desired survey list, so assign and
  unassign both resend the whole list.
- An invite with `requiredLogin: false` forces role `PROMOTER`; otherwise it uses
  the selected role. Default maximum uses is 100.
- The private Share link dialog initializes the selectable role to `PROMOTER`;
  the public link has no selectable role and also uses `PROMOTER`.
- User import accepts one `.xlsx`, `.xls`, or `.csv` file.

## API flow inventory

### Events, dashboard and files

| Method | Browser path | Purpose |
| --- | --- | --- |
| GET | `/api/tf/events` | Select/list events |
| GET | `/api/tf/events/{eventId}` | Event detail/context |
| POST | `/api/tf/events` | Create event/draft |
| PUT | `/api/tf/events/{eventId}` | Update event/draft |
| DELETE | `/api/tf/events/{eventId}` | Delete event |
| PATCH | `/api/tf/events/{eventId}/launch` | Launch draft |
| GET | `/api/tf/locations` | Location search |
| POST | `/api/tf/events/presigned-urls` | Presign attachments |
| PUT | `{presignedUrl}` | Upload attachment |
| GET | `/api/tf/dashboard/stats` | Event overview stats |
| GET | `/api/tf/dashboard/activities` | Event overview activities |

### Surveys and assignment

| Method | Browser path | Purpose |
| --- | --- | --- |
| GET | `/api/tf/surveys/event/{eventId}` | Event/library surveys |
| GET | `/api/tf/surveys/{surveyId}` | Survey detail |
| POST | `/api/tf/surveys` | Create survey |
| PUT | `/api/tf/surveys/{surveyId}` | Update survey |
| DELETE | `/api/tf/surveys/{surveyId}` | Delete survey |
| POST | `/api/tf/surveys/{surveyId}/duplicate` | Duplicate survey |
| POST | `/api/tf/events/{eventId}/assign-surveys` | Replace desired list with `{surveys:[{surveyId,requiredLogin}]}` |
| PATCH | `/api/tf/event-surveys/{eventSurveyId}/required-login` | Send `{requiredLogin}` and refresh survey/event detail |
| GET | `/api/tf/users/event-survey/{eventSurveyId}` | Assigned users |
| POST | `/api/tf/users/assign-survey/{eventSurveyId}` | Add assigned user |
| POST | `/api/tf/users/import-users/{eventSurveyId}` | Import users |
| DELETE | `/api/tf/users/remove-event-assignment/{assignmentId}` | Remove assignment |
| POST | `/api/tf/users/change-roles/{eventId}` | Send `{users:[{id,role}]}` |
| GET | `/api/tf/invite-link/event-survey/{eventSurveyId}` | Invite links |
| POST | `/api/tf/invite-link/event-survey/{eventSurveyId}` | Create with `{role,maxUses}` |

### Answers, leads and analytics

| Method | Browser path | Purpose |
| --- | --- | --- |
| GET | `/api/tf/answers` | Answer list |
| GET | `/api/tf/answers/{answerId}` | Answer/report detail |
| DELETE | `/api/tf/answers/{answerId}` | Delete answer |
| GET | `/api/tf/answer/export` | Export answers blob; disabled until triggered |
| GET | `/api/tf/leads` | Lead list |
| GET | `/api/tf/leads/{leadId}` | Lead detail |
| GET | `/api/tf/lead/export` | Export leads blob; disabled until triggered |
| GET | `/api/tf/analytics/stats` | Analytics stats |
| GET | `/api/tf/analytics/timeline` | Lead timeline |

## State, cache and dependencies

URL state includes `eventId`, `id`, tab, step, search, page, filters and sort.
Creating an event from an event dashboard carries `returnEventId`; cancelling
the create form returns to that dashboard without creating a record.
Query families include `trade-fair-event-list`, `trade-fair-event-detail`,
`trade-fair-locations`, `trade-fair-event-stats`, `trade-fair-event-activity`,
`trade-fair-survey-list`, `trade-fair-survey-detail`,
`trade-fair-user-event-survey`, `trade-fair-invite-link-list`,
`trade-fair-answers-list`, `trade-fair-answer-detail`,
`trade-fair-answer-export`, `trade-fair-leads-list`, `trade-fair-lead-detail`,
`trade-fair-lead-export`, and analytics keys.

Exports use disabled queries and run only on user action. Assignment mutations
invalidate user/event lists; invite creation also updates invite-link cache.
General event info reuses an events feature component, so changes there are
cross-module.

Answer and lead lists default to page 1, limit 5, `updatedAt:desc`; keyword,
status, or sort changes reset page. Both list status filters use
`status:{value}`. Answer export sends `eventId` and optional selected `ids`
only. Lead export sends event, search, sort, and uses
`status:eq:{value}`. Recent activity comes from `/dashboard/activities`.
The select-event list keeps the events API's offset `page`/`limit` contract but
loads and appends successive pages automatically with infinite scroll.
Overview and analytics stat changes always show an explicit sign: negative
values use `-`, while zero and positive values use `+` (for example, `+0%`).
Overview stat values use the active UI locale for thousands separators.
The analytics lead timeline keeps its empty chart, a `0`-to-`5` Y-axis, and
zero totals visible when the timeline endpoint returns no points.
Activity avatars in the overview and recent-activity page derive their initials
from the activity actor's name, not from the activity type.

## Change checklist

For event changes update schema, defaults, detail mapper, create/update payload,
review card and attachment mapping. For survey types update form, preview,
validation, answer detail and export expectations. Test draft -> update -> launch,
survey create -> assign -> preview, and filtered answer/lead export flows.

# Customer activation (CAM) feature context

This is the business/API source of truth for `src/features/cam`; read it before
changing workflow, roles, statuses, scoring, feedback, chat, or notifications.

## Scope and routes

- `/[locale]/customer-activation`
- `/[locale]/customer-activation/new-activation`
- `/[locale]/customer-activation/update-activation?activation_id=...`
- `/[locale]/customer-activation/[id]`
- `/[locale]/customer-activation/store/[id]`

Submodules: `activation-view` (admin/role-specific board), `activation-form`
(two-step store + activation wizard), `activation-detail` (detail tabs/drawers),
and `notification` (in-app list, actions, SSE). Shared CAM hooks include
presigned upload and status/evaluation badges.

## Permission split

`activation-view-main.tsx` reads `useUserStore.permissions`:

- wildcard or `CustomerActivation.InternalAdmin`: admin dashboard, intake board,
  and admin store views;
- Sale, PrintingAgency, or InstallerAgency: other-role board;
- otherwise: forbidden view.

This is a rendering guard only; backend authorization still applies.

- Main route relies on the component permission split above.
- New/update activation permits wildcard, `CustomerActivation.InternalAdmin`,
  or `CustomerActivation.Sale`.
- Activation detail (`/[id]`) requires `CustomerActivation.InternalAdmin`.
- The role-board detail drawer exposes Activity to wildcard, Internal Admin,
  Printing Agency, and Installer Agency permissions; Sale users see Overview,
  Briefing, and Communication without Activity. Briefing is hidden for Printing
  Agency and Installer Agency permissions (they see Overview, Activity, and Communication).
- Store detail has no additional route-level component guard.

## Status workflow

Known statuses are `DRAFT`, `READY`, `REVIEW`, `CLARIFICATION`, `APPROVED`,
`IN_PROGRESS`, `INSTALLATION`, `COMPLETED`, and `CANCELLED`. Cancelled records
are hidden from the board.

```text
DRAFT -> READY -> REVIEW -> APPROVED -> IN_PROGRESS
      -> INSTALLATION -> COMPLETED
```

- Admin dashboard quick advance intentionally has no `REVIEW -> APPROVED`
  action; approval is produced by evaluation.
- Intake-board quick advance blocks `REVIEW -> APPROVED` when the activation
  evaluation score is missing or not greater than zero; no status request is
  sent, an error toast is shown, and the admin is taken to that activation's
  Scoring tab. A positive score moves directly to `APPROVED`.
- Detail approval follows the same score gate from every tab: a positive
  evaluation score moves directly to `APPROVED`; a missing or nonpositive
  score opens Scoring, where the completed form can be submitted.
- Detail footer allows admin `DRAFT -> READY`; `READY -> REVIEW`; admin review
  or clarification can request changes or approve; Sale can return clarification
  feedback.
- Submitting `POST /api/cam/evaluations` automatically transitions the
  activation to `APPROVED` (confirmed business rule).
- Requesting a change must finish in `CLARIFICATION`; returning feedback must
  finish in `REVIEW` (confirmed business rules).
- Current implementation gap: request-change explicitly PATCHes
  `CLARIFICATION` after optional feedback creation, but the return-feedback
  branch only closes the drawer and does not PATCH `REVIEW`.
- Scoring is read-only for `APPROVED`, `IN_PROGRESS`, `INSTALLATION`, and
  `COMPLETED`. Completed/cancelled records expose no detail-footer transition.

## Runtime flows

```text
step=1: list/search/create/edit store
  -> GET store list/detail
  -> POST or PUT store
step=2: activation data
  -> GET presigned upload URLs
  -> PUT media directly to object storage
  -> POST activation or PUT activation/{id}
  -> admin: /customer-activation?tab=intakeBoard
  -> other role: /customer-activation
```

`step`, `activation_id`, store mode and edit flags are URL state (`nuqs`).
When updating an activation, selecting a different existing store replaces the
activation's original store in both the `storeId` URL state and the step 2 store
summary/submission data.

Store validation requires name, address, contact name, valid phone, and valid
email. Backend duplicate codes `PHONE_ALREADY_EXISTS` and
`EMAIL_ALREADY_EXISTS` are surfaced on the matching fields.
The edit-store form resets from Store Detail when asynchronous or refreshed
detail data arrives, rather than retaining empty or stale initial form values.
Store Detail uses the global query freshness window, so reopening edit while
the cached detail is still fresh reuses it without a second API call.
Successful store creation and updates show a localized success toast.
After successful store creation in the activation flow, the new store is selected
automatically and the form advances to step 2 (activation data).
Adding activation media or receiving a new chat message invalidates the grouped
board and admin-list queries so their file and comment counters refresh while the
board remains mounted.

Activation validation requires name, responsible person, at least one outlet,
and a HTZ selection (step 2 questions 1-3); target group, sales concept,
contract situation, revenue potential, AH-market, H-market, brand fit, and
profitability (questions 4-11) are all optional. Notes are limited to 150
characters. AH/A-market and media values are also mapped.

The `aMarket` field (question 9, currently displayed as "AH Market"/"AH-Markt"
in the FE label-swap hotfix — see below) keeps its 5 fixed checkbox options
unchanged; a separate free-text `aMarketNotes` field lets the user add a
value outside that list, rendered as a small input next to the checkboxes
(`h-markt-input.tsx`) and shown in the read-only briefing summary
(`activation-detail-briefing.tsx`) appended after the mapped option labels,
the same pattern as every other `*Notes` field. `ahMarket` (question 8, "AH
Market" content but the field is still literally the AH-market field) has no
such notes field — its own option list already includes a "Your idea" entry
instead.

Uploads are combined for presigning, uploaded directly, then sliced back into
their payload fields. Admin users return to `tab=intakeBoard`; other roles
return to the CAM main page.

FE label-swap hotfix (BE keys unchanged pending a BE rename): question 8's
title ("AH-Markt"/"ahMarketTitle", bound to field `ahMarket`) now displays as
"H-Markt", and question 9's title ("H-Markt"/"hMarktTitle", bound to field
`aMarket`) now displays as "AH Market"/"AH-Markt" — in `activationForm.step2`,
`activationView.drawer.addAttachmentDialog`, and
`activationView.drawer.briefing`. `activationView.scoring`'s equivalent
titles were never swapped because that namespace already matched the target
labeling. Revert this swap once the backend field names are corrected to
match.

```text
admin dashboard -> stats + paged activation list
intake board -> grouped activations + status mutation
store tab -> admin store list/detail/activations + single/bulk status actions
activation detail -> overview, briefing, scoring, activity, communication
drawers -> participants/contacts and feedback
```

### Realtime communication

Chat is Socket.IO, not REST:

- URL `${NEXT_PUBLIC_API_BASE_URL}/chat`, path `/cam/socket.io`;
- auth/query contains `activationId` and access token;
- emits `cam:chat:send`, `cam:chat:edit`, `cam:chat:load-more`,
  `cam:chat:jump-to-message`;
- listens for history, message, edited, jump result and errors.

Chat messages keep a single HTML `content` string. That HTML may contain up to five
attachments of at most 10 MiB each: JPEG, PNG, GIF, WebP, PDF, Word (`doc`/`docx`) and
Excel (`xls`/`xlsx`). Pending attachments are uploaded through the CAM presigned URL flow
before the socket send/edit event is emitted; local blob URLs are never emitted. Received
images support lightbox preview and download, while received documents download when
activated. Pending composer attachments only support removal.

Notification SSE is a direct authenticated fetch to
`${NEXT_PUBLIC_API_BASE_URL}/notification/api/{version}/inapp/events`; it
reconnects after eight seconds.

## API flow inventory

### Activation, store and admin

| Method | Browser path | Purpose | Source |
| --- | --- | --- | --- |
| GET | `/api/cam/stores` | Store list/options | `activation-form/(hooks)/use-store-list.ts` |
| GET | `/api/cam/stores/{id}` | Store detail | `use-store-detail.ts` |
| POST | `/api/cam/stores` | Create validated store record | `use-create-store.ts` |
| PUT | `/api/cam/stores/{id}` | Update store | `use-update-store.ts` |
| GET | `/api/cam/activations/presigned-upload-url` | Presign media | `use-activation-media-upload.ts`, shared `use-presigned-upload.ts` |
| PUT | `{presignedUrl}` | Upload media object | upload hooks |
| POST | `/api/cam/activations` | Create mapped store/activation/media DTO | `activation-form/(services)/activation-service.ts` |
| GET | `/api/cam/activations/{id}` | Load activation | form/view/detail hooks |
| PUT | `/api/cam/activations/{id}` | Update activation record | `use-update-activation-record.ts` |
| PATCH | `/api/cam/activations/{id}/status` | Change workflow status with `{status}` | `use-update-activation-status.ts` |
| GET | `/api/cam/activations/grouped` | Grouped board data; sorting uses `sortBy` with `NAME_ASC` or `NAME_DESC` | `use-get-activations-group.ts` |
| GET | `/api/cam/activations-admin` | Admin activation list; sorting uses the `sortBy` query parameter | `use-activation-admin-list.ts` |
| GET | `/api/cam/activations-admin/stats` | Admin stats | `use-activation-admin-stats.ts` |
| GET | `/api/cam/stores-admin` | Admin store list; sorting uses the `sortBy` query parameter | `use-admin-store-list.ts` |
| GET | `/api/cam/stores-admin/{id}` | Admin store detail | `use-admin-store-detail.ts` |
| GET | `/api/cam/stores-admin/{storeId}/activations` | Store activations; sorting uses the `sortBy` query parameter | `use-admin-store-activations.ts` |
| PUT | `/api/cam/stores-admin/{id}` | Admin store edit | `use-admin-store-actions.ts` |
| POST | `/api/cam/stores-admin/{id}/active` | Activate store after confirmation in the admin list/card or detail | same hook |
| POST | `/api/cam/stores-admin/{id}/inactive` | Deactivate store after confirmation in the admin list/card or detail | same hook |
| POST | `/api/cam/stores-admin/bulk/active` | Bulk activate | `use-admin-store-bulk-actions.ts` |
| POST | `/api/cam/stores-admin/bulk/inactive` | Bulk deactivate | same hook |

### Detail, participants, contacts, scoring and feedback

| Method | Browser path | Purpose |
| --- | --- | --- |
| GET | `/api/cam/activities?activationId=...` | Activity timeline |
| PATCH | `/api/cam/activations/{id}/media` | Attach uploaded media |
| GET | `/api/cam/activations/participants` | Participant list |
| POST | `/api/cam/activations-admin/{id}/add-participants` | Add `{userIds}` |
| DELETE | `/api/cam/activations-admin/{id}/remove-participant` | Remove with body `{userId}` |
| GET | `/api/cam/users` | Search CAM users |
| GET | `/api/cam/contacts` | Contact list; owner contacts cannot be edited or deleted |
| GET | `/api/cam/contacts/lookup` | Duplicate/contact lookup |
| GET | `/api/cam/contacts/{id}` | Contact detail |
| POST | `/api/cam/contacts` | Add/invite contact |
| PUT | `/api/cam/contacts/{id}` | Update contact |
| DELETE | `/api/cam/contacts/{id}?activationId=...` | Delete contact |
| POST | `/api/cam/contacts/{id}/resend-email` | Resend contact invite |
| GET | `/api/cam/evaluations/{activationId}` | Evaluation detail |
| POST | `/api/cam/evaluations` | Send `{activationId,maxScore,scores}`; auto-set `APPROVED` |
| GET | `/api/cam/feedbacks?activationId=...` | Feedback list |
| POST | `/api/cam/feedbacks` | Send activation/reason/type and `resolved:false`; request-change then PATCHes status |
| PATCH | `/api/cam/feedbacks/{id}/resolve` | Resolve feedback |
| PATCH | `/api/cam/feedbacks/{id}/unresolve` | Reopen feedback |
| DELETE | `/api/cam/feedbacks/{id}` | Delete feedback |
| POST | `/api/cam/activations/{id}/subscribe` | Subscribe |
| DELETE | `/api/cam/activations/{id}/unsubscribe` | Unsubscribe |
| GET | `{attachment.path}` | Download/display attachment |

### In-app notification

| Method/transport | Browser path | Purpose |
| --- | --- | --- |
| GET | `/api/notification/inapp` | Notification list |
| PATCH | `/api/notification/inapp/{id}/read` | Mark one read |
| PATCH | `/api/notification/inapp/read-all` | Mark all read |
| SSE | direct notification backend `/inapp/events` | Push notification events |

## State and cache

Query families include `cam-activation-detail`, `cam-activation-admin-list`,
`cam-activation-admin-stats`, `cam-activations-grouped`, `cam-stores`,
`cam-store-detail`, `cam-admin-stores`, `cam-admin-store-detail`,
`cam-admin-store-activations`, `cam-activation-participants`,
`cam-contact-detail`, `cam-evaluation`, `cam-activation-feedbacks`,
`cam-activation-activity`, and `notification-list`.

Mutations invalidate both list and detail families; participant mutations use a
predicate to cover paged and infinite queries. Drawer state is URL-addressable. Opening FeedbackDrawer automatically refetches the `cam-activation-feedbacks` query to ensure fresh feedback reasons and comments.
Evaluation submission invalidates the activation detail, evaluation, and grouped-board
queries so returning from full detail after auto-approval does not reuse the pre-scoring
board cache.
Updating an activation also invalidates its `cam-activation-contacts` query so
reopening the Participants drawer fetches current contact data.
Contacts and grouped activation views render their existing skeletons during a
full refetch instead of briefly showing stale cached data; contact pagination
keeps the current list visible while loading the next page.
Scoring validation uses a local Zustand store; chat state is owned by the socket
hook.

An evaluation requires all nine categories; its maximum is their maxima sum.
Notification clicks depend on whether the user is in admin page or drawer context.

## Change checklist

For a new activation field update schema, defaults, detail mapper, create DTO,
update DTO and review UI. For uploads test presign order, object upload and final
URL mapping. For realtime changes test cleanup on activation change, reconnect,
deduplication and expired-token behavior. Status tests must cover evaluation
auto-approval and the confirmed request-change transition.

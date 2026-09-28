# Module: CAM (Customer Activation)

> Module-wide test contract for `src/features/cam`. The public route segment and E2E folder
> remain `customer-activation`; this document intentionally uses the shorter `cam.md` name
> requested by the team. Every checked item under **Behaviour** is an E2E test name.
> All E2E cases use the real backend; `page.route()` mocking is forbidden.

## Route

| | |
| --- | --- |
| Main | `/{locale}/customer-activation` |
| Create | `/{locale}/customer-activation/new-activation` |
| Update | `/{locale}/customer-activation/update-activation?activation_id=<id>&step=<step>` |
| Activation detail | `/{locale}/customer-activation/<id>` |
| Store detail | `/{locale}/customer-activation/store/<id>` |
| Sidebar label | Locale-dependent (`Kundenaktivierung` / `Customer Activation`) |
| Behind auth | Yes |
| Main permission split | `CustomerActivation.InternalAdmin`, `CustomerActivation.Sale`, `CustomerActivation.PrintingAgency`, `CustomerActivation.InstallerAgency`, or wildcard |
| Create/update | wildcard, `CustomerActivation.InternalAdmin`, or `CustomerActivation.Sale` |
| Full activation detail | `CustomerActivation.InternalAdmin` |

## Purpose

CAM manages customer activations from store selection and briefing through admin review,
scoring, fulfilment and completion. Internal admins operate dashboards, intake queues,
stores and full activation details; sales and agency roles work from a role-specific board
and open activation details in a URL-addressable drawer.

## Test data and role fixtures

- Use unique store and activation names for every create journey.
- Clean up every created record through a supported real backend action. Do not invent or
  mock a delete endpoint when cleanup is unavailable.
- The primary `E2E_USER_*` account is the Internal Admin-equivalent account. Dedicated role
  accounts are configured by `E2E_CAM_SALE_*`, `E2E_CAM_INSTALLER_*` and `E2E_CAM_AGENCY_*`
  for Sale, Installer Agency and Printing Agency respectively. Each account must have a
  locale preference (German or English) and the expected navbar row.
- Provision activation records for every workflow status: `DRAFT`, `READY`, `REVIEW`,
  `CLARIFICATION`, `APPROVED`, `IN_PROGRESS`, `INSTALLATION`, `COMPLETED`, `CANCELLED`.
- Provision one activation with full briefing/media, participants, contacts, feedback,
  evaluation, activity and chat history; one with nullable relations and empty collections;
  and one subscribed activation.
- Provision active and inactive stores, plus enough records to exercise pagination and
  bulk actions.
- Supply upload fixtures for JPEG, PNG, GIF, WebP, PDF, DOC, DOCX, XLS and XLSX, plus SVG,
  executable, oversized and duplicate-filename fixtures for rejection/edge cases.

## Data

### Activation, store and admin

| Endpoint | Method | Used for |
| --- | --- | --- |
| `/api/cam/stores` | GET | Store list/search |
| `/api/cam/stores/{id}` | GET | Store detail and edit hydration |
| `/api/cam/stores` | POST | Create store |
| `/api/cam/stores/{id}` | PUT | Update store |
| `/api/cam/activations/presigned-upload-url` | GET | Presign activation and chat media |
| `{presignedUrl}` | PUT | Upload media directly to object storage |
| `/api/cam/activations` | POST | Create activation |
| `/api/cam/activations/{id}` | GET | Hydrate form, board drawer and full detail |
| `/api/cam/activations/{id}` | PUT | Update activation |
| `/api/cam/activations/{id}/status` | PATCH | Move workflow status with `{status}` |
| `/api/cam/activations/grouped` | GET | Role board grouped by status |
| `/api/cam/activations-admin` | GET | Admin activation list |
| `/api/cam/activations-admin/stats` | GET | Admin statistics |
| `/api/cam/stores-admin` | GET | Admin store list |
| `/api/cam/stores-admin/{id}` | GET / PUT | Admin store detail and edit |
| `/api/cam/stores-admin/{id}/active` | POST | Activate one store |
| `/api/cam/stores-admin/{id}/inactive` | POST | Deactivate one store |
| `/api/cam/stores-admin/bulk/active` | POST | Activate selected stores |
| `/api/cam/stores-admin/bulk/inactive` | POST | Deactivate selected stores |
| `/api/cam/stores-admin/{storeId}/activations` | GET | Store activation list |

### Detail, collaboration and notifications

| Endpoint / transport | Method | Used for |
| --- | --- | --- |
| `/api/cam/activities?activationId=<id>` | GET | Activity timeline |
| `/api/cam/activations/{id}/media` | PATCH | Add activation attachment |
| `/api/cam/activations/participants` | GET | Participant list |
| `/api/cam/activations-admin/{id}/add-participants` | POST | Add participants |
| `/api/cam/activations-admin/{id}/remove-participant` | DELETE | Remove participant |
| `/api/cam/users` | GET | Search CAM users |
| `/api/cam/contacts` | GET / POST | List and add external contacts |
| `/api/cam/contacts/lookup` | GET | Detect existing contact |
| `/api/cam/contacts/{id}` | GET / PUT | Read or edit contact |
| `/api/cam/contacts/{id}?activationId=<id>` | DELETE | Delete contact |
| `/api/cam/contacts/{id}/resend-email` | POST | Resend contact invitation |
| `/api/cam/evaluations/{activationId}` | GET | Evaluation detail |
| `/api/cam/evaluations` | POST | Submit all nine scores and auto-approve |
| `/api/cam/feedbacks?activationId=<id>` | GET | Feedback list |
| `/api/cam/feedbacks` | POST | Create reason/comment |
| `/api/cam/feedbacks/{id}/resolve` | PATCH | Resolve feedback |
| `/api/cam/feedbacks/{id}/unresolve` | PATCH | Reopen feedback |
| `/api/cam/feedbacks/{id}` | DELETE | Delete feedback |
| `/api/cam/activations/{id}/subscribe` | POST | Subscribe to activation |
| `/api/cam/activations/{id}/unsubscribe` | DELETE | Unsubscribe |
| `/api/notification/inapp` | GET | Notification list |
| `/api/notification/inapp/{id}/read` | PATCH | Mark one notification read |
| `/api/notification/inapp/read-all` | PATCH | Mark all notifications read |
| notification backend `/inapp/events` | SSE | Receive notification events |
| `${NEXT_PUBLIC_API_BASE_URL}/chat` with path `/cam/socket.io` | Socket.IO | Chat history, send, edit, pagination and jump |

### Query cache contract

- A successful scoring submission invalidates `cam-activation-detail`, `cam-evaluation`,
  and `cam-activations-grouped`. Returning from full activation detail to the intake board
  must therefore fetch the updated `APPROVED` status instead of reusing the pre-scoring cache.

### Contract guards

- API list fields can return `{}` instead of `[]`; list rendering must not throw.
- Nested store, evaluation, sender, parent, feedback and media relations can be `null`.
- Admin list/store filters and the role board all use URL state and `sortBy`; the role
  board's keyword filter uses `keyword` (`sortBy` defaults to `NAME_ASC`).
- Cancelled activations are hidden from the role board.
- Chat content stays one sanitized HTML string; local `blob:` URLs never reach Socket.IO.

## Behaviour

### Journey (`flow.spec.ts`)

#### Entry and role split

- [CAM-J-01] Signs in through the real login form, lands on Dashboards, and opens Customer Activation from the sidebar in the active locale.
- [CAM-J-02] Renders Dashboard, Eingang and Stores tabs for an Internal Admin account.
- [CAM-J-03] Renders the grouped activation board instead of admin tabs for a Sale account.
- [CAM-J-04] Renders the grouped activation board for Printing Agency and Installer Agency accounts.

#### Create and update activation

- [CAM-J-06] Opens New Activation, selects an existing store and advances from step 1 to step 2 with the selected store ID in the URL.
- [CAM-J-07] Creates a valid store, automatically selects it, and advances to activation data with its returned ID.
- [CAM-J-08] Creates an activation with all required briefing values and both supported media groups, then opens the success dialog.
- [CAM-J-09] Uploads all pending media before POSTing the activation and sends object-storage keys rather than blob or CDN preview URLs.
- [CAM-J-10] Returns Internal Admin to the dashboard tab and returns other roles to the role board after successful creation.
- [CAM-J-11] Opens the created activation from the success dialog in a full detail page for Internal Admin and in a drawer for Sale.
- [CAM-J-12] Opens Update Activation, hydrates its store and briefing, updates data through PUT and preserves already-uploaded media.

#### Workflow and collaboration

- [CAM-J-13] Moves an Internal Admin activation through DRAFT to READY and READY to REVIEW with real status PATCH requests.
- [CAM-J-14] Submits all nine scoring categories in REVIEW and the evaluation response moves the activation to APPROVED.
- [CAM-J-15] Moves an approved activation through IN_PROGRESS, INSTALLATION and COMPLETED.
- [CAM-J-16] Requests changes with optional feedback and finishes in CLARIFICATION.
- [CAM-J-18] Adds and removes a participant through the real participant endpoints.
- [CAM-J-19] Adds, edits, resends and deletes a non-owner contact through the real contact endpoints.
- [CAM-J-20] Subscribes and unsubscribes from an activation and keeps the visible action in sync.
- [CAM-J-21] Sends and edits a chat message through Socket.IO and receives the broadcast content without reload.

### Content (`content.spec.ts`)

#### Admin dashboard and intake board

- [CAM-C-01] Renders admin statistic cards from the stats response and an activation row for every admin-list item.
- [CAM-C-02] Shows the admin activation empty state when a real search returns no matching items.
- [CAM-C-03] Applies activation search, sort, page and page-size state to the URL and admin-list request; filter changes reset page to 1.
- [CAM-C-04] Shows status, owner, file/activity counts and evaluation values defensively when evaluation or timestamps are null.
- [CAM-C-05] Renders intake-board columns from known workflow statuses and omits cancelled activations.
- [CAM-C-06] Applies intake-board keyword and name sort to the URL and grouped request.
- [CAM-C-07] Opens an activation from dashboard/intake data and returns to the originating tab through `backTo`.
- [CAM-C-50] Renders the Admin Dashboard layout, real summary values, activation columns/rows, implementation sort options, tabs, New Activation link, and per-page options.
- [CAM-C-51] Renders the Admin Intake Board columns/counts/cards from grouped data, supports search and name sort, opens New Activation and card detail, and exposes the status-specific action menu without mutating QA data.
- [CAM-C-52] Creates a real Draft activation and advances it through the Intake Board menu, verifies the incomplete-score approval guard, submits real evaluation data, and advances the activation through Completed.
- [CAM-C-53] Creates a Draft as Sales Rep, verifies Sales Rep visibility, verifies Admin cannot see that Draft, then verifies Admin sees it after Sales Rep moves it to Ready.
- [CAM-C-54] Opens Request Change from a real Review activation, submits it through the UI, and verifies the activation finishes in Clarification.
- [CAM-C-55] Adds a real file and chat comment from an open activation drawer and verifies the mounted Intake Board refreshes `fileCount` and `chatCount` without a page reload.

#### Store administration

- [CAM-C-08] Renders active and inactive stores with contact, activation count and last-activity data.
- [CAM-C-09] Applies store search, status, sort, page and page-size state to the URL and store-list request; filter changes reset page to 1.
- [CAM-C-10] Selects one page or individual stores, exposes the selected count and clears selection after a bulk mutation settles.
- [CAM-C-11] Activates and deactivates one store only after confirmation.
- [CAM-C-12] Bulk activates and deactivates the selected stores through the matching real endpoints.
- [CAM-C-13] Opens store detail, renders its activation list and keeps store-activation search, sort and pagination in the URL.
- [CAM-C-14] Edits store name, address and owner contact, then renders the saved backend values.

#### Activation form

- [CAM-C-15] Keeps wizard step, selected store, store mode and activation ID in URL state.
- [CAM-C-16] Renders a safe empty state when a real store search returns no matching items.
- [CAM-C-17] Switches between existing-store, new-store and edit-store modes without losing the selected store.
- [CAM-C-18] Returning from editing the selected store at step 2 restores step 2 and the updated store summary.
- [CAM-C-19] Renders all briefing fields, selection groups, 150-character note counters and AH/A-market media inputs.

#### Activation detail

- [CAM-C-21] Full Internal Admin detail renders Overview, Briefing, Scoring, Activity and Communication tabs.
- [CAM-C-22] Role-board drawer renders Activity for Printing Agency and Installer Agency, while Sale sees Overview, Briefing and Communication without Activity; Briefing is hidden for Printing Agency and Installer Agency, and no role-board drawer exposes Internal Admin Scoring.
- [CAM-C-23] Keeps selected detail tab, drawer state, activation ID, feedback drawer, participants drawer and chat jump target in URL state.
- [CAM-C-24] Overview renders activation identity, store data, status, participants and attached files with null-safe fallbacks.
- [CAM-C-25] Briefing renders all stored selections, notes, outlet count and media without crashing on nullable relations.
- [CAM-C-27] Completed and cancelled activations render no footer mutation action.
- [CAM-C-28] Scoring becomes read-only for APPROVED, IN_PROGRESS, INSTALLATION and COMPLETED.

#### Chat and attachments

- [CAM-C-33] Accepts JPEG, PNG, GIF, WebP, PDF, Word and Excel attachments.
- [CAM-C-34] Rejects unsupported types, files over 10 MiB and selections beyond five while retaining other valid files.
- [CAM-C-35] Shows pending images as square thumbnails and documents as filename/type cards with only a remove action.
- [CAM-C-36] Sends an attachment-only message, blocks mutation/duplicate submit during upload, clears only after every upload and keeps text/attachments on failure.

#### Notifications

- [CAM-C-45] Opens the notification panel and renders its localized title.
- [CAM-C-47] Marks one notification read on activation and marks all notifications read through the real endpoints.

### Validation (`validation.spec.ts`)

#### Store and activation form

- [CAM-V-01] Rejects missing store name, address and contact name and sends no store mutation.
- [CAM-V-02] Rejects invalid contact phone or email and sends no store mutation.
- [CAM-V-03] Rejects missing activation name, responsible CAM or outlet count below 1 and sends no activation mutation.
- [CAM-V-04] Rejects empty HTZ, target group, sales concept, contract situation, revenue potential, profitability, brand fit, AH market or A-market selections.
- [CAM-V-05] Rejects any briefing note longer than 150 characters and sends no activation mutation.
- [CAM-V-06] Blocks activation submit without a selected store ID.

#### Detail, scoring and chat

- [CAM-V-07] Rejects evaluation approval until all nine categories have one selected option and sends no evaluation mutation.

### Errors (`errors.spec.ts`)

- [CAM-E-01] Renders the module maintenance state when the activation detail request is unavailable (for example, a real 404 response).

### Routing (`routing.spec.ts`)

- [CAM-R-01] Redirects unauthenticated visitors from every CAM route to the login page in the active locale.
- [CAM-R-02] Hides or denies create/update without wildcard, Internal Admin or Sale permission.
- [CAM-R-03] Denies full activation detail without Internal Admin permission.
- [CAM-R-04] Renders only the role-specific main view selected by loaded permissions.
- [CAM-R-05] Uses dashboard as the default valid admin tab and preserves a deep-linked admin tab.
- [CAM-R-06] Uses step 1 when activation-form step is missing or invalid and preserves valid step/store/activation parameters.
- [CAM-R-07] Prevents update step 2 from rendering until its real activation detail has loaded.
- [CAM-R-08] Closing activation, feedback or participants drawers removes only their owned URL parameters.
- [CAM-R-09] Preserves `backTo` when full detail navigates back to its originating admin tab.

### Accessibility (`a11y.spec.ts`)

- [CAM-A-01] Has no axe violations on admin dashboard, intake board, store tab and role board with loaded data.
- [CAM-A-02] Has no axe violations on both activation-form steps, full detail and every opened drawer/dialog.
- [CAM-A-03] Has no axe violations with store, activation, scoring and contact validation errors visible.
- [CAM-A-04] Exposes every search, sort, pagination, tab, form, upload, drawer, dialog and mutation control with an accessible name.
- [CAM-A-05] Links each validation error to its invalid control with aria-describedby, aria-invalid and an alert node.
- [CAM-A-06] Supports keyboard navigation and activation for boards, tables, wizard, detail tabs, scoring, participants, feedback, chat, attachments and notifications.
- [CAM-A-07] Keeps browser console clean in German and English across admin, other-role, form and detail journeys.

## Chat attachment contract

- Supported: JPEG, PNG, GIF, WebP, PDF, DOC, DOCX, XLS and XLSX.
- Limit: five attachments per message, 10 MiB per attachment.
- Pending attachments support removal only; received images support lightbox preview and
  download; received documents support download.
- Socket payload remains `content: string`; attachment metadata is escaped into sanitized
  HTML and includes CDN URL, original filename and MIME type.
- Existing image-only messages remain editable. SVG, video, audio, archives and executables
  remain unsupported. PDF/Office files have no in-app document preview.

## Out of Scope

- Backend authorization and calculation correctness beyond verifying the client request and
  visible response binding.
- Pixel comparison, Tailwind class assertions and tenant color-contrast testing.
- Drag-and-drop chat upload, per-byte progress, individual attachment retry, document
  preview and lightbox download controls.
- Creating backend-only states by mocking responses. Locked roles, exact workflow statuses,
  errors and notification types require dedicated real accounts/data.
- Changing the Socket.IO payload, backend endpoint contract or status graph.

## Open Questions

1. Which activation/store IDs provide every required status and populated/nullable detail
   state, and may E2E mutate/reset them?
2. What supported real cleanup operation removes a store or activation created by E2E?
3. Which backend conditions reproducibly produce list, store, activation, upload, status,
   evaluation, collaboration, socket and notification failures?
4. Is `/customer-activation/store/<id>` intentionally missing a route-level CAM permission
   guard, or should routing tests pin a denial?
5. Live observation is currently blocked because `/api/auth/login` returns HTTP 200 with
   envelope status 500. Re-run browser discovery after the backend/auth environment recovers.

## Success criteria

- Every behaviour above has a durable E2E case, or a clearly skipped case naming its missing
  dedicated real account/data prerequisite.
- Unit/component tests cover pure schemas, mappers, status/scoring constants, socket state,
  attachment serialization/parsing and interactive edge cases below the E2E tier.
- `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build` and
  `pnpm test:e2e customer-activation` report their actual results.
- Browser verification covers German and English, light and dark themes, keyboard use,
  console/network health and axe scans when the real authenticated environment is available.

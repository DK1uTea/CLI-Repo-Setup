# Events feature context

This is the business/API source of truth for `src/features/events`. Read and
update it with every event behaviour or contract change.

## Coverage, scope, and permissions

Static audit on 2026-07-29 found 40 network callsites in this feature: every
`apiProxy` call plus direct object-storage upload. Routes:

- `/[locale]/events`: list/calendar/analytics/address workspace; requires
  `Event.Management` or at least one of `Event.List.Draft`,
  `Event.List.Active`, or `Event.List.Deleted`.
- `/events/new-event`: create; `Event.Management` + `Event.Create`.
- `/events/update-event?eventId=...&step=...`: edit;
  `Event.Management` + `Event.Update`.
- `/events/product-detail?product=...&eventId=...&referer=...&step=...`:
  `Event.Management` + `Event.Product.Detail`.
- `/event-detail/[id]`: `Event.Management` + `Event.Detail`.
- `/calendar-event-detail/[id]`: `Calendar.Management` + `Calendar.List`.

## Create/edit wizard contract

Steps are `overview -> logistics -> product_catalog -> helping_hand -> summary`.
`eventId`, `step`, product filters, and product-detail return context use `nuqs`.
An invalid/missing step renders the first configured step.

| Concern | Create | Edit |
| --- | --- | --- |
| Initial data | Defaults; after Overview returns an ID, `logistics: null` retains Create defaults | `GET /api/etr/events/{id}/detail/{apiStep}` |
| Persist step | Overview POSTs only until it returns an ID; Overview, Logistics, and Helping Hands then use PATCH; Summary is always POST | Overview/logistics/helping-hands use PATCH; Summary uses POST |
| Navigation | Footer Next advances one step after persistence; sidebar allows only the current or an earlier step | Any wizard step is clickable once `eventId` exists |
| Editability | Enabled | Each detail response supplies `canEdit`; `false` locks fields/actions |

The step-detail API accepts Overview, Logistics, Helping Hands, and Summary;
Product Catalog is not a supported detail step. The frontend maps
`helping_hand -> helping-hands`. Query key is
`["event-step-detail", eventId, frontendStep]`, `staleTime: 0`. Product
Catalog has no own detail endpoint. The wizard maps that step to Helping
Hands (`getEventFormDetailStep`) so step 3 still loads
`GET /api/etr/events/{id}/detail/helping-hands` and can read event-level
`general` (`isPrivate`, `canEdit`, status) for the sidebar Public Event
button. The shared cart still comes from the dedicated cart endpoint
(see "Shared cart" below), not from this detail response.
Edit hydration (every other step) keeps dirty values, maps API timestamps as
UTC, and turns existing file URLs into uploaded file objects. Every list field it reads off a detail response goes through an
`Array.isArray` guard (`toArray` / `toUploadedFiles` in `event-form-helpers.ts`),
because the backend returns `{}` rather than `[]` for an empty list on some
endpoints and `{}` is truthy — an unguarded `(x || []).map(...)` threw and took
the whole wizard down instead of hydrating an empty list.
On Overview, the browser calls `GET /api/etr/holidays/deadline` (ETR backend
`GET /etr/api/v1/holidays/deadline`). Response data is `referenceDate`,
`countryCode`, `workingDays`, and required ISO `deadline`. Create defaults all
times to `00:00`. Empty Logistics dates derive from the current Event dates:
Setup start is Event start minus one day but never before the deadline, Setup
end is one day later, Teardown start is Event end plus one day, and Teardown end
is one day later. Values already hydrated from the Logistics API are preserved.
Query cache is reused across Overview and Logistics, not re-fetched on each step
change. No frontend deadline fallback.
Edit hydrates and preserves its detail response; its dates are never replaced.
Missing, invalid, or failed deadline data locks the active date step and Next,
then shows a friendly `eventForm.overview.deadlineUnavailable` toast.
Overview generates `EVENT-10` plus five random digits when the ID is empty.
Changing event/setup/teardown start auto-moves an invalid end one day forward.

Leaving a dirty Overview, Logistics, or Helping Hands step offers to save that
step. Product Catalog and Summary have no per-step save. Back changes only the
URL step; Cancel from Overview goes to `/events`.
Choosing **Leave without saving** synchronously deactivates the dirty-form
navigation guard before replaying the intercepted navigation, so the replay is
not caught by the same guard and the dialog does not immediately reopen. This
shared behaviour also applies to the Calendar event form.

### Active-order reactivate/create-order dialog

`GET /api/etr/event-orders/{eventId}/active-count` (sits outside the wizard's
step-detail contract) returns `{total, haveActive}` and uses `staleTime: 0` so
the cached count is immediately stale. The sidebar
(`use-event-order-cancel-guard.ts`) fetches this whenever an `eventId` exists.
Entering Product Catalog, Helping Hands, or Summary while an active order
exists no longer prompts to cancel it — editing an event never requires
cancelling its order first, so there is no confirm dialog on step entry.

If an ACTIVE event ends up with no active order (`haveActive: false`) for any
other reason — it was cancelled elsewhere, or it never had one — leaving
`update-event` in that state (an anchor click, browser back/forward, or
closing the tab) is intercepted and shows a dialog
(`event-form-order-choice-dialog.tsx`, `use-event-order-reactivate-guard.ts`)
offering **Stay on page**, **Reactivate order**, or **Create new order**.
Reactivate order calls `POST /api/etr/event-orders/{eventId}/reactive`
(`use-reactivate-event-order.ts`). Create new order calls the same
order-creation endpoint the summary step's Submit button uses — `POST
/api/etr/events/{eventId}/summary` (`use-create-event-order.ts`,
`submitEventSummary` in `use-submit-event.ts`) — building a new order from the
event's current cart state server-side. Both actions invalidate the
active-count query, clear the missing-order flag, and resume the navigation
that was intercepted. Both this guard and `use-unsaved-changes.ts` share one
page-level navigation interceptor (`use-navigation-guard.ts`); only one guard
is expected to be active at a time in practice.

This "no order" state is re-derived from the active-count response on every
mount, so reloading the page still blocks leaving it. `useEventOrderCancelGuard`
treats an ACTIVE event (`useEventDetailStore`'s `status === 'ACTIVE'`, populated from the
step-detail response's `general.status` for every step — Product Catalog
included, via its Helping Hands detail fallback) with `canEdit: true` and an
active-count response of `haveActive: false` as needing the
reactivate/create-order dialog, regardless of `total` (confirmed business
rule: this includes an event that has never had an order at all, not only
one that was previously cancelled). A DRAFT event is skipped entirely — it
was never published/ordered, so a missing order there is expected, not a
problem. This check is **not** restricted to any particular step (Product
Catalog, Helping Hands, Summary included) — leaving via "Back to events", a
breadcrumb, the outer app sidebar, or browser back/forward must be blocked
from any step, since `useNavigationGuard` intercepts navigation regardless of
which step the wizard is on. This check fires once per `eventId` so it does
not re-open the dialog immediately after the reactivate/create-order guard
resolves it back to false and the active-count query is still refetching.

`useNavigationGuard` itself tracks active guards in a stack, not a single
shared variable — the update-event page always mounts more than one consumer
at once (this missing-order/reactivate guard in the sidebar, plus a
`useUnsavedChanges` guard in every step component), and an unconditional
"cleanup nulls the shared blocker" let one guard's deactivation silently
un-register a different, still-active guard.

All add-product, cart-quantity, finalize, reactivate, and create-order
mutations treat a rejected API response as recoverable. The UI keeps the last
confirmed local cart/order state, shows the API/fallback error, and refreshes
only the queries for the current surface: Product Catalog refreshes
`products-list`, Helping Hands refreshes `products-helping-hands-list`, Product
Detail refreshes its `event-product-detail` query, and the cart refreshes
`event-products-cart`. Finalize and order-recovery actions additionally refresh
`event-order-active-count`; Summary also refreshes its current step-detail data
when that data is visible. No failure path invalidates unrelated product
surfaces.

A third, separate case: the order still exists (`haveActive: true`) but the
cart itself has since diverged from it — `useCartChangedGuard`
(`use-cart-changed-guard.ts`) activates whenever `hasCartOrderChanges(cart)`
is true (at least one line is new/deleted/changed, see the Shared cart
section below) alongside `haveActive: true` and `canEdit: true`, on **any**
step (not gated to the guarded steps, same reasoning as the missing-order
case above). It shows `event-form-cart-changed-dialog.tsx` — **Leave event**
(discard the divergence and proceed, no API call), **Stay on page**, or
**Create new order** (same `submitEventSummary` call as the other two
guards). Unlike the reactivate/create-order guard, this condition has no
external "resolved" flag to flip `active` off before replaying navigation —
the cart divergence doesn't clear itself just because the user chose to
leave. A one-shot "suppress the next interception" ref was tried first and
is wrong: `use-navigation-guard.ts`'s click interceptor unconditionally
calls `preventDefault()` whenever any guard is still registered, so replaying
navigation while still "active" just gets re-intercepted forever — the
suppress flag only avoided reopening the dialog on the very next call, but
the replay itself (`anchor.click()`) still never reached real navigation,
so the user stayed on the page. The fix is a local `bypassed` boolean
(`use-cart-changed-guard.ts`) that ORs into `active`, flipped via
`flushSync` (same mechanism as the reactivate guard) before replaying — this
genuinely removes the guard from `useNavigationGuard`'s stack first, so the
replayed click is no longer intercepted at all.

The calendar variant never calls `active-count` at all —
`EventFormSidebar` passes `enabled: !isCalendarVariant` into
`useEventOrderCancelGuard`, which only detects a missing active order and skips
`useEventOrderActiveCount` entirely (passes `null`) when disabled. The calendar
variant has only an overview step, with no product/order steps to guard.

### Step 1 — Overview

Sources: `GET /api/etr/holidays/deadline`, `GET /api/etr/event-types`; infinite
location search `GET /api/etr/locations`; partnership options are local constants.

- Required: a non-empty `customEventId`, title, mode, at least one
  target audience, event type, description (max 5,000), participation,
  start/end date+time, venue name/street/ZIP/city, admin first/last name,
  valid admin email/phone, and at least one partnership type.
- Event ID has no format restriction in Event or Calendar forms.
- Modes: `FACE_TO_FACE`, `HYBRID`, `ONLINE`. Participation:
  `NOT_POSSIBLE`, `PERSONAL_INVITATION`, `TICKET_ALLOCATION`.
- Target audiences are the 11 local constants in `event-form-constants.ts`.
- Permanent Loan (`permanent-loan` / Performance Load) is always private:
  the "Do not publish" checkbox is forced on and disabled, and the sidebar
  visibility button is disabled. Selecting Dauerleihgabe also turns "Do not
  publish" on by default, but its checkbox stays enabled and can be turned off.
  Selecting any other event type resets "Do not publish" to off. Other event
  types can then toggle privacy from the checkbox (saved with Overview) or
  immediately via the sidebar button.
- Optional: link, images, saved-location ID, save-address flag, privacy flag,
  and additional contacts. Every added contact requires name, a role from the
  fixed `EVENT_CONTACT_ROLES` enum (`ADMIN`, `ORGANIZER`, `CATERING`,
  `MANAGEMENT`, `ELECTRICIAN`, `TECHNICIAN`, `SERVICE_LEAD` —
  `event-form-constants.ts`, rendered as a `SelectFloat`, sent to the backend as
  `role`), valid email, and valid phone. Admin contact phone and each added
  contact's phone default to `+49` (dial-code only; the shared `zPhone` schema
  blanks a dial-code-only value back to empty, so this is a typing aid, not a
  value that passes as "filled in" by itself).
- Selecting a saved location fills address fields. Editing any address field
  clears `locationId`. An empty saved-location search renders an empty state in
  the Location dropdown. End must be strictly after start. Create cannot select
  a date before the BE deadline (or a past date); edit preserves returned dates.
  Changing either part of the End datetime revalidates the complete Start/End
  range, so a same-day End Time later than Start Time clears any prior End error.
- Partnerships are local: `PRODUCT_PARTNER`, `KEYNOTE_SPEAKER`, `EXHIBITION`,
  `JURY_MEMBER`, `MEDIA_PARTNER`. Product Partner requires at least one of
  `SOFTDRINKS`, `WATER`, `ENERGY`, `HYDRATION`, `ARTD`, `COFFEE`; deselecting it
  clears categories.
- Pending images are presigned/uploaded before the overview request, into the
  `event` presign folder (`uploadFiles(files, 'event')` in
  `use-submit-step-overview.ts`, same folder as Logistics uploads). Any upload
  failure stops submission.

Payload: ID/title/mode/audiences/type/description/participation/link/image keys,
UTC ISO `startTime`/`endTime`, `locationId`, `isSaveAddress`, location object,
admin contact, mapped `otherContacts`, `isPrivate` from `doNotPublish`,
`isCalendarEvent`, partnership types/categories.

- First Overview submit: `POST /api/etr/events/overview`; returned ID replaces URL
  `eventId`. Every later Overview submit, including on `/events/new-event`, uses
  `PATCH /api/etr/events/{eventId}/overview`.
- Known current behaviour: `link` and `images` are omitted from Overview's
  `STEP_FIELDS` trigger. Images are optional; `canEdit=false` disables all
  Overview edits, including image add/remove, so Event edit is view-only.

### Step 2 — Logistics

`GET /api/etr/logistics/filter-config` supplies warehouses and is cached with
infinite stale time; the first warehouse is auto-selected when none exists.
Summary displays `logistics.warehouseName` returned by its step-detail API and
does not fetch filter config to resolve the saved warehouse code.

- Required: warehouse, contact name/email/phone, setup start/end, teardown
  start/end. Both end timestamps must be strictly after their starts. Changing
  either end date/time revalidates its complete range so a corrected timestamp
  clears the previous range error immediately.
- Create Setup defaults from Event Start minus one day; Setup
  and Teardown date pickers do not allow dates before today. Neither Setup nor
  Teardown uses the BE deadline as a date minimum. Both ends must be strictly
  after their starts; range errors are shown on the corresponding Start field.
  If Setup or Teardown overlaps the Event range, the form shows an inline
  warning under the corresponding End field; this warning is informational and
  does not block submission.
- “Different delivery address” adds one address record. Venue/street/ZIP/city
  become required; selecting a saved location fills them, manual edits clear
  its ID. Turning the option off removes delivery records.
- Optional groups: access permits, certifications, event documents, venue
  layouts (UI max 10 each), and rich-text comment.
- Pending files are uploaded group-by-group through the shared presign flow,
  presigned into the `event` folder (`uploadFiles(files, 'event')` in
  `use-submit-step-logistics.ts`), consistently with Overview and Helping Hands.
- Per-group file-type restriction (enforced client-side via `UploadDropzone`'s
  `accept` prop, wired in `logistics-upload-card.tsx` — the file-field cards
  actually rendered by the step; a same-named but unused
  `logistics-files-card.tsx` duplicate existed pre-refactor and has been
  removed): Access Permits is PDF-only; Certifications, Event Documents, and
  Venue Layouts accept JPEG/PNG/WEBP/HEIF/HEIC/GIF images plus PDF, all defined
  in `event-form-constants.ts`. `UploadDropzone`'s preview tile always renders
  via `<img src={file.preview}>`, so a non-image file (a PDF) shows a broken
  thumbnail — a pre-existing display limitation, not something this
  restriction introduces.

Payload: four file-key arrays, contact, `wareHouseCode`, optional comment,
UTC ISO `setupTime`/`teardownTime`, first delivery address only, and its
`isGenerateAddress` mapped to `isSaveAddress`.

- Every Logistics submit, including the first one after Create Overview, uses
  `PATCH /api/etr/events/{id}/logistics`.
- Missing `eventId` blocks submission.

### Shared cart (Product Catalog / Helping Hands / Summary)

The wizard's shared Zustand cart (`useEventCartStore`, `src/features/events/(stores)/use-event-cart-store.ts`)
is hydrated from `GET /api/etr/event-products/cart/{eventId}` (`use-event-products-cart.ts`),
**not** from `productCatalog` on the step-detail response — `mapDetailToFormValues`/
`use-event-form.ts` never touch the cart. `use-sync-event-cart.ts`
(`useSyncEventCart(eventId, currentStep)`, owned by the shared `event-cart-drawer.tsx`)
enables this query only on `product_catalog`, `helping_hand`, and `summary` —
including when a product-detail route is open. Overview and Logistics never
fetch it. Product detail uses the shared event edit state and does not fetch the
legacy product-catalog step detail. While the cart's initial request is loading,
the drawer shows item skeletons instead of its empty state; background refetches
keep the current items visible. Add/remove-to-event mutations
(`use-add-product-to-event.ts` / `use-remove-product-from-event.ts`) invalidate
`['event-products-cart', eventId]` (refills the cart) and `event-step-detail`
(the latter is still needed for `costSummary`, unrelated to the cart itself).
Remove invalidates `products-list`; add leaves the product list cache unchanged
on success. The drawer/summary cart sections also call
`addToCart`/`updateQuantity`/`removeFromCart` directly after a successful
mutation for immediate feedback, on top of the eventual query-driven refill.
When add or quantity-update fails, no local cart write is performed; the
current surface's availability query and the event cart are refreshed instead.
Product Catalog and Helping Hands perform the availability precheck before
add-to-event; Product Detail uses the same check against its detail response.
The one exception is delete: `event-cart-drawer.tsx`'s `handleDelete` skips
the local `removeFromCart` call when the deleted item still has
`actualQuantity > 0` — the backend keeps returning that line (now
`quantity: 0`) in the cart response as long as it's tied to the active
order, so splicing it out immediately just to have the invalidated
`event-products-cart` query's refetch bring it straight back was a visible
vanish-then-reappear flicker. Leaving it in place lets that refetch alone
settle it into the "Deleted" state above. An item with `actualQuantity === 0`
(never ordered) is still spliced out immediately — the backend won't return
it again. `event-detail-rented-products.tsx` (the read-only event-detail
page, outside the wizard) is unrelated — it builds its own local
`CartItem[]` from a different type (`EventCommonProduct`) and never touches
this store.

Each cart item response also carries `actualQuantity` — the quantity of that
product already in the event's active order (0 if none), distinct from
`quantity` (the current cart quantity, which the user is actively editing).
`use-sync-event-cart.ts` drops any line where both are 0 before syncing the
store — nothing in the cart and nothing in the order means nothing to show.
`event-cart-item.tsx` uses the two together to flag the item's state relative
to its order: `actualQuantity === 0` (added to the cart but no order
created/updated yet) renders the card with a success border/tint and a "New"
badge; `quantity === 0 && actualQuantity > 0` (still in the active order but
the user removed it from the cart) renders a destructive border/tint, a
"Deleted" badge, and hides the delete icon (there is nothing left in the
cart to delete); `actualQuantity > 0 && quantity > 0` but the two values
differ renders a plain "Changed" (warning-colored) badge with no special
border. Whenever `actualQuantity > 0` (any of the above, or unchanged), an
"Active order: {n} unit(s)" line renders under the product name — always in
`text-destructive`, regardless of which badge state applies (a deliberate
choice: the line itself is a warning that this product carries an existing
order commitment, not a status indicator that should match the badge color).
`getCartItemOrderState`/`hasCartOrderChanges`
(`(helpers)/cart-order-state.ts`) centralize this new/deleted/changed
comparison — both `event-cart-item.tsx` and the cart drawer's Finalize button
(below) read it from the same place. All of this — the badges, the border
tint, and the "Active order" line — is skipped entirely on a DRAFT event
(`useEventDetailStore`'s `status !== 'ACTIVE'`): a DRAFT event was never
published/ordered, so comparing cart quantity against an order that doesn't
exist yet is meaningless, not a New/Deleted/Changed state.

The cart drawer's own footer (`event-cart-footer.tsx`, rendered by
`event-cart-drawer.tsx`) — not the wizard page footer — shows a **Finalize
event** button next to Save & Continue whenever the event is ACTIVE and
`hasCartOrderChanges(cart)` is true (computed in `use-event-form-footer.ts`,
which the drawer already calls for `onNext`/`isPending`) — i.e. at least one
cart line is new/deleted/changed relative to the active order (`CART_STEPS`
in `event-form-helpers.ts` gates this the same way `use-sync-event-cart.ts`
gates its own logic; the `status === 'ACTIVE'` check mirrors the same DRAFT
exemption as the cart-item indicators above).
Clicking it calls the exact same `submitEventSummary` (`POST
/api/etr/events/{eventId}/summary`) that Summary's own Submit button uses
(reusing the label "Finalize event" = `actions.submit`), letting the user
push the current cart into the order
immediately without walking through to Summary, then closes the drawer the
same way Save & Continue does. With no cart changes, only the full-width
Save & Continue button renders — unchanged from before this feature.
Both Finalize event (drawer and Summary footer) and order creation
(`useCreateEventOrder`) validate that the cart is non-empty (`isCartEmpty`,
checking `cart.length === 0` or no positive-quantity lines) and that every
requested line has sufficient stock (`validateCartForOrder`). If the cart is
empty, `productCatalog.errorCartEmpty` blocks submission; if stock is
insufficient, `productCatalog.insufficientStockSingle` / `Multiple` toasts the
issue. If Finalize is rejected after the client precheck, the drawer remains
open, the route does not change, and active-order/cart/visible availability
state is refreshed so the user can adjust and retry.

### Step 3 — Product Catalog

- Loads `GET /api/etr/events/{id}/detail/helping-hands` (step 4) so the
  sidebar can read `general.isPrivate` / `canEdit`. Cart data still comes
  from the dedicated cart endpoint, not this detail response.
- `GET /api/etr/event-products/filter-config` supplies categories/brands.
- `GET /api/etr/event-products` uses event ID, category slug, brand ID, keyword,
  page, limit 9, and default `createdAt:desc`. Filters reset page; search applies
  on Enter. Product cards use the response's `isAvailable` flag for availability,
  display `totalQuantity` and `availableQuantity` directly, and display `0` when
  either quantity field is absent or invalid.
- Product detail calls `GET /api/etr/event-products/{slug}?eventId=...`.
- Product-detail availability uses its dedicated event hook and calls
  `GET /api/etr/event-products/{slug}/calendar-table` with `slug`, `eventId`,
  `month`, and `year`; it stays disabled until both identifiers are present.
- Bundle children are shown with their required quantities inside the shared
  Weight/Length/Width/Height card in the Description tab, matching Rent product
  detail. They are not rendered in the general information shell.
- Product-detail Documents data uses the shared Rent product-detail
  `useProductDocuments(sku)` hook, which calls `GET /api/etr/products/{sku}/attachments`.
  The shared `ProductDocuments` component renders the same grouped shadcn Button download items as Rent.
- Add/update calls `POST /api/etr/event-products/add-to-event` with
  `{eventId, sku, quantity, isRentEntirePeriod}`. Detail add sends existing
  quantity + selected quantity; rental reserve-all controls the boolean. Cart
  and Summary quantity edits send the final quantity with the boolean `true`.
- Remove calls
  `DELETE /api/etr/event-products/remove-from-event/{eventId}/{sku}`.
- Add invalidates the shared cart query and event step-detail family; remove
  additionally invalidates `products-list` (see "Shared cart" above). Product detail Cancel/Save-and-
  Continue only navigate back/forward; the add-to-event call is what persists
  the product.
- No step-level submit endpoint. Next is disabled while the shared cart is empty.
- Product detail's Download PDF action reuses the shared event-detail HTML-to-PDF
  generator. Images are taken from the already-rendered gallery (or the
  same-origin `/_next/image` optimizer) — `/api/proxy-image` is not used.
  Layout matches the legacy product PDF: logo + printed timestamp, 200×160
  image tiles, red dividers, SKU/price, details, dimensions, then bundle
  children. Missing manufacturer/material values (including the mapped `-`
  placeholder) are omitted. Bundle children render as a warning-labelled,
  full-width list with right-aligned quantities. The filename prefers SKU,
  then slug, then product name. Download remains available when the event is
  view-only because it does not mutate the event.

### Step 4 — Helping Hands

- Local helper types are `DROPSHIPPER` and `PROWERB`.
- `GET /api/etr/event-products/helping-hands` uses event ID, helper type,
  keyword, page, limit 9, and default `createdAt:desc`; filters reset page.
- Products use the same product-detail, add/remove endpoints, and shared cart as
  Product Catalog.
- Optional form data: up to 10 assembly/planogram files and rich-text comment.
  New files upload first into the `event` presign folder; payload is `{helpingHandComment?,
  assemblyPlanograms:[keys]}`.
- Every Helping Hands submit uses `PATCH /api/etr/events/{id}/helping-hands`.
- Helping Hands is optional: Next remains available without a Helping Hands
  product. Product Catalog alone requires a non-empty shared cart before Next.
  Current limitation: the cart does not distinguish catalog products from
  helping-hand products.

### Step 5 — Summary and publish

The summary step GET returns overview, logistics, product catalog, helping
hands, location coordinates, and `costSummary`. UI renders the Overview
location's display name rather than its `locationId`, along with event/contact,
logistics, files, cart, cost, and map. The event section displays Participation
directly below Event Name using its translated option label rather than its
stored enum value. Backend cost values win; without them, only
rental/purchase/total are calculated locally. The Logistics section shows the
delivery address (`location.name`, street, city, state, and postal code) only when the
Summary response has `logistics.location`, immediately before the optional
Logistics Comment row; the comment row is omitted when empty.
Cart quantity/remove actions
remain available when editing is allowed.

Submit calls `POST /api/etr/events/{id}/summary`. Confirmed business effect:
publish/activate the event, show success, and route to `/events`. There is no
separate summary payload.

### Event-detail PDF layout

`EventDetailPdfContent` header now renders the CCEP logo (`/images/logo_red.png`)
top-left with the "Overview: {customEventId}" / event name / printed-at block
top-right, red (`#F40009`, the theme's `--primary`) section dividers instead of
gray, and a 2-column table for Setup/Event/Teardown start-end pairs. The cost
breakdown filters out any zero-value line (Rental/Purchase/Services/Transport/
PM) but always renders Total — `showPrice && costs` gates the whole block,
`costRows` is the individual lines after the `> 0` filter. Order details render
as `Order ID : {id|-} - {UPPERCASE status|-}`. The schedule section starts with
`Weight: {totalWeight|0} kg`. Freight Forwarder is not rendered because
`GET .../detail/summary` doesn't return it yet (translation key
`pdf.freightForwarder` remains reserved for when the backend adds it). The off-screen
capture wrapper (`EventCommonPdfContentWrapper`, shared with the Calendar PDF
variant) matches the legacy app's PDF page exactly: white page background and
`40px 48px` outer padding (legacy's 20px wrapper padding plus the content's own
`px-10 py-5`), so content no longer sits flush against the 4 edges.

### Event-detail "Download PDF"

`EventDetailDownloadPdf` (`event-detail/event/(components)/event-detail-download-pdf.tsx`)
reuses the same `GET .../detail/summary` step-detail query to build the PDF,
but via `useEventStepDetail(eventId, 'summary', { enabled })` — it stays
disabled until the user actually clicks "Download PDF", so opening an event's
detail page no longer fires a summary fetch nobody asked for. First click
enables the query and shows the button's loading state; once the summary
resolves, an effect fires the actual `download()`. A second click while the
summary is already cached downloads immediately. The Calendar variant
(`CalendarEventDetailDownloadPdf`) follows the same on-demand summary flow and
renders the same `EventDetailPdfContent`, so both detail pages export the same
header, address, schedule, weight, order, product, and permitted cost content.

## Cross-step actions and upload contract

- Clicking an available step in the event-form sidebar (mobile or desktop,
  including keyboard activation) uses the active navigation guard. If the
  current step has unsaved form changes, its Unsaved Changes dialog must be
  resolved before the requested step navigation proceeds. Save & Leave submits
  the current step and navigates only after success; Leave without saving
  restores the form's last persisted baseline before navigating.
- Presign: `POST /api/etr/uploads/presigned-url` with `{fileName, folder}`
  (`folder` is explicitly `event` for every Events feature upload); response
  supplies presigned URL, key, CDN URL.
- Upload: direct `PUT {presignedUrl}` with the file MIME type. Payloads retain
  the object key/URL; existing API URLs are converted back to file objects.
- Save draft has no separate mark-draft endpoint. It runs the current step's
  own submit (Overview `PATCH .../overview`, Logistics `PATCH .../logistics`,
  Helping Hands `PATCH .../helping-hands`) with the same body as a normal step
  save plus `status: "DRAFT"`, then routes to `/events?status=DRAFT`. It
  requires an existing `eventId` (same as before) and full validation still
  runs before the request fires. Product Catalog and Summary have no per-step
  submit endpoint, so Save as Draft remains enabled there and skips API calls;
  confirming still closes the dialog, shows the success toast, and routes to
  `/events?status=DRAFT` like the other steps.
- Visibility: `PATCH /api/etr/events/{eventId}/visibility` with
  `{ isPrivate }`. **Temporarily disabled** (`event-form-visibility-button.tsx`):
  the confirm-dialog + PATCH flow is commented out (not deleted, meant to be
  restored later) — clicking the button now just calls the same `onNext` the
  Save & Continue footer button uses (`useEventFormFooter('events').onNext`)
  instead of opening `event-form-visibility-dialog.tsx` or touching
  `useEventVisibility`/`doNotPublish`. The label is also temporarily fixed to
  always read **Public event** — it no longer toggles to **Do not publish**
  based on `isPrivate` (that string swap, and the "Do not publish" wording
  itself, only still apply to the Overview step's own checkbox, unrelated to
  this button). `isPrivate`/`aria-pressed` are still computed and unchanged,
  just no longer drive the label. It follows the footer's Next/Finalize action
  from the first create step as well, so it is no longer disabled before an
  `eventId` exists. It is disabled when
  `canEdit` is false, the event type is Permanent Loan, or the footer's own
  submit is pending. Calendar variant still uses its own separate control as
  the calendar submit, not this button — unaffected by this change.
- Duplicate: `POST /api/etr/events/{id}/duplicate`, then open the returned ID in
  update mode. Delete: `DELETE /api/etr/events/{id}`, then `/events`.
- Known state limitation: the Zustand cart has no explicit clear on wizard
  mount/unmount; step-detail hydration replaces it only when product data exists.

## APIs outside the wizard

| Methods and browser paths | Purpose/input |
| --- | --- |
| `GET /api/etr/events` | Paged/filtered event list |
| `GET /api/etr/user-filter-preferences/{screen}` | Saved list/calendar filter prefs. `screen` is `EVENT_NAVIGATOR_LIST` or `EVENT_NAVIGATOR_CALENDAR` (the Event Navigator's own List/Calendar tabs). Response `data.filters` may omit lists or send `{}` — treat non-arrays as `[]`. Query uses `staleTime: 0`, `gcTime: 0`, and `refetchOnMount: "always"`. A successful save stores the submitted normalized filters as the current cache snapshot. |
| `PUT /api/etr/user-filter-preferences/{screen}` | Persist `{ filters }` for that screen. Reset sends `{ timeFrame: "UPCOMING", onlyMine: true }`. |
| `GET /api/etr/events/filter-config` | Event-list filter options. `status` and `timeFrame` labels come back locale-appropriate already — the FE renders `item.label` as-is and must never re-map it through a hardcoded per-value i18n table (a stale mapping is exactly what broke when the backend's `timeFrame` enum changed). Only the FE-only `all` option gets a local i18n key, since it has no backend counterpart. |
| `GET /api/etr/user-filter-preferences/{screen}` | Saved list/calendar filter prefs. `screen` is `EVENT_NAVIGATOR_LIST` or `EVENT_NAVIGATOR_CALENDAR`. Response `data.filters` may omit lists or send `{}` — treat non-arrays as `[]`. |
| `PUT /api/etr/user-filter-preferences/{screen}` | Persist `{ filters }` for that screen. Reset sends `{ timeFrame: "UPCOMING_ASC", onlyMine: true }`. |
| `GET /api/etr/events/export` | Filtered Excel blob |
| `GET /api/etr/events/calendar-table` | Date-range calendar using list filters |
| `GET /api/etr/analytics/stats` | Event analytics |
| `GET /api/etr/locations/list` | Paged/searchable saved-address management list |
| `GET/POST /api/etr/locations` | Form location options/create saved address |
| `PATCH/DELETE /api/etr/locations/{id}` | Update/delete saved address |
| `GET /api/etr/events/{id}`, `/api/etr/calendar/{id}` | Event/calendar detail |
| `GET/POST /api/etr/events/{id}/comments` | Cursor comments; post `{content,parentId?}` |
| `GET/POST /api/etr/event-tasks`; `DELETE /api/etr/event-tasks/{id}` | Paged tasks; create/delete. Each task exposes `canDelete` to gate its delete action. |
| `GET /api/etr/users/ownership-transfer-candidates` | Paged candidate search, enabled only while the ownership-transfer dialog is open |
| `PATCH /api/etr/events/transfer-ownership` | Send `{eventId,userId}` |

Each proof task is one table row: service, every file, and the optional comment stay
together. Files show a dropzone-style icon; images open `MediaLightbox` (download
lives in the lightbox toolbar), other files open in a new tab. The table row has
no separate download control.
Documents Save requires a service and at least one file, then uploads the files and
sends any trimmed comment on the same `POST /api/etr/event-tasks`. The Comment action
requires a service and a non-blank comment and does not upload files. Submitting
either action without a service scrolls the service select into view.
The event-form Summary file section previews image files, keeps other files as document
tiles, and downloads the selected file when either tile is clicked.

The shared event-detail schedule renders six timestamps from the detail
response in three columns: Logistics Setup, Event, and Logistics Teardown.
Each column shows Start above End.
Event detail maps `productPartnerCategories` keys against the local
`PRODUCT_PARTNER` partnership data and displays the matching category labels.
The Event detail Transfer action is available to the event owner or a wildcard
admin (`*`), subject to the component permission guard.

The calendar status filter only offers Active and Draft, and defaults to Active
when the URL has no `status` query parameter.
Switching from the calendar toolbar to Week anchors the visible week on the
current UTC date, and switching to Day opens the current UTC date; Month keeps
the calendar's existing navigation position.

`filters.start_date`/`end_date` on the `EVENT_NAVIGATOR_CALENDAR` screen are reserved
exclusively for an explicit Date-filter range the user picked via
`EventListDateFilter` — FullCalendar's own visible-range callback
(`datesSet`/`handleDatesSet` in `event-calendar-main.tsx`) only updates a local
`calendarRange` state (used to fetch data for whatever the grid currently shows)
and the `view`-date URL param; it never writes into `start_date`/`end_date`.
Fixed 2026-09-09: previously `handleDatesSet` also wrote the visible range into
`start_date`/`end_date`, which fought with the Date filter over the same fields —
every view change/navigation silently overwrote a user-picked range (or made the
Date filter trigger appear "active" from calendar navigation the user never
initiated through the Date filter itself).

Date filter vs. View selector are mutually exclusive, matching the legacy app's
`customRange_GridWeek` pattern: applying a Date range (`from`/`to`) switches
FullCalendar to a registered custom `dayGrid` view (`FC_CUSTOM_RANGE_VIEW` in
`use-event-calendar-view.ts`) whose `duration` is the exact number of Mon-Sun
calendar weeks spanning `[from, to]`, anchored at the Monday of `from`'s week —
so the grid renders exactly the selected weeks, no more. Picking a Month/Week/Day
view while a Date range is active clears `start_date`/`end_date` and applies that
view instead (the two controls are not layered — selecting one drops the other).
Resetting the Date filter clears the range and returns to whatever
Month/Week/Day view was last selected, anchored at today.

The event-list response returns `items` already grouped as
`{month: "YYYY-MM", total, events}`. The frontend formats `month` for display
without reordering its events, and combines groups with the same month when an
API page boundary splits that month across two responses.
When the event wizard is reloaded on a step after Overview with an `eventId`,
the sidebar falls back to that step-detail response's `general` data for the
event name, custom ID, start time, and status. Non-empty form values remain the
preferred source so in-progress edits are reflected immediately. While that
fallback query is loading with no cached detail, the mobile and desktop sidebar
information areas render skeletons instead of flashing the Event Name placeholder.
"Save Filter" on the Event Navigator's List tab uses
`GET/PUT /api/etr/user-filter-preferences/EVENT_NAVIGATOR_LIST`; its Calendar tab uses
`EVENT_NAVIGATOR_CALENDAR`. The standalone Event Calendar module's own list
(`calendar-dashboard`, `CalendarListMain`) uses a third, distinct key,
`EVENT_CALENDAR_LIST` — see `calendar/CONTEXT.md`. These three screens were
previously only two (`EVENT_LIST`/`EVENT_CALENDAR`), and the Event Navigator's
Calendar tab and the standalone Event Calendar module's list both saved/read
under the same `EVENT_CALENDAR` key, so saving a filter on one silently
overwrote the other's saved preferences against the same backend endpoint.
Renamed 2026-09-10 to three distinct keys, one per screen. Save persists the current
URL filters. Reset PUTs
`{ timeFrame: "UPCOMING", onlyMine: true }` and writes those defaults back
to the URL. Saved prefs are applied on first load only when the URL has no
active filters. The list/calendar-table query stays disabled until that
GET finishes and the URL has been synced, so the first fetch already uses
the saved filters. On all saved-filter surfaces, the popover's Save action is disabled while
the current normalized filters equal the cached saved snapshot. Any semantic change enables
Save; array order and missing versus empty arrays do not count as changes. Reset remains
enabled unless a mutation is pending. A successful Save or Reset updates the cached snapshot
without a reload. This behavior applies to all three screens.

The `EVENT_NAVIGATOR_CALENDAR` screen's saved payload (`eventCalendarUrlToSaved`/
`savedToEventCalendarUrl` in `event-list/(helpers)/user-filter-preferences.ts`) is
distinct from the plain `EVENT_NAVIGATOR_LIST` mapping: it additionally persists the
selected calendar `view` (`month`/`week`/`day`, from `useEventCalendarView`), and
deliberately never persists `startDate`/`endDate` — those only ever reflect
whichever date range FullCalendar happened to have on screen at the moment Save
was clicked, so restoring them verbatim reproduced a stale one-day window instead
of the intended view. On load, `EventCalendarMain` derives a fresh date range
from the restored `view` (via `handleDatesSet`) rather than trusting a saved
range. Fixed 2026-09-09: previously the calendar toolbar reused the `EVENT_LIST`
mapping functions, which dropped `view` entirely and saved/restored a stale
`startDate`/`endDate` snapshot instead.

The calendar toolbar's Export to Excel button previously rendered as inert
(no `onClick`, no popover). Fixed 2026-09-09: it now renders `EventListExportFilter`,
the same scope/year export popover and `useExportEventToExcel` hook the list tab uses,
so calendar-tab export behaves identically to the list tab's.

List filters map keyword to search, uppercase status, event type, creator,
timeframe, date range, partnership/target arrays, Product Partner categories to
the dedicated `productPartnerCategories` array, `onlyMine`, batch limit, and
`createdAt:desc`. The list uses `useInfiniteQuery`, starts at API page 1, and
loads the next page from a bottom intersection sentinel while `hasNextPage` is
true. Numbered pagination and the list's URL `page` state are not used; `limit`
controls the infinite-scroll batch size. Month groups split across API pages are
merged before rendering. Array filters are serialized as repeated query keys without
brackets (for example `partnershipTypes=A&partnershipTypes=B`) for both list and
export requests and the calendar-table view. `use-event-calendar-data.ts`'s
`EventCalendarParams` must forward every array/list filter it receives — it
previously omitted `productPartnerCategories` entirely (declared on neither the
params type nor the query params, unlike `partnershipTypes`/`targetAudience`), so
selecting a Product Partner category on the Event Navigator's Calendar tab never
reached `GET /api/etr/events/calendar-table`. Fixed 2026-09-10. Manager choices are loaded lazily from
`GET /api/etr/users/ownership-transfer-candidates` when the manager dropdown opens;
the dropdown fetches subsequent candidate pages as the user scrolls. Export
adds year/yearScope. Comment/file permissions are `Event.Comment`/
`Event.ManageFiles` (calendar detail uses the Calendar equivalents).

Both `CalendarEvent.description` (calendar-table response) and
`EventCommonDetail.shortDescription` (event/calendar-event detail response) can
contain rich HTML from the backend, regardless of which form control captured
it — never render either directly as plain text/children. Fixed 2026-09-09
(previously both showed literal `<p>`/`<strong>` tag source):
- A single-line/truncated context (the Week/Day calendar-cell event label in
  `event-calendar-fc.tsx`) uses `stripHtmlToPlainText` (`@/lib/html-utils`) to
  reduce it to plain text — there's no room to render real formatting there.
- A block/container context (the calendar event-click dialog
  `event-calendar-event-dialog.tsx`, and the event-detail info card
  `event-common-info-card.tsx`) uses the shared `ExpandableHtml` component
  (`@/shared/components/common/expandable-html`), which sanitizes via
  `sanitizeHtmlForEditor` then renders the real HTML — same pattern as the Rent/
  Events product description (`event-product-description.tsx`).

The event list defaults a missing `timeFrame` URL parameter to `UPCOMING` — the backend's `GET /api/etr/events` rejects any other value with 400 (accepted set: `UPCOMING`, `NEXT_9_MONTHS`, `ALL_FUTURE`, `UPCOMING_TO_FARTHEST`, `PAST`, `ALL`).
Selecting All writes the explicit `timeFrame=all` URL state so it differs from
that default and triggers a fresh list query; the API mapper omits `timeFrame`
from the request when its value is `all`.
The event-list empty state includes a "Show Me All" action that writes the same
explicit `timeFrame=all` URL state.
Event-list Edit and Delete actions render as full buttons from the `md`
breakpoint upward. Delete is available to the event owner or a user with
`Event.Delete`; the shared permission hook includes wildcard administrators in
that permission. Below `md`, the same available actions move into the row's
option menu, kept beside the event details in the card's primary row; Edit uses
a pencil icon and Delete uses a trash icon.

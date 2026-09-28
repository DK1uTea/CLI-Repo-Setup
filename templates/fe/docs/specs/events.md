# Module: events

> Test-case specification for the Event wizard. Every item under **Behaviour**
> is an E2E test name. Tests use real backend data only; no `page.route()`.

## Route

| | |
| --- | --- |
| Paths | `/de/events`, `/de/events/new-event`, `/de/events/update-event?eventId=<id>&step=<step>` |
| Sidebar label | Observe from the real German sidebar before locator implementation |
| Behind auth | Yes |
| Permission-gated | Create: `Event.Management` + `Event.Create`; edit: `Event.Management` + `Event.Update`; product detail: `Event.Management` + `Event.Product.Detail` |

## Purpose

Event managers create an Event through five persisted steps, review the
result, then publish it. Existing Events use the same wizard in view or edit
mode according to the server-provided `canEdit` flag.

## Test data and cleanup

- Use a unique `EVENT-10xxxxx` ID and a unique title for every create journey.
- Read `GET /api/etr/holidays/deadline` response during the test; do not
  hardcode its date. Calculate all expected defaults from its `deadline`.
- Delete each Event created by an E2E journey with the real delete action/API
  after its assertions, unless the test deliberately verifies published state.
- Provision these real records before implementing edit cases:
  1. Draft Event with all five steps completed and `canEdit: true`.
  2. Draft or active Event with `canEdit: false`.
  3. Event with no Logistics record (`logistics: null`) on the create route.
  4. Event with catalog and helping-hand products, uploaded files, delivery
     address, and existing Overview images.
- Test account needs the route permissions above plus every permission required
  by Delete, Duplicate, Save as Draft, upload, comments, and product mutations.

## Data

| Endpoint | Method | Used for / oracle |
| --- | --- | --- |
| `/api/etr/holidays/deadline` | GET | Server deadline: `referenceDate`, `countryCode`, `workingDays`, `deadline`; source for create Event and Logistics defaults |
| `/api/etr/event-types` | GET | Overview event-type choices |
| `/api/etr/locations` | GET | Infinite saved-location search and location selection |
| `/api/etr/events/overview` | POST | Create Overview; response Event ID becomes URL `eventId` |
| `/api/etr/events/{id}/overview` | PATCH | Update Overview |
| `/api/etr/events/{id}/detail/{step}` | GET | Edit hydration and server `canEdit`; API steps `product-catalog` and `helping-hands` |
| `/api/etr/logistics/filter-config` | GET | Warehouse choices |
| `/api/etr/events/{id}/logistics` | PATCH | Persist Logistics after Overview has created the Event |
| `/api/etr/event-products/filter-config` | GET | Catalog category and brand filters |
| `/api/etr/event-products` | GET | Product list; category, brand, keyword, page, limit, `createdAt:desc` |
| `/api/etr/event-products/{slug}?eventId={id}` | GET | Product detail |
| `/api/etr/event-products/add-to-event` | POST | Add/update product quantity and rental flag |
| `/api/etr/event-products/remove-from-event/{id}/{sku}` | DELETE | Remove product |
| `/api/etr/event-products/helping-hands` | GET | Helping Hands list; helper type, keyword, page, limit, sort |
| `/api/etr/events/{id}/helping-hands` | PATCH | Persist Helping Hands files and comment |
| `/api/etr/events/{id}/detail/summary` | GET | Summary data, map data, cart and backend cost summary |
| `/api/etr/events/{id}/summary` | POST | Publish/activate Event, then route to `/events` |
| `/api/etr/uploads/presigned-url` | POST | Obtain presigned URL/key before upload |
| `{presignedUrl}` | PUT | Upload pending file with its MIME type |
| `/api/etr/events/{id}/overview` \| `/logistics` \| `/helping-hands` | PATCH | Save draft — the current step's own endpoint, same body as a normal save plus `status: "DRAFT"`, then route to `/events?status=draft`. No separate mark-draft endpoint; disabled outright on Product Catalog/Summary, which have no per-step endpoint. |
| `/api/etr/events/{id}/duplicate` | POST | Duplicate and open returned ID in update mode |
| `/api/etr/events/{id}` | DELETE | Delete and route to `/events` |

### Contract guards

- Editing an ACTIVE Event never prompts the user to cancel its existing order
  when entering Product Catalog, Helping Hands, or Summary, and the frontend
  never calls `/api/etr/event-orders/{eventId}/cancel` from that flow. Missing-order
  and cart-change navigation guards remain separate behaviours.
- Product/order mutations handle every rejected API response as a recoverable
  state: they show an error, preserve the last confirmed local state, and
  refresh only the cart/order/availability queries for the surface that started
  the mutation. They do not invalidate unrelated product-detail or list queries.
- Arrays from backend may be `{}` instead of `[]`; cases that render lists must
  verify no crash and the correct empty state.
- Nested API relations may be `null`; use optional data in assertions.
- `canEdit`, not `allowEdit`, controls Event editability in step-detail and
  Event-detail responses.
- All timestamps sent by the browser are UTC ISO values. Existing timestamps
  hydrate as UTC date/time values.

## Behaviour

### Journey (`flow.spec.ts`)

#### Create Event

- [EVT-C-01] Signs in through the real login form, opens Events from the sidebar, and opens New Event.
- [EVT-C-02] Reads the live deadline response and renders Overview only after the deadline-dependent create dates are available.
- [EVT-C-03] Creates Overview with all required valid values, one partnership type, one uploaded image, and receives an Event ID in the create-route URL.
- [EVT-C-04] Keeps the created Event on `/events/new-event` after Overview creates its ID and opens Logistics through Next.
- [EVT-C-05] Uses the cached deadline on Logistics without another deadline request when moving from Overview to Logistics.
- [EVT-C-06] PATCHes Logistics with the auto-selected warehouse, valid contact, setup/teardown dates, delivery address, comment, and one file in every supported upload group.
- [EVT-C-07] Opens Product Catalog after Logistics persistence and adds one product with a positive quantity.
- [EVT-C-08] Opens a Catalog product detail, changes quantity and rental-period choice, and returns to the wizard with the persisted cart value.
- [EVT-C-09] Opens Helping Hands, can continue without a Helping Hands product, and PATCHes its optional files/comment before Summary.
- [EVT-C-10] Renders Summary from the backend response and publishes the created Event through the real summary endpoint.
- [EVT-C-11] Shows publish success and routes to `/events` after the summary publish response succeeds.
- [EVT-C-12] Deletes the created draft Event through the real delete action and routes to `/events`.

#### Edit Event with `canEdit: true`

- [EVT-E-01] Opens an existing editable draft Event directly at Overview and hydrates the server Overview values.
- [EVT-E-02] Updates one Overview value and persists it with `PATCH /api/etr/events/{id}/overview`.
- [EVT-E-03] Opens editable Logistics, changes contact/schedule data, and persists it with `PATCH /api/etr/events/{id}/logistics`.
- [EVT-E-04] Opens editable Helping Hands, changes its comment or uploaded files, and persists it with `PATCH /api/etr/events/{id}/helping-hands`.
- [EVT-E-05] Changes product quantity from Catalog or Helping Hands and the Summary cart renders the final server quantity.
- [EVT-E-06] Publishes an editable draft after all required data is valid and routes to `/events`.

#### Edit ACTIVE Event with an existing order

- [EVT-EA-01] Opens Product Catalog and Helping Hands without showing a cancel-order dialog or calling the cancel-order endpoint.
- [EVT-EA-02] Keeps the cart unchanged, refreshes the current Catalog/Helping Hands availability, and shows an error when adding a product is rejected after the frontend availability check.
- [EVT-EA-03] Keeps the last confirmed quantity, refreshes cart availability, and shows an error when a cart quantity update is rejected.
- [EVT-EA-04] Keeps the user in the current cart/Summary flow, refreshes active-order and cart state, and shows an error when Finalize is rejected after the precheck passes.
- [EVT-EA-05] Keeps the missing-order choice flow open, refreshes the relevant order/cart/availability state, and shows an error when Reactivate order or Create new order is rejected.

#### View-only Event with `canEdit: false`

- [EVT-V-01] Opens an Event whose step-detail response returns `canEdit: false` and renders its backend values.
- [EVT-V-02] Disables Overview text inputs, dates, location, partnerships, contact controls, image add/remove, and Next for `canEdit: false`.
- [EVT-V-03] Disables Logistics contact, warehouse, schedule, delivery, files, comment, and Next for `canEdit: false`.
- [EVT-V-04] Disables product quantity, add/remove, cart mutation, draft, delete, duplicate, and publish actions for `canEdit: false` where those actions are rendered.
- [EVT-V-05] Does not send POST, PATCH, PUT, or DELETE mutations after interaction attempts in view-only mode.

### Content (`content.spec.ts`)

#### Overview

- [EVT-O-01] Generates an empty Create Event ID in the `EVENT-<digits>` format and keeps a valid supplied ID unchanged.
- [EVT-O-02] Shows Event ID format feedback while the user types an invalid value and marks the control invalid.
- [EVT-O-03] Renders Event type options from the real event-type response and target audience/partnership options from local business constants.
- [EVT-O-04] Selecting a saved location fills venue name, street, ZIP, and city; editing any address field clears its location ID.
- [EVT-O-08] Renders the Location empty state when saved-location search returns no results.
- [EVT-O-05] Renders Product Partner categories only while Product Partner is selected and clears the categories after it is deselected.
- [EVT-O-06] Renders existing Overview image URLs as uploaded image items when editing.
- [EVT-O-07] Adds and removes additional contacts; each visible contact has name, role, email, and phone controls.

#### Date defaults and deadline

- [EVT-D-01] Sets create Event start to deadline `00:00` and Event end to deadline plus one day `00:00`.
- [EVT-D-02] Sets create Setup start to Event start minus one day and Setup end one day later at the same time.
- [EVT-D-03] Sets create Teardown start to Setup end plus one day and Teardown end one day after Teardown start, both at `00:00`.
- [EVT-D-04] Retains deadline-derived Setup/Teardown defaults when Step 2 detail returns `logistics: null` after Overview has created an `eventId`.
- [EVT-D-05] Prevents create Event dates before the live backend deadline and prevents Setup/Teardown date selections before today.
- [EVT-D-06] Does not use the backend deadline as a Setup/Teardown date minimum.
- [EVT-D-07] Preserves all backend date/time values in edit mode and never replaces them with create defaults.
- [EVT-D-08] Moves an invalid Event, Setup, or Teardown end date one day forward when its corresponding start moves to or after it.
- [EVT-D-09] Revalidates the complete Setup or Teardown range whenever either field in that pair changes, including after an automatic End update.
- [EVT-D-10] Shows a yellow informational warning under Setup End or Teardown End when that range overlaps the Event range, including boundary-touching ranges, without blocking submission.

#### Logistics, products, and Summary

- [EVT-L-01] Selects the first warehouse from the real filter-config response when no warehouse is already set.
- [EVT-L-02] Shows a delivery-address form only while Different delivery address is enabled and removes delivery data when it is disabled.
- [EVT-L-03] Renders existing Logistics files and converts their API URLs into uploaded file items without requesting a new upload.
- [EVT-P-01] Applies category, brand, keyword-on-Enter, page, and `createdAt:desc` Catalog request state; changing filters resets page.
- [EVT-P-02] Applies helper type, keyword, page, and `createdAt:desc` Helping Hands request state; changing filters resets page.
- [EVT-P-03] Disables Next on Product Catalog while the shared cart is empty and keeps Helping Hands Next available.
- [EVT-P-04] Refreshes the shared cart and only the current product surface's availability after a product mutation, so unrelated Catalog, Helping Hands, and Product Detail queries are not refetched.
- [EVT-S-01] Renders backend Overview, Logistics, cart, files, map, and `costSummary` values on Summary.
- [EVT-S-02] Uses backend cost values when provided and only falls back to local rental/purchase/total calculation when they are absent.

### Validation (`validation.spec.ts`)

#### Overview validation

- [EVT-OV-01] Rejects Event ID values that do not match `^EVENT-\d+$` and does not send Overview mutation.
- [EVT-OV-02] Rejects missing title, mode, target audience, event type, description, participation, images, partnership type, location fields, or admin contact and does not send Overview mutation.
- [EVT-OV-03] Rejects a description longer than 5,000 characters and does not send Overview mutation.
- [EVT-OV-04] Rejects invalid admin and additional-contact email or phone values and does not send Overview mutation.
- [EVT-OV-05] Rejects an additional contact missing name, role, email, or phone and does not send Overview mutation.
- [EVT-OV-06] Rejects Product Partner without a selected allowed category and does not send Overview mutation.
- [EVT-OV-07] Rejects Event end at or before Event start and does not send Overview mutation.
- [EVT-OV-08] Rejects create Event dates before the backend deadline and does not send Overview mutation.

#### Logistics validation

- [EVT-LV-01] Rejects missing warehouse or Logistics contact name, email, or phone and does not send Logistics mutation.
- [EVT-LV-02] Rejects Setup end at or before Setup start and does not send Logistics mutation.
- [EVT-LV-03] Rejects Teardown end at or before Teardown start and does not send Logistics mutation.
- [EVT-LV-04] Rejects Setup or Teardown date selections before today and does not send Logistics mutation.
- [EVT-LV-05] Rejects enabled delivery address without venue name, street, ZIP, or city and does not send Logistics mutation.
- [EVT-LV-06] Rejects more than ten files in each Logistics upload group before any upload or Logistics mutation.

#### Cross-step validation

- [EVT-XV-01] Does not open Catalog, Helping Hands, or Summary when the current persisted step is invalid or its mutation fails.
- [EVT-XV-02] Rejects an empty shared cart before Product Catalog Next and does not navigate.
- [EVT-XV-03] Rejects more than ten Helping Hands assembly/planogram files before upload or mutation.

### Errors (`errors.spec.ts`)

- [EVT-ER-01] Shows the friendly deadline-unavailable toast, locks the active Overview or Logistics date step, and disables Next when the deadline request fails, has no deadline, or has an invalid deadline.
- [EVT-ER-02] Does not submit a date-dependent step while the deadline request is pending or unavailable.
- [EVT-ER-03] Stops Overview, Logistics, or Helping Hands persistence when a presigned upload or direct file PUT fails.
- [EVT-ER-04] Keeps the current step and form values visible after a real Overview, Logistics, or Helping Hands mutation error.
- [EVT-ER-05] Keeps the Event unpublished and on Summary after a real summary publish mutation error.

### Routing (`routing.spec.ts`)

- [EVT-R-01] Redirects unauthenticated visitors from every Event route to login.
- [EVT-R-02] Hides or denies New Event without `Event.Management` plus `Event.Create` and update Event without `Event.Management` plus `Event.Update`.
- [EVT-R-03] Uses the first configured wizard step when `step` is missing or invalid.
- [EVT-R-04] Keeps `eventId` and `step` in the URL after every wizard navigation.
- [EVT-R-05] Allows only Overview navigation before Create Overview returns an Event ID.
- [EVT-R-06] In Create flow, allows sidebar navigation only to the current or an earlier step after an Event ID exists; forward progression uses Next.
- [EVT-R-07] Returns Back to the previous URL step without persisting that step.
- [EVT-R-08] Routes Cancel from Overview to `/events`.
- [EVT-R-09] Shows the unsaved-changes save choice when leaving a dirty Overview, Logistics, or Helping Hands step.
- [EVT-R-10] Does not show a per-step save choice when leaving Product Catalog or Summary.
- [EVT-R-11] Saves a draft by PATCHing the current step's own endpoint with `status: "DRAFT"` added to its normal body, and routes to `/events?status=draft`.
- [EVT-R-11b] Disables Save as Draft on Product Catalog and Summary, which have no per-step submit endpoint.
- [EVT-R-12] Duplicates an Event and routes to the returned ID in update mode.
- [EVT-R-13] Blocks Logistics, Helping Hands, and Summary persistence when `eventId` is missing.

### Accessibility (`a11y.spec.ts`)

- [EVT-A-01] Has no axe violations on each wizard step with valid loaded data.
- [EVT-A-02] Has no axe violations with Overview and Logistics validation errors visible.
- [EVT-A-03] Exposes every date/time, text, select, checkbox, upload, and rich-text control with an accessible label.
- [EVT-A-04] Links every validation error to its invalid control through `aria-describedby` and exposes the error as an alert.
- [EVT-A-05] Supports keyboard navigation and activation for wizard steps, location search, selects, checkboxes, uploads, dialogs, and footer actions.
- [EVT-A-06] Makes disabled `canEdit: false` controls unavailable to keyboard mutation while keeping their server values readable.
- [EVT-A-07] Keeps browser console clean during create, editable update, and view-only update journeys.

## Out of Scope

- Event list filters, export, analytics, calendar table, address management,
  comments, tasks, ownership transfer, and calendar-event wizard have separate
  module specs.
- Visual pixel comparison and Tailwind class assertions are not functional
  Event-wizard cases.
- Backend calculation correctness for `costSummary` is owned by backend tests;
  this module verifies client rendering and documented fallback only.

## Open Questions

1. Which dedicated E2E account/data fixture supplies each required `canEdit`
   state, complete draft, product/cart state, and upload fixtures?
2. Which real backend conditions reproducibly produce deadline, presign/upload,
   step-mutation, and publish errors? Provide error code and observed German
   message for each if exact copy is required.
3. Which permissions govern Delete, Duplicate, Save as Draft, file operations,
   and product cart mutations for the E2E account?
4. Is a published Event safe to leave in the shared test backend, or is there a
   supported cleanup/reset route after publish?
5. What exact German sidebar label is visible for the Event module in the
   configured E2E account?

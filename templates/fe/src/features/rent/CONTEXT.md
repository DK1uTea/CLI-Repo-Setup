# Rental feature context

This file is the business/API source of truth for `src/features/rent`.

## Scope, routes, and permissions

- `/[locale]/rent?tab=catalogue`: catalogue.
- `/[locale]/rent?tab=rented`: rental orders.
- `/[locale]/rent/[product-slug]`: product detail, availability, related
  products, and PDF download.
- `/[locale]/rent/order?order_id=...`: order detail. The query key is
  `order_id`, not `orderId`.

The main route requires `Event.Management` + `Event.Product.List`; product
detail requires `Event.Management` + `Event.Product.Detail`; order detail
requires `Event.Management`. `tab` and filters are URL state and must survive
deep links.

## Catalogue and product behaviour

- Filter configuration provides product categories.
- Product list inputs are `page`, `limit`, `search`, `categorySlug`, `from`,
  and `to`.
- The catalogue date-range calendar disables dates before the current UTC day;
  this is enabled only for Rent through the shared picker's `disablePast` prop.
- Product-detail From/To uses the same `disablePast` rule, including typed
  dates in the picker.
- `start_date` / `end_date` URL values are validated on both the catalogue
  and product-detail pages. Garbage, a one-sided range, from after to, or a
  start before today shows `rent.invalidDateRange` and rewrites the URL to
  today → today + 10 days (UTC). Product detail always requires a range: an
  empty URL is filled with that default without a toast. The product-detail
  query stays disabled until the range is valid.
- Product detail uses the slug plus the validated `from`/`to`; related
  products use the current slug.
- Product detail breadcrumbs show Catalogue > the loaded product name; the
  Catalogue breadcrumb links back to `/rent?tab=catalogue`.
- Bundle product details hide the Availability tab and always show Description,
  including when opened from a stale `?tab=availability` URL.
- Bundle product descriptions list each child product with its required quantity
  inside the shared dimensions card. Rent and Event product details use the same
  card layout; the general information shell does not render bundle children.
- Product-detail Documents data uses the shared `useProductDocuments(sku)` hook.
  It calls `GET /api/etr/products/{sku}/attachments` and returns the response's
  `data.items` list, falling back to an empty list for a missing or non-array value.
  `ProductDocuments` groups `instructions` as Assembly Instructions and `manufacturer`
  as Manufacturer Data; empty groups show No documents available, while each file is a
  full-width shadcn Button download item with an image thumbnail for image MIME types and
  a file icon otherwise.
  The download action uses `/api/proxy-download?url=...&filename=...` so the browser
  receives the API-provided filename; the proxy only allows HTTPS hosts configured in
  `NEXT_PUBLIC_IMAGE_HOST`.
- The shared availability component selects one of two dedicated hooks by its
  explicit `source`. Rent loads `GET /api/etr/products/{slug}/calendar-table`
  using `slug`, `month`, and `year`. Event product detail loads
  `GET /api/etr/event-products/{slug}/calendar-table` using the same inputs plus
  the required `eventId`; that query remains disabled until both identifiers
  are available.
- Product PDF is generated client-side. Images use the already-rendered
  gallery or the same-origin `/_next/image` optimizer — `/api/proxy-image`
  is not used. Layout matches the legacy product PDF (logo, red dividers,
  200×160 tiles). The filename falls back through SKU, slug, then name.

## Rental-order behaviour

- Order inputs are `page`, `limit`, `search`, `status`, `sortBy`, `from`, and
  `to`.
- UI sort values map to API values:
  `created_at_desc` -> newest, `created_at_asc` -> oldest,
  `entity_id_desc` -> `order_id_desc`, and
  `entity_id_asc` -> `order_id_asc`.
- Supported statuses are `pending`, `processing`, `complete`, `holded`, and
  `canceled`.
- The final order-table column shows disabled placeholder actions with no
  handlers yet. Edit is visible to wildcard administrators and Event Managers;
  Cancel is wildcard-administrator only. Cancel uses the primary/default
  variant only when the status is neither `complete` nor `canceled` and the
  start time is more than 10 days away; otherwise it uses `outline`.
- The cancel dialog is not wired to the placeholder Cancel button and no cancel
  mutation exists. This feature also has no order-create mutation.

## API contracts

| Method | Browser path | Inputs/effect |
| --- | --- | --- |
| GET | `/api/etr/products/filter-config` | Category/filter configuration. |
| GET | `/api/etr/products` | Filtered/paged catalogue. |
| GET | `/api/etr/products/{slug}` | Product detail and base availability. |
| GET | `/api/etr/products/{sku}/attachments` | Product Documents attachments. |
| GET | `/api/proxy-download?url=...&filename=...` | Download an approved product attachment with its filename. |
| GET | `/api/etr/products/{slug}/calendar-table` | Per-day Rent availability for the selected month. |
| GET | `/api/etr/products/related?slug=...` | Related products. |
| GET | `/api/etr/event-products/{slug}/calendar-table` | Per-day availability for an event product and selected month. |
| GET | `/api/etr/orders` | Filtered/paged/sorted rental orders. |
| GET | `/api/etr/orders/{orderId}` | One order's detail. |


Important query keys are `["product-filter-config"]`, `["products", params]`,
`["product-detail", slug, params]`, `["related-products", slug]`,
`["rental-availability", "rent", slug, month, year]`,
`["rental-availability", "event", slug, eventId, month, year]`, rental-order list keys,
and `["order-detail", orderId]`.

## Test anchors

- URL tab/filter persistence, page reset, sort mapping, and `order_id` deep link.
- Empty/non-array catalogue and order responses.
- Product date range plus Rent and event-specific monthly availability.
- Product Documents attachment query and malformed/empty list fallback.
- Related products, not-found handling, PDF filename, and failed/proxied images.
- Assert that cancel/order creation is unavailable until a real mutation is
  introduced.

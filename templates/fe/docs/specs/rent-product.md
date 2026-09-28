# Module: rent-product

> Test-case specification for the Rent Product catalogue, rental availability,
> Rent Orders list, and order detail. Every item under **Behaviour** is an E2E
> test name. Tests use real backend data only; no `page.route()`.

## Route

| | |
|---|---|
| Paths | `/{locale}/rent`, `/{locale}/rent/<product-slug>`, `/{locale}/rent/order?order_id=<id>` where `{locale}` is `de` or `en` |
| Sidebar label | Localized navigation label |
| Behind auth | Yes |
| Permission-gated | Rent catalogue/detail: `Event.Management` + product permissions; order detail: `Event.Management` |

## Purpose

Event managers browse products available for rent, inspect rental availability,
and review existing rental orders and their details.

## Data

| Endpoint | Method | Used for / oracle |
|---|---|---|
| `/api/etr/products/filter-config` | GET | Rental category configuration |
| `/api/etr/products` | GET | Filtered and paginated rental catalogue |
| `/api/etr/products/{slug}` | GET | Product detail for the selected rental date range |
| `/api/etr/products/{slug}/calendar-table` | GET | Monthly rental availability |
| `/api/etr/products/related?slug=...` | GET | Related rental products |
| `/api/etr/orders` | GET | Filtered, sorted, and paginated rental orders |
| `/api/etr/orders/{orderId}` | GET | Rental order detail |

### Contract guards

- Category, product, related-product, order, and order-item lists must be handled safely when the backend returns `null` or `{}` instead of an array.
- Product and order relations may be absent; the UI must render a safe fallback or hide the dependent value.
- Rental date parameters are UTC ISO values and are validated before product-detail requests are enabled.
- Order detail deep links use `order_id`, not `orderId`.

## Behaviour

### Journey (`flow.spec.ts`)

- [RP-F-01] An authenticated user can open the Rent Product catalogue and navigate to an available product detail page.
- [RP-F-02] An authenticated user can switch to Rent Orders and see the order list with its table columns and pagination.
- [RP-F-03] Selecting an order opens its detail page with rental items, totals, and customer information.

### Content (`content.spec.ts`)

- [RP-C-01] A product detail page displays its breadcrumb, gallery, product information, description, rental availability, related products, PDF action, and returns to the catalogue through the active menu.
- [RP-C-02] The product detail PDF action downloads a PDF file.
- [RP-C-03] Selecting the availability tab loads and displays the product's monthly availability calendar.
- [RP-C-09] Product detail documents render grouped attachments and download the selected file.
- [RP-C-04] Catalogue search synchronizes its value to the URL and refreshes the product list.
- [RP-C-05] The default catalogue loads 20 more categories when the user selects the localized load-more action.
- [RP-C-06] Rent Orders search synchronizes its value to the URL and refreshes the order list.
- [RP-C-07] Rent Orders status and sort filters update the URL and refresh the order list.
- [RP-C-08] Rent Orders pagination changes the page in the URL and displays the selected page.
- [RP-L-01] The catalogue renders its localized header, filters, product grid, and view-only cards.
- [RP-S-01] Product search is case-insensitive, returns matching names, and can be cleared.
- [RP-S-02] A product search with no matches renders the localized empty state without an error.
- [RP-S-03] Product search matches a distinct product SKU.
- [RP-CAT-01] Selecting and deselecting one category updates the product filter and selected state.
- [RP-P-01] Catalogue pagination changes product data and supports first, previous, next, and last page controls.

### Validation (`validation.spec.ts`)

- [RP-D-01] The rental date picker disables past dates and only enables Apply for a complete valid range.
- [RP-D-02] Applying a selected date range updates the catalogue and Reset clears the range.
- [RP-D-03] Product detail shows and applies its rental date range.
- [RP-V-01] Invalid rental date parameters show the localized validation message and are replaced with the default valid range.
- [RP-V-02] A product detail opened without a rental date range is populated with the default range without showing a validation error.

### Routing (`routing.spec.ts`)

- [RP-R-01] A missing product slug renders the localized unavailable-page fallback.
- [RP-R-02] The product detail keeps the selected availability tab in the URL.

## Out of Scope

- Creating rental orders, editing orders, and canceling orders are not covered because no real order mutation is currently available in the module.
- Visual pixel comparison, exact Tailwind classes, and backend calculation correctness are not E2E responsibilities.
- Browser UI login is covered by the Login module; Rent tests use the shared real API session helper except where the Rent navigation itself is under test.

## Open Questions

- Which dedicated test data guarantees a stable order list across environments, including at least two pages of orders?
- Which exact permission keys distinguish catalogue, product detail, orders, and order detail access for restricted accounts?
- Which real backend response represents a product-specific not-found state instead of the shared unavailable-page fallback?
- Does the product API support filtering by multiple category slugs with AND semantics, and which parameter encodes it?
- Does the product API also support searching by brand, and is that behaviour required?

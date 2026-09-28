# Spec: Product Detail UI Unification (Event ↔ Catalog)

## Objective
`src/features/events/product-detail/` and `src/features/rent/product-detail/` render two
visually different product-detail layouts for what is largely the same underlying content
(carousel, title, availability/quantity, price, product-details grid, bundle children). Event
side already partially reuses catalog code (`useProductCarousel`, `resolveProductImageSrc`,
`EventCommonPdfContentWrapper` + `useDownloadPdf`). This spec extends that reuse so both
surfaces render from the same presentational components and look identical, while each keeps
its own business-specific action (event: quantity + "Add to Event" + reserve toggle; catalog:
date-range picker).

## Assumptions (confirmed by human)
1. Shared components live under `src/features/rent/product-detail/(components)/` — event
   imports them directly, following the precedent already set by the carousel hook and PDF
   helpers. Not promoted to `src/shared/components/` (only 2 features use them).
2. The info panel is split: everything identical (header + PDF button, availability/quantity
   line, price, product-details grid, bundle-children section) is extracted into one shared
   `ProductDetailInfoShell`; each side renders its own `actionArea` (date-range picker vs.
   quantity/reserve/add-to-event) as a slot.
3. Catalog currently has no "Bundle Product" children section on screen (only in its PDF
   export, which already has the data/i18n keys). It gains one, matching event's.

## Scope
**In scope:**
- Carousel: generalize `ProductGeneralCarousel` to accept `{ images, name }` instead of a
  `ProductDetail`; delete `EventProductDetailCarousel`; event imports the generalized
  component directly. Catalog's thumbnail-position layout (`sm:flex-row-reverse`) becomes the
  single layout both sides use.
- Info panel: new `ProductDetailInfoShell` in `rent/product-detail/(components)/`, consumed by
  both `ProductGeneralInfo` (catalog) and `EventProductDetailInfo` (event).
- Catalog's on-screen info panel gains the "Product Details" grid and "Bundle Product" section
  (data + i18n keys already exist for its PDF export — see `product-detail-pdf-content.tsx`).
- Add missing `rent.productDetail` i18n keys: `shippingMethod`, `bundleProductInfo` (en + de).
- Fix a latent bug while touching `EventProductDetailMain`'s image list: it currently falls
  back to `[product.image_url]` even when `image_url` is `''`, producing a broken-image slide.
  Reuse catalog's guarded fallback (`Array.isArray(...) && length ? ... : (url ? [url] : [])`).
- Update `event-product-detail-main-skeleton.tsx`'s carousel skeleton to match the new
  thumbnail-position layout (currently `flex-col` only, no `sm:flex-row-reverse`).

**Out of scope:**
- Catalog's `shortDescription` teaser staying only on the catalog side (event shows
  description via its own Description tab) — not unified, left as-is.
- The action-area content itself (date-range picker vs. quantity/add-to-event) — genuinely
  different business flows, not merged.
- `product-detail-general-skeleton.tsx` / `event-product-detail-main-skeleton.tsx`'s info-panel
  skeleton rows — approximate shape is acceptable since Details/Bundle sections are
  conditional per product.
- Any change to `rental-availability*`, `similar-products*`, PDF content components (already
  shared/near-identical, not part of this pass).

## UX / Behaviour
- Event product detail's carousel renders with thumbnails beside the main image on `sm+`
  screens (was: always below), matching catalog.
- Event product detail with an empty `image_url` and no `images` shows the catalog's "no
  images" placeholder instead of a broken image.
- Catalog product detail shows a "Product Details" section (category, branding, manufacturer,
  material, shipping method, weight, length, width, height) when the product has any of
  those fields — same as event already does.
- Catalog product detail shows a "Bundle Product" section with child items and requiredQty
  when `productType === 'bundle'` and it has children — same as event already does.
- Both sides' info panel keep their own action row untouched (quantity/reserve/add-to-event
  for event; date-range picker + short description for catalog).

## Data
No backend/API changes. `rent.ProductDetail.categoryLabels`/`material` are arrays needing
`.join(', ')`; `events.EventProductDetail.category`/`material` are already pre-joined strings
by `mapApiToEventProductDetail`. Each caller keeps computing its own `descriptiveDetails` /
`dimensionDetails: { label: string; value: string }[]` and passes the finished rows into the
shell — the shell has no knowledge of either underlying product type.

## Architecture
- `product-general-carousel.tsx`: `Props = { images: string[]; name: string }`. No behavior
  change to `useProductCarousel` (already generic).
- `product-detail-info-shell.tsx` (new): renders header/PDF row, separator, availability/qty,
  price, `{actionArea}`, details grid, bundle section. Exports `DetailRow`/`BundleItem` types.
  Takes `t: (key: string) => string` like the existing PDF-content components already do
  (`bundleProduct`, `bundleProductInfo`, `productDetails`, `availability`, `quantity` — keys
  already match 1:1 across both `events.productDetail` and `rent.productDetail` namespaces
  once the two missing keys are added).
- `product-detail-display.ts` (new helper): exports `hasDisplayValue`, currently duplicated
  verbatim in `event-product-detail-info.tsx` and `product-detail-pdf-content.tsx`.
- `ProductGeneralInfo` and `EventProductDetailInfo` become thin composers: compute their rows
  + `actionArea`, render `<ProductDetailInfoShell />`.
- `EventProductDetailCarousel` deleted; `EventProductDetailMain` imports
  `ProductGeneralCarousel` from `rent/product-detail` directly.

## Testing Strategy
- Unit/component:
  - `product-detail-info-shell.test.tsx`: renders details grid only when rows given, bundle
    section only when `bundleItems` non-empty.
  - `product-general-carousel.test.tsx`: empty-images placeholder; multi-image thumbnails.
  - Extend `event-product-detail-info.test.tsx` and add `product-general-info.test.tsx`:
    bundle section appears for `productType: 'bundle'` with children, details grid appears
    with descriptive/dimension fields.
  - `product-detail-display.test.ts`: `hasDisplayValue` truth table (null/undefined/''/'-' vs
    real value).
- No E2E changes required (no new route/flow); verify visually via Playwright MCP against
  `pnpm dev` for both an event product and a catalog product, rental and bundle type, per
  `browser-verification-playwright` skill, before calling this done.

## Boundaries
- Always: TDD per behaviour bullet above; update `en.json` + `de.json` together; run
  `pnpm test`, `pnpm typecheck`, `pnpm lint` before done; verify in a real browser (both
  surfaces, both product types).
- Ask first: nothing expected — no new dependency, no new backend module, no schema change.
- Never: merge the action-area business logic; move components to `src/shared/`; touch
  `rental-availability*`/`similar-products*`.

## Success Criteria
- `pnpm test` / `pnpm typecheck` / `pnpm lint` clean.
- Event and catalog product-detail pages render pixel-equivalent carousel + info-panel shell
  (verified in browser), differing only in the action area.
- A bundle-type catalog product shows its children on screen (previously only in the PDF).
- No behavior regression on `event-product-detail-info.test.tsx` (cart add flow, disabled
  states, PDF button).

## Open Questions
None blocking — the three architectural forks were confirmed with the human before writing
this spec (component location, info-panel split, bundle parity for catalog).

## Addendum: dimensions moved out of the info panel
Follow-up change: Weight/Length/Width/Height no longer render in the right-hand info panel.
They render in the Description tab instead, matching catalog's pre-existing
`ProductDescription` tab component, via a new shared `ProductDetailDimensions`
(`rent/product-detail/(components)/product-detail-dimensions.tsx`) — always renders all four
rows with a `-` placeholder when a value is missing (not filtered/hidden like the descriptive
details grid). `ProductDetailInfoShell` dropped its `dimensionDetails` prop entirely; the
right panel now only shows the descriptive details (category/branding/manufacturer/
materialType/shippingMethod) under "Product Details". Fixed a pre-existing unit bug in
catalog's original inline version (`m` instead of `cm` for length/width/height) as a side
effect of centralizing.

## Addendum: Documents tab

Both Rent and Event product-detail views add a `Documents` tab after the existing tabs.
The tab uses a shared `ProductDocuments` component located with the Rent product-detail
components and imported by both surfaces. It loads documents by SKU and renders the
`instructions` and `manufacturer` buckets as Assembly Instructions and Manufacturer Data.
Each bucket shows `No documents available` when empty, and each returned file is a shared
download button item; clicking anywhere on the item downloads the file. Image files render
an image thumbnail while other files use a file icon. A loading state is rendered while the
shared hook is fetching. Existing description and availability tab behavior remains
unchanged, including URL parameter handling.

Each document also has a download action. The action fetches
`/api/proxy-download?url=...&filename=...`, creates a browser object URL, and downloads
the file with the API-provided filename. The proxy only fetches HTTPS URLs from the
configured image/download host allowlist and responds with attachment headers.

The shared product-detail document data is loaded by `useProductDocuments(sku)` from
`GET /api/etr/products/{sku}/attachments`. The hook uses the query key
`['product-documents', sku]`, remains disabled until a SKU is available, and maps a
missing or non-array `data.items` value to an empty list.

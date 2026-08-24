# BuildMatch — Locked Project Decisions

- **Status:** Implemented v1
- **Initially locked:** 21 August 2026
- **Last updated:** 24 August 2026

This document records the initial v1 product decisions derived from the investigation and the later approved implementation enhancements. It remains the authority when a current product or technical choice is ambiguous.

## Catalogue shape

| Decision | Why |
| --- | --- |
| Use four categories: **Boards**, **Insulation**, **Profiles**, and **Accessories**. | They provide representative building-material families while keeping a 20-product prototype deep enough to browse. |
| Use 20 fictional products. | This is enough data to exercise search, filters, product pages, active filters, and empty states without pretending to be a full manufacturer catalogue. |
| Use three performance needs: **acoustic**, **fire**, and **moisture**. | These represent desired performance outcomes rather than physical installation contexts. |
| Permit zero, one, or more performance needs per product. | This allows both untagged products and genuine multi-performance results. An empty array means that no specific performance need is modeled for that product; it does not represent a separate "general" classification. |

## Discovery and state

| Decision | Why |
| --- | --- |
| The only catalogue filters are category and performance need. | A 20-product dataset does not benefit from enterprise-scale technical facets. |
| Provide free-text search in addition to filters. | Users may start with a product identity, SKU, product type, or ordinary requirement language. |
| Search across product name, SKU, category, `shortDescription`, `description`, features, and performance needs. | These fields provide useful discovery without searching arbitrary technical specification values. |
| Keep search and filter state in the URL. | Views are shareable and bookmarkable, and browser history works naturally. |
| Use `q`, `category`, and `need` as the catalogue query parameters. | A small explicit URL contract keeps routing and filtering predictable. |
| Ignore unsupported filter values rather than allowing them to break the catalogue. | Invalid URLs should degrade safely to a usable catalogue state. |
| Offer a deterministic search-intent suggestion for recognised requirement language when direct search returns zero results. | It supports need-first discovery without silently changing a search or presenting the feature as AI. |
| A search-intent suggestion must require explicit user action before applying a performance filter. | The system should never reinterpret or mutate the user's search silently. |

Example URLs:

```text
/products?q=board
/products?category=boards
/products?need=fire
/products?q=insulation&need=acoustic
```

## Data and scope

| Decision | Why |
| --- | --- |
| Use static local TypeScript data. | The prototype needs no deployment dependency, operational data layer, or external API. |
| Product names, descriptions, SKUs, and technical values are fictional. | This avoids presenting manufacturer information as authoritative construction guidance. |
| Use realistic terminology, specification labels, and units informed by public industry sources. | The demonstration should feel technically plausible without copying proprietary records or product copy. |
| Include a clear fictional-data disclaimer in project documentation. | Prototype values must not be mistaken for certified construction information. |
| Do not build a backend, database, authentication, AI, product comparison, building-system model, or configuration workflow in v1. | These features do not advance the core catalogue-discovery assignment and materially increase scope. |

## Product-detail behaviour

| Decision | Why |
| --- | --- |
| Each valid product has a dedicated `/products/[id]` page. | Detailed product information is a core assignment requirement. |
| Product details show name, SKU, category, description, features, performance needs, and specifications. | This provides technical depth without introducing enterprise documentation or configuration features. |
| Unknown product IDs use the application's not-found experience. | Invalid product URLs should fail clearly and predictably. |

## Model contract

The following model is locked for v1. Product-specific technical data stays flexible through `Specification[]`.

```ts
export type ProductCategory =
  | 'boards'
  | 'insulation'
  | 'profiles'
  | 'accessories';

export type PerformanceNeed =
  | 'acoustic'
  | 'fire'
  | 'moisture';

export interface Specification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  shortDescription: string;
  description: string;
  performanceNeeds: PerformanceNeed[];
  features: string[];
  specifications: Specification[];
}
```

## Implementation record

The initial product was completed in the following sequence:

1. Implement the locked model in `types/index.ts`.
2. Populate `data/products.ts` from the approved [product matrix](./product-matrix.md).
3. Add product lookup, filtering, and search utilities.
4. Build the `/products` catalogue grid.
5. Add search and category/performance filters.
6. Add URL state, active-filter controls, clear-all behaviour, and invalid-query handling.
7. Add empty states and the deterministic search-intent suggestion.
8. Build `/products/[id]`, including invalid product handling.
9. Build the homepage as an entry point into the completed discovery flows.
10. Test responsive behaviour, keyboard navigation, focus states, edge cases, and production build.

## Final guided-search enhancement

**Status:** Implemented 24 August 2026

| Decision | Why |
| --- | --- |
| Rank catalogue results deterministically by field relevance, match quality, and original dataset order. | Product identity and product names should outrank broad descriptive matches without introducing an opaque external search service. |
| Require every normalized query token to match. | Multi-word searches stay predictable and do not broaden silently. |
| Attempt bounded typo recovery only after global exact search returns zero results. | A small correction can recover a useful search without displacing valid exact matches. |
| Keep the original query in the URL and explain every interpreted token. | Correction remains visible, reversible, and honest rather than silently rewriting user input. |
| Resolve exact or fuzzy search globally once before applying filters or calculating facet counts. | Results and contextual counts must share one interpretation even when an active filter produces an empty view. |
| Reuse the same global ranking for product suggestions and catalogue results. | Autocomplete order should never contradict the result page. |
| Use a manual-selection combobox and retain the native GET form. | Keyboard and assistive-technology behavior takes priority while search remains usable without client JavaScript. |
| Keep catalogue results server-rendered and add client state only to the shared search control. | This adds responsive URL behavior without converting the catalogue into a large client application. |
| Standardize local guidance, CI, and deployment metadata on Node 24. | Node 24 is compatible with the installed Next.js release and matches the current supported local runtime. |

## Final discovery-navigation polish

**Status:** Implemented 24 August 2026

| Decision | Why |
| --- | --- |
| Make the prominent category and performance tags on product details link to their filtered catalogue views. | Product metadata becomes a direct continuation of discovery without introducing another navigation model. |
| Define “similar products” as products in the same category. | A transparent category link is useful for a 20-product catalogue and avoids implying a recommendation algorithm. |
| Show at most two targeted broaden-search actions in empty states. | Removing one constraint at a time is more useful than only clearing all state and preserves unrelated valid filters. |
| Keep the existing active-filter controls and URL contract. | The polish should reuse established navigation rather than add state or duplicate search logic. |

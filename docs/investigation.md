# BuildMatch — Investigation

## 1. Purpose

BuildMatch is a small building-material product discovery prototype. This investigation was conducted before implementation to understand how established manufacturers structure product catalogues, distinguish product-use contexts from performance requirements, present technical information, and support professional users who may not begin with a specific product name.

The investigation is intentionally focused. Its purpose is not to model the entire building-material industry or reproduce an enterprise product information system. It is to identify enough evidence to make defensible product, UX, data-model, accessibility, and scope decisions for the prototype.

## 2. Research Questions

The investigation focused on the following questions:

- How do building-material manufacturers organize large product catalogues?
- What terminology do they use for product categories, applications, and performance characteristics?
- Can users discover products from a project need or performance requirement rather than a known product name?
- Which information belongs in catalogue listings versus product-detail pages?
- How much should BuildMatch simplify enterprise filtering for a small prototype dataset?
- How should heterogeneous technical specifications be represented?
- Which accessibility requirements are particularly relevant to search and filter interactions?
- Which industry features should remain intentionally outside the first version?

## 3. Method

Primary research focused on official public sources from:

1. **Knauf Germany** — product catalogue, application areas, competence areas, and profile catalogue.
2. **ROCKWOOL Germany** — application-oriented product discovery and performance-oriented content.
3. **Rigips / Saint-Gobain Germany** — drywall product taxonomy, product database, and technical product information.
4. **W3C WCAG 2.2** — accessibility requirements relevant to search, filters, focus, contrast, and target sizing.

The investigation looked for recurring patterns rather than attempting to reproduce any manufacturer's interface or taxonomy exactly.

Research was conducted on **21 August 2026**. Catalogue counts and site structures may change over time.

---

## 4. Industry and Catalogue Scale

### Observation

Real manufacturer catalogues are substantially broader than the scope required for BuildMatch.

At the time of research, Knauf Germany's product catalogue listed **1,557 products** and exposed **17 top-level product categories**, including boards, insulation, ceilings and wall absorbers, plaster and mortar, fillers, profiles and supports, floor products, coatings, adhesives and sealants, fastening technology, waterproofing products, tools, accessories, and other specialist categories.

Rigips uses a narrower drywall-oriented taxonomy. Its product database groups products into seven broad areas, including gypsum boards, ceiling/acoustic systems, gypsum-fibre products, plasters and fillers, and profile technology/accessories.

### Interpretation

A small prototype does not benefit from reproducing enterprise catalogue breadth. Too many categories would produce shallow category pages and increase fictional-data work without improving the core discovery experience.

### BuildMatch decision

Use a deliberately constrained product taxonomy with enough depth to make browsing and filtering meaningful:

- **Boards**
- **Insulation**
- **Profiles**
- **Accessories**

BuildMatch will use **20 fictional demonstration products** distributed across these categories.

The reduced taxonomy is a scope decision, not a claim that these are the only important building-material categories.

---

## 5. Product Category Terminology

### Observation

Knauf groups metal drywall components under **"Profile & Stützen"** and exposes a dedicated **"Profile"** subcategory containing products such as CD, UD, CW, UW, and UA profiles.

Rigips likewise uses **"Profiltechnik und Zubehör"** in its product taxonomy.

### Interpretation

"Framing" is valid terminology for the construction function, but **Profiles** aligns more closely with how these manufacturers categorize the actual product family.

### BuildMatch decision

Use the following type:

```ts
export type ProductCategory =
  | 'boards'
  | 'insulation'
  | 'profiles'
  | 'accessories';
```

The UI label for the category is **Profiles**.

---

## 6. Application Context vs. Performance Need

### Observation

Knauf's official German site clearly separates **application context** from **building-performance competencies**.

Its application-area content includes physical or construction contexts such as:

- roof
- ceiling
- wall
- floor
- timber construction
- other building contexts

Separately, Knauf's competence areas include requirements and outcomes such as:

- fire protection
- sound protection
- acoustics
- energy efficiency
- moisture protection
- safety

ROCKWOOL follows a similar distinction. Its application-oriented content describes where insulation is used, while its material-performance content separately highlights fire protection, thermal protection, sound protection, and moisture protection.

### Interpretation

Terms such as **acoustic**, **fire**, and **moisture** describe the performance a user needs from a product rather than the physical location in which the product is installed.

For BuildMatch, modelling those values as "applications" would conflate two distinct domain concepts.

### BuildMatch decision

Use **performance need** as the product-model concept:

```ts
export type PerformanceNeed =
  | 'acoustic'
  | 'fire'
  | 'moisture';
```

Products expose:

```ts
performanceNeeds: PerformanceNeed[];
```

The corresponding UI labels are:

- **Acoustic Performance**
- **Fire Resistance**
- **Moisture Resistance**

A product with no explicitly modelled performance need uses an empty array. An empty array means only that no specific performance need has been assigned in the prototype data; it is not a separate classification.

---

## 7. Product Discovery Behaviour

### Observation

Manufacturer sites support more than one way of reaching a relevant product.

Direct catalogue search and category browsing support users who already know a product name, product type, or catalogue area.

At the same time, both Knauf and ROCKWOOL organize significant parts of their experiences around project contexts and building-performance needs. ROCKWOOL explicitly presents application-oriented discovery, while Knauf exposes application areas alongside separate capability areas such as fire protection, sound protection, acoustics, and moisture protection.

### Interpretation

A user does not always need to begin with a product name. In a technical domain, a user may instead begin with a requirement such as improving acoustic performance or selecting a moisture-resistant material.

### BuildMatch decision

BuildMatch will support two primary discovery modes:

1. **Product-first discovery** — search, browse categories, filter, open product details.
2. **Performance-need-first discovery** — start from acoustic, fire, or moisture requirements and enter a filtered catalogue view.

The prototype will not add a separate application hierarchy in the first version.

---

## 8. Target User

The public manufacturer experiences examined serve several audiences, including planners, contractors, specialist contractors, homeowners, DIY users, and distributors. BuildMatch is intended to feel like a professional product-discovery tool rather than a consumer retail store.

### BuildMatch target-user assumption

The primary prototype user is:

> **A construction professional involved in evaluating building materials for a project requirement.**

This can include a planner/specifier, contractor, or installer. The prototype does not need detailed fictional personas because the relevant distinction is the user's task and level of product knowledge, not demographic characteristics.

The target user may begin with either:

- a known product or product category; or
- a required performance outcome.

---

## 9. Filters and Catalogue Scope

### Observation

Knauf's large catalogue exposes multiple filter dimensions. Its profile catalogue, for example, includes facets such as application area, product area, availability, thickness, corrosion category, profile type, and web height.

This level of filtering is appropriate when users are navigating hundreds of products and product variants.

### Interpretation

BuildMatch's 20-product dataset does not justify enterprise-scale filtering. Adding many technical facets would create unnecessary UI and data complexity while making each filter only marginally useful.

### BuildMatch decision

The product catalogue will expose:

1. **Search**
2. **Product Category**
3. **Performance Need**

Technical characteristics such as thickness, dimensions, density, thermal properties, or material-specific values remain product-detail information rather than catalogue filters.

Search and filter state will be represented in the URL, for example:

```text
/products?q=board
/products?category=boards
/products?need=fire
/products?category=insulation&need=acoustic
```

This keeps filtered views shareable, bookmarkable, and compatible with normal browser back/forward navigation.

---

## 10. Search

Search should work for users who already know all or part of a product's identity as well as users who use ordinary technical language.

### Searchable product data

BuildMatch search will consider relevant text fields such as:

- product name
- SKU
- category
- short description
- description
- features
- performance needs

### Requirement-aware suggestion

The prototype will include a small deterministic fallback for common requirement-oriented language.

Example mappings may include:

```text
noise, sound, quiet       -> acoustic
fire, flame               -> fire
water, wet, bathroom      -> moisture
```

If direct search produces few or no useful matches and the query matches one of these concepts, the UI may offer a suggestion such as:

> Looking for products with acoustic performance?

The suggestion does not silently alter the user's query or automatically apply a filter. The user chooses whether to follow it.

### Evidence status

The underlying **need-first discovery pattern** is supported by the manufacturer research. The exact keyword-to-performance suggestion mechanism was not identified as a documented manufacturer feature during this investigation.

It is therefore treated as a **small BuildMatch design inference**, not an industry-standard feature and not an AI feature.

---

## 11. Catalogue Information Hierarchy

The catalogue's main job is to help users scan products and decide which items deserve closer inspection.

### Product card

A product card should contain:

- product name
- category
- short description
- relevant performance-need tags
- optionally, one concise headline specification when it materially helps distinguish the product

Full technical tables should not appear on catalogue cards.

### Rationale

Technical product data is valuable, but presenting too much information at the catalogue level reduces scanability. Detailed validation belongs on the individual product page after a user has identified a potentially relevant item.

---

## 12. Product Detail Information

Rigips's product database explicitly provides product descriptions, application information, technical data, variants, and downloadable documentation. Large manufacturer product pages may also expose compliance documents, declarations, EPDs, BIM/CAD files, installation documentation, and detailed variants.

BuildMatch needs only the subset required to demonstrate clear product understanding.

### Product-detail hierarchy

Each product page will contain:

1. Product name
2. SKU
3. Category
4. Description
5. Key features
6. Performance needs
7. Technical specifications

The following enterprise functions are intentionally outside the prototype:

- BIM/CAD assets
- compliance documentation
- certification workflows
- technical calculators
- procurement or ordering
- user accounts and saved projects

---

## 13. Technical Specifications and Data Model

### Observation

Technical fields differ substantially between product families.

Examples include:

**Boards**
- thickness
- width
- length
- density or weight

**Insulation**
- thickness
- density
- thermal conductivity
- fire classification

**Profiles**
- profile dimensions
- length
- material thickness
- material or coating

**Accessories**
- package size
- coverage
- working/application temperature
- curing or setting characteristics

### Interpretation

A single rigid specification object would either contain many category-specific optional fields or fit some product families poorly.

### BuildMatch decision

Use a simple flexible specification model:

```ts
export interface Specification {
  label: string;
  value: string;
}
```

Products then contain:

```ts
specifications: Specification[];
```

This is intentionally a prototype-oriented model. It is not intended to reproduce an enterprise Product Information Management (PIM) schema.

---

## 14. Prototype Data Strategy

BuildMatch will use **20 local fictional products**.

The dataset will be informed by publicly available manufacturer catalogues and open construction-material references so that terminology, specification types, and units remain plausible. Manufacturer product copy, imagery, and proprietary catalogue records will not be reproduced in the application dataset.

### Data disclaimer

The project documentation and UI should make the prototype status clear:

> **All product names, specifications, and technical values in BuildMatch are fictional demonstration data. They are not certified construction information and must not be used for engineering, specification, procurement, or construction decisions.**

This approach keeps the prototype independent of external APIs and avoids implying that fictional technical information is authoritative.

---

## 15. Responsive Behaviour

No manufacturer-specific mobile interaction identified during the investigation is important enough to justify reproducing it directly.

BuildMatch will therefore use a conventional responsive catalogue pattern:

### Desktop

- search remains visible near the catalogue controls
- filters remain persistently available where screen width permits
- products use a responsive grid

### Mobile

- search remains immediately accessible
- filters move into a collapsible panel, drawer, or sheet
- active filters remain understandable and removable
- controls use touch-friendly spacing and sizing
- technical specifications remain readable without requiring a desktop layout

The exact mobile control implementation will be validated during development and testing.

---

## 16. Accessibility

Accessibility is part of the implementation requirements rather than a final polish step.

WCAG 2.2 considerations particularly relevant to BuildMatch include:

- **1.3.1 — Info and Relationships:** structure and relationships conveyed visually should also be programmatically determinable.
- **1.4.11 — Non-text Contrast:** visual information required to identify controls and states needs sufficient contrast.
- **2.1.1 — Keyboard:** interactive functionality must be usable from a keyboard where applicable.
- **2.4.7 — Focus Visible:** keyboard focus must be visibly identifiable.
- **2.4.11 — Focus Not Obscured (Minimum):** focused controls should not be completely hidden by author-created content.
- **2.5.8 — Target Size (Minimum):** pointer targets should meet the WCAG minimum-size requirement or one of its documented exceptions, including sufficient spacing.
- **3.3.2 — Labels or Instructions:** inputs should provide labels or instructions where users need them.
- **4.1.2 — Name, Role, Value:** custom or interactive UI controls need appropriate programmatically determinable names, roles, and states.

### BuildMatch implementation implications

- use semantic HTML controls wherever possible
- provide meaningful accessible names for search and filters
- associate form labels correctly
- ensure all filtering interactions are keyboard operable
- provide visible focus states
- do not communicate selected states using color alone
- maintain sufficient contrast for text, control boundaries, and state indicators
- use comfortably sized interactive controls, especially on mobile
- announce or expose meaningful empty/error states in an understandable way
- maintain a logical heading hierarchy

---

## 17. Visual Direction

The manufacturer experiences examined prioritize technical clarity and information hierarchy over retail-style decoration.

BuildMatch should therefore aim for a visual character that is:

- professional
- technical
- restrained
- highly scannable
- content-first

### Design implications

- clear typography and hierarchy
- consistent product-card structure
- restrained use of color
- performance tags used as functional metadata, not decoration
- readable specification tables or definition-list layouts
- predictable spacing and alignment
- limited decorative imagery
- no attempt to copy Knauf, ROCKWOOL, or Rigips branding

The prototype should feel like a modern technical catalogue rather than an e-commerce storefront.

---

## 18. Observation → Product Decision

| Observation | Product decision |
|---|---|
| Real manufacturer catalogues contain far more products and categories than this prototype requires. | Limit the prototype to four representative categories and 20 products. |
| Knauf and Rigips categorize drywall metal components as profiles/profile technology. | Use **Profiles** as the catalogue category. |
| Knauf distinguishes physical application contexts from capabilities such as fire, sound, acoustics, and moisture protection. | Model acoustic/fire/moisture as **performance needs**, not applications. |
| Performance requirements are specific outcomes rather than a generic classification. | Use `acoustic`, `fire`, and `moisture`; do not create an additional generic performance value. |
| Manufacturer experiences allow discovery through both direct product navigation and project/requirement-oriented routes. | Support product-first and performance-need-first discovery. |
| Enterprise catalogues require many facets because of catalogue scale. | Limit BuildMatch filtering to category + performance need + search. |
| Technical attributes vary substantially by product family. | Keep a flexible `Specification[]` model. |
| Technical detail is important after a potentially relevant product has been identified. | Keep catalogue cards concise and place full specifications on the detail page. |
| Real manufacturer ecosystems include BIM, systems, calculators, certification, and other specialist tooling. | Keep those features outside the prototype scope. |
| The exact keyword-to-performance search fallback was not directly observed. | Keep it small and document it as a BuildMatch design inference. |
| Search and filter controls create accessibility requirements from the start. | Build semantic structure, keyboard support, focus visibility, contrast, and usable target sizing into the components. |

---

## 19. Requirements Established by the Investigation

### Product taxonomy

```ts
export type ProductCategory =
  | 'boards'
  | 'insulation'
  | 'profiles'
  | 'accessories';
```

### Performance needs

```ts
export type PerformanceNeed =
  | 'acoustic'
  | 'fire'
  | 'moisture';
```

### Product model

```ts
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

### Dataset

- 20 fictional demonstration products
- local/static data for the prototype
- no dependency on manufacturer APIs
- realistic terminology and specification types informed by research

### Catalogue

- free-text search
- category filter
- performance-need filter
- URL-driven state
- result count
- active-filter display
- clear-filter action
- meaningful empty states

### Product details

- name
- SKU
- category
- description
- features
- performance needs
- technical specifications

### Explicit non-goals for the first version

- product comparison
- BIM/CAD tooling
- technical calculators
- authentication
- saved products/projects
- database-backed catalogue
- e-commerce/procurement
- AI-powered recommendation engine

---

## 20. Limitations

This investigation is intentionally scoped to the needs of a small take-home prototype.

Key limitations:

- only a small number of manufacturers were studied
- taxonomy and terminology can vary by country, product division, and market
- public manufacturer websites do not reveal every internal user-research or search-ranking decision
- no direct interviews or usability tests with construction professionals were conducted
- the responsive patterns were not studied deeply enough to prescribe a manufacturer-derived mobile design
- the requirement-aware keyword suggestion is a product-design inference rather than a directly observed manufacturer feature
- fictional product data cannot represent the regulatory and technical complexity of certified construction products

These limitations are acceptable for the prototype as long as the application clearly communicates that its data is fictional and its scope is intentionally constrained.

---

## 21. Sources

### Knauf

- **All Products — Knauf Germany**  
  https://knauf.com/de-DE/p/produkte

- **Application Areas — Knauf Germany**  
  https://knauf.com/de-DE/anwendungsbereiche

- **Competencies — Knauf Germany**  
  https://knauf.com/de-DE/kompetenzen

- **Profiles & Supports — Knauf Germany**  
  https://knauf.com/de-DE/p/produkte/profile-stuetzen-30335

- **Profiles — Knauf Germany**  
  https://knauf.com/de-DE/p/produkte/profile-stuetzen-30335/profile-30689

### ROCKWOOL

- **Applications — ROCKWOOL Germany**  
  https://www.rockwool.com/de/anwendungen/

### Rigips / Saint-Gobain

- **Rigips Product Database**  
  https://www.rigips.de/produktdatenbank

- **Rigips Products**  
  https://www.rigips.de/produkte

### Accessibility

- **Web Content Accessibility Guidelines (WCAG) 2.2 — W3C**  
  https://www.w3.org/TR/WCAG22/

- **Understanding WCAG 2.2 — W3C**  
  https://www.w3.org/WAI/WCAG22/Understanding/

- **Understanding SC 2.5.8: Target Size (Minimum) — W3C**  
  https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html

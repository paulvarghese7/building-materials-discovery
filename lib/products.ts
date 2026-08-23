import { products } from '@/data/products';
import type { PerformanceNeed, Product, ProductCategory } from '@/types';

export const MAX_SEARCH_QUERY_LENGTH = 100;

export const productCategories: readonly ProductCategory[] = [
  'boards',
  'insulation',
  'profiles',
  'accessories',
];

export const performanceNeeds: readonly PerformanceNeed[] = ['acoustic', 'fire', 'moisture'];

export const categoryLabels: Record<ProductCategory, string> = {
  boards: 'Boards',
  insulation: 'Insulation',
  profiles: 'Profiles',
  accessories: 'Accessories',
};

export const performanceNeedLabels: Record<PerformanceNeed, string> = {
  acoustic: 'Acoustic Performance',
  fire: 'Fire Resistance',
  moisture: 'Moisture Resistance',
};

export interface CatalogueFilters {
  query: string;
  category?: ProductCategory;
  need?: PerformanceNeed;
}

export type CatalogueSearchParams = Record<string, string | string[] | undefined>;

// These are a small, deterministic fallback for plain-language searches—not an AI recommendation system.
const searchIntentKeywords: Record<PerformanceNeed, readonly string[]> = {
  acoustic: ['acoustic', 'noise', 'quiet', 'sound'],
  fire: ['fire', 'flame', 'heat'],
  moisture: ['bathroom', 'damp', 'moisture', 'water', 'wet'],
};

// Returns the first value when a URL parameter has been supplied more than once.
function getFirstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// Cleans a URL query while preserving the text a user expects to see in the search input.
function cleanQuery(value: string): string {
  return value.trim().replace(/\s+/g, ' ').slice(0, MAX_SEARCH_QUERY_LENGTH).trim();
}

// Normalises punctuation and casing so equivalent search terms compare consistently.
function normaliseSearchText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

// Splits a query into the terms that every matching product must contain.
function getSearchTokens(query: string): string[] {
  const normalisedQuery = normaliseSearchText(query);

  return normalisedQuery ? normalisedQuery.split(' ') : [];
}

// Checks whether a URL value is one of the categories supported by this catalogue.
function isProductCategory(value: string | undefined): value is ProductCategory {
  return value !== undefined && productCategories.includes(value as ProductCategory);
}

// Checks whether a URL value is one of the performance needs supported by this catalogue.
function isPerformanceNeed(value: string | undefined): value is PerformanceNeed {
  return value !== undefined && performanceNeeds.includes(value as PerformanceNeed);
}

// Builds one normalized search document from the product fields approved for discovery.
function getProductSearchText(product: Product): string {
  return normaliseSearchText(
    [
      product.name,
      product.sku,
      product.category,
      categoryLabels[product.category],
      product.shortDescription,
      product.description,
      ...product.features,
      ...product.performanceNeeds,
      ...product.performanceNeeds.map((need) => performanceNeedLabels[need]),
    ].join(' '),
  );
}

// Reads the catalogue URL contract and safely drops unsupported filter values.
export function parseCatalogueFilters(searchParams: CatalogueSearchParams): CatalogueFilters {
  const query = cleanQuery(getFirstValue(searchParams.q) ?? '');
  const category = getFirstValue(searchParams.category);
  const need = getFirstValue(searchParams.need);

  // Ignore unknown URL values so a shared or manually edited link remains usable.
  return {
    query,
    ...(isProductCategory(category) ? { category } : {}),
    ...(isPerformanceNeed(need) ? { need } : {}),
  };
}

// Finds the product used by an individual product-detail route.
export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

// Checks a product against the agreed catalogue-search fields.
export function matchesProductSearch(product: Product, query: string): boolean {
  const searchTokens = getSearchTokens(query);
  const searchableText = getProductSearchText(product);

  return searchTokens.every((token) => searchableText.includes(token));
}

// Returns products that contain every normalized query token in the approved search fields.
export function searchProducts(sourceProducts: readonly Product[], query: string): Product[] {
  return sourceProducts.filter((product) => matchesProductSearch(product, query));
}

// Applies the active search, category, and performance filters to a product collection.
export function filterProducts(
  sourceProducts: readonly Product[],
  filters: CatalogueFilters,
): Product[] {
  return searchProducts(sourceProducts, filters.query).filter(
    (product) =>
      (!filters.category || product.category === filters.category) &&
      (!filters.need || product.performanceNeeds.includes(filters.need)),
  );
}

// Recognises a supported performance need from common plain-language search terms.
export function getSearchIntent(query: string): PerformanceNeed | undefined {
  const words = getSearchTokens(query);

  return performanceNeeds.find((need) =>
    searchIntentKeywords[need].some((keyword) => words.includes(keyword)),
  );
}

// Suggests a performance need only when the user's direct search has no matching products.
export function getSearchIntentSuggestion(
  sourceProducts: readonly Product[],
  filters: CatalogueFilters,
): PerformanceNeed | undefined {
  // A suggestion appears only after a zero-result direct search. The UI must still require a user action.
  if (!filters.query || filterProducts(sourceProducts, filters).length > 0) {
    return undefined;
  }

  return getSearchIntent(filters.query);
}

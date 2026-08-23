import { products } from '@/data/products';
import type { PerformanceNeed, Product, ProductCategory } from '@/types';

export const productCategories: ProductCategory[] = [
  'boards',
  'insulation',
  'profiles',
  'accessories',
];

export const performanceNeeds: PerformanceNeed[] = ['acoustic', 'fire', 'moisture'];

export interface CatalogueFilters {
  query: string;
  category?: ProductCategory;
  need?: PerformanceNeed;
}

export type CatalogueSearchParams = Record<string, string | string[] | undefined>;

// These are a small, deterministic fallback for plain-language searches—not an AI recommendation system.
const searchIntentKeywords: Record<PerformanceNeed, readonly string[]> = {
  acoustic: ['acoustic', 'noise', 'quiet', 'sound'],
  fire: ['fire', 'flame'],
  moisture: ['bathroom', 'moisture', 'water', 'wet'],
};

// Returns the first value when a URL parameter has been supplied more than once.
function getFirstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// Normalises user-entered text so searches are case-insensitive and ignore surrounding spaces.
function normalise(value: string): string {
  return value.trim().toLocaleLowerCase();
}

// Checks whether a URL value is one of the categories supported by this catalogue.
function isProductCategory(value: string | undefined): value is ProductCategory {
  return value !== undefined && productCategories.includes(value as ProductCategory);
}

// Checks whether a URL value is one of the performance needs supported by this catalogue.
function isPerformanceNeed(value: string | undefined): value is PerformanceNeed {
  return value !== undefined && performanceNeeds.includes(value as PerformanceNeed);
}

// Reads the catalogue URL contract and safely drops unsupported filter values.
export function parseCatalogueFilters(searchParams: CatalogueSearchParams): CatalogueFilters {
  const query = getFirstValue(searchParams.q)?.trim() ?? '';
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
  const normalisedQuery = normalise(query);

  if (!normalisedQuery) {
    return true;
  }

  // Keep search limited to the fields agreed for catalogue discovery; specifications stay detail-page data.
  const searchableText = [
    product.name,
    product.sku,
    product.category,
    product.shortDescription,
    product.description,
    ...product.features,
    ...product.performanceNeeds,
  ]
    .join(' ')
    .toLocaleLowerCase();

  return searchableText.includes(normalisedQuery);
}

// Applies the active search, category, and performance filters to a product collection.
export function filterProducts(
  sourceProducts: readonly Product[],
  filters: CatalogueFilters,
): Product[] {
  return sourceProducts.filter(
    (product) =>
      matchesProductSearch(product, filters.query) &&
      (!filters.category || product.category === filters.category) &&
      (!filters.need || product.performanceNeeds.includes(filters.need)),
  );
}

// Recognises a supported performance need from common plain-language search terms.
export function getSearchIntent(query: string): PerformanceNeed | undefined {
  const words = normalise(query).split(/[^a-z]+/).filter(Boolean);

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

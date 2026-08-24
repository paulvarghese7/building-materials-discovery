import { products } from '@/data/products';
import type { ProjectRequirement, Product, ProductType } from '@/types';

export const MAX_SEARCH_QUERY_LENGTH = 100;

export const productTypes: readonly ProductType[] = [
  'boards',
  'insulation',
  'profiles',
  'accessories',
];

export const projectRequirements: readonly ProjectRequirement[] = ['acoustic', 'fire', 'moisture'];

export const productTypeLabels: Record<ProductType, string> = {
  boards: 'Boards',
  insulation: 'Insulation',
  profiles: 'Profiles',
  accessories: 'Accessories',
};

export const projectRequirementLabels: Record<ProjectRequirement, string> = {
  acoustic: 'Acoustic Performance',
  fire: 'Fire Resistance',
  moisture: 'Moisture Resistance',
};

export interface CatalogueFilters {
  query: string;
  productType?: ProductType;
  projectRequirement?: ProjectRequirement;
}

export type CatalogueSearchParams = Record<string, string | string[] | undefined>;

// These are a small, deterministic fallback for plain-language searches—not an AI recommendation system.
const searchRequirementIntentKeywords: Record<ProjectRequirement, readonly string[]> = {
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

// Checks whether a URL value is one of the product types supported by this catalogue.
function isProductType(value: string | undefined): value is ProductType {
  return value !== undefined && productTypes.includes(value as ProductType);
}

// Checks whether a URL value is one of the project requirements supported by this catalogue.
function isProjectRequirement(value: string | undefined): value is ProjectRequirement {
  return value !== undefined && projectRequirements.includes(value as ProjectRequirement);
}

// Builds one normalized search document from the product fields approved for discovery.
function getProductSearchText(product: Product): string {
  return normaliseSearchText(
    [
      product.name,
      product.sku,
      product.productType,
      productTypeLabels[product.productType],
      product.shortDescription,
      product.description,
      ...product.features,
      ...product.projectRequirements,
      ...product.projectRequirements.map(
        (projectRequirement) => projectRequirementLabels[projectRequirement],
      ),
    ].join(' '),
  );
}

// Reads the catalogue URL contract and safely drops unsupported filter values.
export function parseCatalogueFilters(searchParams: CatalogueSearchParams): CatalogueFilters {
  const query = cleanQuery(getFirstValue(searchParams.q) ?? '');
  const canonicalProductType = getFirstValue(searchParams.type);
  const legacyProductType = getFirstValue(searchParams.category);
  const canonicalProjectRequirement = getFirstValue(searchParams.requirement);
  const legacyProjectRequirement = getFirstValue(searchParams.need);
  const productType = isProductType(canonicalProductType)
    ? canonicalProductType
    : isProductType(legacyProductType)
      ? legacyProductType
      : undefined;
  const projectRequirement = isProjectRequirement(canonicalProjectRequirement)
    ? canonicalProjectRequirement
    : isProjectRequirement(legacyProjectRequirement)
      ? legacyProjectRequirement
      : undefined;

  // Prefer canonical parameters while retaining simple compatibility with previously shared URLs.
  return {
    query,
    ...(productType ? { productType } : {}),
    ...(projectRequirement ? { projectRequirement } : {}),
  };
}

// Creates a catalogue URL from validated discovery state in a consistent parameter order.
export function createCatalogueHref(filters: CatalogueFilters): string {
  const searchParams = new URLSearchParams();

  if (filters.query) {
    searchParams.set('q', cleanQuery(filters.query));
  }

  if (filters.productType) {
    searchParams.set('type', filters.productType);
  }

  if (filters.projectRequirement) {
    searchParams.set('requirement', filters.projectRequirement);
  }

  const queryString = searchParams.toString();

  return queryString ? `/products?${queryString}` : '/products';
}

// Builds the explicit CTA target for accepting a deterministic search-intent suggestion.
export function createSearchRequirementIntentHref(
  filters: CatalogueFilters,
  suggestedRequirement: ProjectRequirement,
): string {
  return createCatalogueHref({
    query: '',
    ...(filters.productType ? { productType: filters.productType } : {}),
    projectRequirement: suggestedRequirement,
  });
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

// Applies the active search, product-type, and project-requirement filters to a collection.
export function filterProducts(
  sourceProducts: readonly Product[],
  filters: CatalogueFilters,
): Product[] {
  return searchProducts(sourceProducts, filters.query).filter(
    (product) =>
      (!filters.productType || product.productType === filters.productType) &&
      (!filters.projectRequirement ||
        product.projectRequirements.includes(filters.projectRequirement)),
  );
}

// Recognises a supported project requirement from common plain-language search terms.
export function getSearchRequirementIntent(query: string): ProjectRequirement | undefined {
  const words = getSearchTokens(query);

  return projectRequirements.find((projectRequirement) =>
    searchRequirementIntentKeywords[projectRequirement].some((keyword) => words.includes(keyword)),
  );
}

// Suggests a project requirement only when the user's direct search has no matching products.
export function getSearchRequirementIntentSuggestion(
  sourceProducts: readonly Product[],
  filters: CatalogueFilters,
): ProjectRequirement | undefined {
  // A suggestion appears only after a zero-result direct search. The UI must still require a user action.
  if (!filters.query || filterProducts(sourceProducts, filters).length > 0) {
    return undefined;
  }

  return getSearchRequirementIntent(filters.query);
}

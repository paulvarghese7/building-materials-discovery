import {
  productTypeLabels,
  createCatalogueHref,
  getSearchRequirementIntent,
  projectRequirementLabels,
  projectRequirements,
  productTypes,
  type CatalogueFilters,
} from '@/lib/products';
import type { ProjectRequirement, Product, ProductType } from '@/types';

export type CatalogueSearchMode = 'browse' | 'exact' | 'fuzzy' | 'none';

export type CatalogueMatchReason =
  | 'SKU'
  | 'Product name'
  | 'Product type'
  | 'Project requirement'
  | 'Feature'
  | 'Short description'
  | 'Description';

export interface CatalogueCorrection {
  original: string;
  replacement: string;
}

export interface CatalogueProductMatch {
  product: Product;
  reasons: CatalogueMatchReason[];
}

export interface CatalogueSearchResult {
  mode: CatalogueSearchMode;
  allMatches: CatalogueProductMatch[];
  matches: CatalogueProductMatch[];
  corrections: CatalogueCorrection[];
  interpretedQuery: string;
}

export interface CatalogueFacetCounts {
  allProductTypes: number;
  productTypes: Record<ProductType, number>;
  allProjectRequirements: number;
  projectRequirements: Record<ProjectRequirement, number>;
}

export type CatalogueSuggestion =
  | {
      type: 'product';
      id: string;
      name: string;
      sku: string;
      href: string;
    }
  | {
      type: 'discovery';
      id: string;
      label: string;
      description: string;
      href: string;
    }
  | {
      type: 'search';
      id: string;
      label: string;
      href: string;
    };

interface SearchField {
  reason: CatalogueMatchReason;
  value: string;
  weight: number;
}

interface QueryToken {
  original: string;
  interpreted: string;
  fuzzyDistance: 0 | 1 | 2;
}

interface ScoredMatch extends CatalogueProductMatch {
  datasetIndex: number;
  score: number;
}

interface FuzzyCandidate {
  token: string;
  weight: number;
  datasetIndex: number;
  tokenIndex: number;
}

const reasonOrder: readonly CatalogueMatchReason[] = [
  'SKU',
  'Product name',
  'Product type',
  'Project requirement',
  'Feature',
  'Short description',
  'Description',
];

// Reduces user and product text to comparable lowercase alphanumeric tokens.
function normaliseSearchText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

// Converts normalized text into the individual terms required by AND-style search.
function getTokens(value: string): string[] {
  const normalised = normaliseSearchText(value);

  return normalised ? normalised.split(' ') : [];
}

// Maps one product into the weighted fields used by deterministic relevance scoring.
function getSearchFields(product: Product): SearchField[] {
  return [
    { reason: 'SKU', value: product.sku, weight: 100 },
    { reason: 'Product name', value: product.name, weight: 80 },
    { reason: 'Product type', value: productTypeLabels[product.productType], weight: 50 },
    {
      reason: 'Project requirement',
      value: product.projectRequirements
        .map((projectRequirement) => projectRequirementLabels[projectRequirement])
        .join(' '),
      weight: 50,
    },
    { reason: 'Feature', value: product.features.join(' '), weight: 30 },
    { reason: 'Short description', value: product.shortDescription, weight: 20 },
    { reason: 'Description', value: product.description, weight: 10 },
  ];
}

// Limits spelling recovery to high-signal discovery fields and excludes SKU/descriptive copy.
function getFuzzyFields(product: Product): SearchField[] {
  return getSearchFields(product).filter(({ reason }) =>
    ['Product name', 'Product type', 'Project requirement', 'Feature'].includes(reason),
  );
}

// Returns only the strongest relationship for one token/field pair: exact, prefix, or substring.
function getMatchMultiplier(fieldValue: string, queryToken: string): number {
  const fieldTokens = getTokens(fieldValue);

  if (fieldTokens.some((token) => token === queryToken)) {
    return 3;
  }

  if (fieldTokens.some((token) => token.startsWith(queryToken))) {
    return 2;
  }

  return normaliseSearchText(fieldValue).includes(queryToken) ? 1 : 0;
}

// Scores products without exposing scores publicly, then applies stable dataset-order tie-breaking.
function rankProducts(
  sourceProducts: readonly Product[],
  queryTokens: readonly QueryToken[],
): CatalogueProductMatch[] {
  const interpretedPhrase = queryTokens.map(({ interpreted }) => interpreted).join(' ');
  const scoredMatches: ScoredMatch[] = [];

  sourceProducts.forEach((product, datasetIndex) => {
    const fields = getSearchFields(product);
    const reasonScores = new Map<CatalogueMatchReason, number>();
    let score = 0;

    for (const queryToken of queryTokens) {
      let tokenMatched = false;
      const fuzzyFactor = queryToken.fuzzyDistance === 1 ? 0.5 : queryToken.fuzzyDistance === 2 ? 0.25 : 1;

      for (const field of fields) {
        const multiplier = getMatchMultiplier(field.value, queryToken.interpreted);

        if (multiplier === 0) {
          continue;
        }

        tokenMatched = true;
        const contribution = field.weight * multiplier * fuzzyFactor;
        score += contribution;
        reasonScores.set(field.reason, (reasonScores.get(field.reason) ?? 0) + contribution);
      }

      // AND semantics exclude the whole product as soon as one query term has no field match.
      if (!tokenMatched) {
        return;
      }
    }

    for (const field of fields) {
      const normalisedField = normaliseSearchText(field.value);
      const phraseBonus =
        normalisedField === interpretedPhrase
          ? 200
          : normalisedField.includes(interpretedPhrase)
            ? 100
            : 0;

      if (phraseBonus > 0) {
        score += phraseBonus;
        reasonScores.set(field.reason, (reasonScores.get(field.reason) ?? 0) + phraseBonus);
      }
    }

    const reasons = [...reasonScores.entries()]
      .sort(
        ([firstReason, firstScore], [secondReason, secondScore]) =>
          secondScore - firstScore || reasonOrder.indexOf(firstReason) - reasonOrder.indexOf(secondReason),
      )
      .slice(0, 2)
      .map(([reason]) => reason);

    scoredMatches.push({ product, reasons, score, datasetIndex });
  });

  return scoredMatches
    .sort((first, second) => second.score - first.score || first.datasetIndex - second.datasetIndex)
    .map(({ product, reasons }) => ({ product, reasons }));
}

// Selects the conservative edit-distance limit and disables fuzzy matching for unsafe token shapes.
function getMaximumDistance(token: string): 0 | 1 | 2 {
  if (!/^[a-z]+$/.test(token) || token.length < 4) {
    return 0;
  }

  return token.length >= 8 ? 2 : 1;
}

// Computes bounded optimal-string-alignment distance, including adjacent transpositions.
function getBoundedDamerauLevenshteinDistance(
  first: string,
  second: string,
  maximumDistance: number,
): number | undefined {
  if (Math.abs(first.length - second.length) > maximumDistance) {
    return undefined;
  }

  const rows = Array.from({ length: first.length + 1 }, () =>
    Array<number>(second.length + 1).fill(0),
  );

  for (let firstIndex = 0; firstIndex <= first.length; firstIndex += 1) {
    rows[firstIndex][0] = firstIndex;
  }

  for (let secondIndex = 0; secondIndex <= second.length; secondIndex += 1) {
    rows[0][secondIndex] = secondIndex;
  }

  for (let firstIndex = 1; firstIndex <= first.length; firstIndex += 1) {
    let rowMinimum = maximumDistance + 1;

    for (let secondIndex = 1; secondIndex <= second.length; secondIndex += 1) {
      const substitutionCost = first[firstIndex - 1] === second[secondIndex - 1] ? 0 : 1;
      let distance = Math.min(
        rows[firstIndex - 1][secondIndex] + 1,
        rows[firstIndex][secondIndex - 1] + 1,
        rows[firstIndex - 1][secondIndex - 1] + substitutionCost,
      );

      if (
        firstIndex > 1 &&
        secondIndex > 1 &&
        first[firstIndex - 1] === second[secondIndex - 2] &&
        first[firstIndex - 2] === second[secondIndex - 1]
      ) {
        distance = Math.min(distance, rows[firstIndex - 2][secondIndex - 2] + 1);
      }

      rows[firstIndex][secondIndex] = distance;
      rowMinimum = Math.min(rowMinimum, distance);
    }

    if (rowMinimum > maximumDistance) {
      return undefined;
    }
  }

  const distance = rows[first.length][second.length];

  return distance <= maximumDistance ? distance : undefined;
}

// Builds a deterministic spelling vocabulary, retaining the strongest occurrence of each token.
function getFuzzyCandidates(sourceProducts: readonly Product[]): FuzzyCandidate[] {
  const candidates = new Map<string, FuzzyCandidate>();

  sourceProducts.forEach((product, datasetIndex) => {
    getFuzzyFields(product).forEach((field) => {
      getTokens(field.value).forEach((token, tokenIndex) => {
        const existing = candidates.get(token);
        const candidate = { token, weight: field.weight, datasetIndex, tokenIndex };

        if (
          !existing ||
          candidate.weight > existing.weight ||
          (candidate.weight === existing.weight && candidate.datasetIndex < existing.datasetIndex) ||
          (candidate.weight === existing.weight &&
            candidate.datasetIndex === existing.datasetIndex &&
            candidate.tokenIndex < existing.tokenIndex)
        ) {
          candidates.set(token, candidate);
        }
      });
    });
  });

  return [...candidates.values()];
}

// Interprets unmatched eligible tokens once so results and every facet share the same correction.
function resolveFuzzyTokens(
  sourceProducts: readonly Product[],
  originalTokens: readonly string[],
): { queryTokens: QueryToken[]; corrections: CatalogueCorrection[] } {
  const candidates = getFuzzyCandidates(sourceProducts);
  const allFields = sourceProducts.flatMap(getSearchFields);
  const corrections: CatalogueCorrection[] = [];

  const queryTokens = originalTokens.map<QueryToken>((original) => {
    const alreadyMatches = allFields.some((field) => getMatchMultiplier(field.value, original) > 0);
    const maximumDistance = getMaximumDistance(original);

    if (alreadyMatches || maximumDistance === 0) {
      return { original, interpreted: original, fuzzyDistance: 0 };
    }

    const replacement = candidates
      .filter(({ token }) => token[0] === original[0])
      .map((candidate) => ({
        ...candidate,
        distance: getBoundedDamerauLevenshteinDistance(original, candidate.token, maximumDistance),
      }))
      .filter((candidate): candidate is FuzzyCandidate & { distance: number } =>
        candidate.distance !== undefined && candidate.distance > 0,
      )
      .sort(
        (first, second) =>
          first.distance - second.distance ||
          second.weight - first.weight ||
          first.datasetIndex - second.datasetIndex ||
          first.tokenIndex - second.tokenIndex ||
          first.token.localeCompare(second.token),
      )[0];

    if (!replacement) {
      return { original, interpreted: original, fuzzyDistance: 0 };
    }

    if (
      !corrections.some(
        (correction) =>
          correction.original === original && correction.replacement === replacement.token,
      )
    ) {
      corrections.push({ original, replacement: replacement.token });
    }

    return {
      original,
      interpreted: replacement.token,
      fuzzyDistance: replacement.distance as 1 | 2,
    };
  });

  return { queryTokens, corrections };
}

// Applies product-type and project-requirement constraints after global query interpretation.
function applyFilters(
  matches: readonly CatalogueProductMatch[],
  filters: CatalogueFilters,
): CatalogueProductMatch[] {
  return matches.filter(
    ({ product }) =>
      (!filters.productType || product.productType === filters.productType) &&
      (!filters.projectRequirement ||
        product.projectRequirements.includes(filters.projectRequirement)),
  );
}

// Resolves one global exact-or-fuzzy interpretation before applying catalogue facets.
export function searchCatalogue(
  sourceProducts: readonly Product[],
  filters: CatalogueFilters,
): CatalogueSearchResult {
  const originalTokens = getTokens(filters.query);

  if (originalTokens.length === 0) {
    const allMatches = sourceProducts.map((product) => ({ product, reasons: [] }));

    return {
      mode: 'browse',
      allMatches,
      matches: applyFilters(allMatches, filters),
      corrections: [],
      interpretedQuery: '',
    };
  }

  const exactTokens = originalTokens.map<QueryToken>((token) => ({
    original: token,
    interpreted: token,
    fuzzyDistance: 0,
  }));
  const exactMatches = rankProducts(sourceProducts, exactTokens);

  if (exactMatches.length > 0) {
    return {
      mode: 'exact',
      allMatches: exactMatches,
      matches: applyFilters(exactMatches, filters),
      corrections: [],
      interpretedQuery: originalTokens.join(' '),
    };
  }

  const fuzzyResolution = resolveFuzzyTokens(sourceProducts, originalTokens);
  const fuzzyMatches =
    fuzzyResolution.corrections.length > 0
      ? rankProducts(sourceProducts, fuzzyResolution.queryTokens)
      : [];

  if (fuzzyMatches.length > 0) {
    return {
      mode: 'fuzzy',
      allMatches: fuzzyMatches,
      matches: applyFilters(fuzzyMatches, filters),
      corrections: fuzzyResolution.corrections,
      interpretedQuery: fuzzyResolution.queryTokens.map(({ interpreted }) => interpreted).join(' '),
    };
  }

  return {
    mode: 'none',
    allMatches: [],
    matches: [],
    corrections: [],
    interpretedQuery: originalTokens.join(' '),
  };
}

// Counts each facet against the already-resolved global search interpretation.
export function getCatalogueFacetCounts(
  searchResult: CatalogueSearchResult,
  filters: CatalogueFilters,
): CatalogueFacetCounts {
  const productsForProductTypeCounts = searchResult.allMatches.filter(
    ({ product }) =>
      !filters.projectRequirement ||
      product.projectRequirements.includes(filters.projectRequirement),
  );
  const productsForProjectRequirementCounts = searchResult.allMatches.filter(
    ({ product }) => !filters.productType || product.productType === filters.productType,
  );

  return {
    allProductTypes: productsForProductTypeCounts.length,
    productTypes: Object.fromEntries(
      productTypes.map((productType) => [
        productType,
        productsForProductTypeCounts.filter(({ product }) => product.productType === productType)
          .length,
      ]),
    ) as Record<ProductType, number>,
    allProjectRequirements: productsForProjectRequirementCounts.length,
    projectRequirements: Object.fromEntries(
      projectRequirements.map((projectRequirement) => [
        projectRequirement,
        productsForProjectRequirementCounts.filter(({ product }) =>
          product.projectRequirements.includes(projectRequirement),
        ).length,
      ]),
    ) as Record<ProjectRequirement, number>,
  };
}

// Converts recognizable product-type or requirement language into one catalogue action.
function getDiscoverySuggestion(
  query: string,
  filters: CatalogueFilters,
): Extract<CatalogueSuggestion, { type: 'discovery' }> | undefined {
  const normalisedQuery = normaliseSearchText(query);
  const productType = productTypes.find((candidate) =>
    normaliseSearchText(productTypeLabels[candidate]).startsWith(normalisedQuery),
  );

  if (productType) {
    return {
      type: 'discovery',
      id: `product-type-${productType}`,
      label: `Browse ${productTypeLabels[productType]}`,
      description: 'Product type',
      href: createCatalogueHref({
        query: '',
        productType,
        projectRequirement: filters.projectRequirement,
      }),
    };
  }

  const projectRequirement = getSearchRequirementIntent(query);

  return projectRequirement
    ? {
        type: 'discovery',
        id: `project-requirement-${projectRequirement}`,
        label: `Browse ${projectRequirementLabels[projectRequirement]}`,
        description: 'Project requirement',
        href: createCatalogueHref({
          query: '',
          productType: filters.productType,
          projectRequirement,
        }),
      }
    : undefined;
}

// Returns a small action list while preserving the catalogue's global relevance order.
export function getCatalogueSuggestions(
  sourceProducts: readonly Product[],
  query: string,
  filters: CatalogueFilters = { query: '' },
): CatalogueSuggestion[] {
  const normalisedQuery = normaliseSearchText(query);

  if (normalisedQuery.length < 2) {
    return [];
  }

  const globalResult = searchCatalogue(sourceProducts, { query });
  const suggestions: CatalogueSuggestion[] = globalResult.allMatches.slice(0, 3).map(({ product }) => ({
    type: 'product',
    id: `product-${product.id}`,
    name: product.name,
    sku: product.sku,
    href: `/products/${product.id}`,
  }));
  const discoverySuggestion = getDiscoverySuggestion(query, filters);

  if (discoverySuggestion) {
    suggestions.push(discoverySuggestion);
  }

  suggestions.push({
    type: 'search',
    id: 'search-all',
    label: `Search all products for “${query.trim()}”`,
    href: createCatalogueHref({ ...filters, query }),
  });

  return suggestions.slice(0, 5);
}

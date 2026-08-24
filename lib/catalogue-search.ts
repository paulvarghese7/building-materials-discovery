import {
  categoryLabels,
  createCatalogueHref,
  getSearchIntent,
  performanceNeedLabels,
  performanceNeeds,
  productCategories,
  type CatalogueFilters,
} from '@/lib/products';
import type { PerformanceNeed, Product, ProductCategory } from '@/types';

export type CatalogueSearchMode = 'browse' | 'exact' | 'fuzzy' | 'none';

export type CatalogueMatchReason =
  | 'SKU'
  | 'Product name'
  | 'Category'
  | 'Performance need'
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
  allCategories: number;
  categories: Record<ProductCategory, number>;
  allPerformanceNeeds: number;
  performanceNeeds: Record<PerformanceNeed, number>;
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
  'Category',
  'Performance need',
  'Feature',
  'Short description',
  'Description',
];

function normaliseSearchText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function getTokens(value: string): string[] {
  const normalised = normaliseSearchText(value);

  return normalised ? normalised.split(' ') : [];
}

function getSearchFields(product: Product): SearchField[] {
  return [
    { reason: 'SKU', value: product.sku, weight: 100 },
    { reason: 'Product name', value: product.name, weight: 80 },
    { reason: 'Category', value: categoryLabels[product.category], weight: 50 },
    {
      reason: 'Performance need',
      value: product.performanceNeeds.map((need) => performanceNeedLabels[need]).join(' '),
      weight: 50,
    },
    { reason: 'Feature', value: product.features.join(' '), weight: 30 },
    { reason: 'Short description', value: product.shortDescription, weight: 20 },
    { reason: 'Description', value: product.description, weight: 10 },
  ];
}

function getFuzzyFields(product: Product): SearchField[] {
  return getSearchFields(product).filter(({ reason }) =>
    ['Product name', 'Category', 'Performance need', 'Feature'].includes(reason),
  );
}

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

function applyFilters(
  matches: readonly CatalogueProductMatch[],
  filters: CatalogueFilters,
): CatalogueProductMatch[] {
  return matches.filter(
    ({ product }) =>
      (!filters.category || product.category === filters.category) &&
      (!filters.need || product.performanceNeeds.includes(filters.need)),
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
  const productsForCategoryCounts = searchResult.allMatches.filter(
    ({ product }) => !filters.need || product.performanceNeeds.includes(filters.need),
  );
  const productsForNeedCounts = searchResult.allMatches.filter(
    ({ product }) => !filters.category || product.category === filters.category,
  );

  return {
    allCategories: productsForCategoryCounts.length,
    categories: Object.fromEntries(
      productCategories.map((category) => [
        category,
        productsForCategoryCounts.filter(({ product }) => product.category === category).length,
      ]),
    ) as Record<ProductCategory, number>,
    allPerformanceNeeds: productsForNeedCounts.length,
    performanceNeeds: Object.fromEntries(
      performanceNeeds.map((need) => [
        need,
        productsForNeedCounts.filter(({ product }) => product.performanceNeeds.includes(need)).length,
      ]),
    ) as Record<PerformanceNeed, number>,
  };
}

function getDiscoverySuggestion(
  query: string,
  filters: CatalogueFilters,
): Extract<CatalogueSuggestion, { type: 'discovery' }> | undefined {
  const normalisedQuery = normaliseSearchText(query);
  const category = productCategories.find((candidate) =>
    normaliseSearchText(categoryLabels[candidate]).startsWith(normalisedQuery),
  );

  if (category) {
    return {
      type: 'discovery',
      id: `category-${category}`,
      label: `Browse ${categoryLabels[category]}`,
      description: 'Category',
      href: createCatalogueHref({ query: '', category, need: filters.need }),
    };
  }

  const need = getSearchIntent(query);

  return need
    ? {
        type: 'discovery',
        id: `need-${need}`,
        label: `Browse ${performanceNeedLabels[need]}`,
        description: 'Performance need',
        href: createCatalogueHref({ query: '', category: filters.category, need }),
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

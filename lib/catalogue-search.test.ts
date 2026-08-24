import { describe, expect, it } from 'vitest';

import { products } from '@/data/products';
import {
  getCatalogueFacetCounts,
  getCatalogueSuggestions,
  searchCatalogue,
} from '@/lib/catalogue-search';
import type { Product } from '@/types';

function makeProduct(id: string, overrides: Partial<Product> = {}): Product {
  return {
    id,
    name: `Product ${id}`,
    sku: `SKU-${id}`,
    productType: 'boards',
    shortDescription: 'General product summary.',
    description: 'General product description.',
    projectRequirements: [],
    features: [],
    specifications: [{ label: 'Width', value: '100 mm' }],
    ...overrides,
  };
}

describe('catalogue relevance ranking', () => {
  it('prioritises higher-weight fields and returns no numeric scores', () => {
    const source = [
      makeProduct('feature', { features: ['alpha'] }),
      makeProduct('name', { name: 'Alpha' }),
      makeProduct('sku', { sku: 'alpha' }),
    ];
    const result = searchCatalogue(source, { query: 'alpha' });

    expect(result.allMatches.map(({ product }) => product.id)).toEqual(['sku', 'name', 'feature']);
    expect(result.allMatches[0]).toEqual({ product: source[2], reasons: ['SKU'] });
    expect(result.allMatches[0]).not.toHaveProperty('score');
  });

  it('applies equality and contiguous phrase bonuses without sacrificing deterministic order', () => {
    const phraseResult = searchCatalogue(
      [
        makeProduct('separated', { name: 'Alpha panel beta' }),
        makeProduct('phrase', { name: 'Alpha beta panel' }),
      ],
      { query: 'alpha beta' },
    );
    const equalityResult = searchCatalogue(
      [
        makeProduct('containment', { name: 'Alpha panel' }),
        makeProduct('equality', { name: 'Alpha' }),
      ],
      { query: 'alpha' },
    );

    expect(phraseResult.allMatches[0].product.id).toBe('phrase');
    expect(equalityResult.allMatches[0].product.id).toBe('equality');
  });

  it('requires every token and uses original dataset order to break equal scores', () => {
    const source = [
      makeProduct('first', { features: ['alpha beta'] }),
      makeProduct('second', { features: ['alpha beta'] }),
      makeProduct('partial', { features: ['alpha'] }),
    ];
    const result = searchCatalogue(source, { query: 'alpha beta' });

    expect(result.allMatches.map(({ product }) => product.id)).toEqual(['first', 'second']);
  });

  it('returns no more than two unique explainability reasons', () => {
    const result = searchCatalogue(products, { query: 'acoustic' });

    expect(result.allMatches.length).toBeGreaterThan(0);
    expect(result.allMatches.every(({ reasons }) => reasons.length <= 2)).toBe(true);
    expect(result.allMatches.every(({ reasons }) => new Set(reasons).size === reasons.length)).toBe(
      true,
    );
  });
});

describe('catalogue typo recovery', () => {
  it('never invokes fuzzy recovery when global exact matches exist', () => {
    const result = searchCatalogue(products, { query: 'acoustic' });

    expect(result.mode).toBe('exact');
    expect(result.corrections).toEqual([]);
  });

  it('recovers an adjacent transposition only after exact search returns zero', () => {
    const result = searchCatalogue(products, { query: 'quietbaord' });

    expect(result.mode).toBe('fuzzy');
    expect(result.corrections).toEqual([
      { original: 'quietbaord', replacement: 'quietboard' },
    ]);
    expect(result.allMatches[0].product.id).toBe('quietboard-15');
  });

  it('represents multiple token corrections independently', () => {
    const result = searchCatalogue(products, { query: 'acustic performnace' });

    expect(result.mode).toBe('fuzzy');
    expect(result.corrections).toEqual([
      { original: 'acustic', replacement: 'acoustic' },
      { original: 'performnace', replacement: 'performance' },
    ]);
    expect(result.allMatches).toHaveLength(5);
  });

  it('does not fuzzy-match short, numeric, or digit-containing tokens', () => {
    expect(searchCatalogue(products, { query: 'xyz' }).mode).toBe('none');
    expect(searchCatalogue(products, { query: '1513' }).mode).toBe('none');
    expect(searchCatalogue(products, { query: 'quietboar1' }).mode).toBe('none');
  });

  it('does not recover typos from descriptions outside the approved fuzzy fields', () => {
    const source = [makeProduct('description-only', { description: 'uniquewording' })];

    expect(searchCatalogue(source, { query: 'uniquewordng' }).mode).toBe('none');
  });
});

describe('contextual catalogue facets', () => {
  it('keeps one fuzzy interpretation fixed while applying filters and counts', () => {
    const filters = { query: 'acustic', productType: 'boards' } as const;
    const result = searchCatalogue(products, filters);
    const counts = getCatalogueFacetCounts(result, filters);

    expect(result.mode).toBe('fuzzy');
    expect(result.allMatches).toHaveLength(5);
    expect(result.matches.map(({ product }) => product.id)).toEqual(['quietboard-15']);
    expect(counts.productTypes.boards).toBe(1);
    expect(counts.productTypes.insulation).toBe(2);
    expect(counts.allProjectRequirements).toBe(1);
    expect(counts.projectRequirements.acoustic).toBe(1);
  });
});

describe('catalogue suggestions', () => {
  it('uses the same global product order as catalogue search and returns at most five actions', () => {
    const suggestions = getCatalogueSuggestions(products, 'board');
    const productSuggestions = suggestions.filter(({ type }) => type === 'product');
    const rankedIds = searchCatalogue(products, { query: 'board' }).allMatches
      .slice(0, 3)
      .map(({ product }) => `product-${product.id}`);

    expect(productSuggestions.map(({ id }) => id)).toEqual(rankedIds);
    expect(suggestions).toHaveLength(5);
    expect(suggestions.at(-1)?.type).toBe('search');
  });

  it('preserves active filters in the search-all action', () => {
    const suggestions = getCatalogueSuggestions(products, 'quiet', {
      query: '',
      productType: 'boards',
      projectRequirement: 'acoustic',
    });

    expect(suggestions.at(-1)).toMatchObject({
      type: 'search',
      href: '/products?q=quiet&type=boards&requirement=acoustic',
    });
  });
});

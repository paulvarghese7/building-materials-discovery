import { describe, expect, it } from 'vitest';

import { products } from '@/data/products';
import {
  MAX_SEARCH_QUERY_LENGTH,
  categoryLabels,
  createCatalogueHref,
  filterProducts,
  getProductById,
  getSearchIntentSuggestion,
  parseCatalogueFilters,
  performanceNeedLabels,
  searchProducts,
} from '@/lib/products';

describe('product dataset', () => {
  it('contains 20 products with unique IDs and SKUs', () => {
    expect(products).toHaveLength(20);
    expect(new Set(products.map((product) => product.id))).toHaveLength(20);
    expect(new Set(products.map((product) => product.sku))).toHaveLength(20);
  });

  it('contains five products in every category', () => {
    for (const category of Object.keys(categoryLabels)) {
      expect(products.filter((product) => product.category === category)).toHaveLength(5);
    }
  });

  it('matches the locked performance distribution', () => {
    expect(products.filter((product) => product.performanceNeeds.includes('acoustic'))).toHaveLength(5);
    expect(products.filter((product) => product.performanceNeeds.includes('fire'))).toHaveLength(5);
    expect(products.filter((product) => product.performanceNeeds.includes('moisture'))).toHaveLength(6);
    expect(products.filter((product) => product.performanceNeeds.length === 0)).toHaveLength(6);
  });

  it('gives every product at least four specifications', () => {
    expect(products.every((product) => product.specifications.length >= 4)).toBe(true);
  });
});

describe('product lookup', () => {
  it('returns a product for a valid ID', () => {
    expect(getProductById('quietboard-15')?.sku).toBe('BLD-QB-1512');
  });

  it('returns undefined for an unknown ID', () => {
    expect(getProductById('does-not-exist')).toBeUndefined();
  });
});

describe('catalogue filter parsing', () => {
  it('trims whitespace and keeps supported values', () => {
    expect(
      parseCatalogueFilters({
        q: '  acoustic   board  ',
        category: 'boards',
        need: 'acoustic',
      }),
    ).toEqual({ query: 'acoustic board', category: 'boards', need: 'acoustic' });
  });

  it('uses the first repeated parameter value', () => {
    expect(
      parseCatalogueFilters({
        q: ['board', 'ignored'],
        category: ['boards', 'profiles'],
        need: ['fire', 'moisture'],
      }),
    ).toEqual({ query: 'board', category: 'boards', need: 'fire' });
  });

  it('ignores unsupported category and performance values', () => {
    expect(parseCatalogueFilters({ q: ' board ', category: 'banana', need: 'unknown' })).toEqual({
      query: 'board',
    });
  });

  it('limits direct URL queries to the supported maximum length', () => {
    expect(parseCatalogueFilters({ q: 'a'.repeat(150) }).query).toHaveLength(
      MAX_SEARCH_QUERY_LENGTH,
    );
  });
});

describe('catalogue URLs', () => {
  it('creates a stable URL containing only active discovery state', () => {
    expect(
      createCatalogueHref({
        query: 'acoustic board',
        category: 'boards',
        need: 'acoustic',
      }),
    ).toBe('/products?q=acoustic+board&category=boards&need=acoustic');
  });

  it('returns the catalogue root when no discovery state is active', () => {
    expect(createCatalogueHref({ query: '' })).toBe('/products');
  });

  it('normalizes and limits query text before adding it to a URL', () => {
    const href = createCatalogueHref({ query: `  ${'a'.repeat(120)}   board  ` });
    const query = new URL(href, 'https://buildmatch.test').searchParams.get('q');

    expect(query).toHaveLength(MAX_SEARCH_QUERY_LENGTH);
    expect(query).toBe('a'.repeat(MAX_SEARCH_QUERY_LENGTH));
  });
});

describe('product search', () => {
  it.each([
    ['QUIETBOARD', 'quietboard-15'],
    ['bld-qb-1512', 'quietboard-15'],
    ['door openings', 'reinforcedprofile-ua-50'],
    ['self-adhesive', 'resilientstrip-50'],
  ])('finds %s in an approved product field', (query, expectedId) => {
    expect(searchProducts(products, query).map((product) => product.id)).toContain(expectedId);
  });

  it('searches human-readable category labels', () => {
    expect(searchProducts(products, categoryLabels.accessories)).toHaveLength(5);
  });

  it('searches human-readable performance labels', () => {
    expect(searchProducts(products, performanceNeedLabels.fire)).toHaveLength(5);
  });

  it('matches every token in a multi-word query regardless of whitespace and casing', () => {
    expect(searchProducts(products, '  ACOUSTIC \n BOARD  ').map((product) => product.id)).toEqual([
      'quietboard-15',
    ]);
  });

  it('does not search technical specification values', () => {
    expect(searchProducts(products, 'DX51D')).toEqual([]);
  });
});

describe('product filtering', () => {
  it.each(['boards', 'insulation', 'profiles', 'accessories'] as const)(
    'filters the %s category',
    (category) => {
      expect(filterProducts(products, { query: '', category })).toHaveLength(5);
    },
  );

  it.each([
    ['acoustic', 5],
    ['fire', 5],
    ['moisture', 6],
  ] as const)('filters the %s performance need', (need, expectedCount) => {
    expect(filterProducts(products, { query: '', need })).toHaveLength(expectedCount);
  });

  it('allows a multi-performance product to match either need', () => {
    const acousticIds = filterProducts(products, { query: '', need: 'acoustic' }).map(
      (product) => product.id,
    );
    const fireIds = filterProducts(products, { query: '', need: 'fire' }).map(
      (product) => product.id,
    );

    expect(acousticIds).toContain('securewool-af');
    expect(fireIds).toContain('securewool-af');
  });

  it('combines search, category, and performance filters with AND semantics', () => {
    expect(
      filterProducts(products, { query: 'board', category: 'boards', need: 'fire' }).map(
        (product) => product.id,
      ),
    ).toEqual(['flameboard-type-f', 'shieldboard-fm']);
  });

  it('preserves the intentional profiles and fire empty result', () => {
    expect(filterProducts(products, { query: '', category: 'profiles', need: 'fire' })).toEqual([]);
  });
});

describe('search-intent suggestions', () => {
  it.each([
    ['noise', 'acoustic'],
    ['heat', 'fire'],
    ['damp', 'moisture'],
  ] as const)('maps %s to %s after a zero-result search', (query, expectedNeed) => {
    expect(getSearchIntentSuggestion(products, { query })).toBe(expectedNeed);
  });

  it('does not suggest an intent when direct results already exist', () => {
    expect(getSearchIntentSuggestion(products, { query: 'sound' })).toBeUndefined();
  });

  it('does not suggest an intent for an empty query', () => {
    expect(getSearchIntentSuggestion(products, { query: '' })).toBeUndefined();
  });
});

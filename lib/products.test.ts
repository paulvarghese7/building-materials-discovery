import { describe, expect, it } from 'vitest';

import { products } from '@/data/products';
import {
  MAX_SEARCH_QUERY_LENGTH,
  productTypeLabels,
  createCatalogueHref,
  createSearchRequirementIntentHref,
  filterProducts,
  getProductById,
  getSearchRequirementIntentSuggestion,
  parseCatalogueFilters,
  projectRequirementLabels,
  searchProducts,
} from '@/lib/products';

describe('product dataset', () => {
  it('contains 20 products with unique IDs and SKUs', () => {
    expect(products).toHaveLength(20);
    expect(new Set(products.map((product) => product.id))).toHaveLength(20);
    expect(new Set(products.map((product) => product.sku))).toHaveLength(20);
  });

  it('contains five products in every product type', () => {
    for (const productType of Object.keys(productTypeLabels)) {
      expect(products.filter((product) => product.productType === productType)).toHaveLength(5);
    }
  });

  it('matches the locked project-requirement distribution', () => {
    expect(products.filter((product) => product.projectRequirements.includes('acoustic'))).toHaveLength(5);
    expect(products.filter((product) => product.projectRequirements.includes('fire'))).toHaveLength(5);
    expect(products.filter((product) => product.projectRequirements.includes('moisture'))).toHaveLength(6);
    expect(products.filter((product) => product.projectRequirements.length === 0)).toHaveLength(6);
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
        type: 'boards',
        requirement: 'acoustic',
      }),
    ).toEqual({
      query: 'acoustic board',
      productType: 'boards',
      projectRequirement: 'acoustic',
    });
  });

  it('uses the first repeated parameter value', () => {
    expect(
      parseCatalogueFilters({
        q: ['board', 'ignored'],
        type: ['boards', 'profiles'],
        requirement: ['fire', 'moisture'],
      }),
    ).toEqual({ query: 'board', productType: 'boards', projectRequirement: 'fire' });
  });

  it('ignores unsupported product-type and project-requirement values', () => {
    expect(
      parseCatalogueFilters({ q: ' board ', type: 'banana', requirement: 'unknown' }),
    ).toEqual({ query: 'board' });
  });

  it('accepts legacy category and need parameters as compatibility aliases', () => {
    expect(parseCatalogueFilters({ category: 'boards', need: 'fire' })).toEqual({
      query: '',
      productType: 'boards',
      projectRequirement: 'fire',
    });
  });

  it('prefers supported canonical parameters over legacy aliases', () => {
    expect(
      parseCatalogueFilters({
        type: 'insulation',
        category: 'boards',
        requirement: 'moisture',
        need: 'fire',
      }),
    ).toEqual({
      query: '',
      productType: 'insulation',
      projectRequirement: 'moisture',
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
        productType: 'boards',
        projectRequirement: 'acoustic',
      }),
    ).toBe('/products?q=acoustic+board&type=boards&requirement=acoustic');
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

  it('searches human-readable product-type labels', () => {
    expect(searchProducts(products, productTypeLabels.accessories)).toHaveLength(5);
  });

  it('searches human-readable project-requirement labels', () => {
    expect(searchProducts(products, projectRequirementLabels.fire)).toHaveLength(5);
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
    'filters the %s product type',
    (productType) => {
      expect(filterProducts(products, { query: '', productType })).toHaveLength(5);
    },
  );

  it.each([
    ['acoustic', 5],
    ['fire', 5],
    ['moisture', 6],
  ] as const)('filters the %s project requirement', (projectRequirement, expectedCount) => {
    expect(filterProducts(products, { query: '', projectRequirement })).toHaveLength(expectedCount);
  });

  it('allows a multi-requirement product to match either project requirement', () => {
    const acousticIds = filterProducts(products, { query: '', projectRequirement: 'acoustic' }).map(
      (product) => product.id,
    );
    const fireIds = filterProducts(products, { query: '', projectRequirement: 'fire' }).map(
      (product) => product.id,
    );

    expect(acousticIds).toContain('securewool-af');
    expect(fireIds).toContain('securewool-af');
  });

  it('combines search, product-type, and project-requirement filters with AND semantics', () => {
    expect(
      filterProducts(products, {
        query: 'board',
        productType: 'boards',
        projectRequirement: 'fire',
      }).map((product) => product.id),
    ).toEqual(['flameboard-type-f', 'shieldboard-fm']);
  });

  it('preserves the intentional profiles and fire empty result', () => {
    expect(
      filterProducts(products, {
        query: '',
        productType: 'profiles',
        projectRequirement: 'fire',
      }),
    ).toEqual([]);
  });
});

describe('search-intent suggestions', () => {
  it.each([
    ['noise', 'acoustic'],
    ['heat', 'fire'],
    ['damp', 'moisture'],
  ] as const)('maps %s to %s after a zero-result search', (query, expectedRequirement) => {
    expect(getSearchRequirementIntentSuggestion(products, { query })).toBe(expectedRequirement);
  });

  it('does not suggest an intent when direct results already exist', () => {
    expect(getSearchRequirementIntentSuggestion(products, { query: 'sound' })).toBeUndefined();
  });

  it('does not suggest an intent for an empty query', () => {
    expect(getSearchRequirementIntentSuggestion(products, { query: '' })).toBeUndefined();
  });

  it('creates a CTA that removes the query, preserves type, and replaces requirement', () => {
    expect(
      createSearchRequirementIntentHref(
        {
          query: 'noise',
          productType: 'insulation',
          projectRequirement: 'fire',
        },
        'acoustic',
      ),
    ).toBe('/products?type=insulation&requirement=acoustic');
  });
});

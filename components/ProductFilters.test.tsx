import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ProductFilters } from '@/components/ProductFilters';

const counts = {
  allProductTypes: 5,
  productTypes: { boards: 2, insulation: 1, profiles: 0, accessories: 2 },
  allProjectRequirements: 5,
  projectRequirements: { acoustic: 1, fire: 2, moisture: 0 },
};

describe('responsive product filters', () => {
  it('provides a native mobile disclosure and a named desktop filter region', () => {
    const markup = renderToStaticMarkup(
      <ProductFilters
        counts={counts}
        filters={{ query: '', productType: 'boards', projectRequirement: 'fire' }}
      />,
    );

    expect(markup).toContain('<details');
    expect(markup).toContain('<summary');
    expect(markup).toContain('2 active filters');
    expect(markup).toContain('aria-label="Product filters"');
    expect(markup).toContain('Product type');
    expect(markup).toContain('All product types');
    expect(markup).toContain('Project requirement');
    expect(markup).toContain('All requirements');
  });

  it('keeps search and the other active filter when a filter link changes', () => {
    const markup = renderToStaticMarkup(
      <ProductFilters
        counts={counts}
        filters={{ query: 'board', productType: 'boards', projectRequirement: 'fire' }}
      />,
    );

    expect(markup).toContain('/products?q=board&amp;type=insulation&amp;requirement=fire');
    expect(markup).toContain('/products?q=board&amp;type=boards&amp;requirement=moisture');
  });

  it('shows contextual counts without disabling zero-count links', () => {
    const markup = renderToStaticMarkup(
      <ProductFilters counts={counts} filters={{ query: 'board' }} />,
    );

    expect(markup).toContain('aria-label="0 products"');
    expect(markup).toContain('href="/products?q=board&amp;type=profiles"');
  });
});

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ProductFilters } from '@/components/ProductFilters';

describe('responsive product filters', () => {
  it('provides a native mobile disclosure and a named desktop filter region', () => {
    const markup = renderToStaticMarkup(
      <ProductFilters filters={{ query: '', category: 'boards', need: 'fire' }} />,
    );

    expect(markup).toContain('<details');
    expect(markup).toContain('<summary');
    expect(markup).toContain('2 active filters');
    expect(markup).toContain('aria-label="Product filters"');
  });

  it('keeps search and the other active filter when a filter link changes', () => {
    const markup = renderToStaticMarkup(
      <ProductFilters filters={{ query: 'board', category: 'boards', need: 'fire' }} />,
    );

    expect(markup).toContain('/products?q=board&amp;category=insulation&amp;need=fire');
    expect(markup).toContain('/products?q=board&amp;category=boards&amp;need=moisture');
  });
});

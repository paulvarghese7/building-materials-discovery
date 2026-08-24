import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import Home from '@/app/page';
import { performanceNeeds, productCategories } from '@/lib/products';

describe('homepage discovery links', () => {
  const markup = renderToStaticMarkup(<Home />);

  it('hands search queries to the catalogue URL contract', () => {
    expect(markup).toContain('action="/products"');
    expect(markup).toContain('method="get"');
    expect(markup).toContain('name="q"');
  });

  it('links every category into its filtered catalogue view', () => {
    for (const category of productCategories) {
      expect(markup).toContain(`href="/products?category=${category}"`);
    }
  });

  it('links every performance need into its filtered catalogue view', () => {
    for (const need of performanceNeeds) {
      expect(markup).toContain(`href="/products?need=${need}"`);
    }
  });
});

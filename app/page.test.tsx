import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

import Home from '@/app/page';
import { performanceNeeds, productCategories } from '@/lib/products';

describe('homepage discovery links', () => {
  const markup = renderToStaticMarkup(<Home />);

  it('hands search queries to the catalogue URL contract', () => {
    expect(markup).toContain('action="/products"');
    expect(markup).toContain('method="get"');
    expect(markup).toContain('name="q"');
    expect(markup).toContain('role="combobox"');
    expect(markup).toContain('aria-autocomplete="list"');
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

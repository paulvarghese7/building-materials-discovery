import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

import Home from '@/app/page';
import { projectRequirements, productTypes } from '@/lib/products';

describe('homepage discovery links', () => {
  const markup = renderToStaticMarkup(<Home />);

  it('hands search queries to the catalogue URL contract', () => {
    expect(markup).toContain('action="/products"');
    expect(markup).toContain('method="get"');
    expect(markup).toContain('name="q"');
    expect(markup).toContain('role="combobox"');
    expect(markup).toContain('aria-autocomplete="list"');
  });

  it('links every product type into its filtered catalogue view', () => {
    for (const productType of productTypes) {
      expect(markup).toContain(`href="/products?type=${productType}"`);
    }
  });

  it('links every project requirement into its filtered catalogue view', () => {
    for (const projectRequirement of projectRequirements) {
      expect(markup).toContain(`href="/products?requirement=${projectRequirement}"`);
    }
  });

  it('uses the shared discovery terminology in both homepage paths', () => {
    expect(markup).toContain('Browse by product type');
    expect(markup).toContain('Browse by project requirement');
  });
});

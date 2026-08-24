import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { EmptyState } from '@/components/EmptyState';

describe('empty-state recovery navigation', () => {
  it('offers at most two targeted actions while preserving unrelated filters', () => {
    const markup = renderToStaticMarkup(
      <EmptyState
        filters={{ query: 'quiet', productType: 'boards', projectRequirement: 'fire' }}
      />,
    );

    expect(markup).toContain('href="/products?type=boards&amp;requirement=fire"');
    expect(markup).toContain('Clear search query');
    expect(markup).toContain('href="/products?q=quiet&amp;requirement=fire"');
    expect(markup).toContain('Search all product types');
    expect(markup).not.toContain('Search all requirements');
  });

  it('shows only one broaden action alongside an intent suggestion', () => {
    const markup = renderToStaticMarkup(
      <EmptyState
        filters={{ query: 'noise', productType: 'boards', projectRequirement: 'fire' }}
        suggestion={{
          href: '/products?type=boards&requirement=acoustic',
          projectRequirement: 'acoustic',
        }}
      />,
    );

    expect(markup).toContain('Looking for products with acoustic performance?');
    expect(markup).toContain('Clear search query');
    expect(markup).not.toContain('Search all product types');
    expect(markup).not.toContain('Search all requirements');
  });
});

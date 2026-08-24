import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { EmptyState } from '@/components/EmptyState';

describe('empty-state recovery navigation', () => {
  it('offers at most two targeted actions while preserving unrelated filters', () => {
    const markup = renderToStaticMarkup(
      <EmptyState
        filters={{ query: 'quiet', category: 'boards', need: 'fire' }}
      />,
    );

    expect(markup).toContain('href="/products?category=boards&amp;need=fire"');
    expect(markup).toContain('Clear search query');
    expect(markup).toContain('href="/products?q=quiet&amp;need=fire"');
    expect(markup).toContain('Search all categories');
    expect(markup).not.toContain('Search all performance needs');
  });

  it('shows only one broaden action alongside an intent suggestion', () => {
    const markup = renderToStaticMarkup(
      <EmptyState
        filters={{ query: 'noise', category: 'boards', need: 'fire' }}
        suggestion={{ href: '/products?category=boards&need=acoustic', need: 'acoustic' }}
      />,
    );

    expect(markup).toContain('Looking for products with acoustic performance?');
    expect(markup).toContain('Clear search query');
    expect(markup).not.toContain('Search all categories');
    expect(markup).not.toContain('Search all performance needs');
  });
});

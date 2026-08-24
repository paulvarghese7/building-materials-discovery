import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

const route = vi.hoisted(() => ({ pathname: '/' }));

vi.mock('next/font/google', () => ({
  Geist: () => ({ variable: 'font-geist-sans' }),
  Geist_Mono: () => ({ variable: 'font-geist-mono' }),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => route.pathname,
}));

import RootLayout from '@/app/layout';

describe('root layout navigation', () => {
  function renderLayout(pathname: string): string {
    route.pathname = pathname;

    return renderToStaticMarkup(
      <RootLayout>
        <main>Page content</main>
      </RootLayout>,
    );
  }

  it('shows only the products destination on the homepage', () => {
    const markup = renderLayout('/');

    expect(markup).toContain('aria-label="BuildMatch home"');
    expect(markup).toContain('aria-label="Primary navigation"');
    expect(markup).not.toMatch(/href="\/"[^>]*>Home<\/a>/);
    expect(markup).toMatch(/href="\/products"[^>]*>Products<\/a>/);
    expect(markup).toContain('Page content');
  });

  it('shows only the home destination on the catalogue page', () => {
    const markup = renderLayout('/products');

    expect(markup).toMatch(/href="\/"[^>]*>Home<\/a>/);
    expect(markup).not.toMatch(/href="\/products"[^>]*>Products<\/a>/);
  });

  it('keeps both useful destinations on product detail pages', () => {
    const markup = renderLayout('/products/quietboard-15');

    expect(markup).toMatch(/href="\/"[^>]*>Home<\/a>/);
    expect(markup).toMatch(/href="\/products"[^>]*>Products<\/a>/);
  });
});

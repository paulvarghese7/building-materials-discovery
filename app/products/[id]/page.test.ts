import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { products } from '@/data/products';

import ProductPage, { generateMetadata, generateStaticParams } from './page';

describe('product detail route', () => {
  it('generates one static route for every product', () => {
    expect(generateStaticParams()).toEqual(products.map((product) => ({ id: product.id })));
  });

  it('generates product-specific metadata', async () => {
    await expect(
      generateMetadata({ params: Promise.resolve({ id: 'quietboard-15' }) }),
    ).resolves.toEqual({
      title: 'QuietBoard 15 | BuildMatch',
      description: 'Higher-mass board for sound-sensitive internal partitions.',
    });
  });

  it('uses safe metadata for an unknown product ID', async () => {
    await expect(
      generateMetadata({ params: Promise.resolve({ id: 'not-a-real-product' }) }),
    ).resolves.toEqual({
      title: 'Product not found | BuildMatch',
    });
  });

  it('links category, performance, and similar-product discovery back to the catalogue', async () => {
    const markup = renderToStaticMarkup(
      await ProductPage({ params: Promise.resolve({ id: 'quietboard-15' }) }),
    );

    expect(markup).toContain('aria-label="Browse Boards products"');
    expect(markup).toContain('href="/products?category=boards"');
    expect(markup).toContain('aria-label="Browse products for Acoustic Performance"');
    expect(markup).toContain('href="/products?need=acoustic"');
    expect(markup).toContain('View similar products in boards');
  });
});

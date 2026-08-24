import { describe, expect, it } from 'vitest';

import { products } from '@/data/products';

import { generateMetadata, generateStaticParams } from './page';

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
});

import { ProductCard } from '@/components/ProductCard';
import type { Product } from '@/types';

interface ProductGridProps {
  products: readonly Product[];
}

// Renders catalogue products in a responsive list while preserving semantic list structure.
export function ProductGrid({ products }: ProductGridProps) {
  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}

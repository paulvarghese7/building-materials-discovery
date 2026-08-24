import { ProductCard } from '@/components/ProductCard';
import type { CatalogueProductMatch } from '@/lib/catalogue-search';

interface ProductGridProps {
  matches: readonly CatalogueProductMatch[];
}

// Renders catalogue products in a responsive list while preserving semantic list structure.
export function ProductGrid({ matches }: ProductGridProps) {
  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {matches.map(({ product, reasons }) => (
        <li key={product.id}>
          <ProductCard product={product} matchReasons={reasons} />
        </li>
      ))}
    </ul>
  );
}

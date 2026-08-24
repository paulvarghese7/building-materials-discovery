import type { Metadata } from 'next';

import { ActiveFilters } from '@/components/ActiveFilters';
import { EmptyState } from '@/components/EmptyState';
import { ProductFilters } from '@/components/ProductFilters';
import { ProductGrid } from '@/components/ProductGrid';
import { SearchInput } from '@/components/SearchInput';
import { products } from '@/data/products';
import {
  createSearchIntentHref,
  filterProducts,
  getSearchIntentSuggestion,
  parseCatalogueFilters,
  type CatalogueSearchParams,
} from '@/lib/products';

export const metadata: Metadata = {
  title: 'Products | BuildMatch',
  description: 'Browse the fictional building-material product catalogue.',
};

interface ProductsPageProps {
  searchParams: Promise<CatalogueSearchParams>;
}

// Formats the result total with the correct singular or plural product label.
function formatProductCount(count: number): string {
  return `${count} ${count === 1 ? 'product' : 'products'}`;
}

// Reads catalogue state from the URL and renders the matching static product collection.
export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const filters = parseCatalogueFilters(await searchParams);
  const filteredProducts = filterProducts(products, filters);
  const suggestedNeed = getSearchIntentSuggestion(products, filters);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">
            BuildMatch catalogue
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Products</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Explore fictional building materials by product type and performance need.
          </p>
        </div>
      </header>

      <section
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8"
        aria-labelledby="product-results-heading"
      >
        <SearchInput filters={filters} />

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <ProductFilters filters={filters} />

          <div className="min-w-0">
            <ActiveFilters filters={filters} />

            <div className="mb-6 flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
              <h2 id="product-results-heading" className="text-2xl font-semibold tracking-tight">
                Product catalogue
              </h2>
              <p
                className="shrink-0 text-sm font-medium text-slate-600"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                {formatProductCount(filteredProducts.length)}
              </p>
            </div>

            {filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} />
            ) : (
              <EmptyState
                suggestion={
                  suggestedNeed
                    ? {
                        need: suggestedNeed,
                        href: createSearchIntentHref(filters, suggestedNeed),
                      }
                    : undefined
                }
              />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

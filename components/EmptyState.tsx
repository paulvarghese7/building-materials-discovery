import Link from 'next/link';

import { SearchSuggestion } from '@/components/SearchSuggestion';
import { createCatalogueHref, type CatalogueFilters } from '@/lib/products';
import type { PerformanceNeed } from '@/types';

interface EmptyStateProps {
  filters: CatalogueFilters;
  suggestion?: {
    href: string;
    need: PerformanceNeed;
  };
}

// Replaces an empty grid with recovery actions and an optional explicit intent suggestion.
export function EmptyState({ filters, suggestion }: EmptyStateProps) {
  const broadenActions: { href: string; label: string }[] = [];

  // Offer the narrowest reversible changes first while preserving every unrelated active filter.
  if (filters.query) {
    broadenActions.push({
      href: createCatalogueHref({ ...filters, query: '' }),
      label: 'Clear search query',
    });
  }

  if (filters.category) {
    broadenActions.push({
      href: createCatalogueHref({ ...filters, category: undefined }),
      label: 'Search all categories',
    });
  }

  if (filters.need) {
    broadenActions.push({
      href: createCatalogueHref({ ...filters, need: undefined }),
      label: 'Search all performance needs',
    });
  }

  // Keep recovery choices focused: the intent suggestion already occupies one prominent action.
  const visibleActions = broadenActions.slice(0, suggestion ? 1 : 2);

  return (
    <section
      className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center sm:px-8 sm:py-12"
      aria-labelledby="empty-state-heading"
    >
      <div className="mx-auto max-w-xl">
        <h3 id="empty-state-heading" className="text-xl font-semibold text-slate-950">
          No matching products
        </h3>
        <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
          Try removing a search term or filter to broaden the catalogue results.
        </p>

        {suggestion && <SearchSuggestion href={suggestion.href} need={suggestion.need} />}

        {visibleActions.length > 0 && (
          <nav className="mt-6 flex flex-wrap justify-center gap-3" aria-label="Broaden your search">
            {visibleActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                scroll={false}
                className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
              >
                {action.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </section>
  );
}

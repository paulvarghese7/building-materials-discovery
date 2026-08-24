import Link from 'next/link';

import { SearchSuggestion } from '@/components/SearchSuggestion';
import type { PerformanceNeed } from '@/types';

interface EmptyStateProps {
  suggestion?: {
    href: string;
    need: PerformanceNeed;
  };
}

// Replaces an empty grid with recovery actions and an optional explicit intent suggestion.
export function EmptyState({ suggestion }: EmptyStateProps) {
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

        <Link
          href="/products"
          scroll={false}
          className="mt-6 inline-flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          Clear search and filters
        </Link>
      </div>
    </section>
  );
}

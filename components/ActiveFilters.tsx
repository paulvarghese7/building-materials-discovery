import Link from 'next/link';

import {
  categoryLabels,
  createCatalogueHref,
  performanceNeedLabels,
  type CatalogueFilters,
} from '@/lib/products';

interface ActiveFiltersProps {
  filters: CatalogueFilters;
}

interface ActiveFilterLinkProps {
  href: string;
  label: string;
  removeLabel: string;
}

function ActiveFilterLink({ href, label, removeLabel }: ActiveFilterLinkProps) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-label={removeLabel}
      className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-900 hover:border-teal-300 hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
    >
      <span className="truncate">{label}</span>
      <span aria-hidden="true">×</span>
    </Link>
  );
}

// Makes every active catalogue value visible and independently removable.
export function ActiveFilters({ filters }: ActiveFiltersProps) {
  const hasActiveFilters = Boolean(filters.query || filters.category || filters.need);

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <section
      className="mb-6 rounded-xl border border-slate-200 bg-white p-4"
      aria-labelledby="active-filters-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="active-filters-heading" className="text-sm font-semibold text-slate-900">
          Active filters
        </h2>
        <Link
          href="/products"
          scroll={false}
          className="inline-flex min-h-11 items-center rounded px-1 text-sm font-semibold text-teal-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          Clear all
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {filters.query && (
          <ActiveFilterLink
            href={createCatalogueHref({ ...filters, query: '' })}
            label={`Search: “${filters.query}”`}
            removeLabel={`Remove search query ${filters.query}`}
          />
        )}
        {filters.category && (
          <ActiveFilterLink
            href={createCatalogueHref({ ...filters, category: undefined })}
            label={categoryLabels[filters.category]}
            removeLabel={`Remove category filter ${categoryLabels[filters.category]}`}
          />
        )}
        {filters.need && (
          <ActiveFilterLink
            href={createCatalogueHref({ ...filters, need: undefined })}
            label={performanceNeedLabels[filters.need]}
            removeLabel={`Remove performance filter ${performanceNeedLabels[filters.need]}`}
          />
        )}
      </div>
    </section>
  );
}

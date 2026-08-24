import Link from 'next/link';

import {
  productTypeLabels,
  createCatalogueHref,
  projectRequirementLabels,
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
      className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-900 hover:border-brand-300 hover:bg-brand-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
    >
      <span className="truncate">{label}</span>
      <span aria-hidden="true">×</span>
    </Link>
  );
}

// Makes every active catalogue value visible and independently removable.
export function ActiveFilters({ filters }: ActiveFiltersProps) {
  const hasActiveFilters = Boolean(
    filters.query || filters.productType || filters.projectRequirement,
  );

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
          className="inline-flex min-h-11 items-center rounded-md px-2 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50 hover:text-brand-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
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
        {filters.productType && (
          <ActiveFilterLink
            href={createCatalogueHref({ ...filters, productType: undefined })}
            label={productTypeLabels[filters.productType]}
            removeLabel={`Remove product type filter ${productTypeLabels[filters.productType]}`}
          />
        )}
        {filters.projectRequirement && (
          <ActiveFilterLink
            href={createCatalogueHref({ ...filters, projectRequirement: undefined })}
            label={projectRequirementLabels[filters.projectRequirement]}
            removeLabel={`Remove project requirement filter ${projectRequirementLabels[filters.projectRequirement]}`}
          />
        )}
      </div>
    </section>
  );
}

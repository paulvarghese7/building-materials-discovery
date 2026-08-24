import Link from 'next/link';

import {
  categoryLabels,
  createCatalogueHref,
  performanceNeedLabels,
  productCategories,
  performanceNeeds,
  type CatalogueFilters,
} from '@/lib/products';
import type { CatalogueFacetCounts } from '@/lib/catalogue-search';
import type { PerformanceNeed, ProductCategory } from '@/types';

interface ProductFiltersProps {
  counts: CatalogueFacetCounts;
  filters: CatalogueFilters;
}

interface FilterLinkProps {
  active: boolean;
  count: number;
  href: string;
  label: string;
}

interface FilterGroupsProps {
  counts: CatalogueFacetCounts;
  filters: CatalogueFilters;
  idPrefix: string;
}

const filterLinkClassName =
  'flex min-h-11 items-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700';

function FilterLink({ active, count, href, label }: FilterLinkProps) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? 'page' : undefined}
      className={`${filterLinkClassName} ${
        active
          ? 'border-teal-700 bg-teal-50 font-semibold text-teal-900'
          : 'border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50'
      }`}
    >
      <span className="flex-1">{label}</span>
      <span
        className="ml-3 text-xs tabular-nums text-slate-500"
        aria-label={`${count} ${count === 1 ? 'product' : 'products'}`}
      >
        {count}
      </span>
    </Link>
  );
}

function getCategoryHref(filters: CatalogueFilters, category?: ProductCategory): string {
  return createCatalogueHref({ ...filters, category });
}

function getNeedHref(filters: CatalogueFilters, need?: PerformanceNeed): string {
  return createCatalogueHref({ ...filters, need });
}

function FilterGroups({ counts, filters, idPrefix }: FilterGroupsProps) {
  const categoryHeadingId = `${idPrefix}-category-filter-heading`;
  const performanceHeadingId = `${idPrefix}-performance-filter-heading`;

  return (
    <>
      <div>
        <h2 id={categoryHeadingId} className="text-sm font-semibold text-slate-950">
          Category
        </h2>
        <nav className="mt-2" aria-labelledby={categoryHeadingId}>
          <ul className="space-y-1">
            <li>
              <FilterLink
                active={!filters.category}
                count={counts.allCategories}
                href={getCategoryHref(filters)}
                label="All categories"
              />
            </li>
            {productCategories.map((category) => (
              <li key={category}>
                <FilterLink
                  active={filters.category === category}
                  count={counts.categories[category]}
                  href={getCategoryHref(filters, category)}
                  label={categoryLabels[category]}
                />
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mt-7 border-t border-slate-200 pt-6">
        <h2 id={performanceHeadingId} className="text-sm font-semibold text-slate-950">
          Performance need
        </h2>
        <nav className="mt-2" aria-labelledby={performanceHeadingId}>
          <ul className="space-y-1">
            <li>
              <FilterLink
                active={!filters.need}
                count={counts.allPerformanceNeeds}
                href={getNeedHref(filters)}
                label="All performance needs"
              />
            </li>
            {performanceNeeds.map((need) => (
              <li key={need}>
                <FilterLink
                  active={filters.need === need}
                  count={counts.performanceNeeds[need]}
                  href={getNeedHref(filters, need)}
                  label={performanceNeedLabels[need]}
                />
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}

// Uses a native disclosure on small screens and a persistent sidebar when space allows.
export function ProductFilters({ counts, filters }: ProductFiltersProps) {
  const activeFilterCount = Number(Boolean(filters.category)) + Number(Boolean(filters.need));
  const activeFilterLabel = `${activeFilterCount} active ${activeFilterCount === 1 ? 'filter' : 'filters'}`;

  return (
    <>
      <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm lg:hidden">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 [&::-webkit-details-marker]:hidden">
          <span className="font-semibold text-slate-950">Filters</span>
          <span className="flex items-center gap-3">
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-900">
                {activeFilterLabel}
              </span>
            )}
            <span
              aria-hidden="true"
              className="text-lg text-slate-500 transition-transform group-open:rotate-180"
            >
              ↓
            </span>
          </span>
        </summary>
        <div className="border-t border-slate-200 p-4 sm:p-5">
          <FilterGroups counts={counts} filters={filters} idPrefix="mobile" />
        </div>
      </details>

      <aside
        className="hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:block"
        aria-label="Product filters"
      >
        <FilterGroups counts={counts} filters={filters} idPrefix="desktop" />
      </aside>
    </>
  );
}

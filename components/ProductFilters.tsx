import Link from 'next/link';

import {
  categoryLabels,
  createCatalogueHref,
  performanceNeedLabels,
  productCategories,
  performanceNeeds,
  type CatalogueFilters,
} from '@/lib/products';
import type { PerformanceNeed, ProductCategory } from '@/types';

interface ProductFiltersProps {
  filters: CatalogueFilters;
}

interface FilterLinkProps {
  active: boolean;
  href: string;
  label: string;
}

const filterLinkClassName =
  'flex min-h-11 items-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700';

function FilterLink({ active, href, label }: FilterLinkProps) {
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
      {label}
    </Link>
  );
}

function getCategoryHref(filters: CatalogueFilters, category?: ProductCategory): string {
  return createCatalogueHref({ ...filters, category });
}

function getNeedHref(filters: CatalogueFilters, need?: PerformanceNeed): string {
  return createCatalogueHref({ ...filters, need });
}

// Renders each single-select filter as semantic navigation into URL-backed catalogue state.
export function ProductFilters({ filters }: ProductFiltersProps) {
  return (
    <aside
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
      aria-label="Product filters"
    >
      <div>
        <h2 id="category-filter-heading" className="text-sm font-semibold text-slate-950">
          Category
        </h2>
        <nav className="mt-2" aria-labelledby="category-filter-heading">
          <ul className="space-y-1">
            <li>
              <FilterLink
                active={!filters.category}
                href={getCategoryHref(filters)}
                label="All categories"
              />
            </li>
            {productCategories.map((category) => (
              <li key={category}>
                <FilterLink
                  active={filters.category === category}
                  href={getCategoryHref(filters, category)}
                  label={categoryLabels[category]}
                />
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mt-7 border-t border-slate-200 pt-6">
        <h2 id="performance-filter-heading" className="text-sm font-semibold text-slate-950">
          Performance need
        </h2>
        <nav className="mt-2" aria-labelledby="performance-filter-heading">
          <ul className="space-y-1">
            <li>
              <FilterLink
                active={!filters.need}
                href={getNeedHref(filters)}
                label="All performance needs"
              />
            </li>
            {performanceNeeds.map((need) => (
              <li key={need}>
                <FilterLink
                  active={filters.need === need}
                  href={getNeedHref(filters, need)}
                  label={performanceNeedLabels[need]}
                />
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

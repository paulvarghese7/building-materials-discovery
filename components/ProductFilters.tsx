import Link from 'next/link';

import {
  productTypeLabels,
  createCatalogueHref,
  projectRequirementLabels,
  productTypes,
  projectRequirements,
  type CatalogueFilters,
} from '@/lib/products';
import type { CatalogueFacetCounts } from '@/lib/catalogue-search';
import type { ProjectRequirement, ProductType } from '@/types';

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
  'flex min-h-11 items-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700';

function FilterLink({ active, count, href, label }: FilterLinkProps) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? 'page' : undefined}
      className={`${filterLinkClassName} ${
        active
          ? 'border-brand-700 bg-brand-50 font-semibold text-brand-900'
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

function getProductTypeHref(filters: CatalogueFilters, productType?: ProductType): string {
  return createCatalogueHref({ ...filters, productType });
}

function getProjectRequirementHref(
  filters: CatalogueFilters,
  projectRequirement?: ProjectRequirement,
): string {
  return createCatalogueHref({ ...filters, projectRequirement });
}

function FilterGroups({ counts, filters, idPrefix }: FilterGroupsProps) {
  const productTypeHeadingId = `${idPrefix}-product-type-filter-heading`;
  const projectRequirementHeadingId = `${idPrefix}-project-requirement-filter-heading`;

  return (
    <>
      <div>
        <h2 id={productTypeHeadingId} className="text-sm font-semibold text-slate-950">
          Product type
        </h2>
        <nav className="mt-2" aria-labelledby={productTypeHeadingId}>
          <ul className="space-y-1">
            <li>
              <FilterLink
                active={!filters.productType}
                count={counts.allProductTypes}
                href={getProductTypeHref(filters)}
                label="All product types"
              />
            </li>
            {productTypes.map((productType) => (
              <li key={productType}>
                <FilterLink
                  active={filters.productType === productType}
                  count={counts.productTypes[productType]}
                  href={getProductTypeHref(filters, productType)}
                  label={productTypeLabels[productType]}
                />
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mt-7 border-t border-slate-200 pt-6">
        <h2 id={projectRequirementHeadingId} className="text-sm font-semibold text-slate-950">
          Project requirement
        </h2>
        <nav className="mt-2" aria-labelledby={projectRequirementHeadingId}>
          <ul className="space-y-1">
            <li>
              <FilterLink
                active={!filters.projectRequirement}
                count={counts.allProjectRequirements}
                href={getProjectRequirementHref(filters)}
                label="All requirements"
              />
            </li>
            {projectRequirements.map((projectRequirement) => (
              <li key={projectRequirement}>
                <FilterLink
                  active={filters.projectRequirement === projectRequirement}
                  count={counts.projectRequirements[projectRequirement]}
                  href={getProjectRequirementHref(filters, projectRequirement)}
                  label={projectRequirementLabels[projectRequirement]}
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
  const activeFilterCount =
    Number(Boolean(filters.productType)) + Number(Boolean(filters.projectRequirement));
  const activeFilterLabel = `${activeFilterCount} active ${activeFilterCount === 1 ? 'filter' : 'filters'}`;

  return (
    <>
      <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm lg:hidden">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 [&::-webkit-details-marker]:hidden">
          <span className="font-semibold text-slate-950">Filters</span>
          <span className="flex items-center gap-3">
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-900">
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

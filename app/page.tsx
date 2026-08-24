import Link from 'next/link';

import { SearchInput } from '@/components/SearchInput';
import { products } from '@/data/products';
import {
  productTypeLabels,
  createCatalogueHref,
  projectRequirementLabels,
  projectRequirements,
  productTypes,
} from '@/lib/products';
import type { ProjectRequirement, ProductType } from '@/types';

const productTypeDescriptions: Record<ProductType, string> = {
  boards: 'Internal lining boards for standard, acoustic, fire, and moisture requirements.',
  insulation: 'Mineral-wool products for cavity, thermal, acoustic, and fire-related discovery.',
  profiles: 'Metal studs and tracks for internal partition framing and specialist conditions.',
  accessories: 'Jointing, sealing, and perimeter products for completing internal assemblies.',
};

const projectRequirementDescriptions: Record<ProjectRequirement, string> = {
  acoustic: 'Explore products intended for sound-sensitive partitions and perimeter details.',
  fire: 'Find products associated with protected linings, voids, and fire-related joint work.',
  moisture: 'Browse products for humid interiors and moisture-sensitive internal areas.',
};

export default function Home() {
  return (
    <div className="flex-1 bg-slate-50 text-slate-950">
      <main>
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end lg:gap-16 lg:px-8 lg:py-24">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-700">
                Building material discovery
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Find building materials by product or project requirement.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Search a focused fictional catalogue, browse product types, or start with an
                acoustic, fire, or moisture project requirement.
              </p>

              <SearchInput filters={{ query: '' }} products={products} variant="homepage" />
            </div>

            <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-6" aria-label="Catalogue overview">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">
                Focused prototype
              </p>
              <dl className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
                <div className="flex items-baseline justify-between gap-4 py-4">
                  <dt className="text-sm text-slate-600">Products</dt>
                  <dd className="text-2xl font-semibold">{products.length}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-4">
                  <dt className="text-sm text-slate-600">Product types</dt>
                  <dd className="text-2xl font-semibold">{productTypes.length}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-4">
                  <dt className="text-sm text-slate-600">Requirements</dt>
                  <dd className="text-2xl font-semibold">{projectRequirements.length}</dd>
                </div>
              </dl>
              <Link
                href="/products"
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md px-2 font-semibold text-brand-800 transition-colors hover:bg-brand-50 hover:text-brand-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-700"
              >
                View the full catalogue
                <span aria-hidden="true">→</span>
              </Link>
            </aside>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-slate-50" aria-labelledby="product-types-heading">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-700">
                Product-first discovery
              </p>
              <h2 id="product-types-heading" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Browse by product type
              </h2>
              <p className="mt-4 leading-7 text-slate-600">
                Start with the type of material you need and refine the catalogue from there.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {productTypes.map((productType, index) => (
                <Link
                  key={productType}
                  href={createCatalogueHref({ query: '', productType })}
                  className="group flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-50/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-700"
                >
                  <span className="font-mono text-xs font-semibold text-slate-500">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-8 text-2xl font-semibold tracking-tight">
                    {productTypeLabels[productType]}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {productTypeDescriptions[productType]}
                  </p>
                  <span className="mt-auto flex items-center gap-2 pt-6 font-semibold text-brand-800">
                    Browse product type
                    <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50" aria-labelledby="project-requirements-heading">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-700">
                Requirement-first discovery
              </p>
              <h2
                id="project-requirements-heading"
                className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                Browse by project requirement
              </h2>
              <p className="mt-4 leading-7 text-slate-600">
                Begin with the outcome that matters to the project, even when you do not know a
                product name.
              </p>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {projectRequirements.map((projectRequirement) => (
                <Link
                  key={projectRequirement}
                  href={createCatalogueHref({ query: '', projectRequirement })}
                  className="group flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-50/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-700"
                >
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    Project requirement
                  </span>
                  <h3 className="mt-5 text-2xl font-semibold tracking-tight">
                    {projectRequirementLabels[projectRequirement]}
                  </h3>
                  <p className="mt-3 leading-7 text-slate-600">
                    {projectRequirementDescriptions[projectRequirement]}
                  </p>
                  <span className="mt-auto flex items-center gap-2 pt-6 font-semibold text-brand-800">
                    Explore matching products
                    <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-slate-600 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="font-semibold text-slate-900">BuildMatch</p>
          <p>Product information is fictional demonstration data, not construction guidance.</p>
        </div>
      </footer>
    </div>
  );
}

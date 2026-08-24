import Link from 'next/link';

import { products } from '@/data/products';
import {
  MAX_SEARCH_QUERY_LENGTH,
  categoryLabels,
  createCatalogueHref,
  performanceNeedLabels,
  performanceNeeds,
  productCategories,
} from '@/lib/products';
import type { PerformanceNeed, ProductCategory } from '@/types';

const categoryDescriptions: Record<ProductCategory, string> = {
  boards: 'Internal lining boards for standard, acoustic, fire, and moisture requirements.',
  insulation: 'Mineral-wool products for cavity, thermal, acoustic, and fire-related discovery.',
  profiles: 'Metal studs and tracks for internal partition framing and specialist conditions.',
  accessories: 'Jointing, sealing, and perimeter products for completing internal assemblies.',
};

const performanceNeedDescriptions: Record<PerformanceNeed, string> = {
  acoustic: 'Explore products intended for sound-sensitive partitions and perimeter details.',
  fire: 'Find products associated with protected linings, voids, and fire-related joint work.',
  moisture: 'Browse products for humid interiors and moisture-sensitive internal areas.',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="rounded text-xl font-bold tracking-tight text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
            aria-label="BuildMatch home"
          >
            Build<span className="text-teal-700">Match</span>
          </Link>
          <nav aria-label="Primary navigation">
            <Link
              href="/products"
              className="inline-flex min-h-11 items-center rounded-md px-3 font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              Products
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end lg:gap-16 lg:px-8 lg:py-24">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">
                Building material discovery
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Find building materials by product or performance need.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Search a focused fictional catalogue, browse product categories, or start with an
                acoustic, fire, or moisture requirement.
              </p>

              <form
                action="/products"
                method="get"
                role="search"
                className="mt-9 max-w-2xl rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm sm:flex sm:items-end sm:gap-3"
              >
                <div className="min-w-0 flex-1">
                  <label htmlFor="homepage-product-search" className="block text-sm font-semibold">
                    Search products
                  </label>
                  <input
                    id="homepage-product-search"
                    name="q"
                    type="search"
                    maxLength={MAX_SEARCH_QUERY_LENGTH}
                    required
                    placeholder="Try a product name, SKU, or requirement"
                    className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none placeholder:text-slate-500 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-teal-700 px-5 font-semibold text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:mt-0 sm:w-auto"
                >
                  Search catalogue
                </button>
              </form>
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
                  <dt className="text-sm text-slate-600">Categories</dt>
                  <dd className="text-2xl font-semibold">{productCategories.length}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-4">
                  <dt className="text-sm text-slate-600">Performance needs</dt>
                  <dd className="text-2xl font-semibold">{performanceNeeds.length}</dd>
                </div>
              </dl>
              <Link
                href="/products"
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md font-semibold text-teal-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
              >
                View the full catalogue
                <span aria-hidden="true">→</span>
              </Link>
            </aside>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8" aria-labelledby="categories-heading">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">
              Product-first discovery
            </p>
            <h2 id="categories-heading" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Browse by category
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Start with the type of material you need and refine the catalogue from there.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {productCategories.map((category, index) => (
              <Link
                key={category}
                href={createCatalogueHref({ query: '', category })}
                className="group flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-teal-300 hover:bg-teal-50/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
              >
                <span className="font-mono text-xs font-semibold text-slate-500">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-8 text-2xl font-semibold tracking-tight">
                  {categoryLabels[category]}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {categoryDescriptions[category]}
                </p>
                <span className="mt-auto flex items-center gap-2 pt-6 font-semibold text-teal-800">
                  Browse category
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 text-white" aria-labelledby="performance-needs-heading">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-300">
                Need-first discovery
              </p>
              <h2
                id="performance-needs-heading"
                className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                Browse by performance need
              </h2>
              <p className="mt-4 leading-7 text-slate-300">
                Begin with the outcome that matters to the project, even when you do not know a
                product name.
              </p>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {performanceNeeds.map((need) => (
                <Link
                  key={need}
                  href={createCatalogueHref({ query: '', need })}
                  className="group flex min-h-56 flex-col rounded-2xl border border-slate-700 bg-slate-800 p-6 transition-colors hover:border-teal-400 hover:bg-slate-800/70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300"
                >
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-teal-300">
                    Performance need
                  </span>
                  <h3 className="mt-5 text-2xl font-semibold tracking-tight">
                    {performanceNeedLabels[need]}
                  </h3>
                  <p className="mt-3 leading-7 text-slate-300">
                    {performanceNeedDescriptions[need]}
                  </p>
                  <span className="mt-auto flex items-center gap-2 pt-6 font-semibold text-teal-200">
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

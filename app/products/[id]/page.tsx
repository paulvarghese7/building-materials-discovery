import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PerformanceBadge } from '@/components/PerformanceBadge';
import { ProductSpecifications } from '@/components/ProductSpecifications';
import { products } from '@/data/products';
import {
  categoryLabels,
  createCatalogueHref,
  getProductById,
  performanceNeedLabels,
} from '@/lib/products';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    return {
      title: 'Product not found | BuildMatch',
    };
  }

  return {
    title: `${product.name} | BuildMatch`,
    description: product.shortDescription,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  const categoryLabel = categoryLabels[product.category];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <article>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <li>
                  <Link
                    href="/products"
                    className="inline-flex min-h-11 items-center rounded font-semibold text-teal-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                  >
                    Products
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link
                    href={createCatalogueHref({ query: '', category: product.category })}
                    className="inline-flex min-h-11 items-center rounded font-semibold text-teal-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                  >
                    {categoryLabel}
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="min-w-0 self-center truncate" aria-current="page">
                  {product.name}
                </li>
              </ol>
            </nav>

            <div className="mt-8 grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">
                  {categoryLabel}
                </p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                  {product.name}
                </h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
                  {product.description}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 lg:min-w-52">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                  Product SKU
                </p>
                <p className="mt-2 break-all font-mono text-sm font-semibold text-slate-900">
                  {product.sku}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.7fr)] lg:gap-16 lg:px-8">
          <div className="space-y-10">
            <section aria-labelledby="performance-heading">
              <h2 id="performance-heading" className="text-2xl font-semibold tracking-tight">
                Performance needs
              </h2>
              {product.performanceNeeds.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  {product.performanceNeeds.map((need) => (
                    <Link
                      key={need}
                      href={createCatalogueHref({ query: '', need })}
                      aria-label={`Browse products for ${performanceNeedLabels[need]}`}
                      className="inline-flex min-h-11 items-center rounded-full hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
                    >
                      <PerformanceBadge need={need} />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-4 leading-7 text-slate-600">
                  This general-purpose product is not assigned to a specific performance filter.
                </p>
              )}
            </section>

            <section aria-labelledby="features-heading">
              <h2 id="features-heading" className="text-2xl font-semibold tracking-tight">
                Key features
              </h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {product.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 leading-6 text-slate-700 shadow-sm"
                  >
                    <span className="mt-2 size-2 shrink-0 rounded-full bg-teal-600" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </section>

            <aside className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
              <h2 className="font-semibold">Prototype data notice</h2>
              <p className="mt-1">
                Product names, specifications, and technical values shown in BuildMatch are
                fictional demonstration data and must not be used for engineering, specification,
                procurement, or construction decisions.
              </p>
            </aside>
          </div>

          <section aria-labelledby="specifications-heading">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-teal-700">
                Technical data
              </p>
              <h2
                id="specifications-heading"
                className="mt-2 text-2xl font-semibold tracking-tight"
              >
                Specifications
              </h2>
              <div className="mt-6">
                <ProductSpecifications specifications={product.specifications} />
              </div>
            </div>

            <Link
              href={createCatalogueHref({ query: '', category: product.category })}
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md font-semibold text-teal-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
            >
              Browse all {categoryLabel.toLowerCase()}
              <span aria-hidden="true">→</span>
            </Link>
          </section>
        </div>
      </article>
    </main>
  );
}

import Link from 'next/link';

import { ProjectRequirementBadge } from '@/components/ProjectRequirementBadge';
import { productTypeLabels } from '@/lib/products';
import type { CatalogueMatchReason } from '@/lib/catalogue-search';
import type { Product } from '@/types';

interface ProductCardProps {
  matchReasons?: readonly CatalogueMatchReason[];
  product: Product;
}

// Summarises one product while keeping its full technical detail on the dedicated product page.
export function ProductCard({ matchReasons = [], product }: ProductCardProps) {
  const headlineSpecification = product.specifications[0];

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-slate-300 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">
          {productTypeLabels[product.productType]}
        </p>
        <p className="break-all text-right font-mono text-xs text-slate-500">{product.sku}</p>
      </div>

      <h2 className="mt-4 break-words text-xl font-semibold tracking-tight text-slate-950">
        {product.name}
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">{product.shortDescription}</p>

      {matchReasons.length > 0 && (
        <p className="mt-3 text-xs font-semibold text-brand-800">
          Matches: {matchReasons.join(' · ')}
        </p>
      )}

      {product.projectRequirements.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2" aria-label="Project requirements">
          {product.projectRequirements.map((projectRequirement) => (
            <ProjectRequirementBadge
              key={projectRequirement}
              projectRequirement={projectRequirement}
            />
          ))}
        </div>
      )}

      {headlineSpecification && (
        <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-3 border-t border-slate-100 pt-4 text-sm">
          <dt className="text-slate-500">{headlineSpecification.label}</dt>
          <dd className="text-right font-medium text-slate-800">{headlineSpecification.value}</dd>
        </dl>
      )}

      <Link
        href={`/products/${product.id}`}
        className="mt-6 inline-flex min-h-11 items-center gap-2 self-start rounded-md px-2 font-semibold text-brand-800 transition-colors hover:bg-brand-50 hover:text-brand-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-700"
      >
        View product details
        <span className="sr-only"> for {product.name}</span>
        <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}

import Link from 'next/link';

import { performanceNeedLabels } from '@/lib/products';
import type { PerformanceNeed } from '@/types';

interface SearchSuggestionProps {
  href: string;
  need: PerformanceNeed;
}

// Offers a user-controlled reinterpretation of a failed plain-language search.
export function SearchSuggestion({ href, need }: SearchSuggestionProps) {
  return (
    <aside className="mt-6 rounded-xl border border-teal-200 bg-teal-50 p-4 sm:p-5">
      <p className="font-semibold text-teal-950">
        Looking for products with {performanceNeedLabels[need].toLowerCase()}?
      </p>
      <p className="mt-1 text-sm leading-6 text-teal-900">
        Apply that performance need explicitly to browse the relevant products.
      </p>
      <Link
        href={href}
        scroll={false}
        className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-teal-800 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
      >
        Show {need} products
      </Link>
    </aside>
  );
}

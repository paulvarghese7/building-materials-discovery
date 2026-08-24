import Link from 'next/link';

import { projectRequirementLabels } from '@/lib/products';
import type { ProjectRequirement } from '@/types';

interface SearchSuggestionProps {
  href: string;
  projectRequirement: ProjectRequirement;
}

// Offers a user-controlled reinterpretation of a failed plain-language search.
export function SearchSuggestion({ href, projectRequirement }: SearchSuggestionProps) {
  return (
    <aside className="mt-6 rounded-xl border border-brand-200 bg-brand-50 p-4 sm:p-5">
      <p className="font-semibold text-brand-950">
        Looking for products with {projectRequirementLabels[projectRequirement].toLowerCase()}?
      </p>
      <p className="mt-1 text-sm leading-6 text-brand-900">
        Apply that project requirement explicitly to browse the relevant products.
      </p>
      <Link
        href={href}
        scroll={false}
        className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-brand-800 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
      >
        Show {projectRequirement} products
      </Link>
    </aside>
  );
}

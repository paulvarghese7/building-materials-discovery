import type { Specification } from '@/types';

interface ProductSpecificationsProps {
  specifications: readonly Specification[];
}

// Keeps heterogeneous product data readable without requiring a wide comparison table.
export function ProductSpecifications({ specifications }: ProductSpecificationsProps) {
  return (
    <dl className="divide-y divide-slate-200 border-y border-slate-200">
      {specifications.map((specification) => (
        <div
          key={specification.label}
          className="grid gap-1 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-6"
        >
          <dt className="text-sm font-medium text-slate-600">{specification.label}</dt>
          <dd className="break-words text-sm font-semibold text-slate-950 sm:text-right">
            {specification.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

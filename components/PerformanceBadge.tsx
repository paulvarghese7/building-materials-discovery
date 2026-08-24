import { performanceNeedLabels } from '@/lib/products';
import type { PerformanceNeed } from '@/types';

const badgeStyles: Record<PerformanceNeed, string> = {
  acoustic: 'border-violet-200 bg-violet-50 text-violet-800',
  fire: 'border-amber-200 bg-amber-50 text-amber-900',
  moisture: 'border-sky-200 bg-sky-50 text-sky-800',
};

interface PerformanceBadgeProps {
  need: PerformanceNeed;
}

// Displays a performance need with both a readable label and a restrained visual treatment.
export function PerformanceBadge({ need }: PerformanceBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeStyles[need]}`}
    >
      {performanceNeedLabels[need]}
    </span>
  );
}

import { projectRequirementLabels } from '@/lib/products';
import type { ProjectRequirement } from '@/types';

const badgeStyles: Record<ProjectRequirement, string> = {
  acoustic: 'border-violet-200 bg-violet-50 text-violet-800',
  fire: 'border-amber-200 bg-amber-50 text-amber-900',
  moisture: 'border-sky-200 bg-sky-50 text-sky-800',
};

interface ProjectRequirementBadgeProps {
  projectRequirement: ProjectRequirement;
}

// Displays a project requirement with a readable label and restrained visual treatment.
export function ProjectRequirementBadge({ projectRequirement }: ProjectRequirementBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeStyles[projectRequirement]}`}
    >
      {projectRequirementLabels[projectRequirement]}
    </span>
  );
}

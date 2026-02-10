import { Badge } from "@/components/ui/badge";

interface ProjectMaterialsStatusIndicatorProps {
  projectId: string;
  variant?: 'compact' | 'full';
}

export const ProjectMaterialsStatusIndicator = ({
  projectId,
  variant = 'compact',
}: ProjectMaterialsStatusIndicatorProps) => {
  // Placeholder - will show material status for project
  if (variant === 'compact') {
    return (
      <Badge variant="outline" className="text-xs">
        --
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="text-xs">
        Materials: --
      </Badge>
    </div>
  );
};

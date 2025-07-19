
import { Badge } from "@/components/ui/badge";

interface SelectedCategoriesInfoProps {
  windowCoveringId: string;
}

export const SelectedCategoriesInfo = ({ windowCoveringId }: SelectedCategoriesInfoProps) => {
  // For now, return a placeholder since the window covering option categories don't exist yet
  // This prevents the database query error
  
  return (
    <div className="flex flex-wrap gap-1">
      <Badge variant="secondary" className="text-xs">
        Configuration pending
      </Badge>
    </div>
  );
};

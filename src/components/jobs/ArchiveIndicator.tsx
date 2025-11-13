import { Archive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ArchiveIndicatorProps {
  isArchived: boolean;
  className?: string;
  variant?: "default" | "compact";
}

export const ArchiveIndicator = ({ 
  isArchived, 
  className,
  variant = "default" 
}: ArchiveIndicatorProps) => {
  if (!isArchived) return null;

  if (variant === "compact") {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
          "gap-1 px-1.5 py-0.5 text-xs font-medium",
          className
        )}
      >
        <Archive className="h-3 w-3" />
      </Badge>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
        "gap-1.5 px-2 py-1 text-xs font-medium",
        className
      )}
    >
      <Archive className="h-3 w-3" />
      <span>Archived</span>
    </Badge>
  );
};

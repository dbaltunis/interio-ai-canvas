import { Badge } from "@/components/ui/badge";
import { Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface DuplicateJobIndicatorProps {
  isDuplicate?: boolean;
  duplicateCount?: number;
  className?: string;
}

export const DuplicateJobIndicator = ({ 
  isDuplicate, 
  duplicateCount = 0,
  className 
}: DuplicateJobIndicatorProps) => {
  if (!isDuplicate && duplicateCount === 0) return null;

  return (
    <Badge 
      variant="secondary" 
      className={cn(
        "flex items-center gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        className
      )}
    >
      <Copy className="h-3 w-3" />
      {isDuplicate && <span>Duplicate</span>}
      {duplicateCount > 0 && <span>{duplicateCount} {duplicateCount === 1 ? 'copy' : 'copies'}</span>}
    </Badge>
  );
};

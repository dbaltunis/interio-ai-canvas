import { Copy, GitFork } from "lucide-react";
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
    <div 
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold tracking-wide uppercase transition-all duration-200 hover:scale-105",
        isDuplicate 
          ? "bg-gradient-to-r from-orange-500/10 to-orange-600/10 text-orange-600 border border-orange-500/20 hover:border-orange-500/30 dark:from-orange-400/20 dark:to-orange-500/20 dark:text-orange-400 dark:border-orange-400/30" 
          : "bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-600 border border-blue-500/20 hover:border-blue-500/30 dark:from-blue-400/20 dark:to-blue-500/20 dark:text-blue-400 dark:border-blue-400/30",
        className
      )}
    >
      {isDuplicate ? (
        <GitFork className="h-3 w-3" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
      {isDuplicate && <span className="leading-none">Copy</span>}
      {duplicateCount > 0 && (
        <span className="leading-none font-bold">
          {duplicateCount}
        </span>
      )}
    </div>
  );
};

import { cn } from "@/lib/utils";

interface SeamIndicatorProps {
  seamNumber: number;
  seamAllowance: string;
  orientation: 'vertical' | 'horizontal';
  height: number;
  isHighlighted?: boolean;
}

export const SeamIndicator = ({
  seamNumber,
  seamAllowance,
  orientation,
  height,
  isHighlighted = false,
}: SeamIndicatorProps) => {
  if (orientation === 'vertical') {
    // Vertical orientation: seam runs vertically between width blocks
    return (
      <div 
        className="flex flex-col items-center justify-center mx-1"
        style={{ height: `${height}px` }}
      >
        {/* Vertical dashed line */}
        <div 
          className={cn(
            "w-0.5 border-l-2 border-dashed h-full",
            isHighlighted ? "border-amber-500" : "border-amber-400/70"
          )}
        />
        
        {/* Seam label */}
        <div className="absolute bg-amber-100 border border-amber-300 rounded px-1.5 py-0.5 -rotate-90 whitespace-nowrap">
          <span className={cn(
            "text-[9px] font-medium",
            isHighlighted ? "text-amber-700" : "text-amber-600"
          )}>
            Seam {seamNumber}
          </span>
          <span className="text-[8px] text-amber-500 ml-1">
            ({seamAllowance})
          </span>
        </div>
      </div>
    );
  }

  // Horizontal orientation: seam runs horizontally between pieces
  return (
    <div className="flex flex-col items-center justify-center py-1 w-full">
      {/* Horizontal dashed line */}
      <div className="relative w-full flex items-center">
        <div 
          className={cn(
            "h-0.5 border-t-2 border-dashed w-full",
            isHighlighted ? "border-amber-500" : "border-amber-400/70"
          )}
        />
        
        {/* Seam label */}
        <div className="absolute left-1/2 -translate-x-1/2 bg-amber-100 border border-amber-300 rounded px-2 py-0.5">
          <span className={cn(
            "text-[9px] font-medium",
            isHighlighted ? "text-amber-700" : "text-amber-600"
          )}>
            Seam {seamNumber}
          </span>
          <span className="text-[8px] text-amber-500 ml-1">
            ({seamAllowance})
          </span>
        </div>
      </div>
    </div>
  );
};

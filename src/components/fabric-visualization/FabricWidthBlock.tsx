import { cn } from "@/lib/utils";

interface FabricWidthBlockProps {
  index: number;
  width: number;
  height: number;
  dropLength: string;
  fabricWidth: string;
  isHovered: boolean;
  onHover: (index: number | null) => void;
  orientation: 'vertical' | 'horizontal';
  fabricColor?: string;
  isLastPiece?: boolean;
  leftoverAmount?: string;
}

export const FabricWidthBlock = ({
  index,
  width,
  height,
  dropLength,
  fabricWidth,
  isHovered,
  onHover,
  orientation,
  fabricColor = "hsl(var(--primary) / 0.15)",
  isLastPiece,
  leftoverAmount,
}: FabricWidthBlockProps) => {
  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer",
        "flex flex-col items-center justify-center",
        isHovered 
          ? "border-primary shadow-lg scale-105 z-10" 
          : "border-muted-foreground/40 hover:border-primary/60"
      )}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: isHovered ? "hsl(var(--primary) / 0.25)" : fabricColor,
      }}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Width number badge */}
      <div className={cn(
        "absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-semibold",
        isHovered 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted text-muted-foreground"
      )}>
        {orientation === 'vertical' ? `Width ${index + 1}` : `Piece ${index + 1}`}
      </div>

      {/* Dimensions */}
      <div className="text-center space-y-1">
        <div className={cn(
          "text-xs font-medium",
          isHovered ? "text-primary" : "text-muted-foreground"
        )}>
          {fabricWidth}
        </div>
        <div className="text-[10px] text-muted-foreground/80">
          ×
        </div>
        <div className={cn(
          "text-xs font-medium",
          isHovered ? "text-primary" : "text-muted-foreground"
        )}>
          {dropLength}
        </div>
      </div>

      {/* Fabric grain direction indicator */}
      <div className="absolute bottom-2 left-2">
        <div className={cn(
          "flex items-center gap-1 text-[9px]",
          isHovered ? "text-primary" : "text-muted-foreground/60"
        )}>
          {orientation === 'vertical' ? (
            <>
              <span className="rotate-90">→</span>
              <span>grain</span>
            </>
          ) : (
            <>
              <span>→</span>
              <span>grain</span>
            </>
          )}
        </div>
      </div>

      {/* Leftover indicator for last piece */}
      {isLastPiece && leftoverAmount && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-amber-600 whitespace-nowrap">
          Leftover: {leftoverAmount}
        </div>
      )}
    </div>
  );
};

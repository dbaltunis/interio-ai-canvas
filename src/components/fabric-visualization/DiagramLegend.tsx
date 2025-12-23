import { Scissors, ArrowRight, Grid3X3 } from "lucide-react";

interface DiagramLegendProps {
  orientation: 'vertical' | 'horizontal';
  showPatternRepeat?: boolean;
}

export const DiagramLegend = ({ orientation, showPatternRepeat }: DiagramLegendProps) => {
  return (
    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-4 pt-3 border-t border-border/50">
      {/* Fabric Width Block */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-4 border-2 border-dashed border-muted-foreground/40 rounded bg-primary/10" />
        <span>{orientation === 'vertical' ? 'Fabric Width' : 'Fabric Piece'}</span>
      </div>

      {/* Seam Indicator */}
      <div className="flex items-center gap-2">
        <div className="w-4 h-0.5 border-t-2 border-dashed border-amber-400" />
        <span>Seam Join</span>
      </div>

      {/* Cut Line */}
      <div className="flex items-center gap-2">
        <Scissors className="w-3.5 h-3.5 text-destructive/70" />
        <span>Cut Point</span>
      </div>

      {/* Grain Direction */}
      <div className="flex items-center gap-2">
        <ArrowRight className="w-3.5 h-3.5" />
        <span>Fabric Grain</span>
      </div>

      {/* Pattern Repeat (if applicable) */}
      {showPatternRepeat && (
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-3.5 h-3.5 text-violet-500" />
          <span>Pattern Repeat</span>
        </div>
      )}
    </div>
  );
};

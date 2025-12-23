import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RotateCw, Ruler, Scissors, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FabricWidthBlock } from "./FabricWidthBlock";
import { SeamIndicator } from "./SeamIndicator";
import { DiagramLegend } from "./DiagramLegend";

export interface FabricCuttingDiagramProps {
  fabricWidth: number;           // in cm
  dropLength: number;            // in cm (total drop per width)
  widthsRequired: number;        // number of fabric widths
  seamsRequired: number;         // number of seams
  orientation: 'vertical' | 'horizontal';
  panelConfiguration: 'single' | 'pair';
  seamAllowance?: number;        // in cm, default 3
  patternRepeat?: number;        // vertical pattern repeat in cm
  totalLinearMeters?: number;
  fabricName?: string;
  fabricColor?: string;
  leftoverCm?: number;           // leftover fabric from last piece
  unitLabel?: string;            // e.g., "cm" or "in"
}

export const FabricCuttingDiagram = ({
  fabricWidth,
  dropLength,
  widthsRequired,
  seamsRequired,
  orientation,
  panelConfiguration,
  seamAllowance = 3,
  patternRepeat,
  totalLinearMeters,
  fabricName,
  fabricColor,
  leftoverCm,
  unitLabel = "cm",
}: FabricCuttingDiagramProps) => {
  const [hoveredWidth, setHoveredWidth] = useState<number | null>(null);

  // Calculate visual dimensions (scaled for display)
  const maxBlockWidth = 80;
  const maxBlockHeight = 120;
  
  // Scale based on orientation
  const blockWidth = orientation === 'vertical' 
    ? Math.min(maxBlockWidth, fabricWidth / 2) 
    : Math.min(200, dropLength / 15);
  const blockHeight = orientation === 'vertical' 
    ? Math.min(maxBlockHeight, dropLength / 20) 
    : Math.min(maxBlockHeight, fabricWidth / 2);

  // Format measurements for display
  const formatMeasurement = (value: number, unit: string = unitLabel) => {
    if (unit === 'm' || unit === 'meters') {
      return `${(value / 100).toFixed(2)}m`;
    }
    return `${value.toFixed(0)}${unit}`;
  };

  // Calculate finished panel width
  const totalFinishedWidth = (widthsRequired * fabricWidth) - (seamsRequired * seamAllowance);
  const widthPerPanel = panelConfiguration === 'pair' ? totalFinishedWidth / 2 : totalFinishedWidth;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className="w-full print:shadow-none print:border-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Scissors className="w-4 h-4 text-destructive/70" />
            Fabric Cutting Layout
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={orientation === 'vertical' ? 'default' : 'secondary'} className="text-xs">
              <RotateCw className="w-3 h-3 mr-1" />
              {orientation === 'vertical' ? 'Standard' : 'Railroaded'}
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 print:hidden"
              onClick={handlePrint}
            >
              <Printer className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        
        {/* Summary line */}
        <div className="text-xs text-muted-foreground mt-1">
          {widthsRequired} {orientation === 'vertical' ? 'width' : 'piece'}{widthsRequired > 1 ? 's' : ''} × {formatMeasurement(dropLength)} = {totalLinearMeters?.toFixed(2) || ((widthsRequired * dropLength) / 100).toFixed(2)}m linear
          {fabricName && <span className="ml-2 text-foreground/70">• {fabricName}</span>}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Fabric Roll Indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Ruler className="w-3.5 h-3.5" />
          <span>Fabric Roll: {formatMeasurement(fabricWidth)} wide</span>
          {patternRepeat && patternRepeat > 0 && (
            <Badge variant="outline" className="text-[10px] h-5">
              Pattern: {formatMeasurement(patternRepeat)} repeat
            </Badge>
          )}
        </div>

        <Separator className="my-2" />

        {/* Main Diagram Area */}
        <div className="overflow-x-auto pb-4">
          {orientation === 'vertical' ? (
            // VERTICAL LAYOUT: widths side by side
            <div className="flex items-start justify-center gap-0 py-4 min-w-fit">
              {Array.from({ length: widthsRequired }).map((_, index) => (
                <div key={index} className="flex items-start">
                  <FabricWidthBlock
                    index={index}
                    width={blockWidth}
                    height={blockHeight}
                    dropLength={formatMeasurement(dropLength)}
                    fabricWidth={formatMeasurement(fabricWidth)}
                    isHovered={hoveredWidth === index}
                    onHover={setHoveredWidth}
                    orientation={orientation}
                    fabricColor={fabricColor}
                    isLastPiece={index === widthsRequired - 1}
                    leftoverAmount={leftoverCm && leftoverCm > 0 ? formatMeasurement(leftoverCm) : undefined}
                  />
                  
                  {/* Seam indicator between widths */}
                  {index < widthsRequired - 1 && (
                    <SeamIndicator
                      seamNumber={index + 1}
                      seamAllowance={formatMeasurement(seamAllowance)}
                      orientation="vertical"
                      height={blockHeight}
                      isHighlighted={hoveredWidth === index || hoveredWidth === index + 1}
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            // HORIZONTAL/RAILROADED LAYOUT: pieces stacked vertically
            <div className="flex flex-col items-center gap-0 py-4">
              {Array.from({ length: widthsRequired }).map((_, index) => (
                <div key={index} className="flex flex-col items-center w-full max-w-xs">
                  <FabricWidthBlock
                    index={index}
                    width={blockWidth}
                    height={blockHeight}
                    dropLength={formatMeasurement(dropLength)}
                    fabricWidth={formatMeasurement(fabricWidth)}
                    isHovered={hoveredWidth === index}
                    onHover={setHoveredWidth}
                    orientation={orientation}
                    fabricColor={fabricColor}
                    isLastPiece={index === widthsRequired - 1}
                    leftoverAmount={leftoverCm && leftoverCm > 0 ? formatMeasurement(leftoverCm) : undefined}
                  />
                  
                  {/* Seam indicator between pieces */}
                  {index < widthsRequired - 1 && (
                    <SeamIndicator
                      seamNumber={index + 1}
                      seamAllowance={formatMeasurement(seamAllowance)}
                      orientation="horizontal"
                      height={0}
                      isHighlighted={hoveredWidth === index || hoveredWidth === index + 1}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator className="my-2" />

        {/* Finished Panel Preview */}
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Finished Panel{panelConfiguration === 'pair' ? 's' : ''}
          </div>
          <div className="flex items-center justify-center gap-2">
            {panelConfiguration === 'pair' ? (
              <>
                <div className="flex flex-col items-center">
                  <div 
                    className="border-2 border-primary/50 rounded bg-primary/5 flex items-center justify-center"
                    style={{ width: '60px', height: '40px' }}
                  >
                    <span className="text-[10px] text-primary font-medium">LEFT</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {formatMeasurement(widthPerPanel)}
                  </span>
                </div>
                <div className="h-8 border-l border-dashed border-muted-foreground/30" />
                <div className="flex flex-col items-center">
                  <div 
                    className="border-2 border-primary/50 rounded bg-primary/5 flex items-center justify-center"
                    style={{ width: '60px', height: '40px' }}
                  >
                    <span className="text-[10px] text-primary font-medium">RIGHT</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {formatMeasurement(widthPerPanel)}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center">
                <div 
                  className="border-2 border-primary/50 rounded bg-primary/5 flex items-center justify-center"
                  style={{ width: '120px', height: '40px' }}
                >
                  <span className="text-[10px] text-primary font-medium">SINGLE PANEL</span>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1">
                  {formatMeasurement(totalFinishedWidth)} wide
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <DiagramLegend 
          orientation={orientation} 
          showPatternRepeat={!!patternRepeat && patternRepeat > 0}
        />

        {/* Measurement Summary for Print */}
        <div className="hidden print:block mt-4 p-3 border rounded text-xs">
          <div className="font-semibold mb-2">Cutting Instructions</div>
          <ul className="space-y-1">
            <li>• Cut {widthsRequired} piece{widthsRequired > 1 ? 's' : ''} at {formatMeasurement(dropLength)} each</li>
            <li>• Fabric width: {formatMeasurement(fabricWidth)}</li>
            <li>• Seam allowance: {formatMeasurement(seamAllowance)}</li>
            {seamsRequired > 0 && <li>• Join with {seamsRequired} seam{seamsRequired > 1 ? 's' : ''}</li>}
            <li>• Total fabric required: {totalLinearMeters?.toFixed(2) || ((widthsRequired * dropLength) / 100).toFixed(2)}m</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

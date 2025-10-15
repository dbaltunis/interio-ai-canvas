import { useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";

interface VerticalBlindVisualizerProps {
  windowType: string;
  measurements: Record<string, any>;
  template?: any;
  material?: any;
  className?: string;
  slatWidth?: number;
  slatAngle?: number;
  controlSide?: 'left' | 'right';
}

export const VerticalBlindVisualizer = ({
  windowType,
  measurements,
  template,
  material,
  className = "",
  slatWidth = 89,
  slatAngle: initialAngle = 0,
  controlSide = 'left'
}: VerticalBlindVisualizerProps) => {
  
  const [currentAngle, setCurrentAngle] = useState(initialAngle);
  
  const width = measurements?.width || 800;
  const height = measurements?.drop || measurements?.height || 600;
  const materialColor = material?.color || template?.color || '#F5F5F5';
  
  const visualization = useMemo(() => {
    const frameThickness = 8;
    const headrailHeight = 35;
    const numSlats = Math.floor((width - frameThickness * 2) / (slatWidth * 0.9));
    const slatSpacing = (width - frameThickness * 2) / numSlats;
    
    return (
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-full"
        style={{ maxHeight: '600px' }}
      >
        {/* Window frame */}
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="hsl(var(--background))"
          stroke="hsl(var(--border))"
          strokeWidth={frameThickness}
        />
        
        {/* Headrail track */}
        <rect
          x={frameThickness}
          y={frameThickness}
          width={width - frameThickness * 2}
          height={headrailHeight}
          fill="hsl(var(--muted))"
          stroke="hsl(var(--border))"
          strokeWidth={1}
        />
        
        {/* Track detail lines */}
        <line
          x1={frameThickness}
          y1={frameThickness + headrailHeight / 3}
          x2={width - frameThickness}
          y2={frameThickness + headrailHeight / 3}
          stroke="hsl(var(--border))"
          strokeWidth={1}
        />
        <line
          x1={frameThickness}
          y1={frameThickness + (headrailHeight * 2) / 3}
          x2={width - frameThickness}
          y2={frameThickness + (headrailHeight * 2) / 3}
          stroke="hsl(var(--border))"
          strokeWidth={1}
        />
        
        {/* Vertical slats */}
        {Array.from({ length: numSlats }).map((_, i) => {
          const xCenter = frameThickness + (i * slatSpacing) + (slatSpacing / 2);
          const slatHeight = height - frameThickness * 2 - headrailHeight - 10;
          const yTop = frameThickness + headrailHeight + 5;
          
          // Calculate slat width based on angle (perspective effect)
          const angleRad = (currentAngle * Math.PI) / 180;
          const apparentWidth = Math.abs(Math.cos(angleRad)) * slatWidth;
          
          // Determine light/dark side based on angle
          const leftSideBrightness = currentAngle > 0 ? 1.1 : 0.85;
          const rightSideBrightness = currentAngle > 0 ? 0.85 : 1.1;
          
          return (
            <g key={i}>
              {/* Hanger clip */}
              <rect
                x={xCenter - 3}
                y={yTop - 5}
                width={6}
                height={5}
                fill="hsl(var(--muted-foreground))"
                opacity={0.6}
              />
              
              {/* Left side of slat */}
              <rect
                x={xCenter - apparentWidth / 2}
                y={yTop}
                width={apparentWidth / 2}
                height={slatHeight}
                fill={`color-mix(in srgb, ${materialColor} ${leftSideBrightness * 100}%, ${leftSideBrightness > 1 ? 'white' : 'black'})`}
                stroke="hsl(var(--border))"
                strokeWidth={0.5}
                opacity={0.95}
              />
              
              {/* Right side of slat */}
              <rect
                x={xCenter}
                y={yTop}
                width={apparentWidth / 2}
                height={slatHeight}
                fill={`color-mix(in srgb, ${materialColor} ${rightSideBrightness * 100}%, ${rightSideBrightness > 1 ? 'white' : 'black'})`}
                stroke="hsl(var(--border))"
                strokeWidth={0.5}
                opacity={0.95}
              />
              
              {/* Center line for depth */}
              {Math.abs(currentAngle) > 10 && (
                <line
                  x1={xCenter}
                  y1={yTop}
                  x2={xCenter}
                  y2={yTop + slatHeight}
                  stroke="hsl(var(--border))"
                  strokeWidth={1}
                  opacity={0.3}
                />
              )}
              
              {/* Bottom weight */}
              <rect
                x={xCenter - 4}
                y={yTop + slatHeight + 2}
                width={8}
                height={3}
                fill="hsl(var(--muted-foreground))"
                opacity={0.7}
                rx={1}
              />
            </g>
          );
        })}
        
        {/* Control chain */}
        <g opacity={0.6}>
          {controlSide === 'left' ? (
            <>
              <line
                x1={frameThickness + 25}
                y1={frameThickness + headrailHeight}
                x2={frameThickness + 25}
                y2={height / 2}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
              />
              <circle
                cx={frameThickness + 25}
                cy={height / 2}
                r={8}
                fill="hsl(var(--muted))"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1}
              />
            </>
          ) : (
            <>
              <line
                x1={width - frameThickness - 25}
                y1={frameThickness + headrailHeight}
                x2={width - frameThickness - 25}
                y2={height / 2}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
              />
              <circle
                cx={width - frameThickness - 25}
                cy={height / 2}
                r={8}
                fill="hsl(var(--muted))"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1}
              />
            </>
          )}
        </g>
        
        {/* Material info badge */}
        {material?.name && (
          <g>
            <rect
              x={frameThickness + 10}
              y={height - frameThickness - 60}
              width={150}
              height={30}
              fill="hsl(var(--background))"
              fillOpacity={0.9}
              stroke="hsl(var(--border))"
              strokeWidth={1}
              rx={4}
            />
            <text
              x={frameThickness + 85}
              y={height - frameThickness - 40}
              textAnchor="middle"
              fill="hsl(var(--foreground))"
              fontSize={12}
              fontWeight="500"
            >
              {material.name}
            </text>
          </g>
        )}
      </svg>
    );
  }, [width, height, materialColor, slatWidth, currentAngle, controlSide, material?.name]);
  
  return (
    <div className={`relative w-full h-full bg-muted/20 rounded-lg overflow-hidden ${className}`}>
      {visualization}
      
      {/* Angle control */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 bg-background/95 backdrop-blur-sm rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium">Slat Rotation</span>
          <span className="text-xs text-muted-foreground">{currentAngle}°</span>
        </div>
        <Slider
          value={[currentAngle]}
          onValueChange={([value]) => setCurrentAngle(value)}
          min={-90}
          max={90}
          step={15}
          className="w-full"
        />
      </div>
    </div>
  );
};

import { useMemo } from "react";

interface CellularShadeVisualizerProps {
  windowType: string;
  measurements: Record<string, any>;
  template?: any;
  material?: any;
  className?: string;
  cellSize?: 'single' | 'double';
  opacity?: number;
  mounted?: 'inside' | 'outside';
}

export const CellularShadeVisualizer = ({
  windowType,
  measurements,
  template,
  material,
  className = "",
  cellSize = 'double',
  opacity = 0.7,
  mounted = 'inside'
}: CellularShadeVisualizerProps) => {
  
  const width = measurements?.width || 800;
  const height = measurements?.drop || measurements?.height || 600;
  const materialColor = material?.color || template?.color || '#E8E4D9';
  
  const visualization = useMemo(() => {
    const frameThickness = mounted === 'inside' ? 8 : 12;
    const headrailHeight = 40;
    const cellHeight = cellSize === 'double' ? 16 : 12;
    const numCells = Math.floor((height - headrailHeight) / cellHeight);
    
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
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={frameThickness}
        />
        
        {/* Headrail */}
        <rect
          x={frameThickness}
          y={frameThickness}
          width={width - frameThickness * 2}
          height={headrailHeight}
          fill="hsl(var(--muted))"
          stroke="hsl(var(--border))"
          strokeWidth={1}
        />
        
        {/* Headrail detail */}
        <line
          x1={frameThickness + 20}
          y1={frameThickness + headrailHeight / 2}
          x2={width - frameThickness - 20}
          y2={frameThickness + headrailHeight / 2}
          stroke="hsl(var(--border))"
          strokeWidth={1}
        />
        
        {/* Honeycomb cells */}
        <g opacity={opacity}>
          {Array.from({ length: numCells }).map((_, i) => {
            const yPos = frameThickness + headrailHeight + (i * cellHeight);
            
            return (
              <g key={i}>
                {/* Cell background */}
                <rect
                  x={frameThickness}
                  y={yPos}
                  width={width - frameThickness * 2}
                  height={cellHeight}
                  fill={materialColor}
                  stroke="none"
                />
                
                {/* Honeycomb pattern */}
                {Array.from({ length: Math.floor(width / 30) }).map((_, j) => {
                  const xPos = frameThickness + (j * 30);
                  
                  return (
                    <g key={j}>
                      {/* Top half hexagon */}
                      <path
                        d={`M ${xPos + 5} ${yPos + cellHeight / 4}
                            L ${xPos + 10} ${yPos}
                            L ${xPos + 20} ${yPos}
                            L ${xPos + 25} ${yPos + cellHeight / 4}
                            L ${xPos + 20} ${yPos + cellHeight / 2}
                            L ${xPos + 10} ${yPos + cellHeight / 2}
                            Z`}
                        fill="none"
                        stroke={`color-mix(in srgb, ${materialColor} 80%, black)`}
                        strokeWidth={0.5}
                        opacity={0.3}
                      />
                      
                      {/* Bottom half hexagon */}
                      <path
                        d={`M ${xPos + 5} ${yPos + cellHeight * 0.75}
                            L ${xPos + 10} ${yPos + cellHeight / 2}
                            L ${xPos + 20} ${yPos + cellHeight / 2}
                            L ${xPos + 25} ${yPos + cellHeight * 0.75}
                            L ${xPos + 20} ${yPos + cellHeight}
                            L ${xPos + 10} ${yPos + cellHeight}
                            Z`}
                        fill="none"
                        stroke={`color-mix(in srgb, ${materialColor} 80%, black)`}
                        strokeWidth={0.5}
                        opacity={0.3}
                      />
                    </g>
                  );
                })}
                
                {/* Cell divider line */}
                <line
                  x1={frameThickness}
                  y1={yPos + cellHeight}
                  x2={width - frameThickness}
                  y2={yPos + cellHeight}
                  stroke={`color-mix(in srgb, ${materialColor} 70%, black)`}
                  strokeWidth={0.5}
                  opacity={0.4}
                />
              </g>
            );
          })}
        </g>
        
        {/* Bottom rail */}
        <rect
          x={frameThickness}
          y={height - frameThickness - 20}
          width={width - frameThickness * 2}
          height={20}
          fill="hsl(var(--muted))"
          stroke="hsl(var(--border))"
          strokeWidth={1}
        />
        
        {/* Lift cord */}
        <line
          x1={width - frameThickness - 30}
          y1={frameThickness + headrailHeight}
          x2={width - frameThickness - 30}
          y2={height - frameThickness - 20}
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={2}
          opacity={0.4}
        />
        
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
  }, [width, height, materialColor, cellSize, opacity, mounted, material?.name]);
  
  return (
    <div className={`relative w-full h-full bg-muted/20 rounded-lg overflow-hidden ${className}`}>
      {visualization}
    </div>
  );
};

import { useState } from "react";

interface PanelGlideVisualizerProps {
  windowType: string;
  measurements: Record<string, any>;
  template?: any;
  material?: any;
  className?: string;
  numPanels?: number;
  panelPosition?: number;
}

export const PanelGlideVisualizer = ({
  windowType,
  measurements,
  template,
  material,
  className = "",
  numPanels = 4,
  panelPosition = 0
}: PanelGlideVisualizerProps) => {
  
  const [position, setPosition] = useState(panelPosition);
  
  const width = measurements?.width || 800;
  const height = measurements?.drop || measurements?.height || 600;
  const materialColor = material?.color || template?.color || '#E5E5E5';
  
  const frameThickness = 8;
  const trackHeight = 30;
  const panelWidth = (width - frameThickness * 2) / numPanels;
  const panelHeight = height - frameThickness * 2 - trackHeight - 10;
  
  return (
    <div className={`relative w-full h-full bg-muted/20 rounded-lg overflow-hidden ${className}`}>
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
        
        {/* Top track system */}
        <rect
          x={frameThickness}
          y={frameThickness}
          width={width - frameThickness * 2}
          height={trackHeight}
          fill="hsl(var(--muted))"
          stroke="hsl(var(--border))"
          strokeWidth={1}
        />
        
        {/* Track channels */}
        {Array.from({ length: numPanels }).map((_, i) => (
          <line
            key={i}
            x1={frameThickness}
            y1={frameThickness + ((i + 1) * trackHeight) / (numPanels + 1)}
            x2={width - frameThickness}
            y2={frameThickness + ((i + 1) * trackHeight) / (numPanels + 1)}
            stroke="hsl(var(--border))"
            strokeWidth={1}
          />
        ))}
        
        {/* Panel glides - render from back to front */}
        {Array.from({ length: numPanels }).map((_, i) => {
          const panelIndex = numPanels - 1 - i; // Reverse order for proper layering
          const xOffset = (panelIndex * panelWidth * position) / 100;
          const xPos = frameThickness + (panelIndex * panelWidth) + xOffset;
          const yPos = frameThickness + trackHeight + 5;
          
          // Alternate panel colors slightly for visual separation
          const isAlternate = panelIndex % 2 === 0;
          const panelColor = isAlternate 
            ? materialColor
            : `color-mix(in srgb, ${materialColor} 95%, black)`;
          
          return (
            <g key={panelIndex}>
              {/* Panel hanger */}
              <rect
                x={xPos + panelWidth / 2 - 5}
                y={frameThickness + trackHeight / 2 - 3}
                width={10}
                height={6}
                fill="hsl(var(--muted-foreground))"
                opacity={0.7}
              />
              
              {/* Panel body */}
              <rect
                x={xPos}
                y={yPos}
                width={panelWidth - 4}
                height={panelHeight}
                fill={panelColor}
                stroke="hsl(var(--border))"
                strokeWidth={1}
                opacity={0.95}
                rx={2}
              />
              
              {/* Panel texture lines */}
              <line
                x1={xPos + 10}
                y1={yPos}
                x2={xPos + 10}
                y2={yPos + panelHeight}
                stroke={`color-mix(in srgb, ${panelColor} 90%, black)`}
                strokeWidth={0.5}
                opacity={0.3}
              />
              <line
                x1={xPos + panelWidth - 14}
                y1={yPos}
                x2={xPos + panelWidth - 14}
                y2={yPos + panelHeight}
                stroke={`color-mix(in srgb, ${panelColor} 90%, black)`}
                strokeWidth={0.5}
                opacity={0.3}
              />
              
              {/* Bottom weight bar */}
              <rect
                x={xPos + 2}
                y={yPos + panelHeight - 8}
                width={panelWidth - 8}
                height={6}
                fill="hsl(var(--muted-foreground))"
                opacity={0.6}
                rx={1}
              />
              
              {/* Panel number indicator */}
              <text
                x={xPos + panelWidth / 2}
                y={yPos + 30}
                textAnchor="middle"
                fill="hsl(var(--muted-foreground))"
                fontSize={10}
                opacity={0.4}
              >
                Panel {panelIndex + 1}
              </text>
            </g>
          );
        })}
        
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
      
      {/* Panel position control */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 bg-background/95 backdrop-blur-sm rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium">Panel Position</span>
          <span className="text-xs text-muted-foreground">
            {position > 0 ? 'Open' : 'Closed'}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
};

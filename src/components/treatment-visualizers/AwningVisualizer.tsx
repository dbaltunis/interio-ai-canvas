import { useState } from "react";
import { Slider } from "@/components/ui/slider";

interface AwningVisualizerProps {
  windowType: string;
  measurements: Record<string, any>;
  template?: any;
  material?: any;
  className?: string;
  projection?: number;
  isRetractable?: boolean;
  frameType?: string;
  controlType?: string;
  fabricPattern?: string;
  valanceStyle?: string;
}

export const AwningVisualizer = ({
  windowType,
  measurements,
  template,
  material,
  className = "",
  projection: initialProjection = 70,
  isRetractable = true,
  frameType = 'retractable',
  controlType = 'manual',
  fabricPattern = 'striped',
  valanceStyle = 'scalloped'
}: AwningVisualizerProps) => {
  
  const [extension, setExtension] = useState(initialProjection);
  
  const width = measurements?.width || 800;
  const height = measurements?.drop || measurements?.height || 600;
  const materialColor = material?.color || template?.color || '#E85D3C';
  
  // Awning dimensions
  const frameThickness = 8;
  const casseteHeight = 50;
  const maxProjection = height * 0.6; // Maximum distance awning can extend
  const currentProjection = (maxProjection * extension) / 100;
  
  // Stripe pattern for awning fabric
  const stripeWidth = 40;
  const stripeColor1 = materialColor;
  const stripeColor2 = `color-mix(in srgb, ${materialColor} 80%, white)`;
  
  // Determine if awning should show as fixed or retractable based on frameType
  const showRetractable = frameType !== 'fixed' && isRetractable;
  
  // Valance scallop count based on style
  const valanceScallops = valanceStyle === 'straight' ? 0 : valanceStyle === 'scalloped' ? 10 : 15;
  
  return (
    <div className={`relative w-full h-full bg-gradient-to-b from-sky-100 to-sky-50 rounded-lg overflow-hidden ${className}`}>
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-full"
        style={{ maxHeight: '600px' }}
      >
        {/* Building/window structure */}
        <rect
          x={frameThickness}
          y={casseteHeight + 60}
          width={width - frameThickness * 2}
          height={height - casseteHeight - 80}
          fill="hsl(var(--muted))"
          stroke="hsl(var(--border))"
          strokeWidth={2}
        />
        
        {/* Window on building */}
        <rect
          x={frameThickness + 40}
          y={casseteHeight + 100}
          width={width - frameThickness * 2 - 80}
          height={height - casseteHeight - 180}
          fill="hsl(var(--background))"
          stroke="hsl(var(--border))"
          strokeWidth={2}
          opacity={0.8}
        />
        
        {/* Mounting cassette/housing */}
        <rect
          x={frameThickness}
          y={casseteHeight}
          width={width - frameThickness * 2}
          height={casseteHeight}
          fill="hsl(var(--muted))"
          stroke="hsl(var(--border))"
          strokeWidth={2}
          rx={4}
        />
        
        {/* Cassette detail lines */}
        <line
          x1={frameThickness}
          y1={casseteHeight + casseteHeight / 3}
          x2={width - frameThickness}
          y2={casseteHeight + casseteHeight / 3}
          stroke="hsl(var(--border))"
          strokeWidth={1}
        />
        
        {/* Brand label on cassette */}
        <text
          x={width / 2}
          y={casseteHeight + casseteHeight / 2 + 5}
          textAnchor="middle"
          fill="hsl(var(--muted-foreground))"
          fontSize={14}
          fontWeight="600"
        >
          AWNING
        </text>
        
        {/* Extended awning fabric (only if extended) */}
        {extension > 5 && (
          <g>
            {/* Support arms */}
            <line
              x1={frameThickness + 20}
              y1={casseteHeight + casseteHeight}
              x2={frameThickness + 20}
              y2={casseteHeight + casseteHeight + currentProjection}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={4}
              opacity={0.7}
            />
            <line
              x1={width - frameThickness - 20}
              y1={casseteHeight + casseteHeight}
              x2={width - frameThickness - 20}
              y2={casseteHeight + casseteHeight + currentProjection}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={4}
              opacity={0.7}
            />
            
            {/* Awning fabric with stripes */}
            <defs>
              {fabricPattern === 'striped' ? (
                <pattern id="awningStripes" x="0" y="0" width={stripeWidth * 2} height="100" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width={stripeWidth} height="100" fill={stripeColor1} />
                  <rect x={stripeWidth} y="0" width={stripeWidth} height="100" fill={stripeColor2} />
                </pattern>
              ) : fabricPattern === 'solid' ? (
                <pattern id="awningStripes" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="100" height="100" fill={stripeColor1} />
                </pattern>
              ) : (
                <pattern id="awningStripes" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="30" height="30" fill={stripeColor1} />
                  <circle cx="15" cy="15" r="3" fill={stripeColor2} />
                </pattern>
              )}
              
              {/* Shadow gradient */}
              <linearGradient id="awningGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="black" stopOpacity="0.1" />
                <stop offset="100%" stopColor="black" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            
            {/* Main fabric panel */}
            <path
              d={`M ${frameThickness} ${casseteHeight + casseteHeight}
                  L ${width - frameThickness} ${casseteHeight + casseteHeight}
                  L ${width - frameThickness} ${casseteHeight + casseteHeight + currentProjection}
                  L ${frameThickness} ${casseteHeight + casseteHeight + currentProjection}
                  Z`}
              fill="url(#awningStripes)"
              stroke="hsl(var(--border))"
              strokeWidth={2}
            />
            
            {/* Fabric shadow overlay */}
            <path
              d={`M ${frameThickness} ${casseteHeight + casseteHeight}
                  L ${width - frameThickness} ${casseteHeight + casseteHeight}
                  L ${width - frameThickness} ${casseteHeight + casseteHeight + currentProjection}
                  L ${frameThickness} ${casseteHeight + casseteHeight + currentProjection}
                  Z`}
              fill="url(#awningGradient)"
            />
            
            {/* Valance (decorative bottom edge) */}
            {valanceScallops > 0 ? (
              <path
                d={`M ${frameThickness} ${casseteHeight + casseteHeight + currentProjection}
                    ${Array.from({ length: valanceScallops }).map((_, i) => {
                      const x = frameThickness + ((width - frameThickness * 2) / valanceScallops) * (i + 0.5);
                      const y = casseteHeight + casseteHeight + currentProjection + (valanceStyle === 'deep_scallop' ? 20 : 15);
                      return `Q ${x} ${y}`;
                    }).join(' ')}
                    ${width - frameThickness} ${casseteHeight + casseteHeight + currentProjection}
                    Z`}
                fill={stripeColor1}
                stroke="hsl(var(--border))"
                strokeWidth={1}
                opacity={0.9}
              />
            ) : (
              <rect
                x={frameThickness}
                y={casseteHeight + casseteHeight + currentProjection}
                width={width - frameThickness * 2}
                height={10}
                fill={stripeColor1}
                stroke="hsl(var(--border))"
                strokeWidth={1}
                opacity={0.9}
              />
            )}
            
            {/* Front bar */}
            <rect
              x={frameThickness}
              y={casseteHeight + casseteHeight + currentProjection - 5}
              width={width - frameThickness * 2}
              height={10}
              fill="hsl(var(--muted))"
              stroke="hsl(var(--border))"
              strokeWidth={1}
              rx={2}
            />
            
            {/* Shadow cast by awning */}
            <ellipse
              cx={width / 2}
              cy={casseteHeight + casseteHeight + currentProjection + 80}
              rx={(width - frameThickness * 2) / 2}
              ry={20}
              fill="black"
              opacity={0.15}
            />
          </g>
        )}
        
        {/* Material info badge */}
        {material?.name && (
          <g>
            <rect
              x={frameThickness + 10}
              y={height - 60}
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
              y={height - 40}
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
      
      {/* Extension control (only if retractable) */}
      {showRetractable && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 bg-background/95 backdrop-blur-sm rounded-lg p-4 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">
              {controlType === 'motorized' ? '🔌 Motorized' : '↕️ Manual'} Extension
            </span>
            <span className="text-xs text-muted-foreground">{extension}%</span>
          </div>
          <Slider
            value={[extension]}
            onValueChange={([value]) => setExtension(value)}
            min={0}
            max={100}
            step={10}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};

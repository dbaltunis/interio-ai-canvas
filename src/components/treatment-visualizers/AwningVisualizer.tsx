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
  
  const width = measurements?.width || measurements?.rail_width || 300;
  const height = measurements?.drop || measurements?.height || 200;
  
  // Get color from material/fabric
  const materialColor = material?.color || material?.tags?.find((t: string) => t.startsWith('#')) || template?.color || '#D97706';
  const materialImage = material?.image_url;
  
  // Determine if awning should show as fixed or retractable based on frameType
  const showRetractable = frameType !== 'fixed' && isRetractable;
  
  // Valance scallop count based on style
  const valanceScallops = valanceStyle === 'straight' ? 0 : valanceStyle === 'scalloped' ? 8 : 12;
  
  // Calculate projection based on extension
  const maxProjection = 120;
  const currentProjection = (maxProjection * extension) / 100;
  
  return (
    <div className={`relative min-h-[400px] bg-gradient-to-b from-sky-200 via-sky-100 to-sky-50 rounded-lg overflow-hidden ${className}`}>
      {/* Sky background with subtle clouds */}
      <div className="absolute inset-0">
        <div className="absolute top-8 left-12 w-20 h-8 bg-white/40 rounded-full blur-sm" />
        <div className="absolute top-12 right-16 w-16 h-6 bg-white/30 rounded-full blur-sm" />
        <div className="absolute top-6 right-32 w-12 h-5 bg-white/35 rounded-full blur-sm" />
      </div>
      
      <svg 
        viewBox="0 0 400 300" 
        className="w-full h-full relative z-10"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Stripe pattern for awning */}
          <pattern id="awningStripes" x="0" y="0" width="20" height="100" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="10" height="100" fill={materialColor} />
            <rect x="10" y="0" width="10" height="100" fill="white" opacity="0.9" />
          </pattern>
          
          {/* Solid pattern */}
          <pattern id="awningPatternSolid" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="100" height="100" fill={materialColor} />
          </pattern>
          
          {/* Shadow gradient */}
          <linearGradient id="awningFabricGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="black" stopOpacity="0" />
            <stop offset="100%" stopColor="black" stopOpacity="0.2" />
          </linearGradient>
          
          {/* Cassette gradient */}
          <linearGradient id="cassetteGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--muted))" />
            <stop offset="50%" stopColor="hsl(var(--background))" />
            <stop offset="100%" stopColor="hsl(var(--muted))" />
          </linearGradient>
          
          {/* Fabric image if available */}
          {materialImage && (
            <pattern id="awningFabricImage" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <image href={materialImage} x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          )}
        </defs>
        
        {/* Building wall background */}
        <rect
          x="30"
          y="60"
          width="340"
          height="220"
          fill="hsl(var(--muted))"
          stroke="hsl(var(--border))"
          strokeWidth="2"
        />
        
        {/* Window frame */}
        <rect
          x="80"
          y="100"
          width="240"
          height="160"
          fill="hsl(var(--background))"
          stroke="hsl(var(--border))"
          strokeWidth="3"
          rx="2"
        />
        
        {/* Window glass */}
        <rect
          x="90"
          y="110"
          width="220"
          height="140"
          fill="url(#windowGlass)"
          opacity="0.6"
        />
        <defs>
          <linearGradient id="windowGlass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#87CEEB" />
            <stop offset="50%" stopColor="#B0E0E6" />
            <stop offset="100%" stopColor="#87CEEB" />
          </linearGradient>
        </defs>
        
        {/* Window reflection */}
        <rect
          x="95"
          y="115"
          width="40"
          height="60"
          fill="white"
          opacity="0.2"
          rx="2"
        />
        
        {/* Mounting cassette/housing */}
        <rect
          x="50"
          y="45"
          width="300"
          height="25"
          fill="url(#cassetteGradient)"
          stroke="hsl(var(--border))"
          strokeWidth="2"
          rx="4"
        />
        
        {/* Cassette detail line */}
        <line
          x1="50"
          y1="57"
          x2="350"
          y2="57"
          stroke="hsl(var(--border))"
          strokeWidth="1"
          opacity="0.5"
        />
        
        {/* Extended awning fabric (only if extended) */}
        {extension > 5 && (
          <g>
            {/* Left support arm */}
            <line
              x1="70"
              y1="70"
              x2="70"
              y2={70 + currentProjection}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="70" cy={70 + currentProjection} r="4" fill="hsl(var(--muted-foreground))" />
            
            {/* Right support arm */}
            <line
              x1="330"
              y1="70"
              x2="330"
              y2={70 + currentProjection}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="330" cy={70 + currentProjection} r="4" fill="hsl(var(--muted-foreground))" />
            
            {/* Main fabric panel */}
            <rect
              x="50"
              y="70"
              width="300"
              height={currentProjection}
              fill={materialImage ? "url(#awningFabricImage)" : (fabricPattern === 'striped' ? "url(#awningStripes)" : "url(#awningPatternSolid)")}
              stroke="hsl(var(--border))"
              strokeWidth="1"
            />
            
            {/* Fabric shadow overlay */}
            <rect
              x="50"
              y="70"
              width="300"
              height={currentProjection}
              fill="url(#awningFabricGradient)"
            />
            
            {/* Front bar */}
            <rect
              x="50"
              y={70 + currentProjection - 6}
              width="300"
              height="8"
              fill="hsl(var(--muted))"
              stroke="hsl(var(--border))"
              strokeWidth="1"
              rx="2"
            />
            
            {/* Valance (decorative bottom edge) */}
            {valanceScallops > 0 ? (
              <path
                d={`M 50 ${70 + currentProjection + 2}
                    ${Array.from({ length: valanceScallops }).map((_, i) => {
                      const segmentWidth = 300 / valanceScallops;
                      const startX = 50 + segmentWidth * i;
                      const midX = startX + segmentWidth / 2;
                      const endX = startX + segmentWidth;
                      const dropY = valanceStyle === 'deep_scallop' ? 18 : 12;
                      return `L ${startX} ${70 + currentProjection + 2} Q ${midX} ${70 + currentProjection + 2 + dropY} ${endX} ${70 + currentProjection + 2}`;
                    }).join(' ')}
                    L 350 ${70 + currentProjection + 2}
                    Z`}
                fill={materialColor}
                stroke="hsl(var(--border))"
                strokeWidth="1"
                opacity="0.95"
              />
            ) : (
              <rect
                x="50"
                y={70 + currentProjection + 2}
                width="300"
                height="8"
                fill={materialColor}
                stroke="hsl(var(--border))"
                strokeWidth="1"
              />
            )}
            
            {/* Shadow cast by awning on wall */}
            <ellipse
              cx="200"
              cy={70 + currentProjection + 50}
              rx="140"
              ry="15"
              fill="black"
              opacity="0.1"
            />
          </g>
        )}
        
        {/* Material info badge */}
        {material?.name && (
          <g>
            <rect
              x="60"
              y="265"
              width="120"
              height="24"
              fill="hsl(var(--background))"
              fillOpacity="0.95"
              stroke="hsl(var(--border))"
              strokeWidth="1"
              rx="4"
            />
            <text
              x="120"
              y="282"
              textAnchor="middle"
              fill="hsl(var(--foreground))"
              fontSize="11"
              fontWeight="500"
            >
              {material.name.length > 15 ? material.name.substring(0, 15) + '...' : material.name}
            </text>
          </g>
        )}
      </svg>
      
      {/* Measurement indicators */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded shadow-md">
        Width: {width}cm
      </div>
      
      {/* Extension control (only if retractable) */}
      {showRetractable && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 bg-background/95 backdrop-blur-sm rounded-lg p-4 border shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">
              {controlType === 'motorized' ? '⚡ Motorized' : '↕️ Manual'} Extension
            </span>
            <span className="text-xs text-muted-foreground font-medium">{extension}%</span>
          </div>
          <Slider
            value={[extension]}
            onValueChange={([value]) => setExtension(value)}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};

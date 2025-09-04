import { useMemo } from "react";

interface EnhancedWindowRendererProps {
  windowType: string;
  measurements: Record<string, any>;
  selectedTreatment?: any;
  className?: string;
  showDepth?: boolean;
  frameColor?: string;
  wallColor?: string;
}

export const EnhancedWindowRenderer = ({
  windowType,
  measurements,
  selectedTreatment,
  className = "",
  showDepth = true,
  frameColor = "#8B7355",
  wallColor = "#F5F5F0"
}: EnhancedWindowRendererProps) => {
  
  const renderWindow = useMemo(() => {
    const width = measurements?.rail_width || measurements?.window_width || 200;
    const height = measurements?.drop || measurements?.window_height || 150;
    
    switch (windowType) {
      case 'bay':
        return renderEnhancedBayWindow(width, height, frameColor, wallColor, showDepth);
      case 'french_doors':
        return renderEnhancedFrenchDoors(width, height, frameColor, wallColor, showDepth);
      case 'sliding_doors':
        return renderEnhancedSlidingDoors(width, height, frameColor, wallColor, showDepth);
      case 'large_window':
        return renderEnhancedLargeWindow(width, height, frameColor, wallColor, showDepth);
      case 'corner_window':
        return renderEnhancedCornerWindow(width, height, frameColor, wallColor, showDepth);
      default:
        return renderEnhancedStandardWindow(width, height, frameColor, wallColor, showDepth);
    }
  }, [windowType, measurements, frameColor, wallColor, showDepth]);

  return (
    <div className={`relative bg-gradient-to-b from-sky-100 to-sky-200 rounded-lg border-2 border-sky-300 ${className}`}>
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        {renderWindow}
        
        {/* Window type label with enhanced styling */}
        <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full border shadow-sm">
          <span className="text-xs font-medium text-foreground">
            {windowType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
        
        {/* Lighting effect overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 30% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)`
          }}
        />
      </div>
    </div>
  );
};

// Enhanced window rendering functions with realistic depth and shadows
const renderEnhancedStandardWindow = (width: number, height: number, frameColor: string, wallColor: string, showDepth: boolean) => (
  <svg viewBox="0 0 400 300" className="w-full h-full">
    {/* Wall background with texture */}
    <defs>
      <pattern id="wallTexture" patternUnits="userSpaceOnUse" width="4" height="4">
        <rect width="4" height="4" fill={wallColor} />
        <circle cx="2" cy="2" r="0.5" fill="rgba(0,0,0,0.03)" />
      </pattern>
      
      {/* Shadow gradients */}
      <linearGradient id="windowShadow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(0,0,0,0.1)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0.05)" />
      </linearGradient>
      
      {/* Glass gradient */}
      <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(135,206,235,0.3)" />
        <stop offset="50%" stopColor="rgba(135,206,235,0.1)" />
        <stop offset="100%" stopColor="rgba(135,206,235,0.2)" />
      </linearGradient>
    </defs>
    
    <rect width="100%" height="100%" fill="url(#wallTexture)" />
    
    {/* Window shadow (depth effect) */}
    {showDepth && (
      <rect 
        x="75" y="65" 
        width={width * 0.6} height={height * 0.7} 
        fill="url(#windowShadow)" 
        rx="4" 
      />
    )}
    
    {/* Window frame - outer */}
    <rect 
      x="70" y="60" 
      width={width * 0.6} height={height * 0.7} 
      fill={frameColor} 
      stroke="rgba(0,0,0,0.2)" 
      strokeWidth="1" 
      rx="4" 
    />
    
    {/* Window frame - inner recess */}
    <rect 
      x="78" y="68" 
      width={width * 0.6 - 16} height={height * 0.7 - 16} 
      fill="url(#glassGradient)" 
      stroke={frameColor} 
      strokeWidth="2" 
      rx="2" 
    />
    
    {/* Window mullions (cross pattern) */}
    <line 
      x1={70 + (width * 0.6) / 2} y1="68" 
      x2={70 + (width * 0.6) / 2} y2={60 + height * 0.7 - 8} 
      stroke={frameColor} 
      strokeWidth="3" 
    />
    <line 
      x1="78" y1={60 + (height * 0.7) / 2} 
      x2={70 + width * 0.6 - 8} y2={60 + (height * 0.7) / 2} 
      stroke={frameColor} 
      strokeWidth="3" 
    />
    
    {/* Glass reflection highlights */}
    <rect 
      x="85" y="75" 
      width="20" height="60" 
      fill="rgba(255,255,255,0.4)" 
      rx="2" 
    />
    <rect 
      x="120" y="85" 
      width="15" height="40" 
      fill="rgba(255,255,255,0.2)" 
      rx="1" 
    />
  </svg>
);

const renderEnhancedBayWindow = (width: number, height: number, frameColor: string, wallColor: string, showDepth: boolean) => (
  <svg viewBox="0 0 400 300" className="w-full h-full">
    <defs>
      <pattern id="wallTexture" patternUnits="userSpaceOnUse" width="4" height="4">
        <rect width="4" height="4" fill={wallColor} />
        <circle cx="2" cy="2" r="0.5" fill="rgba(0,0,0,0.03)" />
      </pattern>
      
      <linearGradient id="bayGlass" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(135,206,235,0.4)" />
        <stop offset="50%" stopColor="rgba(135,206,235,0.1)" />
        <stop offset="100%" stopColor="rgba(135,206,235,0.3)" />
      </linearGradient>
    </defs>
    
    <rect width="100%" height="100%" fill="url(#wallTexture)" />
    
    {/* Bay window - three panels with perspective */}
    {/* Center panel */}
    <rect 
      x="150" y="60" 
      width={width * 0.35} height={height * 0.7} 
      fill={frameColor} 
      stroke="rgba(0,0,0,0.2)" 
      strokeWidth="1" 
      rx="4" 
    />
    <rect 
      x="158" y="68" 
      width={width * 0.35 - 16} height={height * 0.7 - 16} 
      fill="url(#bayGlass)" 
      stroke={frameColor} 
      strokeWidth="2" 
      rx="2" 
    />
    
    {/* Left angled panel */}
    <polygon 
      points="60,70 150,60 150,200 60,210" 
      fill={frameColor} 
      stroke="rgba(0,0,0,0.2)" 
      strokeWidth="1" 
    />
    <polygon 
      points="68,77 142,67 142,193 68,203" 
      fill="url(#bayGlass)" 
      stroke={frameColor} 
      strokeWidth="2" 
    />
    
    {/* Right angled panel */}
    <polygon 
      points={`${150 + width * 0.35},60 340,70 340,210 ${150 + width * 0.35},200`}
      fill={frameColor} 
      stroke="rgba(0,0,0,0.2)" 
      strokeWidth="1" 
    />
    <polygon 
      points={`${158 + width * 0.35 - 16},67 332,77 332,203 ${158 + width * 0.35 - 16},193`}
      fill="url(#bayGlass)" 
      stroke={frameColor} 
      strokeWidth="2" 
    />
    
    {/* Depth shadows */}
    {showDepth && (
      <>
        <polygon points="150,60 158,52 158,192 150,200" fill="rgba(0,0,0,0.1)" />
        <polygon points={`${150 + width * 0.35},60 ${158 + width * 0.35 - 16},52 ${158 + width * 0.35 - 16},192 ${150 + width * 0.35},200`} fill="rgba(0,0,0,0.1)" />
      </>
    )}
    
    {/* Glass reflections on each panel */}
    <rect x="170" y="75" width="15" height="50" fill="rgba(255,255,255,0.3)" rx="2" />
    <polygon points="75,82 95,80 95,120 75,122" fill="rgba(255,255,255,0.3)" />
    <polygon points="310,82 330,80 330,120 310,122" fill="rgba(255,255,255,0.3)" />
  </svg>
);

const renderEnhancedFrenchDoors = (width: number, height: number, frameColor: string, wallColor: string, showDepth: boolean) => (
  <svg viewBox="0 0 400 300" className="w-full h-full">
    <defs>
      <pattern id="wallTexture" patternUnits="userSpaceOnUse" width="4" height="4">
        <rect width="4" height="4" fill={wallColor} />
        <circle cx="2" cy="2" r="0.5" fill="rgba(0,0,0,0.03)" />
      </pattern>
      
      <linearGradient id="doorGlass" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(135,206,235,0.2)" />
        <stop offset="100%" stopColor="rgba(135,206,235,0.4)" />
      </linearGradient>
    </defs>
    
    <rect width="100%" height="100%" fill="url(#wallTexture)" />
    
    {/* French doors - taller and double */}
    {/* Left door */}
    <rect 
      x="80" y="40" 
      width={width * 0.25} height={height * 0.85} 
      fill={frameColor} 
      stroke="rgba(0,0,0,0.2)" 
      strokeWidth="2" 
      rx="6" 
    />
    
    {/* Left door glass panels (3 vertical) */}
    <rect x="88" y="48" width={width * 0.25 - 16} height={height * 0.25} fill="url(#doorGlass)" stroke={frameColor} strokeWidth="1" rx="2" />
    <rect x="88" y={48 + height * 0.3} width={width * 0.25 - 16} height={height * 0.25} fill="url(#doorGlass)" stroke={frameColor} strokeWidth="1" rx="2" />
    <rect x="88" y={48 + height * 0.6} width={width * 0.25 - 16} height={height * 0.2} fill="url(#doorGlass)" stroke={frameColor} strokeWidth="1" rx="2" />
    
    {/* Right door */}
    <rect 
      x="220" y="40" 
      width={width * 0.25} height={height * 0.85} 
      fill={frameColor} 
      stroke="rgba(0,0,0,0.2)" 
      strokeWidth="2" 
      rx="6" 
    />
    
    {/* Right door glass panels */}
    <rect x="228" y="48" width={width * 0.25 - 16} height={height * 0.25} fill="url(#doorGlass)" stroke={frameColor} strokeWidth="1" rx="2" />
    <rect x="228" y={48 + height * 0.3} width={width * 0.25 - 16} height={height * 0.25} fill="url(#doorGlass)" stroke={frameColor} strokeWidth="1" rx="2" />
    <rect x="228" y={48 + height * 0.6} width={width * 0.25 - 16} height={height * 0.2} fill="url(#doorGlass)" stroke={frameColor} strokeWidth="1" rx="2" />
    
    {/* Door handles */}
    <circle cx={80 + width * 0.2} cy="130" r="3" fill="#DAA520" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
    <circle cx="228" cy="130" r="3" fill="#DAA520" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
    
    {/* Depth shadows */}
    {showDepth && (
      <>
        <rect x="75" y="45" width="5" height={height * 0.85} fill="rgba(0,0,0,0.1)" rx="2" />
        <rect x="315" y="45" width="5" height={height * 0.85} fill="rgba(0,0,0,0.1)" rx="2" />
      </>
    )}
    
    {/* Glass reflections */}
    <rect x="95" y="55" width="8" height="30" fill="rgba(255,255,255,0.4)" rx="1" />
    <rect x="235" y="55" width="8" height="30" fill="rgba(255,255,255,0.4)" rx="1" />
  </svg>
);

const renderEnhancedSlidingDoors = (width: number, height: number, frameColor: string, wallColor: string, showDepth: boolean) => (
  <svg viewBox="0 0 400 300" className="w-full h-full">
    <defs>
      <pattern id="wallTexture" patternUnits="userSpaceOnUse" width="4" height="4">
        <rect width="4" height="4" fill={wallColor} />
        <circle cx="2" cy="2" r="0.5" fill="rgba(0,0,0,0.03)" />
      </pattern>
      
      <linearGradient id="slidingGlass" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(135,206,235,0.3)" />
        <stop offset="100%" stopColor="rgba(135,206,235,0.1)" />
      </linearGradient>
    </defs>
    
    <rect width="100%" height="100%" fill="url(#wallTexture)" />
    
    {/* Sliding door track */}
    <rect x="50" y="35" width="300" height="8" fill="#666" rx="4" />
    <rect x="50" y={40 + height * 0.85} width="300" height="6" fill="#666" rx="3" />
    
    {/* Back sliding panel */}
    <rect 
      x="60" y="40" 
      width={width * 0.4} height={height * 0.85} 
      fill={frameColor} 
      stroke="rgba(0,0,0,0.15)" 
      strokeWidth="1" 
      rx="4" 
      opacity="0.8"
    />
    <rect 
      x="68" y="48" 
      width={width * 0.4 - 16} height={height * 0.85 - 16} 
      fill="url(#slidingGlass)" 
      stroke={frameColor} 
      strokeWidth="1" 
      rx="2" 
      opacity="0.8"
    />
    
    {/* Front sliding panel (overlapping) */}
    <rect 
      x="180" y="40" 
      width={width * 0.4} height={height * 0.85} 
      fill={frameColor} 
      stroke="rgba(0,0,0,0.2)" 
      strokeWidth="2" 
      rx="4" 
    />
    <rect 
      x="188" y="48" 
      width={width * 0.4 - 16} height={height * 0.85 - 16} 
      fill="url(#slidingGlass)" 
      stroke={frameColor} 
      strokeWidth="1" 
      rx="2" 
    />
    
    {/* Sliding door handles */}
    <rect x={180 + width * 0.35} y="120" width="12" height="4" fill="#DAA520" rx="2" />
    <rect x="75" y="120" width="12" height="4" fill="#DAA520" rx="2" opacity="0.6" />
    
    {/* Depth and shadow effects */}
    {showDepth && (
      <>
        <rect x="55" y="45" width={width * 0.4} height={height * 0.85} fill="rgba(0,0,0,0.05)" rx="4" />
        <rect x="185" y="45" width={width * 0.4} height={height * 0.85} fill="rgba(0,0,0,0.1)" rx="4" />
      </>
    )}
    
    {/* Glass reflections */}
    <rect x="200" y="55" width="12" height="40" fill="rgba(255,255,255,0.4)" rx="2" />
    <rect x="85" y="60" width="10" height="35" fill="rgba(255,255,255,0.2)" rx="1" opacity="0.6" />
  </svg>
);

const renderEnhancedLargeWindow = (width: number, height: number, frameColor: string, wallColor: string, showDepth: boolean) => (
  <svg viewBox="0 0 400 300" className="w-full h-full">
    <defs>
      <pattern id="wallTexture" patternUnits="userSpaceOnUse" width="4" height="4">
        <rect width="4" height="4" fill={wallColor} />
        <circle cx="2" cy="2" r="0.5" fill="rgba(0,0,0,0.03)" />
      </pattern>
      
      <linearGradient id="largeGlass" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(135,206,235,0.2)" />
        <stop offset="50%" stopColor="rgba(135,206,235,0.05)" />
        <stop offset="100%" stopColor="rgba(135,206,235,0.3)" />
      </linearGradient>
    </defs>
    
    <rect width="100%" height="100%" fill="url(#wallTexture)" />
    
    {/* Large window - panoramic style */}
    <rect 
      x="30" y="50" 
      width={width * 0.85} height={height * 0.75} 
      fill={frameColor} 
      stroke="rgba(0,0,0,0.2)" 
      strokeWidth="2" 
      rx="6" 
    />
    
    {/* Large glass area with minimal mullions */}
    <rect 
      x="38" y="58" 
      width={width * 0.85 - 16} height={height * 0.75 - 16} 
      fill="url(#largeGlass)" 
      stroke={frameColor} 
      strokeWidth="1" 
      rx="4" 
    />
    
    {/* Minimal mullions - just two vertical dividers */}
    <line 
      x1={30 + (width * 0.85) / 3} y1="58" 
      x2={30 + (width * 0.85) / 3} y2={50 + height * 0.75 - 8} 
      stroke={frameColor} 
      strokeWidth="2" 
    />
    <line 
      x1={30 + (width * 0.85) * 2/3} y1="58" 
      x2={30 + (width * 0.85) * 2/3} y2={50 + height * 0.75 - 8} 
      stroke={frameColor} 
      strokeWidth="2" 
    />
    
    {/* Depth shadow */}
    {showDepth && (
      <rect 
        x="35" y="55" 
        width={width * 0.85} height={height * 0.75} 
        fill="rgba(0,0,0,0.08)" 
        rx="6" 
      />
    )}
    
    {/* Large glass reflections */}
    <rect x="50" y="70" width="25" height="80" fill="rgba(255,255,255,0.3)" rx="3" />
    <rect x="120" y="80" width="20" height="60" fill="rgba(255,255,255,0.2)" rx="2" />
    <rect x="250" y="75" width="18" height="70" fill="rgba(255,255,255,0.25)" rx="2" />
  </svg>
);

const renderEnhancedCornerWindow = (width: number, height: number, frameColor: string, wallColor: string, showDepth: boolean) => (
  <svg viewBox="0 0 400 300" className="w-full h-full">
    <defs>
      <pattern id="wallTexture" patternUnits="userSpaceOnUse" width="4" height="4">
        <rect width="4" height="4" fill={wallColor} />
        <circle cx="2" cy="2" r="0.5" fill="rgba(0,0,0,0.03)" />
      </pattern>
      
      <linearGradient id="cornerGlass" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(135,206,235,0.3)" />
        <stop offset="100%" stopColor="rgba(135,206,235,0.1)" />
      </linearGradient>
    </defs>
    
    <rect width="100%" height="100%" fill="url(#wallTexture)" />
    
    {/* Corner window - L-shaped */}
    {/* Horizontal window */}
    <rect 
      x="100" y="80" 
      width={width * 0.6} height={height * 0.5} 
      fill={frameColor} 
      stroke="rgba(0,0,0,0.2)" 
      strokeWidth="2" 
      rx="4" 
    />
    <rect 
      x="108" y="88" 
      width={width * 0.6 - 16} height={height * 0.5 - 16} 
      fill="url(#cornerGlass)" 
      stroke={frameColor} 
      strokeWidth="1" 
      rx="2" 
    />
    
    {/* Vertical window */}
    <rect 
      x="60" y="40" 
      width={width * 0.35} height={height * 0.6} 
      fill={frameColor} 
      stroke="rgba(0,0,0,0.2)" 
      strokeWidth="2" 
      rx="4" 
    />
    <rect 
      x="68" y="48" 
      width={width * 0.35 - 16} height={height * 0.6 - 16} 
      fill="url(#cornerGlass)" 
      stroke={frameColor} 
      strokeWidth="1" 
      rx="2" 
    />
    
    {/* Corner junction - special treatment */}
    <rect 
      x="100" y="80" 
      width={width * 0.12} height={height * 0.2} 
      fill={frameColor} 
      stroke="rgba(0,0,0,0.3)" 
      strokeWidth="2" 
    />
    
    {/* Depth shadows */}
    {showDepth && (
      <>
        <rect x="95" y="85" width={width * 0.6} height={height * 0.5} fill="rgba(0,0,0,0.06)" rx="4" />
        <rect x="55" y="45" width={width * 0.35} height={height * 0.6} fill="rgba(0,0,0,0.06)" rx="4" />
      </>
    )}
    
    {/* Glass reflections on both windows */}
    <rect x="85" y="55" width="12" height="40" fill="rgba(255,255,255,0.3)" rx="2" />
    <rect x="120" y="95" width="20" height="25" fill="rgba(255,255,255,0.3)" rx="2" />
  </svg>
);
import { useMemo } from "react";

interface RomanBlindVisualizerProps {
  windowType: string;
  measurements: Record<string, any>;
  template?: any;
  material?: any;
  className?: string;
  foldStyle?: 'classic' | 'relaxed' | 'hobbled';
  mounted?: 'inside' | 'outside';
}

export const RomanBlindVisualizer = ({
  windowType,
  measurements,
  template,
  material,
  className = "",
  foldStyle = 'classic',
  mounted = 'outside'
}: RomanBlindVisualizerProps) => {
  
  const renderRomanBlind = useMemo(() => {
    const width = measurements?.rail_width || measurements?.window_width || 200;
    const height = measurements?.drop || measurements?.window_height || 150;
    const fabricColor = material?.color || "#E8E2D4";
    const fabricImage = material?.image_url || null;
    const foldCount = Math.floor(height / 25); // Fold every 25cm approximately
    
    return (
      <svg viewBox="0 0 400 300" className="w-full h-full">
        <defs>
          {/* Fabric image pattern or gradient */}
          {fabricImage ? (
            <pattern id="fabricPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <image href={fabricImage} x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          ) : (
            <linearGradient id="fabricGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={fabricColor} />
              <stop offset="50%" stopColor={`${fabricColor}CC`} />
              <stop offset="100%" stopColor={fabricColor} />
            </linearGradient>
          )}
          
          {/* Shadow for depth */}
          <linearGradient id="blindShadow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.1)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.05)" />
          </linearGradient>
          
          {/* Fold shadow */}
          <linearGradient id="foldShadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.2)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        
        {/* Window frame background */}
        <rect x="50" y="50" width={width * 0.8} height={height * 0.8} fill="#F5F5F0" stroke="#8B7355" strokeWidth="8" rx="4" />
        
        {/* Roman blind mounting system */}
        {mounted === 'outside' ? (
          <>
            {/* Outside mount - headrail above window */}
            <rect 
              x="45" y="42" 
              width={width * 0.8 + 10} height="12" 
              fill="#666" 
              rx="2" 
            />
            {/* Brackets */}
            <rect x="48" y="40" width="8" height="16" fill="#444" rx="1" />
            <rect x={45 + width * 0.8 + 5} y="40" width="8" height="16" fill="#444" rx="1" />
          </>
        ) : (
          <>
            {/* Inside mount - headrail inside window */}
            <rect 
              x="52" y="52" 
              width={width * 0.8 - 4} height="8" 
              fill="#666" 
              rx="1" 
            />
          </>
        )}
        
        {/* Roman blind fabric with realistic folds */}
        {foldStyle === 'classic' && renderClassicFolds(width, height, foldCount, fabricImage ? 'url(#fabricPattern)' : fabricColor, fabricImage)}
        {foldStyle === 'relaxed' && renderRelaxedFolds(width, height, foldCount, fabricImage ? 'url(#fabricPattern)' : fabricColor, fabricImage)}
        {foldStyle === 'hobbled' && renderHobbledFolds(width, height, foldCount, fabricImage ? 'url(#fabricPattern)' : fabricColor, fabricImage)}
        
        {/* Control cord */}
        <line 
          x1={50 + width * 0.75} y1="54" 
          x2={50 + width * 0.75} y2="280" 
          stroke="#8B4513" 
          strokeWidth="2" 
        />
        
        {/* Cord pull */}
        <circle 
          cx={50 + width * 0.75} cy="285" 
          r="4" 
          fill="#D2691E" 
          stroke="#8B4513" 
          strokeWidth="1" 
        />
        
        {/* Material info badge */}
        <rect x="60" y="260" width="120" height="25" fill="rgba(255,255,255,0.9)" rx="4" />
        <text x="70" y="275" fontSize="10" fill="#333">
          {material?.name || 'Roman Blind'} - {foldStyle.charAt(0).toUpperCase() + foldStyle.slice(1)}
        </text>
      </svg>
    );
  }, [windowType, measurements, material, foldStyle, mounted]);

  return (
    <div className={`relative bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 ${className}`}>
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        {renderRomanBlind}
      </div>
    </div>
  );
};

// Classic Roman blind with clean horizontal folds
const renderClassicFolds = (width: number, height: number, foldCount: number, fabricColor: string, hasFabricImage?: boolean) => {
  const folds = [];
  const foldHeight = (height * 0.7) / foldCount;
  
  for (let i = 0; i < foldCount; i++) {
    const y = 60 + (i * foldHeight);
    const isVisible = i < foldCount - 2; // Bottom folds are raised
    
    if (isVisible) {
      // Flat section
      folds.push(
        <rect 
          key={`fold-${i}`}
          x="50" 
          y={y} 
          width={width * 0.8} 
          height={foldHeight - 4} 
          fill={fabricColor} 
          stroke="rgba(0,0,0,0.1)" 
          strokeWidth="0.5" 
        />
      );
      
      // Fold line shadow
      folds.push(
        <line 
          key={`fold-line-${i}`}
          x1="50" 
          y1={y + foldHeight - 4} 
          x2={50 + width * 0.8} 
          y2={y + foldHeight - 4} 
          stroke="rgba(0,0,0,0.2)" 
          strokeWidth="2" 
        />
      );
    } else {
      // Raised/folded section
      const curveHeight = 8;
      folds.push(
        <path 
          key={`raised-fold-${i}`}
          d={`M 50 ${y} Q ${50 + (width * 0.8) / 2} ${y + curveHeight} ${50 + width * 0.8} ${y} L ${50 + width * 0.8} ${y + foldHeight} Q ${50 + (width * 0.8) / 2} ${y + foldHeight - curveHeight} 50 ${y + foldHeight} Z`}
          fill={fabricColor}
          stroke="rgba(0,0,0,0.15)"
          strokeWidth="1"
        />
      );
    }
  }
  
  return <g>{folds}</g>;
};

// Relaxed Roman blind with soft, curved folds
const renderRelaxedFolds = (width: number, height: number, foldCount: number, fabricColor: string, hasFabricImage?: boolean) => {
  const folds = [];
  const foldHeight = (height * 0.7) / foldCount;
  
  for (let i = 0; i < foldCount; i++) {
    const y = 60 + (i * foldHeight);
    const isVisible = i < foldCount - 3; // More folds raised for relaxed look
    
    if (isVisible) {
      // Gently curved section
      const curve = 3;
      folds.push(
        <path 
          key={`relaxed-fold-${i}`}
          d={`M 50 ${y} Q ${50 + (width * 0.8) / 2} ${y + curve} ${50 + width * 0.8} ${y} L ${50 + width * 0.8} ${y + foldHeight} Q ${50 + (width * 0.8) / 2} ${y + foldHeight + curve} 50 ${y + foldHeight} Z`}
          fill={fabricColor}
          stroke="rgba(0,0,0,0.1)"
          strokeWidth="0.5"
        />
      );
    } else {
      // Deep curved fold
      const curveHeight = 12;
      folds.push(
        <path 
          key={`deep-fold-${i}`}
          d={`M 50 ${y} Q ${50 + (width * 0.8) / 2} ${y + curveHeight} ${50 + width * 0.8} ${y} L ${50 + width * 0.8} ${y + foldHeight} Q ${50 + (width * 0.8) / 2} ${y + foldHeight - curveHeight} 50 ${y + foldHeight} Z`}
          fill={fabricColor}
          stroke="rgba(0,0,0,0.2)"
          strokeWidth="1"
        />
      );
    }
  }
  
  return <g>{folds}</g>;
};

// Hobbled Roman blind with permanent horizontal folds
const renderHobbledFolds = (width: number, height: number, foldCount: number, fabricColor: string, hasFabricImage?: boolean) => {
  const folds = [];
  const foldHeight = (height * 0.7) / (foldCount + 2); // Smaller sections for hobbled
  
  for (let i = 0; i < foldCount + 2; i++) {
    const y = 60 + (i * foldHeight);
    const curveHeight = 6;
    
    // Permanent hobbled fold
    folds.push(
      <path 
        key={`hobbled-fold-${i}`}
        d={`M 50 ${y} Q ${50 + (width * 0.8) / 2} ${y + curveHeight} ${50 + width * 0.8} ${y} L ${50 + width * 0.8} ${y + foldHeight - curveHeight} Q ${50 + (width * 0.8) / 2} ${y + foldHeight} 50 ${y + foldHeight - curveHeight} Z`}
        fill={fabricColor}
        stroke="rgba(0,0,0,0.15)"
        strokeWidth="1"
      />
    );
    
    // Sewn tack line
    folds.push(
      <line 
        key={`tack-line-${i}`}
        x1={50 + (width * 0.8) * 0.2} 
        y1={y + foldHeight - curveHeight} 
        x2={50 + (width * 0.8) * 0.8} 
        y2={y + foldHeight - curveHeight} 
        stroke="rgba(0,0,0,0.3)" 
        strokeWidth="1"
        strokeDasharray="2,2"
      />
    );
  }
  
  return <g>{folds}</g>;
};
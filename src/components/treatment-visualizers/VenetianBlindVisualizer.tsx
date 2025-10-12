import { useMemo, useState } from "react";

interface VenetianBlindVisualizerProps {
  windowType: string;
  measurements: Record<string, any>;
  template?: any;
  material?: any;
  className?: string;
  slatSize?: '25mm' | '35mm' | '50mm';
  slatAngle?: number; // 0-90 degrees
  mounted?: 'inside' | 'outside';
}

export const VenetianBlindVisualizer = ({
  windowType,
  measurements,
  template,
  material,
  className = "",
  slatSize = '25mm',
  slatAngle = 45,
  mounted = 'inside'
}: VenetianBlindVisualizerProps) => {
  
  const [currentAngle, setCurrentAngle] = useState(slatAngle);
  
  const renderVenetianBlind = useMemo(() => {
    const width = measurements?.rail_width || measurements?.window_width || 200;
    const height = measurements?.drop || measurements?.window_height || 150;
    const slatColor = material?.color || "#F5F5F5";
    const slatHeight = getSlatHeight(slatSize);
    const slatCount = Math.floor((height * 0.7) / (slatHeight + 2));
    
    return (
      <svg viewBox="0 0 400 300" className="w-full h-full">
        <defs>
          {/* Slat gradient for 3D effect */}
          <linearGradient id="slatGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={lightenColor(slatColor, 20)} />
            <stop offset="50%" stopColor={slatColor} />
            <stop offset="100%" stopColor={darkenColor(slatColor, 15)} />
          </linearGradient>
          
          {/* Shadow gradient */}
          <linearGradient id="slatShadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.1)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
          </linearGradient>
        </defs>
        
        {/* Window frame */}
        <rect x="50" y="50" width={width * 0.8} height={height * 0.8} fill="#F8F8F8" stroke="#8B7355" strokeWidth="6" rx="4" />
        
        {/* Headrail */}
        {mounted === 'outside' ? (
          <rect x="45" y="42" width={width * 0.8 + 10} height="12" fill="#A0A0A0" rx="2" />
        ) : (
          <rect x="52" y="52" width={width * 0.8 - 4} height="8" fill="#A0A0A0" rx="1" />
        )}
        
        {/* Venetian slats */}
        {renderSlats(width, height, slatCount, slatHeight, currentAngle, slatColor)}
        
        {/* Ladder strings */}
        <line x1={50 + (width * 0.8) * 0.2} y1="54" x2={50 + (width * 0.8) * 0.2} y2={50 + height * 0.8} stroke="#D3D3D3" strokeWidth="1" />
        <line x1={50 + (width * 0.8) * 0.8} y1="54" x2={50 + (width * 0.8) * 0.8} y2={50 + height * 0.8} stroke="#D3D3D3" strokeWidth="1" />
        
        {/* Tilt control wand */}
        <rect x={48 + width * 0.8} y="60" width="3" height="60" fill="#666" rx="1" />
        <circle cx={49.5 + width * 0.8} cy="55" r="2" fill="#888" />
        
        {/* Lift cord */}
        <line x1={50 + (width * 0.8) * 0.9} y1="54" x2={50 + (width * 0.8) * 0.9} y2="280" stroke="#E0E0E0" strokeWidth="2" />
        
        {/* Interactive angle control */}
        <g transform="translate(320, 80)">
          <circle cx="0" cy="0" r="25" fill="rgba(255,255,255,0.9)" stroke="#CCC" strokeWidth="2" />
          <text x="-8" y="-30" fontSize="8" fill="#666">Tilt</text>
          <line 
            x1="0" y1="0" 
            x2={20 * Math.cos((currentAngle - 90) * Math.PI / 180)} 
            y2={20 * Math.sin((currentAngle - 90) * Math.PI / 180)} 
            stroke="#333" 
            strokeWidth="3" 
            strokeLinecap="round"
          />
          <text x="-8" y="35" fontSize="8" fill="#666">{currentAngle}°</text>
        </g>
        
        {/* Material info */}
        <rect x="60" y="260" width="150" height="25" fill="rgba(255,255,255,0.9)" rx="4" />
        <text x="70" y="275" fontSize="10" fill="#333">
          {material?.name || 'Venetian Blind'} - {slatSize} slats
        </text>
      </svg>
    );
  }, [windowType, measurements, material, slatSize, currentAngle, mounted]);

  return (
    <div className={`relative bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200 ${className}`}>
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        {renderVenetianBlind}
        
        {/* Angle control slider */}
        <div className="absolute bottom-4 left-4 bg-white/90 p-2 rounded">
          <label className="text-xs text-gray-600 block mb-1">Slat Angle</label>
          <input 
            type="range" 
            min="0" 
            max="90" 
            value={currentAngle}
            onChange={(e) => setCurrentAngle(Number(e.target.value))}
            className="w-20 h-2 bg-gray-200 rounded appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

// Render individual slats with 3D perspective based on angle
const renderSlats = (width: number, height: number, slatCount: number, slatHeight: number, angle: number, slatColor: string) => {
  const slats = [];
  const startY = 60;
  const slatSpacing = (height * 0.7) / slatCount;
  
  for (let i = 0; i < slatCount; i++) {
    const y = startY + (i * slatSpacing);
    const perspective = Math.sin(angle * Math.PI / 180);
    const visibleHeight = slatHeight * perspective;
    const shadowOffset = (1 - perspective) * 2;
    
    // Shadow behind slat
    slats.push(
      <ellipse 
        key={`shadow-${i}`}
        cx={50 + (width * 0.8) / 2} 
        cy={y + shadowOffset} 
        rx={(width * 0.8) / 2} 
        ry={visibleHeight / 2 + 1} 
        fill="rgba(0,0,0,0.1)"
      />
    );
    
    // Main slat
    slats.push(
      <ellipse 
        key={`slat-${i}`}
        cx={50 + (width * 0.8) / 2} 
        cy={y} 
        rx={(width * 0.8) / 2} 
        ry={visibleHeight / 2} 
        fill={`url(#slatGradient)`}
        stroke="rgba(0,0,0,0.2)"
        strokeWidth="0.5"
      />
    );
    
    // Highlight for 3D effect
    if (perspective > 0.3) {
      slats.push(
        <ellipse 
          key={`highlight-${i}`}
          cx={50 + (width * 0.8) / 2} 
          cy={y - 1} 
          rx={(width * 0.8) / 2 - 2} 
          ry={visibleHeight / 4} 
          fill="rgba(255,255,255,0.3)"
        />
      );
    }
  }
  
  return <g>{slats}</g>;
};

const getSlatHeight = (size: '25mm' | '35mm' | '50mm'): number => {
  switch (size) {
    case '25mm': return 8;
    case '35mm': return 12;
    case '50mm': return 16;
    default: return 10;
  }
};

const lightenColor = (color: string, percent: number): string => {
  // Simple color lightening - in real app you'd use a proper color manipulation library
  return color.replace(/[0-9A-F]/gi, (char) => {
    const num = parseInt(char, 16);
    const lightened = Math.min(15, num + Math.floor(percent * 15 / 100));
    return lightened.toString(16).toUpperCase();
  });
};

const darkenColor = (color: string, percent: number): string => {
  // Simple color darkening
  return color.replace(/[0-9A-F]/gi, (char) => {
    const num = parseInt(char, 16);
    const darkened = Math.max(0, num - Math.floor(percent * 15 / 100));
    return darkened.toString(16).toUpperCase();
  });
};
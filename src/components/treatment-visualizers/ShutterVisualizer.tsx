import { useMemo, useState } from "react";

interface ShutterVisualizerProps {
  windowType: string;
  measurements: Record<string, any>;
  template?: any;
  material?: any;
  className?: string;
  panelConfig?: 'single' | 'bifold' | 'trifold' | 'bypass';
  louverSize?: '47mm' | '63mm' | '89mm' | '114mm';
  frameStyle?: 'L-frame' | 'Z-frame' | 'deco';
  mounted?: 'inside' | 'outside';
  hideDetails?: boolean;
}

export const ShutterVisualizer = ({
  windowType,
  measurements,
  template,
  material,
  className = "",
  panelConfig = 'bifold',
  louverSize = '63mm',
  frameStyle = 'L-frame',
  mounted = 'inside',
  hideDetails = false
}: ShutterVisualizerProps) => {
  
  const [louverAngle, setLouverAngle] = useState(45);
  const [openPosition, setOpenPosition] = useState(0); // 0 = closed, 100 = fully open
  
  const renderShutter = useMemo(() => {
    const width = measurements?.rail_width || measurements?.window_width || 200;
    const height = measurements?.drop || measurements?.window_height || 150;
    const frameColor = material?.color || "#D2B48C";
    const louverHeight = getLouverHeight(louverSize);
    const louverCount = Math.floor((height * 0.7) / (louverHeight + 3));
    
    return (
      <svg viewBox="0 0 400 300" className="w-full h-full">
        <defs>
          {/* Wood grain pattern */}
          <pattern id="woodGrain" patternUnits="userSpaceOnUse" width="4" height="40">
            <rect width="4" height="40" fill={frameColor} />
            <line x1="0" y1="10" x2="4" y2="10" stroke={darkenColor(frameColor, 10)} strokeWidth="0.5" />
            <line x1="0" y1="25" x2="4" y2="25" stroke={darkenColor(frameColor, 15)} strokeWidth="0.3" />
          </pattern>
          
          {/* Frame shadow */}
          <linearGradient id="frameShadow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={lightenColor(frameColor, 20)} />
            <stop offset="50%" stopColor={frameColor} />
            <stop offset="100%" stopColor={darkenColor(frameColor, 15)} />
          </linearGradient>
          
          {/* Louver gradient */}
          <linearGradient id="louverGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={lightenColor(frameColor, 15)} />
            <stop offset="50%" stopColor={frameColor} />
            <stop offset="100%" stopColor={darkenColor(frameColor, 10)} />
          </linearGradient>
        </defs>
        
        {/* Window opening */}
        <rect x="45" y="45" width={width * 0.85} height={height * 0.85} fill="#F0F8FF" stroke="#8B7355" strokeWidth="8" rx="4" />
        
        {/* Render different panel configurations */}
        {panelConfig === 'single' && renderSinglePanel(width, height, louverCount, louverHeight, louverAngle, openPosition)}
        {panelConfig === 'bifold' && renderBifoldPanels(width, height, louverCount, louverHeight, louverAngle, openPosition)}
        {panelConfig === 'trifold' && renderTrifoldPanels(width, height, louverCount, louverHeight, louverAngle, openPosition)}
        {panelConfig === 'bypass' && renderBypassPanels(width, height, louverCount, louverHeight, louverAngle, openPosition)}
        
        {/* Tilt control rod */}
        <rect 
          x={50 + (width * 0.2)} 
          y="55" 
          width="3" 
          height={height * 0.6} 
          fill="#A0522D" 
          rx="1" 
        />
        
        {/* Panel control */}
        {!hideDetails && (
          <>
            <g transform="translate(320, 120)">
              <rect x="-30" y="-40" width="60" height="80" fill="rgba(255,255,255,0.9)" stroke="#CCC" strokeWidth="1" rx="4" />
              <text x="-25" y="-25" fontSize="8" fill="#666">Controls</text>
              
              {/* Louver angle control */}
              <text x="-20" y="-10" fontSize="7" fill="#666">Louver</text>
              <circle cx="0" cy="0" r="12" fill="rgba(240,240,240,0.9)" stroke="#AAA" strokeWidth="1" />
              <line 
                x1="0" y1="0" 
                x2={10 * Math.cos((louverAngle - 90) * Math.PI / 180)} 
                y2={10 * Math.sin((louverAngle - 90) * Math.PI / 180)} 
                stroke="#333" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
              
              {/* Panel open control */}
              <text x="-15" y="25" fontSize="7" fill="#666">Open</text>
              <rect x="-15" y="30" width="30" height="6" fill="#DDD" stroke="#AAA" strokeWidth="1" rx="3" />
              <rect x={-15 + (openPosition * 24 / 100)} y="31" width="6" height="4" fill="#666" rx="2" />
            </g>
            
            {/* Material & config info */}
            <rect x="60" y="250" width="180" height="35" fill="rgba(255,255,255,0.9)" rx="4" />
            <text x="70" y="265" fontSize="9" fill="#333">
              {material?.name || 'Plantation Shutters'}
            </text>
            <text x="70" y="275" fontSize="8" fill="#666">
              {panelConfig.charAt(0).toUpperCase() + panelConfig.slice(1)} • {louverSize} louvers
            </text>
          </>
        )}
      </svg>
    );
  }, [windowType, measurements, material, panelConfig, louverSize, frameStyle, mounted, louverAngle, openPosition]);

  return (
    <div className={`relative bg-gradient-to-b from-amber-50 to-amber-100 rounded-lg border-2 border-amber-200 ${className}`}>
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        {renderShutter}
        
        {/* Interactive controls */}
        {!hideDetails && (
          <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded space-y-2">
            <div>
              <label className="text-xs text-gray-600 block mb-1">Louver Angle</label>
              <input 
                type="range" 
                min="0" 
                max="90" 
                value={louverAngle}
                onChange={(e) => setLouverAngle(Number(e.target.value))}
                className="w-24 h-2 bg-gray-200 rounded appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Panel Opening</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={openPosition}
                onChange={(e) => setOpenPosition(Number(e.target.value))}
                className="w-24 h-2 bg-gray-200 rounded appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Single panel shutter
const renderSinglePanel = (width: number, height: number, louverCount: number, louverHeight: number, louverAngle: number, openPosition: number) => {
  const panelWidth = width * 0.8;
  const rotateAngle = (openPosition / 100) * 120; // Max 120 degree opening
  
  return (
    <g transform={`rotate(${rotateAngle}, 50, ${50 + height * 0.42})`}>
      {/* Panel frame */}
      <rect 
        x="50" y="50" 
        width={panelWidth} height={height * 0.8} 
        fill="url(#frameShadow)" 
        stroke={darkenColor("#D2B48C", 20)} 
        strokeWidth="2" 
        rx="4" 
      />
      
      {/* Louvers */}
      {renderLouvers(50, 50, panelWidth, height * 0.8, louverCount, louverHeight, louverAngle)}
      
      {/* Panel stiles */}
      <rect x="50" y="50" width="8" height={height * 0.8} fill="url(#woodGrain)" />
      <rect x={50 + panelWidth - 8} y="50" width="8" height={height * 0.8} fill="url(#woodGrain)" />
    </g>
  );
};

// Bifold panels (most common)
const renderBifoldPanels = (width: number, height: number, louverCount: number, louverHeight: number, louverAngle: number, openPosition: number) => {
  const panelWidth = (width * 0.8) / 2;
  const openOffset = (openPosition / 100) * panelWidth * 0.8;
  
  return (
    <g>
      {/* Left panel */}
      <g transform={`translate(${-openOffset}, 0)`}>
        <rect 
          x="50" y="50" 
          width={panelWidth} height={height * 0.8} 
          fill="url(#frameShadow)" 
          stroke={darkenColor("#D2B48C", 20)} 
          strokeWidth="2" 
          rx="4" 
        />
        {renderLouvers(50, 50, panelWidth, height * 0.8, louverCount, louverHeight, louverAngle)}
        <rect x="50" y="50" width="6" height={height * 0.8} fill="url(#woodGrain)" />
        <rect x={50 + panelWidth - 6} y="50" width="6" height={height * 0.8} fill="url(#woodGrain)" />
      </g>
      
      {/* Right panel */}
      <g transform={`translate(${openOffset}, 0)`}>
        <rect 
          x={50 + panelWidth} y="50" 
          width={panelWidth} height={height * 0.8} 
          fill="url(#frameShadow)" 
          stroke={darkenColor("#D2B48C", 20)} 
          strokeWidth="2" 
          rx="4" 
        />
        {renderLouvers(50 + panelWidth, 50, panelWidth, height * 0.8, louverCount, louverHeight, louverAngle)}
        <rect x={50 + panelWidth} y="50" width="6" height={height * 0.8} fill="url(#woodGrain)" />
        <rect x={50 + panelWidth + panelWidth - 6} y="50" width="6" height={height * 0.8} fill="url(#woodGrain)" />
      </g>
      
      {/* Center meeting rail */}
      <rect x={50 + panelWidth - 2} y="50" width="4" height={height * 0.8} fill={darkenColor("#D2B48C", 15)} />
    </g>
  );
};

// Trifold panels
const renderTrifoldPanels = (width: number, height: number, louverCount: number, louverHeight: number, louverAngle: number, openPosition: number) => {
  const panelWidth = (width * 0.8) / 3;
  const openOffset = (openPosition / 100) * panelWidth * 0.6;
  
  return (
    <g>
      {/* Left panel */}
      <g transform={`translate(${-openOffset}, 0)`}>
        <rect 
          x="50" y="50" 
          width={panelWidth} height={height * 0.8} 
          fill="url(#frameShadow)" 
          stroke={darkenColor("#D2B48C", 20)} 
          strokeWidth="1" 
          rx="4" 
        />
        {renderLouvers(50, 50, panelWidth, height * 0.8, louverCount, louverHeight, louverAngle)}
      </g>
      
      {/* Center panel */}
      <rect 
        x={50 + panelWidth} y="50" 
        width={panelWidth} height={height * 0.8} 
        fill="url(#frameShadow)" 
        stroke={darkenColor("#D2B48C", 20)} 
        strokeWidth="1" 
        rx="4" 
      />
      {renderLouvers(50 + panelWidth, 50, panelWidth, height * 0.8, louverCount, louverHeight, louverAngle)}
      
      {/* Right panel */}
      <g transform={`translate(${openOffset}, 0)`}>
        <rect 
          x={50 + panelWidth * 2} y="50" 
          width={panelWidth} height={height * 0.8} 
          fill="url(#frameShadow)" 
          stroke={darkenColor("#D2B48C", 20)} 
          strokeWidth="1" 
          rx="4" 
        />
        {renderLouvers(50 + panelWidth * 2, 50, panelWidth, height * 0.8, louverCount, louverHeight, louverAngle)}
      </g>
    </g>
  );
};

// Bypass panels (sliding)
const renderBypassPanels = (width: number, height: number, louverCount: number, louverHeight: number, louverAngle: number, openPosition: number) => {
  const panelWidth = (width * 0.8) / 2;
  const slideOffset = (openPosition / 100) * panelWidth;
  
  return (
    <g>
      {/* Track */}
      <rect x="45" y="45" width={width * 0.85} height="4" fill="#999" rx="2" />
      
      {/* Back panel */}
      <rect 
        x="50" y="50" 
        width={panelWidth} height={height * 0.8} 
        fill="url(#frameShadow)" 
        stroke={darkenColor("#D2B48C", 20)} 
        strokeWidth="2" 
        rx="4" 
        opacity="0.8"
      />
      {renderLouvers(50, 50, panelWidth, height * 0.8, louverCount, louverHeight, louverAngle, 0.8)}
      
      {/* Front panel (sliding) */}
      <g transform={`translate(${slideOffset}, 0)`}>
        <rect 
          x={50 + panelWidth * 0.5} y="50" 
          width={panelWidth} height={height * 0.8} 
          fill="url(#frameShadow)" 
          stroke={darkenColor("#D2B48C", 20)} 
          strokeWidth="2" 
          rx="4" 
        />
        {renderLouvers(50 + panelWidth * 0.5, 50, panelWidth, height * 0.8, louverCount, louverHeight, louverAngle)}
      </g>
    </g>
  );
};

// Render louvers within a panel
const renderLouvers = (x: number, y: number, panelWidth: number, panelHeight: number, louverCount: number, louverHeight: number, angle: number, opacity: number = 1) => {
  const louvers = [];
  const louverSpacing = (panelHeight - 40) / louverCount; // Leave space for top/bottom rails
  const perspective = Math.sin(angle * Math.PI / 180);
  
  for (let i = 0; i < louverCount; i++) {
    const louverY = y + 20 + (i * louverSpacing);
    const visibleHeight = louverHeight * perspective;
    
    louvers.push(
      <ellipse 
        key={`louver-${i}`}
        cx={x + panelWidth / 2} 
        cy={louverY} 
        rx={(panelWidth - 20) / 2} 
        ry={visibleHeight / 2} 
        fill="url(#louverGradient)"
        stroke="rgba(0,0,0,0.2)"
        strokeWidth="0.5"
        opacity={opacity}
      />
    );
    
    // Highlight for 3D effect
    if (perspective > 0.3) {
      louvers.push(
        <ellipse 
          key={`louver-highlight-${i}`}
          cx={x + panelWidth / 2} 
          cy={louverY - 1} 
          rx={(panelWidth - 24) / 2} 
          ry={visibleHeight / 4} 
          fill="rgba(255,255,255,0.4)"
          opacity={opacity}
        />
      );
    }
  }
  
  return <g>{louvers}</g>;
};

const getLouverHeight = (size: '47mm' | '63mm' | '89mm' | '114mm'): number => {
  switch (size) {
    case '47mm': return 12;
    case '63mm': return 16;
    case '89mm': return 22;
    case '114mm': return 28;
    default: return 16;
  }
};

const lightenColor = (color: string, percent: number): string => {
  return color.replace(/[0-9A-F]/gi, (char) => {
    const num = parseInt(char, 16);
    const lightened = Math.min(15, num + Math.floor(percent * 15 / 100));
    return lightened.toString(16).toUpperCase();
  });
};

const darkenColor = (color: string, percent: number): string => {
  return color.replace(/[0-9A-F]/gi, (char) => {
    const num = parseInt(char, 16);
    const darkened = Math.max(0, num - Math.floor(percent * 15 / 100));
    return darkened.toString(16).toUpperCase();
  });
};
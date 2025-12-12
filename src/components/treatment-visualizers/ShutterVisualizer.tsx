import React, { useMemo, useState } from "react";
import { useMeasurementUnits } from '@/hooks/useMeasurementUnits';

// Helper functions for wood grain effects
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
  mounted = 'inside'
}: ShutterVisualizerProps) => {
  const { units } = useMeasurementUnits();
  const [louverAngle, setLouverAngle] = useState(45);
  const [openPosition, setOpenPosition] = useState(0);

  const hasValue = (value: any) => value && value !== "" && value !== "0";

  // Helper to display measurement with correct unit
  const displayValue = (value: any) => {
    const unitLabels: Record<string, string> = {
      'mm': 'mm',
      'cm': 'cm',
      'm': 'm',
      'inches': '"',
      'feet': "'"
    };
    const unitSymbol = unitLabels[units.length] || units.length;
    return `${value}${unitSymbol}`;
  };

  // Get shutter color from material or default
  const getShutterColor = (): string => {
    if (material?.color) {
      if (material.color.startsWith('#')) return material.color;
      const colorMap: Record<string, string> = {
        'white': '#FFFFFF',
        'cream': '#FFFDD0',
        'ivory': '#FFFFF0',
        'beige': '#F5F5DC',
        'natural': '#E8D4A8',
        'walnut': '#5D432C',
        'oak': '#806517',
        'mahogany': '#C04000',
        'cherry': '#DE3163',
        'brown': '#8B4513',
        'black': '#1a1a1a',
        'grey': '#808080',
        'gray': '#808080',
      };
      return colorMap[material.color.toLowerCase()] || '#D2B48C';
    }
    return '#D2B48C'; // Default tan/wood color
  };

  const shutterColor = getShutterColor();

  const getLouverHeight = (size: string): number => {
    switch (size) {
      case '47mm': return 12;
      case '63mm': return 16;
      case '89mm': return 22;
      case '114mm': return 28;
      default: return 16;
    }
  };

  const renderLouvers = (panelWidth: number, panelHeight: number, angle: number) => {
    const louverHeight = getLouverHeight(louverSize);
    const count = Math.floor((panelHeight - 40) / (louverHeight + 4));
    const perspective = Math.sin(angle * Math.PI / 180);

    return Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="absolute left-2 right-2 transition-all duration-200"
        style={{
          height: `${louverHeight * perspective}px`,
          top: `${20 + i * (louverHeight + 4)}px`,
          background: `linear-gradient(180deg, ${lightenColor(shutterColor, 15)} 0%, ${shutterColor} 50%, ${darkenColor(shutterColor, 10)} 100%)`,
          borderRadius: '2px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
          transform: `perspective(200px) rotateX(${90 - angle}deg)`,
          transformOrigin: 'center center',
        }}
      />
    ));
  };

  const renderShutterPanels = () => {
    const isInsideMount = mounted === 'inside';
    const panelWidth = isInsideMount ? 'calc(50% - 16px)' : 'calc(50% - 12px)';
    const leftOffset = isInsideMount ? 'left-16' : 'left-12';
    const rightOffset = isInsideMount ? 'right-16' : 'right-12';
    const topOffset = isInsideMount ? 'top-24' : 'top-20';
    const openOffset = (openPosition / 100) * 40; // Max 40px opening

    if (panelConfig === 'single') {
      return (
        <div 
          className={`absolute ${topOffset} ${leftOffset} ${rightOffset} bottom-16 rounded-sm border-2 overflow-hidden`}
          style={{ 
            borderColor: darkenColor(shutterColor, 20),
            backgroundColor: shutterColor,
            transform: `rotateY(${openOffset}deg)`,
            transformOrigin: 'left center',
          }}
        >
          {renderLouvers(200, 200, louverAngle)}
          {/* Stiles (vertical frame pieces) */}
          <div className="absolute left-0 top-0 bottom-0 w-2" style={{ backgroundColor: darkenColor(shutterColor, 5) }} />
          <div className="absolute right-0 top-0 bottom-0 w-2" style={{ backgroundColor: darkenColor(shutterColor, 5) }} />
        </div>
      );
    }

    if (panelConfig === 'bifold') {
      return (
        <>
          {/* Left Panel */}
          <div 
            className={`absolute ${topOffset} bottom-16 rounded-sm border-2 overflow-hidden z-10`}
            style={{ 
              left: isInsideMount ? '64px' : '48px',
              width: panelWidth,
              borderColor: darkenColor(shutterColor, 20),
              backgroundColor: shutterColor,
              transform: `translateX(${-openOffset}px)`,
            }}
          >
            {renderLouvers(150, 200, louverAngle)}
            <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: darkenColor(shutterColor, 5) }} />
            <div className="absolute right-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: darkenColor(shutterColor, 5) }} />
          </div>
          
          {/* Right Panel */}
          <div 
            className={`absolute ${topOffset} bottom-16 rounded-sm border-2 overflow-hidden z-10`}
            style={{ 
              right: isInsideMount ? '64px' : '48px',
              width: panelWidth,
              borderColor: darkenColor(shutterColor, 20),
              backgroundColor: shutterColor,
              transform: `translateX(${openOffset}px)`,
            }}
          >
            {renderLouvers(150, 200, louverAngle)}
            <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: darkenColor(shutterColor, 5) }} />
            <div className="absolute right-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: darkenColor(shutterColor, 5) }} />
          </div>

          {/* Center Meeting Rail */}
          <div 
            className={`absolute ${topOffset} bottom-16 w-1 left-1/2 -translate-x-1/2 z-20`}
            style={{ backgroundColor: darkenColor(shutterColor, 15) }}
          />
        </>
      );
    }

    if (panelConfig === 'trifold') {
      const thirdWidth = 'calc(33.33% - 16px)';
      return (
        <>
          {/* Left Panel */}
          <div 
            className={`absolute ${topOffset} bottom-16 rounded-sm border-2 overflow-hidden`}
            style={{ 
              left: isInsideMount ? '64px' : '48px',
              width: thirdWidth,
              borderColor: darkenColor(shutterColor, 20),
              backgroundColor: shutterColor,
              transform: `translateX(${-openOffset * 0.6}px)`,
            }}
          >
            {renderLouvers(100, 200, louverAngle)}
          </div>
          
          {/* Center Panel */}
          <div 
            className={`absolute ${topOffset} bottom-16 rounded-sm border-2 overflow-hidden left-1/2 -translate-x-1/2`}
            style={{ 
              width: thirdWidth,
              borderColor: darkenColor(shutterColor, 20),
              backgroundColor: shutterColor,
            }}
          >
            {renderLouvers(100, 200, louverAngle)}
          </div>
          
          {/* Right Panel */}
          <div 
            className={`absolute ${topOffset} bottom-16 rounded-sm border-2 overflow-hidden`}
            style={{ 
              right: isInsideMount ? '64px' : '48px',
              width: thirdWidth,
              borderColor: darkenColor(shutterColor, 20),
              backgroundColor: shutterColor,
              transform: `translateX(${openOffset * 0.6}px)`,
            }}
          >
            {renderLouvers(100, 200, louverAngle)}
          </div>
        </>
      );
    }

    if (panelConfig === 'bypass') {
      return (
        <>
          {/* Track at top */}
          <div 
            className={`absolute ${topOffset} ${leftOffset} ${rightOffset} h-2 bg-muted-foreground/60 rounded-sm z-30`}
          />
          
          {/* Back Panel (stationary) */}
          <div 
            className={`absolute bottom-16 rounded-sm border-2 overflow-hidden opacity-80`}
            style={{ 
              top: isInsideMount ? 'calc(6rem + 8px)' : 'calc(5rem + 8px)',
              left: isInsideMount ? '64px' : '48px',
              width: panelWidth,
              borderColor: darkenColor(shutterColor, 20),
              backgroundColor: shutterColor,
            }}
          >
            {renderLouvers(150, 200, louverAngle)}
          </div>
          
          {/* Front Panel (sliding) */}
          <div 
            className={`absolute bottom-16 rounded-sm border-2 overflow-hidden z-10`}
            style={{ 
              top: isInsideMount ? 'calc(6rem + 8px)' : 'calc(5rem + 8px)',
              left: `calc(30% + ${openOffset}px)`,
              width: panelWidth,
              borderColor: darkenColor(shutterColor, 20),
              backgroundColor: shutterColor,
            }}
          >
            {renderLouvers(150, 200, louverAngle)}
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className={`relative container-level-2 rounded-lg p-8 min-h-[400px] overflow-visible ${className}`}>
      {/* Width Measurement Indicator (Blue) */}
      {hasValue(measurements.rail_width) && (
        <div className="absolute left-12 right-12 flex items-center z-30" style={{ top: '12px' }}>
          <div className="w-0 h-0 border-t-[4px] border-b-[4px] border-r-[6px] border-transparent border-r-blue-600"></div>
          <div className="flex-1 border-t border-blue-600 relative">
            <span className="absolute left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px] font-semibold shadow-md whitespace-nowrap" style={{ top: '-18px' }}>
              W: {displayValue(measurements.rail_width)}
            </span>
          </div>
          <div className="w-0 h-0 border-t-[4px] border-b-[4px] border-l-[6px] border-transparent border-l-blue-600"></div>
        </div>
      )}

      {/* Height Measurement Indicator (Green) */}
      {hasValue(measurements.drop) && (
        <div className="absolute top-20 bottom-16 flex flex-col items-center z-30" style={{ right: '12px' }}>
          <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-transparent border-b-green-600"></div>
          <div className="flex-1 border-r border-green-600 relative">
            <span className="absolute top-1/2 transform -translate-y-1/2 bg-green-600 text-white px-1.5 py-0.5 rounded text-[10px] font-semibold shadow-md whitespace-nowrap" style={{ right: '-42px' }}>
              H: {displayValue(measurements.drop)}
            </span>
          </div>
          <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-transparent border-t-green-600"></div>
        </div>
      )}

      {/* Window Frame */}
      <div className="absolute top-24 left-16 right-16 bottom-16">
        <div className="w-full h-full border-4 border-muted-foreground bg-background relative">
          {/* Shutter Frame (outer) */}
          <div 
            className="absolute inset-1 border-4 rounded-sm"
            style={{ borderColor: darkenColor(shutterColor, 10), backgroundColor: 'transparent' }}
          />
        </div>
      </div>

      {/* Shutter Panels */}
      {renderShutterPanels()}

      {/* Tilt Rod */}
      <div 
        className="absolute w-1 bg-amber-800 rounded-full z-20"
        style={{
          top: mounted === 'inside' ? '6.5rem' : '5.5rem',
          left: mounted === 'inside' ? '80px' : '64px',
          height: 'calc(100% - 10rem)',
        }}
      />

      {/* Floor Line */}
      <div className="absolute bottom-4 left-8 right-8 border-t-4 border-muted-foreground">
        <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-muted-foreground">
          Floor Line
        </span>
      </div>

      {/* Interactive Controls */}
      <div className="absolute bottom-12 left-4 bg-background/95 backdrop-blur-sm rounded-lg border border-border p-3 space-y-2 shadow-md z-40">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Louver Angle</label>
          <input 
            type="range" 
            min="0" 
            max="90" 
            value={louverAngle}
            onChange={(e) => setLouverAngle(Number(e.target.value))}
            className="w-20 accent-primary cursor-pointer"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Panel Opening</label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={openPosition}
            onChange={(e) => setOpenPosition(Number(e.target.value))}
            className="w-20 accent-primary cursor-pointer"
          />
        </div>
      </div>

      {/* Material/Config Info Badge */}
      <div className="absolute bottom-12 right-4 bg-background/95 backdrop-blur-sm rounded-lg border border-border px-3 py-2 shadow-md z-40">
        <div className="text-xs font-medium text-foreground">
          {material?.name || 'Plantation Shutters'}
        </div>
        <div className="text-[10px] text-muted-foreground">
          {panelConfig.charAt(0).toUpperCase() + panelConfig.slice(1)} • {louverSize}
        </div>
      </div>
    </div>
  );
};

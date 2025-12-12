import React from "react";
import { useMeasurementUnits } from '@/hooks/useMeasurementUnits';

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
  selectedColor?: string;
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
  selectedColor
}: ShutterVisualizerProps) => {
  const { units } = useMeasurementUnits();

  const hasValue = (value: any) => value && value !== "" && value !== "0";

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

  // Get color value from selectedColor or material - same pattern as DynamicBlindVisual
  const getColorValue = (colorName?: string): string => {
    if (!colorName) return 'hsl(var(--muted-foreground))';
    if (colorName.startsWith('#') || colorName.startsWith('rgb') || colorName.startsWith('hsl')) {
      return colorName;
    }
    const colorMap: Record<string, string> = {
      'white': '#FFFFFF',
      'black': '#1a1a1a',
      'grey': '#808080',
      'gray': '#808080',
      'silver': '#C0C0C0',
      'cream': '#FFFDD0',
      'ivory': '#FFFFF0',
      'beige': '#F5F5DC',
      'brown': '#8B4513',
      'tan': '#D2B48C',
      'natural': '#E8D4A8',
      'walnut': '#5D432C',
      'oak': '#806517',
      'mahogany': '#C04000',
      'cherry': '#DE3163',
      'gold': '#D4AF37',
      'bronze': '#CD7F32',
      'charcoal': '#36454F',
    };
    return colorMap[colorName.toLowerCase()] || colorName;
  };

  const shutterColor = getColorValue(selectedColor || material?.color);
  const hasCustomColor = selectedColor || material?.color;

  const isInsideMount = mounted === 'inside';
  const blindWidth = isInsideMount ? 'left-16 right-16' : 'left-12 right-12';
  const blindTop = isInsideMount ? 'top-24' : 'top-20';

  const getLouverCount = (size: string): number => {
    switch (size) {
      case '47mm': return 18;
      case '63mm': return 14;
      case '89mm': return 10;
      case '114mm': return 8;
      default: return 14;
    }
  };

  const getLouverHeight = (size: string): string => {
    switch (size) {
      case '47mm': return 'h-1.5';
      case '63mm': return 'h-2';
      case '89mm': return 'h-2.5';
      case '114mm': return 'h-3';
      default: return 'h-2';
    }
  };

  const louverCount = getLouverCount(louverSize);
  const louverHeight = getLouverHeight(louverSize);

  const renderLouvers = () => {
    return Array.from({ length: louverCount }).map((_, i) => (
      <div
        key={i}
        className={`absolute left-1.5 right-1.5 ${louverHeight} transition-all duration-300`}
        style={{ 
          top: `${(i / louverCount) * 100}%`,
          background: hasCustomColor 
            ? `linear-gradient(180deg, ${shutterColor} 0%, ${shutterColor}CC 40%, ${shutterColor}DD 60%, ${shutterColor}AA 100%)`
            : `linear-gradient(180deg, hsl(var(--muted-foreground) / 0.7) 0%, hsl(var(--muted-foreground) / 0.5) 40%, hsl(var(--muted-foreground) / 0.6) 60%, hsl(var(--muted-foreground) / 0.45) 100%)`,
          boxShadow: '0 1px 2px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.15)',
          borderRadius: '1px',
          transform: 'perspective(500px) rotateX(45deg)',
          transformOrigin: 'center center',
          borderTop: hasCustomColor ? `1px solid ${shutterColor}33` : '1px solid hsl(var(--muted-foreground) / 0.3)',
          borderBottom: hasCustomColor ? `1px solid ${shutterColor}22` : '1px solid hsl(var(--muted-foreground) / 0.2)',
        }}
      >
        <div 
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{ opacity: 0.3 }}
        />
      </div>
    ));
  };

  const renderShutterPanel = (position: 'left' | 'right' | 'center' | 'full', widthStyle: string, leftPos?: string, rightPos?: string) => (
    <div 
      className="absolute rounded-sm overflow-hidden shadow-md"
      style={{ 
        top: `calc(${blindTop.includes('24') ? '6rem' : '5rem'} + 1rem)`,
        bottom: '4rem',
        width: widthStyle,
        left: leftPos,
        right: rightPos,
        backgroundColor: hasCustomColor ? `${shutterColor}30` : 'hsl(var(--muted-foreground) / 0.15)',
        borderLeft: `3px solid ${hasCustomColor ? `${shutterColor}80` : 'hsl(var(--muted-foreground) / 0.5)'}`,
        borderRight: `3px solid ${hasCustomColor ? `${shutterColor}80` : 'hsl(var(--muted-foreground) / 0.5)'}`,
        borderTop: `3px solid ${hasCustomColor ? `${shutterColor}60` : 'hsl(var(--muted-foreground) / 0.4)'}`,
        borderBottom: `3px solid ${hasCustomColor ? `${shutterColor}90` : 'hsl(var(--muted-foreground) / 0.6)'}`,
      }}
    >
      {renderLouvers()}
    </div>
  );

  const renderShutterPanels = () => {
    const leftOffset = isInsideMount ? '64px' : '48px';
    const rightOffset = isInsideMount ? '64px' : '48px';

    if (panelConfig === 'single') {
      return renderShutterPanel('full', `calc(100% - ${isInsideMount ? '128px' : '96px'})`, leftOffset, undefined);
    }

    if (panelConfig === 'bifold') {
      return (
        <>
          {renderShutterPanel('left', `calc(50% - ${isInsideMount ? '66px' : '50px'})`, leftOffset, undefined)}
          {renderShutterPanel('right', `calc(50% - ${isInsideMount ? '66px' : '50px'})`, undefined, rightOffset)}
          {/* Center divider rail */}
          <div 
            className="absolute w-1 left-1/2 -translate-x-1/2 z-20 rounded-sm"
            style={{ 
              top: `calc(${blindTop.includes('24') ? '6rem' : '5rem'} + 1rem)`,
              bottom: '4rem',
              backgroundColor: hasCustomColor ? `${shutterColor}90` : 'hsl(var(--muted-foreground) / 0.6)',
            }}
          />
        </>
      );
    }

    if (panelConfig === 'trifold') {
      const thirdWidth = `calc(33.33% - ${isInsideMount ? '48px' : '36px'})`;
      return (
        <>
          {renderShutterPanel('left', thirdWidth, leftOffset, undefined)}
          <div 
            className="absolute rounded-sm overflow-hidden shadow-md left-1/2 -translate-x-1/2"
            style={{ 
              top: `calc(${blindTop.includes('24') ? '6rem' : '5rem'} + 1rem)`,
              bottom: '4rem',
              width: thirdWidth,
              backgroundColor: hasCustomColor ? `${shutterColor}30` : 'hsl(var(--muted-foreground) / 0.15)',
              borderLeft: `3px solid ${hasCustomColor ? `${shutterColor}80` : 'hsl(var(--muted-foreground) / 0.5)'}`,
              borderRight: `3px solid ${hasCustomColor ? `${shutterColor}80` : 'hsl(var(--muted-foreground) / 0.5)'}`,
              borderTop: `3px solid ${hasCustomColor ? `${shutterColor}60` : 'hsl(var(--muted-foreground) / 0.4)'}`,
              borderBottom: `3px solid ${hasCustomColor ? `${shutterColor}90` : 'hsl(var(--muted-foreground) / 0.6)'}`,
            }}
          >
            {renderLouvers()}
          </div>
          {renderShutterPanel('right', thirdWidth, undefined, rightOffset)}
        </>
      );
    }

    if (panelConfig === 'bypass') {
      const halfWidth = `calc(50% - ${isInsideMount ? '40px' : '32px'})`;
      return (
        <>
          {/* Back panel */}
          <div 
            className="absolute rounded-sm overflow-hidden shadow-md opacity-70"
            style={{ 
              top: `calc(${blindTop.includes('24') ? '6rem' : '5rem'} + 1.5rem)`,
              bottom: '4rem',
              width: halfWidth,
              left: leftOffset,
              backgroundColor: hasCustomColor ? `${shutterColor}25` : 'hsl(var(--muted-foreground) / 0.12)',
              borderLeft: `3px solid ${hasCustomColor ? `${shutterColor}70` : 'hsl(var(--muted-foreground) / 0.45)'}`,
              borderRight: `3px solid ${hasCustomColor ? `${shutterColor}70` : 'hsl(var(--muted-foreground) / 0.45)'}`,
              borderTop: `3px solid ${hasCustomColor ? `${shutterColor}50` : 'hsl(var(--muted-foreground) / 0.35)'}`,
              borderBottom: `3px solid ${hasCustomColor ? `${shutterColor}80` : 'hsl(var(--muted-foreground) / 0.55)'}`,
            }}
          >
            {renderLouvers()}
          </div>
          {/* Front sliding panel */}
          <div 
            className="absolute rounded-sm overflow-hidden shadow-lg z-10"
            style={{ 
              top: `calc(${blindTop.includes('24') ? '6rem' : '5rem'} + 1.5rem)`,
              bottom: '4rem',
              width: halfWidth,
              left: 'calc(30% + 16px)',
              backgroundColor: hasCustomColor ? `${shutterColor}35` : 'hsl(var(--muted-foreground) / 0.18)',
              borderLeft: `3px solid ${hasCustomColor ? `${shutterColor}80` : 'hsl(var(--muted-foreground) / 0.5)'}`,
              borderRight: `3px solid ${hasCustomColor ? `${shutterColor}80` : 'hsl(var(--muted-foreground) / 0.5)'}`,
              borderTop: `3px solid ${hasCustomColor ? `${shutterColor}60` : 'hsl(var(--muted-foreground) / 0.4)'}`,
              borderBottom: `3px solid ${hasCustomColor ? `${shutterColor}90` : 'hsl(var(--muted-foreground) / 0.6)'}`,
            }}
          >
            {renderLouvers()}
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

      {/* Headrail with mounting brackets - same as venetian blinds */}
      <div className={`absolute ${blindTop} ${blindWidth} h-4 bg-gradient-to-b from-muted-foreground via-muted to-muted-foreground rounded-sm shadow-lg z-20`}>
        {/* Mounting brackets */}
        <div className="absolute -left-2 -top-0.5 w-4 h-5 bg-foreground/90 rounded-sm shadow-md">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-3 bg-background/20"></div>
        </div>
        <div className="absolute -right-2 -top-0.5 w-4 h-5 bg-foreground/90 rounded-sm shadow-md">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-3 bg-background/20"></div>
        </div>
        
        {/* Center mechanism indicator */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-1 bg-foreground/40 rounded-full"></div>
      </div>

      {/* Window Frame */}
      <div className={`absolute ${blindTop} ${blindWidth} bottom-16`} style={{ marginTop: '1rem' }}>
        <div className="w-full h-full border-4 border-muted-foreground bg-background/50 relative">
          {/* Window pane dividers for visual depth */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5 p-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-sky-100/20 border border-muted-foreground/20"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Shutter Panels */}
      {renderShutterPanels()}

      {/* Bottom rail */}
      <div 
        className={`absolute ${blindWidth} h-2.5 bg-gradient-to-b from-muted-foreground/70 to-muted-foreground/90 rounded-sm shadow-md z-10`}
        style={{ bottom: 'calc(4rem - 2px)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </div>

      {/* Floor Line */}
      <div className="absolute bottom-4 left-8 right-8 border-t-4 border-muted-foreground">
        <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-muted-foreground">
          Floor Line
        </span>
      </div>
    </div>
  );
};

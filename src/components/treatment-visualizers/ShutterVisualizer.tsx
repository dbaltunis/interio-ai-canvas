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
  const frameLeft = isInsideMount ? 'left-16' : 'left-12';
  const frameRight = isInsideMount ? 'right-16' : 'right-12';
  const frameTop = 'top-16';

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
        top: '20px',
        bottom: '8px',
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
    if (panelConfig === 'single') {
      return renderShutterPanel('full', 'calc(100% - 16px)', '8px', undefined);
    }

    if (panelConfig === 'bifold') {
      return (
        <>
          {renderShutterPanel('left', 'calc(50% - 12px)', '8px', undefined)}
          {renderShutterPanel('right', 'calc(50% - 12px)', undefined, '8px')}
          {/* Center divider rail */}
          <div 
            className="absolute w-1 left-1/2 -translate-x-1/2 z-20 rounded-sm"
            style={{ 
              top: '20px',
              bottom: '8px',
              backgroundColor: hasCustomColor ? `${shutterColor}90` : 'hsl(var(--muted-foreground) / 0.6)',
            }}
          />
        </>
      );
    }

    if (panelConfig === 'trifold') {
      const thirdWidth = 'calc(33.33% - 12px)';
      return (
        <>
          {renderShutterPanel('left', thirdWidth, '8px', undefined)}
          <div 
            className="absolute rounded-sm overflow-hidden shadow-md left-1/2 -translate-x-1/2"
            style={{ 
              top: '20px',
              bottom: '8px',
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
          {renderShutterPanel('right', thirdWidth, undefined, '8px')}
        </>
      );
    }

    if (panelConfig === 'bypass') {
      const halfWidth = 'calc(50% - 8px)';
      return (
        <>
          {/* Back panel */}
          <div 
            className="absolute rounded-sm overflow-hidden shadow-md opacity-70"
            style={{ 
              top: '24px',
              bottom: '8px',
              width: halfWidth,
              left: '8px',
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
              top: '24px',
              bottom: '8px',
              width: halfWidth,
              left: 'calc(30% + 8px)',
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
      {hasValue(measurements.rail_width || measurements.width) && (
        <div className="absolute left-12 right-12 flex items-center z-30" style={{ top: '12px' }}>
          <div className="w-0 h-0 border-t-[4px] border-b-[4px] border-r-[6px] border-transparent border-r-blue-600"></div>
          <div className="flex-1 border-t border-blue-600 relative">
            <span className="absolute left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px] font-semibold shadow-md whitespace-nowrap" style={{ top: '-18px' }}>
              W: {displayValue(measurements.rail_width || measurements.width)}
            </span>
          </div>
          <div className="w-0 h-0 border-t-[4px] border-b-[4px] border-l-[6px] border-transparent border-l-blue-600"></div>
        </div>
      )}

      {/* Height Measurement Indicator (Green) */}
      {hasValue(measurements.drop || measurements.height) && (
        <div className="absolute top-12 bottom-8 flex flex-col items-center z-30" style={{ right: '12px' }}>
          <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-transparent border-b-green-600"></div>
          <div className="flex-1 border-r border-green-600 relative">
            <span className="absolute top-1/2 transform -translate-y-1/2 bg-green-600 text-white px-1.5 py-0.5 rounded text-[10px] font-semibold shadow-md whitespace-nowrap" style={{ right: '-42px' }}>
              H: {displayValue(measurements.drop || measurements.height)}
            </span>
          </div>
          <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-transparent border-t-green-600"></div>
        </div>
      )}

      {/* Window Frame with Shutter Frame */}
      <div className={`absolute ${frameTop} ${frameLeft} ${frameRight} bottom-8`}>
        <div className="w-full h-full border-4 border-muted-foreground bg-background relative">
          {/* Window pane dividers for visual depth */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5 p-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-sky-100/20 border border-muted-foreground/20"></div>
            ))}
          </div>
          
          {/* Shutter Panels - render inside the window frame */}
          {renderShutterPanels()}
        </div>
      </div>
    </div>
  );
};

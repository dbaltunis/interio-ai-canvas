import { useMemo } from "react";
import { EnhancedWindowRenderer } from "./EnhancedWindowRenderer";

interface DynamicWindowRendererProps {
  windowType: string;
  measurements: Record<string, any>;
  selectedTreatment?: any;
  className?: string;
  enhanced?: boolean; // Toggle between enhanced and simple rendering
}

export const DynamicWindowRenderer = ({
  windowType,
  measurements,
  selectedTreatment,
  className = "",
  enhanced = true // Default to enhanced rendering
}: DynamicWindowRendererProps) => {
  
  // Use enhanced renderer by default
  if (enhanced) {
    return (
      <EnhancedWindowRenderer
        windowType={windowType}
        measurements={measurements}
        selectedTreatment={selectedTreatment}
        className={className}
        showDepth={true}
        frameColor="#8B7355"
        wallColor="#F5F5F0"
      />
    );
  }
  
  const renderWindow = useMemo(() => {
    switch (windowType) {
      case 'bay':
        return renderBayWindow();
      case 'french_doors':
        return renderFrenchDoors();
      case 'sliding_doors':
        return renderSlidingDoors();
      case 'large_window':
        return renderLargeWindow();
      case 'terrace_doors':
        return renderTerraceDoors();
      case 'corner_window':
        return renderCornerWindow();
      case 'arched_window':
        return renderArchedWindow();
      case 'skylight':
        return renderSkylight();
      default:
        return renderStandardWindow();
    }
  }, [windowType, measurements, selectedTreatment]);

  const renderStandardWindow = () => (
    <div className="relative w-full h-full">
      {/* Window Frame */}
      <div className="absolute inset-4 border-4 border-muted-foreground bg-background/50">
        {/* Window Panes */}
        <div className="grid grid-cols-2 grid-rows-2 h-full gap-1 p-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-sky-100/30 border border-border"></div>
          ))}
        </div>
        {/* Cross bars */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted-foreground transform -translate-y-1/2"></div>
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-muted-foreground transform -translate-x-1/2"></div>
      </div>
    </div>
  );

  const renderBayWindow = () => (
    <div className="relative w-full h-full">
      {/* Left angled window */}
      <div className="absolute left-2 top-4 bottom-4 w-16 border-4 border-muted-foreground bg-background/50 transform -skew-y-12 origin-bottom">
        <div className="grid grid-cols-1 grid-rows-3 h-full gap-1 p-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-sky-100/30 border border-border"></div>
          ))}
        </div>
      </div>
      
      {/* Center window */}
      <div className="absolute left-16 right-16 top-4 bottom-4 border-4 border-muted-foreground bg-background/50">
        <div className="grid grid-cols-2 grid-rows-3 h-full gap-1 p-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-sky-100/30 border border-border"></div>
          ))}
        </div>
      </div>
      
      {/* Right angled window */}
      <div className="absolute right-2 top-4 bottom-4 w-16 border-4 border-muted-foreground bg-background/50 transform skew-y-12 origin-bottom">
        <div className="grid grid-cols-1 grid-rows-3 h-full gap-1 p-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-sky-100/30 border border-border"></div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFrenchDoors = () => (
    <div className="relative w-full h-full">
      {/* Left door */}
      <div className="absolute left-4 right-1/2 top-4 bottom-4 border-4 border-muted-foreground bg-background/50 mr-1">
        <div className="grid grid-cols-1 grid-rows-4 h-full gap-1 p-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-sky-100/30 border border-border"></div>
          ))}
        </div>
        {/* Door handle */}
        <div className="absolute right-2 top-1/2 w-2 h-1 bg-muted-foreground rounded"></div>
      </div>
      
      {/* Right door */}
      <div className="absolute left-1/2 right-4 top-4 bottom-4 border-4 border-muted-foreground bg-background/50 ml-1">
        <div className="grid grid-cols-1 grid-rows-4 h-full gap-1 p-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-sky-100/30 border border-border"></div>
          ))}
        </div>
        {/* Door handle */}
        <div className="absolute left-2 top-1/2 w-2 h-1 bg-muted-foreground rounded"></div>
      </div>
    </div>
  );

  const renderSlidingDoors = () => (
    <div className="relative w-full h-full">
      {/* Back panel (fixed) */}
      <div className="absolute left-6 right-4 top-4 bottom-4 border-4 border-muted-foreground bg-background/30">
        <div className="grid grid-cols-2 grid-rows-4 h-full gap-1 p-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-sky-100/20 border border-border"></div>
          ))}
        </div>
      </div>
      
      {/* Front panel (sliding) */}
      <div className="absolute left-4 right-6 top-4 bottom-4 border-4 border-foreground bg-background/50 shadow-lg">
        <div className="grid grid-cols-2 grid-rows-4 h-full gap-1 p-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-sky-100/30 border border-border"></div>
          ))}
        </div>
        {/* Sliding handle */}
        <div className="absolute right-2 top-1/2 w-1 h-8 bg-foreground rounded"></div>
      </div>
    </div>
  );

  const renderLargeWindow = () => (
    <div className="relative w-full h-full">
      {/* Large window frame */}
      <div className="absolute inset-2 border-6 border-muted-foreground bg-background/50">
        {/* Multiple panes */}
        <div className="grid grid-cols-3 grid-rows-3 h-full gap-2 p-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-sky-100/30 border-2 border-border"></div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTerraceDoors = () => (
    <div className="relative w-full h-full">
      {/* Wide terrace doors */}
      <div className="absolute left-2 right-2 top-4 bottom-2 border-4 border-muted-foreground bg-background/50">
        <div className="grid grid-cols-4 grid-rows-3 h-full gap-1 p-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-sky-100/30 border border-border"></div>
          ))}
        </div>
      </div>
      {/* Door threshold */}
      <div className="absolute left-2 right-2 bottom-1 h-2 bg-amber-600"></div>
    </div>
  );

  const renderCornerWindow = () => (
    <div className="relative w-full h-full">
      {/* Left window */}
      <div className="absolute left-4 right-1/2 top-4 bottom-4 border-4 border-l-0 border-muted-foreground bg-background/50">
        <div className="grid grid-cols-1 grid-rows-3 h-full gap-1 p-1 pr-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-sky-100/30 border border-border"></div>
          ))}
        </div>
      </div>
      
      {/* Right window */}
      <div className="absolute left-1/2 right-4 top-4 bottom-4 border-4 border-r-0 border-muted-foreground bg-background/50">
        <div className="grid grid-cols-1 grid-rows-3 h-full gap-1 p-1 pl-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-sky-100/30 border border-border"></div>
          ))}
        </div>
      </div>
      
      {/* Corner connector */}
      <div className="absolute left-1/2 top-4 bottom-4 w-1 bg-muted-foreground transform -translate-x-1/2"></div>
    </div>
  );

  const renderArchedWindow = () => (
    <div className="relative w-full h-full">
      {/* Arched top */}
      <div className="absolute left-8 right-8 top-4 h-16 border-4 border-b-0 border-muted-foreground bg-background/50 rounded-t-full">
        <div className="grid grid-cols-3 grid-rows-1 h-full gap-1 p-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-sky-100/30 border border-border rounded-t-lg"></div>
          ))}
        </div>
      </div>
      
      {/* Rectangular bottom */}
      <div className="absolute left-8 right-8 top-20 bottom-4 border-4 border-t-0 border-muted-foreground bg-background/50">
        <div className="grid grid-cols-3 grid-rows-2 h-full gap-1 p-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-sky-100/30 border border-border"></div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSkylight = () => (
    <div className="relative w-full h-full">
      {/* Skylight frame (angled perspective) */}
      <div className="absolute left-6 right-2 top-8 bottom-6 border-4 border-muted-foreground bg-background/50 transform -skew-x-12">
        <div className="grid grid-cols-2 grid-rows-2 h-full gap-2 p-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-sky-200/50 border border-border transform skew-x-12"></div>
          ))}
        </div>
      </div>
      
      {/* Light rays effect */}
      <div className="absolute left-1/2 top-2 w-1 h-12 bg-yellow-300/50 transform -translate-x-1/2 -skew-x-12"></div>
      <div className="absolute left-1/3 top-4 w-1 h-8 bg-yellow-300/30 transform -skew-x-12"></div>
      <div className="absolute right-1/3 top-6 w-1 h-6 bg-yellow-300/30 transform -skew-x-12"></div>
    </div>
  );

  return (
    <div className={`relative bg-gradient-to-b from-sky-50 to-sky-100 border-2 border-border rounded-lg ${className}`}>
      {renderWindow}
      
      {/* Window type label */}
      <div className="absolute top-2 left-2 bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-medium">
        {windowType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </div>
    </div>
  );
};
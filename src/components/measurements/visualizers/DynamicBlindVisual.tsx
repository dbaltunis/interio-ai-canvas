import React from 'react';

interface DynamicBlindVisualProps {
  windowType: string;
  measurements: Record<string, any>;
  template?: any;
  blindType: 'roller' | 'venetian' | 'vertical' | 'roman' | 'cellular';
  mountType?: 'inside' | 'outside';
  chainSide?: 'left' | 'right';
}

export const DynamicBlindVisual: React.FC<DynamicBlindVisualProps> = ({
  windowType,
  measurements,
  template,
  blindType = 'roller',
  mountType = 'outside',
  chainSide = 'right'
}) => {
  const hasValue = (value: any) => value && value !== "" && value !== "0";
  const displayValue = (value: any) => `${value}cm`;

  const renderRollerBlind = () => {
    const isInsideMount = mountType === 'inside';
    const blindWidth = isInsideMount ? 'left-16 right-16' : 'left-12 right-12';
    const blindTop = isInsideMount ? 'top-24' : 'top-20';
    
    return (
      <>
        {/* Roller Tube/Mechanism */}
        <div className={`absolute ${blindTop} ${blindWidth} h-4 bg-gradient-to-b from-muted-foreground to-muted rounded-sm shadow-md z-20`}>
          {/* Mounting brackets */}
          <div className="absolute -left-2 -top-1 w-3 h-6 bg-foreground/80 rounded-sm"></div>
          <div className="absolute -right-2 -top-1 w-3 h-6 bg-foreground/80 rounded-sm"></div>
          
          {/* Chain/Control */}
          {chainSide === 'right' ? (
            <div className="absolute -right-1 top-full w-0.5 h-32 bg-muted-foreground/60 z-30">
              <div className="absolute -right-1 bottom-0 w-2 h-8 bg-muted-foreground/80 rounded-sm"></div>
            </div>
          ) : (
            <div className="absolute -left-1 top-full w-0.5 h-32 bg-muted-foreground/60 z-30">
              <div className="absolute -left-1 bottom-0 w-2 h-8 bg-muted-foreground/80 rounded-sm"></div>
            </div>
          )}
        </div>

        {/* Roller Blind Fabric - Semi-transparent */}
        <div className={`absolute ${blindWidth} bg-primary/30 backdrop-blur-[1px] shadow-lg`}
             style={{
               top: `calc(${blindTop.includes('24') ? '6rem' : '5rem'} + 1rem)`,
               bottom: hasValue(measurements.drop) ? '4rem' : '8rem'
             }}>
          {/* Fabric texture effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-primary/5"></div>
          
          {/* Bottom bar/hembar */}
          <div className="absolute -bottom-1 left-0 right-0 h-2 bg-gradient-to-b from-muted-foreground/60 to-muted-foreground/80 rounded-sm shadow-md"></div>
        </div>
      </>
    );
  };

  const renderVenetianBlind = () => {
    const isInsideMount = mountType === 'inside';
    const blindWidth = isInsideMount ? 'left-16 right-16' : 'left-12 right-12';
    const blindTop = isInsideMount ? 'top-24' : 'top-20';
    const slatsCount = 20;
    
    return (
      <>
        {/* Headrail */}
        <div className={`absolute ${blindTop} ${blindWidth} h-3 bg-gradient-to-b from-muted-foreground to-muted rounded-sm shadow-md z-20`}>
          <div className="absolute -left-2 -top-0.5 w-3 h-4 bg-foreground/80 rounded-sm"></div>
          <div className="absolute -right-2 -top-0.5 w-3 h-4 bg-foreground/80 rounded-sm"></div>
          
          {/* Control cord */}
          {chainSide === 'right' ? (
            <div className="absolute -right-1 top-full w-0.5 h-24 bg-muted-foreground/60 z-30">
              <div className="absolute -right-0.5 bottom-0 w-1.5 h-6 bg-muted-foreground/80 rounded-sm"></div>
            </div>
          ) : (
            <div className="absolute -left-1 top-full w-0.5 h-24 bg-muted-foreground/60 z-30">
              <div className="absolute -left-0.5 bottom-0 w-1.5 h-6 bg-muted-foreground/80 rounded-sm"></div>
            </div>
          )}
        </div>

        {/* Venetian Slats */}
        <div className={`absolute ${blindWidth}`}
             style={{
               top: `calc(${blindTop.includes('24') ? '6rem' : '5rem'} + 0.75rem)`,
               bottom: '4rem'
             }}>
          {Array.from({ length: slatsCount }).map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 h-1 bg-primary/40 border-t border-b border-primary/20 shadow-sm"
              style={{ 
                top: `${(i / slatsCount) * 100}%`,
                transform: 'rotateX(15deg)',
                transformOrigin: 'center'
              }}
            />
          ))}
        </div>
      </>
    );
  };

  const renderVerticalBlind = () => {
    const isInsideMount = mountType === 'inside';
    const blindWidth = isInsideMount ? 'left-16 right-16' : 'left-12 right-12';
    const blindTop = isInsideMount ? 'top-24' : 'top-20';
    const vaneCount = 12;
    
    return (
      <>
        {/* Headrail */}
        <div className={`absolute ${blindTop} ${blindWidth} h-3 bg-gradient-to-b from-muted-foreground to-muted rounded-sm shadow-md z-20`}>
          <div className="absolute -left-2 -top-0.5 w-3 h-4 bg-foreground/80 rounded-sm"></div>
          <div className="absolute -right-2 -top-0.5 w-3 h-4 bg-foreground/80 rounded-sm"></div>
          
          {/* Control chain */}
          {chainSide === 'right' ? (
            <div className="absolute -right-1 top-full w-0.5 h-40 bg-muted-foreground/60 z-30"></div>
          ) : (
            <div className="absolute -left-1 top-full w-0.5 h-40 bg-muted-foreground/60 z-30"></div>
          )}
        </div>

        {/* Vertical Vanes */}
        <div className={`absolute ${blindWidth} flex justify-between`}
             style={{
               top: `calc(${blindTop.includes('24') ? '6rem' : '5rem'} + 0.75rem)`,
               bottom: '4rem'
             }}>
          {Array.from({ length: vaneCount }).map((_, i) => (
            <div
              key={i}
              className="h-full bg-primary/35 border-l border-r border-primary/20 shadow-md"
              style={{ 
                width: `calc(100% / ${vaneCount} - 2px)`,
                transform: 'rotateY(30deg)',
                transformOrigin: 'top center'
              }}
            />
          ))}
        </div>
      </>
    );
  };

  const renderRomanBlind = () => {
    const isInsideMount = mountType === 'inside';
    const blindWidth = isInsideMount ? 'left-16 right-16' : 'left-12 right-12';
    const blindTop = isInsideMount ? 'top-24' : 'top-20';
    const foldCount = 6;
    
    return (
      <>
        {/* Headrail */}
        <div className={`absolute ${blindTop} ${blindWidth} h-3 bg-gradient-to-b from-muted-foreground to-muted rounded-sm shadow-md z-20`}>
          <div className="absolute -left-2 -top-0.5 w-3 h-4 bg-foreground/80 rounded-sm"></div>
          <div className="absolute -right-2 -top-0.5 w-3 h-4 bg-foreground/80 rounded-sm"></div>
          
          {/* Control cord */}
          {chainSide === 'right' ? (
            <div className="absolute -right-1 top-full w-0.5 h-32 bg-muted-foreground/60 z-30">
              <div className="absolute -right-1 bottom-0 w-2 h-8 bg-muted-foreground/80 rounded-sm"></div>
            </div>
          ) : (
            <div className="absolute -left-1 top-full w-0.5 h-32 bg-muted-foreground/60 z-30">
              <div className="absolute -left-1 bottom-0 w-2 h-8 bg-muted-foreground/80 rounded-sm"></div>
            </div>
          )}
        </div>

        {/* Roman Blind Fabric with Folds */}
        <div className={`absolute ${blindWidth} bg-primary/30 backdrop-blur-[1px] shadow-lg`}
             style={{
               top: `calc(${blindTop.includes('24') ? '6rem' : '5rem'} + 0.75rem)`,
               bottom: '4rem'
             }}>
          {/* Horizontal folds */}
          {Array.from({ length: foldCount }).map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 h-1 bg-primary/20 shadow-inner"
              style={{ 
                bottom: `${(i / foldCount) * 100}%`,
              }}
            />
          ))}
          
          {/* Fabric texture */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-primary/5"></div>
          
          {/* Bottom bar */}
          <div className="absolute -bottom-1 left-0 right-0 h-2 bg-gradient-to-b from-muted-foreground/60 to-muted-foreground/80 rounded-sm shadow-md"></div>
        </div>
      </>
    );
  };

  const renderBlindVisualization = () => {
    switch (blindType) {
      case 'roller':
        return renderRollerBlind();
      case 'venetian':
        return renderVenetianBlind();
      case 'vertical':
        return renderVerticalBlind();
      case 'roman':
        return renderRomanBlind();
      default:
        return renderRollerBlind();
    }
  };

  return (
    <div className="relative container-level-2 rounded-lg p-8 min-h-[400px] overflow-visible">
      {/* Window Frame - Same structure as curtains */}
      {windowType === 'bay' ? (
        <>
          {/* Bay Window - Three angled sections */}
          <div className="absolute top-24 left-12 w-20 bottom-16 transform -skew-y-12 origin-bottom">
            <div className="w-full h-full border-4 border-muted-foreground bg-background relative">
              <div className="grid grid-cols-1 grid-rows-3 h-full gap-1 p-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-muted border border-border"></div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="absolute top-20 left-32 right-32 bottom-20">
            <div className="w-full h-full border-4 border-muted-foreground bg-background relative">
              <div className="grid grid-cols-2 grid-rows-3 h-full gap-1 p-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-muted border border-border"></div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="absolute top-24 right-12 w-20 bottom-16 transform skew-y-12 origin-bottom">
            <div className="w-full h-full border-4 border-muted-foreground bg-background relative">
              <div className="grid grid-cols-1 grid-rows-3 h-full gap-1 p-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-muted border border-border"></div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="absolute top-24 left-16 right-16 bottom-16">
          <div className="w-full h-full border-4 border-muted-foreground bg-background relative">
            <div className="grid grid-cols-2 grid-rows-3 h-full gap-1 p-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-muted border border-border"></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Blind Treatment */}
      {renderBlindVisualization()}

      {/* Width measurement */}
      {hasValue(measurements.rail_width) && (
        <div className="absolute -top-4 left-12 right-12 flex items-center z-10">
          <div className="w-0 h-0 border-t-2 border-b-2 border-r-4 border-transparent border-r-blue-600"></div>
          <div className="flex-1 border-t-2 border-blue-600 relative">
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg z-20 whitespace-nowrap">
              Width: {displayValue(measurements.rail_width)}
            </span>
          </div>
          <div className="w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-blue-600"></div>
        </div>
      )}

      {/* Drop measurement */}
      {hasValue(measurements.drop) && (
        <div className="absolute right-0 top-20 bottom-16 flex flex-col items-center z-20">
          <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-green-600"></div>
          <div className="flex-1 border-r-2 border-green-600 relative">
            <span className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg whitespace-nowrap z-30">
              Drop: {displayValue(measurements.drop)}
            </span>
          </div>
          <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-green-600"></div>
        </div>
      )}

      {/* Floor Line */}
      <div className="absolute bottom-4 left-8 right-8 border-t-4 border-muted-foreground">
        <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-base font-bold text-muted-foreground">
          Floor Line
        </span>
      </div>
    </div>
  );
};

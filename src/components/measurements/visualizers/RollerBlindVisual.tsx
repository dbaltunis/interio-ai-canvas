import React from 'react';

interface RollerBlindVisualProps {
  railWidth: number;
  drop: number;
  unit: string;
  windowType?: string;
}

export const RollerBlindVisual: React.FC<RollerBlindVisualProps> = ({
  railWidth,
  drop,
  unit,
  windowType = 'standard'
}) => {
  const hasValue = (value: number) => value && value > 0;

  return (
    <div className="relative container-level-2 rounded-lg p-8 min-h-[400px] overflow-visible">
      {/* Roller Mechanism - Top bracket */}
      <div className="absolute top-4 left-12 right-12 flex items-center">
        <div className="w-full h-4 bg-muted-foreground relative flex items-center justify-between px-2">
          {/* Left bracket */}
          <div className="w-3 h-6 bg-foreground rounded-sm"></div>
          {/* Roller tube */}
          <div className="absolute left-0 right-0 top-0 h-full bg-gradient-to-b from-muted-foreground to-muted-foreground/80 rounded-sm"></div>
          {/* Right bracket with chain */}
          <div className="relative w-3 h-6 bg-foreground rounded-sm">
            {/* Control chain */}
            <div className="absolute left-1/2 -translate-x-1/2 top-6 w-0.5 h-32 bg-muted-foreground/60 border-l border-r border-muted-foreground"></div>
          </div>
        </div>
      </div>

      {/* Window Frame */}
      {windowType === 'bay' ? (
        <>
          {/* Left Angled Window */}
          <div className="absolute top-24 left-12 w-20 bottom-16 transform -skew-y-12 origin-bottom">
            <div className="w-full h-full border-4 border-muted-foreground bg-background relative">
              <div className="grid grid-cols-1 grid-rows-3 h-full gap-1 p-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-muted border border-border"></div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Center Window */}
          <div className="absolute top-20 left-32 right-32 bottom-20">
            <div className="w-full h-full border-4 border-muted-foreground bg-background relative">
              <div className="grid grid-cols-2 grid-rows-3 h-full gap-1 p-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-muted border border-border"></div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Angled Window */}
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
        // Standard Window
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

      {/* Roller Blind Fabric - Rolled down */}
      <div className="absolute top-8 left-12 right-12 bottom-16 bg-primary/70 shadow-lg">
        {/* Fabric texture - horizontal lines */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary/70 to-primary/60">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i} 
              className="w-full h-px bg-primary/80"
              style={{ marginTop: `${i * 5}%` }}
            ></div>
          ))}
        </div>
        
        {/* Bottom bar weight */}
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-muted-foreground shadow-md"></div>
      </div>

      {/* Floor Line */}
      <div className="absolute bottom-12 left-0 right-0 h-1 bg-border"></div>

      {/* Measurement Labels */}
      {hasValue(railWidth) && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <div className="bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border-2 border-primary shadow-md">
            <span className="text-sm font-semibold text-primary">Enter Rail Width →</span>
          </div>
        </div>
      )}

      {hasValue(drop) && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap">
          <div className="bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border-2 border-primary shadow-md">
            <span className="text-sm font-semibold text-primary">↓ Drop Height</span>
          </div>
        </div>
      )}

      {/* What to Measure Info Box */}
      <div className="absolute bottom-20 left-4 right-4 bg-muted/80 backdrop-blur-sm p-4 rounded-lg shadow-lg">
        <h3 className="font-semibold text-foreground mb-2">What to Measure</h3>
        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>Width (W):</strong> Measure the exact width of the window recess or desired coverage</p>
          <p><strong>Drop (H):</strong> Height from the top of the window to where the blind should end</p>
        </div>
      </div>
    </div>
  );
};

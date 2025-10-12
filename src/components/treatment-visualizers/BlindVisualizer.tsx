interface BlindVisualizerProps {
  windowType: string;
  measurements: Record<string, any>;
  template?: any;
  material?: any;
  className?: string;
  hideDetails?: boolean;
}

export const BlindVisualizer = ({
  windowType,
  measurements,
  template,
  material,
  className = "",
  hideDetails = false
}: BlindVisualizerProps) => {
  const blindType = template?.type || "horizontal";
  const slatWidth = template?.slat_width || 25;
  const mountType = template?.mount_type || "inside";
  const controlSide = measurements.control_side || "right";

  const getSlatColor = () => {
    if (material?.color) return material.color;
    return "hsl(var(--muted))";
  };

  const renderHorizontalBlind = () => {
    const slatCount = Math.floor(300 / (slatWidth + 2)); // Approximate slat count
    
    return (
      <div className="absolute inset-4 bg-background/30">
        {/* Top rail */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-muted-foreground rounded-sm">
          <div className="absolute right-2 top-1 w-2 h-2 bg-foreground rounded-full"></div>
        </div>
        
        {/* Slats */}
        <div className="absolute top-4 left-0 right-0 bottom-4 space-y-0.5">
          {Array.from({ length: slatCount }).map((_, i) => (
            <div
              key={i}
              className="w-full rounded-sm border border-border/50"
              style={{
                height: `${slatWidth}px`,
                backgroundColor: getSlatColor(),
                transform: `rotateX(${15 * Math.sin(i * 0.3)}deg)` // Slight angle variation
              }}
            />
          ))}
        </div>
        
        {/* Control cord */}
        <div className={`absolute top-2 ${controlSide === 'left' ? 'left-2' : 'right-2'} bottom-2 w-0.5 bg-gray-400`}>
          <div className={`absolute bottom-0 ${controlSide === 'left' ? 'left-0' : 'right-0'} w-3 h-6 bg-gray-500 rounded`}></div>
        </div>
        
        {/* Bottom rail */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-muted-foreground rounded-sm"></div>
      </div>
    );
  };

  const renderVerticalBlind = () => {
    const slatCount = Math.floor(400 / (slatWidth + 2)); // Approximate slat count
    
    return (
      <div className="absolute inset-4 bg-background/30">
        {/* Top rail */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-muted-foreground rounded-sm">
          <div className="absolute right-2 top-1 w-2 h-2 bg-foreground rounded-full"></div>
        </div>
        
        {/* Vertical slats */}
        <div className="absolute top-4 left-0 right-0 bottom-0 flex space-x-0.5">
          {Array.from({ length: slatCount }).map((_, i) => (
            <div
              key={i}
              className="h-full rounded-sm border border-border/50"
              style={{
                width: `${slatWidth}px`,
                backgroundColor: getSlatColor(),
                transform: `rotateY(${10 * Math.sin(i * 0.2)}deg)` // Slight rotation variation
              }}
            />
          ))}
        </div>
        
        {/* Control chain */}
        <div className={`absolute top-2 ${controlSide === 'left' ? 'left-2' : 'right-2'} w-0.5 h-20 bg-gray-400`}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-full h-2 border-b border-gray-500"></div>
          ))}
        </div>
      </div>
    );
  };

  const renderRollerBlind = () => (
    <div className="absolute inset-4 bg-background/30">
      {/* Roller mechanism */}
      <div className="absolute top-0 left-0 right-0 h-6 bg-muted-foreground rounded-full">
        <div className="absolute right-2 top-1 w-4 h-4 bg-foreground rounded-full"></div>
      </div>
      
      {/* Blind fabric */}
      <div 
        className="absolute top-6 left-0 right-0 rounded-b-sm border border-border/50"
        style={{
          height: "60%", // Partially lowered
          backgroundColor: getSlatColor()
        }}
      >
        {/* Fabric texture lines */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div 
            key={i} 
            className="w-full h-0.5 bg-black/10 absolute"
            style={{ top: `${i * 12 + 8}%` }}
          />
        ))}
      </div>
      
      {/* Bottom bar */}
      <div 
        className="absolute left-0 right-0 h-3 bg-muted-foreground rounded-sm"
        style={{ top: "66%" }}
      >
        <div className="absolute right-2 top-0.5 w-2 h-2 bg-foreground rounded-full"></div>
      </div>
      
      {/* Pull cord */}
      <div className={`absolute ${controlSide === 'left' ? 'left-2' : 'right-2'} w-0.5 bg-gray-400`}
           style={{ top: "66%", height: "30%" }}>
        <div className="absolute bottom-0 w-3 h-4 bg-gray-500 rounded transform -translate-x-1"></div>
      </div>
    </div>
  );

  const renderBlindByType = () => {
    switch (blindType) {
      case "vertical":
        return renderVerticalBlind();
      case "roller":
        return renderRollerBlind();
      default:
        return renderHorizontalBlind();
    }
  };

  const renderMeasurementIndicators = () => (
    <>
      {/* Width indicator */}
      {measurements.width && (
        <div className="absolute -top-4 left-4 right-4 flex items-center z-10">
          <div className="w-0 h-0 border-t-2 border-b-2 border-r-4 border-transparent border-r-blue-600"></div>
          <div className="flex-1 border-t-2 border-blue-600 relative">
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-bold shadow-lg z-20 whitespace-nowrap">
              Width: {measurements.width}cm
            </span>
          </div>
          <div className="w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-blue-600"></div>
        </div>
      )}
      
      {/* Height indicator */}
      {measurements.height && (
        <div className="absolute right-0 top-4 bottom-4 flex flex-col items-center z-10">
          <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-green-600"></div>
          <div className="flex-1 border-r-2 border-green-600 relative">
            <span className="absolute top-1/2 -right-16 transform -translate-y-1/2 bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-bold shadow-lg whitespace-nowrap">
              Height: {measurements.height}cm
            </span>
          </div>
          <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-green-600"></div>
        </div>
      )}
    </>
  );

  return (
    <div className={`relative min-h-[400px] bg-gradient-to-b from-sky-50 to-sky-100 border-2 border-border rounded-lg overflow-hidden ${className}`}>
      {/* Window frame */}
      <div className="absolute inset-2 border-4 border-muted-foreground bg-background/50">
        {blindType !== "roller" && (
          <div className="grid grid-cols-2 grid-rows-2 h-full gap-1 p-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-sky-100/30 border border-border"></div>
            ))}
          </div>
        )}
      </div>
      
      {/* Blind */}
      {renderBlindByType()}
      
      {/* Measurement indicators */}
      {!hideDetails && renderMeasurementIndicators()}
      
      {/* Treatment info - hide if hideDetails is true */}
      {!hideDetails && (
        <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm rounded p-2 text-xs space-y-1">
          <div className="font-medium">Blind Details</div>
          <div>Type: {blindType}</div>
          <div>Mount: {mountType}</div>
          <div>Control: {controlSide}</div>
          {slatWidth && <div>Slat: {slatWidth}mm</div>}
        </div>
      )}
    </div>
  );
};
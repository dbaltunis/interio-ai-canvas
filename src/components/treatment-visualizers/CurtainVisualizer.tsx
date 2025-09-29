interface CurtainVisualizerProps {
  windowType: string;
  measurements: Record<string, any>;
  template?: any;
  fabric?: any;
  hardware?: any;
  className?: string;
}

export const CurtainVisualizer = ({
  windowType,
  measurements,
  template,
  fabric,
  hardware,
  className = ""
}: CurtainVisualizerProps) => {
  const curtainType = template?.curtain_type || "pair";
  const hardwareType = hardware?.type || "rod";
  const fullnessRatio = template?.fullness_ratio || 2.0;
  const poolingAmount = parseFloat(measurements.pooling_amount || "0");
  const hasPooling = poolingAmount > 0;

  const getCurtainColor = () => {
    if (fabric?.color) return fabric.color;
    return "hsl(var(--primary))";
  };

  const renderTrack = () => (
    <div className="absolute top-4 left-8 right-8 h-3 bg-muted-foreground relative">
      <div className="absolute -left-1 -top-0.5 w-2 h-4 bg-foreground"></div>
      <div className="absolute -right-1 -top-0.5 w-2 h-4 bg-foreground"></div>
    </div>
  );

  const renderRod = () => (
    <div className="absolute top-16 left-8 right-8 h-2 bg-muted-foreground rounded-full relative">
      <div className="absolute -left-2 -top-1 w-4 h-4 bg-foreground rounded-full"></div>
      <div className="absolute -right-2 -top-1 w-4 h-4 bg-foreground rounded-full"></div>
    </div>
  );

  const renderCurtainPanel = (side: 'left' | 'right' | 'center', width: number) => {
    const topPosition = hardwareType === "track" ? "top-4" : "top-16";
    const leftPosition = side === 'left' ? 'left-10' : side === 'right' ? 'right-10' : 'left-1/2';
    const bottomPosition = hasPooling ? "bottom-0" : "bottom-4";
    
    return (
      <div
        className={`absolute ${topPosition} ${leftPosition} ${bottomPosition}`}
        style={{
          width: `${width}px`,
          backgroundColor: getCurtainColor(),
          transform: side === 'center' ? 'translateX(-50%)' : undefined
        }}
      >
        {/* Curtain pleats/folds */}
        <div className="absolute inset-y-0 left-0 right-0 opacity-80">
          {Array.from({ length: Math.floor(width / 4) }).map((_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-0.5 bg-black/20"
              style={{ left: `${(i + 1) * 4}px` }}
            />
          ))}
        </div>
        
        {/* Hang point */}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-foreground rounded-full"></div>
        
        {/* Pooling effect */}
        {hasPooling && (
          <div 
            className="absolute -bottom-4 left-0 w-full rounded-b-lg"
            style={{
              height: `${Math.min(poolingAmount / 2, 16)}px`,
              backgroundColor: getCurtainColor(),
              opacity: 0.6
            }}
          />
        )}
      </div>
    );
  };

  const renderHardware = () => {
    return hardwareType === "track" ? renderTrack() : renderRod();
  };

  const renderCurtains = () => {
    const baseWidth = 32; // Base width for curtain panels
    const adjustedWidth = baseWidth * (fullnessRatio / 2); // Adjust for fullness
    
    if (curtainType === "pair") {
      return (
        <>
          {renderCurtainPanel('left', adjustedWidth)}
          {renderCurtainPanel('right', adjustedWidth)}
        </>
      );
    } else {
      return renderCurtainPanel('center', adjustedWidth * 1.5);
    }
  };

  const renderMeasurementIndicators = () => {
    const hardwareName = hardwareType === "track" ? "Track" : "Rod";
    
    return (
      <>
        {/* Rail width indicator - curtain measurement */}
        {measurements.rail_width && (
          <div className={`absolute ${hardwareType === "track" ? "-top-4" : "top-8"} left-8 right-8 flex items-center z-10`}>
            {/* Left arrow */}
            <div className="w-0 h-0 border-t-2 border-b-2 border-r-4 border-transparent border-r-blue-600"></div>
            {/* Measurement line */}
            <div className="flex-1 border-t-2 border-blue-600 relative">
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg z-20 whitespace-nowrap">
                {hardwareName} Width: {measurements.rail_width}cm
              </span>
            </div>
            {/* Right arrow */}
            <div className="w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-blue-600"></div>
          </div>
        )}
        
        {/* Drop indicator - curtain height measurement */}
        {measurements.drop && (
          <div className={`absolute right-0 ${hardwareType === "track" ? "top-6" : "top-18"} ${hasPooling ? "bottom-8" : "bottom-4"} flex flex-col items-center z-10`}>
            {/* Top arrow */}
            <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-green-600"></div>
            {/* Measurement line */}
            <div className="flex-1 border-r-2 border-green-600 relative">
              <span className="absolute top-1/2 -right-16 transform -translate-y-1/2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg whitespace-nowrap">
                Drop: {measurements.drop}cm
              </span>
            </div>
            {/* Bottom arrow */}
            <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-green-600"></div>
          </div>
        )}

        {/* Pooling measurement - when curtains pool on floor */}
        {hasPooling && (
          <div className="absolute bottom-0 left-8 right-8 flex items-center z-10">
            {/* Left arrow */}
            <div className="w-0 h-0 border-t-2 border-b-2 border-r-4 border-transparent border-r-orange-600"></div>
            {/* Measurement line */}
            <div className="flex-1 border-t-2 border-orange-600 relative">
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-orange-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg z-20 whitespace-nowrap">
                Pooling: {poolingAmount}cm
              </span>
            </div>
            {/* Right arrow */}
            <div className="w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-orange-600"></div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className={`relative min-h-[400px] bg-gradient-to-b from-sky-50 to-sky-100 border-2 border-border rounded-lg overflow-hidden ${className}`}>
      {/* Hardware */}
      {renderHardware()}
      
      {/* Curtains */}
      {renderCurtains()}
      
      {/* Measurement indicators */}
      {renderMeasurementIndicators()}
      
      {/* Floor line */}
      <div className="absolute bottom-4 left-0 right-0 border-t-2 border-amber-600">
        <span className="absolute -bottom-6 left-4 text-xs font-medium text-amber-600">
          Floor Line
        </span>
      </div>
      
      {/* Treatment info */}
      <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm rounded p-2 text-xs space-y-1">
        <div className="font-medium">Curtain Details</div>
        <div>Type: {curtainType}</div>
        <div>Hardware: {hardwareType}</div>
        <div>Fullness: {fullnessRatio}x</div>
        {hasPooling && <div>Pooling: {poolingAmount}cm</div>}
      </div>
    </div>
  );
};
interface RollerBlindVisualProps {
  windowType: string;
  measurements: Record<string, any>;
  template?: any;
  material?: any;
  className?: string;
}

export const RollerBlindVisual = ({
  windowType,
  measurements,
  template,
  material,
  className = ""
}: RollerBlindVisualProps) => {
  const controlSide = measurements.control_side || "right";

  const getBlindColor = () => {
    if (material?.color) return material.color;
    return "hsl(var(--primary))";
  };

  const renderMeasurementIndicators = () => (
    <>
      {/* Width indicator */}
      {measurements.rail_width && (
        <div className="absolute -top-4 left-4 right-4 flex items-center z-10">
          <div className="w-0 h-0 border-t-2 border-b-2 border-r-4 border-transparent border-r-blue-600"></div>
          <div className="flex-1 border-t-2 border-blue-600 relative">
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg z-20 whitespace-nowrap">
              Rail Width: {measurements.rail_width}cm
            </span>
          </div>
          <div className="w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-blue-600"></div>
        </div>
      )}
      
      {/* Height indicator */}
      {measurements.drop && (
        <div className="absolute right-0 top-4 bottom-4 flex flex-col items-center z-10">
          <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-green-600"></div>
          <div className="flex-1 border-r-2 border-green-600 relative">
            <span className="absolute top-1/2 -right-16 transform -translate-y-1/2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg whitespace-nowrap">
              Drop: {measurements.drop}cm
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
        <div className="grid grid-cols-2 grid-rows-2 h-full gap-1 p-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-sky-100/30 border border-border"></div>
          ))}
        </div>
      </div>

      {/* Roller blind mechanism and fabric */}
      <div className="absolute inset-4 bg-background/30">
        {/* Roller mechanism */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-muted-foreground rounded-full">
          <div className="absolute right-2 top-1 w-4 h-4 bg-foreground rounded-full"></div>
        </div>
        
        {/* Blind fabric - semi-transparent */}
        <div 
          className="absolute top-6 left-0 right-0 rounded-b-sm border border-border/50 opacity-60"
          style={{
            height: "60%",
            backgroundColor: getBlindColor()
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
        <div className="font-medium">Roller Blind Details</div>
        <div>Control: {controlSide}</div>
        {material && <div>Material: {material.name}</div>}
      </div>
    </div>
  );
};

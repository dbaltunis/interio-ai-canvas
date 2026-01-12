import { Badge } from "@/components/ui/badge";

interface ZebraBlindVisualizerProps {
  measurements: any;
  selectedFabric?: any;
  controlPosition?: 'left' | 'right';
  mountingType?: 'inside' | 'outside';
  bandWidth?: 'standard' | 'wide' | 'extra_wide';
  bandAlignment?: 'open' | 'closed';
}

export const ZebraBlindVisualizer = ({
  measurements,
  selectedFabric,
  controlPosition = 'right',
  mountingType = 'inside',
  bandWidth = 'standard',
  bandAlignment = 'closed'
}: ZebraBlindVisualizerProps) => {
  const width = parseFloat(measurements.rail_width || measurements.measurement_a || '150');
  const height = parseFloat(measurements.drop || measurements.measurement_b || '200');
  
  const fabricImage = selectedFabric?.image_url;
  
  // Calculate band dimensions based on bandWidth setting
  const getBandConfig = () => {
    switch (bandWidth) {
      case 'extra_wide': return { count: 6, sheerHeight: 18, opaqueHeight: 18 };
      case 'wide': return { count: 8, sheerHeight: 14, opaqueHeight: 14 };
      default: return { count: 10, sheerHeight: 10, opaqueHeight: 10 };
    }
  };
  
  const bandConfig = getBandConfig();
  
  // Colors for the bands - alternating pattern
  const sheerColor = fabricImage ? undefined : 'bg-slate-100/80';
  const opaqueColor = fabricImage ? undefined : 'bg-slate-500';
  
  const getFabricStyle = () => {
    if (fabricImage) {
      return {
        backgroundImage: `url(${fabricImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'repeat',
      };
    }
    return {};
  };

  // Generate alternating bands
  const renderBands = () => {
    const bands = [];
    const totalBands = bandConfig.count * 2; // Sheer + Opaque pairs
    
    for (let i = 0; i < totalBands; i++) {
      const isSheer = i % 2 === 0;
      const isAligned = bandAlignment === 'open';
      
      bands.push(
        <div
          key={i}
          className={`w-full transition-all duration-300 ${
            isSheer 
              ? `${sheerColor} backdrop-blur-sm` 
              : opaqueColor
          }`}
          style={{
            height: isSheer ? `${bandConfig.sheerHeight}px` : `${bandConfig.opaqueHeight}px`,
            opacity: isSheer && isAligned ? 0.3 : isSheer ? 0.6 : 1,
            transform: isAligned && !isSheer ? 'translateY(-4px)' : 'translateY(0)',
            ...(fabricImage && !isSheer ? getFabricStyle() : {})
          }}
        >
          {/* Subtle texture lines on opaque bands */}
          {!isSheer && !fabricImage && (
            <div className="h-full w-full relative overflow-hidden">
              {Array.from({ length: 3 }).map((_, j) => (
                <div
                  key={j}
                  className="absolute w-full h-px bg-slate-400/30"
                  style={{ top: `${(j + 1) * 25}%` }}
                />
              ))}
            </div>
          )}
          {/* Light passing through sheer bands */}
          {isSheer && (
            <div className="h-full w-full relative">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-50/20 to-transparent" />
              {/* Dotted pattern for sheer texture */}
              <div className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                  backgroundSize: '4px 4px'
                }}
              />
            </div>
          )}
        </div>
      );
    }
    return bands;
  };
  
  return (
    <div className="relative border-2 border-dashed border-border rounded-lg p-8 bg-gradient-to-b from-muted/30 to-muted/50 min-h-[400px]">
      {/* Mounting Brackets */}
      <div className={`absolute ${mountingType === 'inside' ? 'top-6' : 'top-2'} left-10 right-10 flex justify-between`}>
        <div className="w-6 h-8 bg-muted-foreground rounded-sm shadow-md" />
        <div className="w-6 h-8 bg-muted-foreground rounded-sm shadow-md" />
      </div>
      
      {/* Roller Tube with dual mechanism */}
      <div className={`absolute ${mountingType === 'inside' ? 'top-10' : 'top-6'} left-12 right-12 h-6 bg-gradient-to-b from-muted-foreground to-muted-foreground/80 rounded-full shadow-lg`}>
        {/* End caps */}
        <div className="absolute -left-2 top-0 w-6 h-6 bg-foreground/80 rounded-l-full" />
        <div className="absolute -right-2 top-0 w-6 h-6 bg-foreground/80 rounded-r-full" />
        {/* Dual roller indicator */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-2/3 h-1 bg-foreground/30 rounded-full" />
      </div>
      
      {/* Fabric Panel with alternating bands */}
      <div 
        className={`absolute ${mountingType === 'inside' ? 'top-16' : 'top-12'} left-14 right-14 rounded-sm shadow-xl overflow-hidden`}
        style={{ 
          height: `${Math.min(height * 0.7, 260)}px`,
          maxHeight: '260px',
        }}
      >
        {/* Alternating bands container */}
        <div className="absolute inset-0 flex flex-col">
          {renderBands()}
        </div>
        
        {/* Chain Control */}
        <div 
          className={`absolute top-4 w-2 bg-foreground/70 rounded-full shadow-md z-10 ${
            controlPosition === 'left' ? 'left-4' : 'right-4'
          }`}
          style={{ height: 'calc(100% - 16px)' }}
        >
          {/* Chain beads */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={i}
              className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-foreground rounded-full"
              style={{ top: `${i * 12}%` }}
            />
          ))}
        </div>
        
        {/* Bottom Bar (weighted hem bar) */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-b from-muted-foreground to-foreground rounded-b-sm shadow-md flex items-center justify-center">
          {/* Bottom bar pull handle */}
          <div className="w-12 h-1.5 bg-foreground/50 rounded-full" />
        </div>
      </div>
      
      {/* Window Frame (behind blind) */}
      <div className={`absolute ${mountingType === 'inside' ? 'top-18' : 'top-14'} left-16 right-16 bottom-12`}>
        <div className="w-full h-full border-4 border-muted-foreground bg-background/50 shadow-inner">
          {/* Window panes with simulated light */}
          <div className="grid grid-cols-2 grid-rows-2 h-full gap-2 p-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div 
                key={i} 
                className="bg-gradient-to-br from-amber-100/40 to-sky-100/30 border border-border"
              >
                {/* Light rays effect */}
                <div className="h-full w-full bg-gradient-to-br from-yellow-50/20 to-transparent" />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Information Badges */}
      <div className="absolute bottom-3 left-3 flex gap-2 flex-wrap">
        <Badge variant="outline" className="bg-background/90">
          Zebra Blind
        </Badge>
        <Badge variant="secondary" className="bg-background/90">
          Day & Night
        </Badge>
        <Badge variant="secondary" className="bg-background/90">
          Control: {controlPosition}
        </Badge>
        <Badge variant="secondary" className="bg-background/90">
          {bandAlignment === 'open' ? 'Light Filtering' : 'Privacy'}
        </Badge>
      </div>
      
      {/* Band width indicator */}
      <div className="absolute top-3 left-3">
        <Badge variant="outline" className="bg-background/90">
          {bandWidth === 'extra_wide' ? '100mm' : bandWidth === 'wide' ? '75mm' : '50mm'} bands
        </Badge>
      </div>
      
      {/* Fabric name if selected */}
      {selectedFabric && (
        <div className="absolute top-3 right-3">
          <Badge className="bg-primary text-primary-foreground">
            {selectedFabric.name}
          </Badge>
        </div>
      )}
      
      {/* Dimensions */}
      <div className="absolute bottom-3 right-3">
        <Badge variant="outline" className="bg-background/90">
          {width}cm × {height}cm
        </Badge>
      </div>
    </div>
  );
};

import { Badge } from "@/components/ui/badge";

interface RollerBlindVisualizerProps {
  measurements: any;
  selectedFabric?: any;
  controlPosition?: 'left' | 'right';
  mountingType?: 'inside' | 'outside';
  transparency?: 'blackout' | 'light_filtering' | 'sheer';
}

export const RollerBlindVisualizer = ({
  measurements,
  selectedFabric,
  controlPosition = 'right',
  mountingType = 'inside',
  transparency = 'light_filtering'
}: RollerBlindVisualizerProps) => {
  const width = parseFloat(measurements.rail_width || measurements.measurement_a || '150');
  const height = parseFloat(measurements.drop || measurements.measurement_b || '200');
  
  const transparencyStyles = {
    blackout: 'from-gray-800 to-gray-900',
    light_filtering: 'from-gray-400 to-gray-500',
    sheer: 'from-gray-100 to-gray-200 opacity-70'
  };
  
  return (
    <div className="relative border-2 border-dashed border-border rounded-lg p-8 bg-gradient-to-b from-muted/30 to-muted/50 min-h-[400px]">
      {/* Mounting Brackets */}
      <div className={`absolute ${mountingType === 'inside' ? 'top-6' : 'top-2'} left-10 right-10 flex justify-between`}>
        <div className="w-6 h-8 bg-muted-foreground rounded-sm shadow-md" />
        <div className="w-6 h-8 bg-muted-foreground rounded-sm shadow-md" />
      </div>
      
      {/* Roller Tube */}
      <div className={`absolute ${mountingType === 'inside' ? 'top-10' : 'top-6'} left-12 right-12 h-5 bg-gradient-to-b from-muted-foreground to-muted-foreground/80 rounded-full shadow-lg`}>
        {/* End caps */}
        <div className="absolute -left-2 top-0 w-6 h-5 bg-foreground/80 rounded-l-full" />
        <div className="absolute -right-2 top-0 w-6 h-5 bg-foreground/80 rounded-r-full" />
      </div>
      
      {/* Fabric Panel */}
      <div 
        className={`absolute ${mountingType === 'inside' ? 'top-14' : 'top-10'} left-14 right-14 bg-gradient-to-b ${transparencyStyles[transparency]} rounded-sm shadow-xl transition-all`}
        style={{ 
          height: `${Math.min(height * 0.7, 250)}px`,
          maxHeight: '250px'
        }}
      >
        {/* Fabric texture lines */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 10 }).map((_, i) => (
            <div 
              key={i} 
              className="w-full h-px bg-background"
              style={{ top: `${i * 10}%` }}
            />
          ))}
        </div>
        
        {/* Chain Control */}
        <div 
          className={`absolute top-4 w-2 bg-foreground/70 rounded-full shadow-md ${
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
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-b from-muted-foreground to-foreground rounded-b-sm shadow-md" />
      </div>
      
      {/* Window Frame (behind blind) */}
      <div className={`absolute ${mountingType === 'inside' ? 'top-16' : 'top-12'} left-16 right-16 bottom-12`}>
        <div className="w-full h-full border-4 border-muted-foreground bg-background/50 shadow-inner">
          {/* Window panes */}
          <div className="grid grid-cols-2 grid-rows-2 h-full gap-2 p-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gradient-to-br from-muted/30 to-muted/50 border border-border" />
            ))}
          </div>
        </div>
      </div>
      
      {/* Information Badges */}
      <div className="absolute bottom-3 left-3 flex gap-2 flex-wrap">
        <Badge variant="outline" className="bg-background/90">
          Roller Blind
        </Badge>
        <Badge variant="secondary" className="bg-background/90">
          {transparency.replace('_', ' ')}
        </Badge>
        <Badge variant="secondary" className="bg-background/90">
          Control: {controlPosition}
        </Badge>
        <Badge variant="secondary" className="bg-background/90">
          Mount: {mountingType}
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

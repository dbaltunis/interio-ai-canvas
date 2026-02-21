import { Badge } from "@/components/ui/badge";

interface RollerBlindVisualizerProps {
  measurements: any;
  selectedFabric?: any;
  selectedFabric2?: any; // Second fabric for double roller
  controlPosition?: 'left' | 'right';
  mountingType?: 'inside' | 'outside';
  transparency?: 'blackout' | 'light_filtering' | 'sheer';
}

const SingleRoller = ({
  fabricImage,
  fabricColor,
  fabricName,
  controlPosition,
  mountingType,
  transparency,
  width,
  height,
}: {
  fabricImage?: string;
  fabricColor?: string;
  fabricName?: string;
  controlPosition: 'left' | 'right';
  mountingType: 'inside' | 'outside';
  transparency: 'blackout' | 'light_filtering' | 'sheer';
  width: number;
  height: number;
}) => {
  const transparencyStyles = {
    blackout: 'from-gray-800 to-gray-900',
    light_filtering: 'from-gray-400 to-gray-500',
    sheer: 'from-gray-100 to-gray-200 opacity-70'
  };

  const fabricStyle = fabricImage
    ? {
        backgroundImage: `url(${fabricImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'repeat',
      }
    : fabricColor
    ? { backgroundColor: fabricColor }
    : {};

  return (
    <div className="relative flex-1">
      {/* Mounting Brackets */}
      <div className={`absolute ${mountingType === 'inside' ? 'top-6' : 'top-2'} left-2 right-2 flex justify-between`}>
        <div className="w-4 h-6 bg-muted-foreground rounded-sm shadow-md" />
        <div className="w-4 h-6 bg-muted-foreground rounded-sm shadow-md" />
      </div>

      {/* Roller Tube */}
      <div className={`absolute ${mountingType === 'inside' ? 'top-10' : 'top-6'} left-3 right-3 h-4 bg-gradient-to-b from-muted-foreground to-muted-foreground/80 rounded-full shadow-lg`}>
        <div className="absolute -left-1.5 top-0 w-4 h-4 bg-foreground/80 rounded-l-full" />
        <div className="absolute -right-1.5 top-0 w-4 h-4 bg-foreground/80 rounded-r-full" />
      </div>

      {/* Fabric Panel */}
      <div
        className={`absolute ${mountingType === 'inside' ? 'top-14' : 'top-10'} left-4 right-4 ${!fabricImage && !fabricColor ? `bg-gradient-to-b ${transparencyStyles[transparency]}` : ''} rounded-sm shadow-xl`}
        style={{
          height: `${Math.min(height * 0.7, 220)}px`,
          maxHeight: '220px',
          ...fabricStyle
        }}
      >
        {/* Fabric texture lines */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-full h-px bg-background" style={{ top: `${i * 12}%` }} />
          ))}
        </div>

        {/* Chain Control */}
        <div
          className={`absolute top-4 w-1.5 bg-foreground/70 rounded-full shadow-md ${
            controlPosition === 'left' ? 'left-3' : 'right-3'
          }`}
          style={{ height: 'calc(100% - 16px)' }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-foreground rounded-full"
              style={{ top: `${i * 14}%` }}
            />
          ))}
        </div>

        {/* Bottom hem bar */}
        <div className="absolute bottom-0 left-0 right-0 h-2.5 bg-gradient-to-b from-muted-foreground to-foreground rounded-b-sm shadow-md" />
      </div>

      {/* Fabric name badge */}
      {fabricName && (
        <div className="absolute top-1 left-1/2 -translate-x-1/2 z-10">
          <Badge className="bg-primary/90 text-primary-foreground text-xs px-1.5 py-0 max-w-[90px] truncate">
            {fabricName}
          </Badge>
        </div>
      )}
    </div>
  );
};

export const RollerBlindVisualizer = ({
  measurements,
  selectedFabric,
  selectedFabric2,
  controlPosition = 'right',
  mountingType = 'inside',
  transparency = 'light_filtering'
}: RollerBlindVisualizerProps) => {
  const width = parseFloat(measurements.rail_width || measurements.measurement_a || '150');
  const height = parseFloat(measurements.drop || measurements.measurement_b || '200');
  const isDouble = measurements?.curtain_type === 'double';

  return (
    <div className="relative border-2 border-dashed border-border rounded-lg p-8 bg-gradient-to-b from-muted/30 to-muted/50 min-h-[400px]">
      {isDouble ? (
        /* Double roller: two side-by-side blinds */
        <div className="absolute inset-8 flex gap-3">
          {/* Center divider */}
          <div className="absolute top-8 bottom-16 left-1/2 -translate-x-1/2 w-0.5 bg-muted-foreground/40 z-10" />

          <SingleRoller
            fabricImage={selectedFabric?.image_url}
            fabricColor={selectedFabric?.color}
            fabricName={selectedFabric?.name}
            controlPosition="right"
            mountingType={mountingType}
            transparency={transparency}
            width={width / 2}
            height={height}
          />
          <SingleRoller
            fabricImage={selectedFabric2?.image_url}
            fabricColor={selectedFabric2?.color}
            fabricName={selectedFabric2 ? selectedFabric2.name : undefined}
            controlPosition="left"
            mountingType={mountingType}
            transparency={transparency}
            width={width / 2}
            height={height}
          />

          {/* "No Fabric 2" placeholder label */}
          {!selectedFabric2 && (
            <div className="absolute right-4 top-1 z-10">
              <Badge variant="outline" className="bg-background/80 text-xs text-muted-foreground">
                Roller 2 — select fabric
              </Badge>
            </div>
          )}
        </div>
      ) : (
        /* Single roller */
        <>
          {/* Mounting Brackets */}
          <div className={`absolute ${mountingType === 'inside' ? 'top-6' : 'top-2'} left-10 right-10 flex justify-between`}>
            <div className="w-6 h-8 bg-muted-foreground rounded-sm shadow-md" />
            <div className="w-6 h-8 bg-muted-foreground rounded-sm shadow-md" />
          </div>

          {/* Roller Tube */}
          <div className={`absolute ${mountingType === 'inside' ? 'top-10' : 'top-6'} left-12 right-12 h-5 bg-gradient-to-b from-muted-foreground to-muted-foreground/80 rounded-full shadow-lg`}>
            <div className="absolute -left-2 top-0 w-6 h-5 bg-foreground/80 rounded-l-full" />
            <div className="absolute -right-2 top-0 w-6 h-5 bg-foreground/80 rounded-r-full" />
          </div>

          {/* Fabric Panel */}
          <div
            className={`absolute ${mountingType === 'inside' ? 'top-14' : 'top-10'} left-14 right-14 ${!selectedFabric?.image_url ? 'bg-gradient-to-b from-gray-400 to-gray-500' : ''} rounded-sm shadow-xl transition-all`}
            style={{
              height: `${Math.min(height * 0.7, 250)}px`,
              maxHeight: '250px',
              ...(selectedFabric?.image_url
                ? { backgroundImage: `url(${selectedFabric.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'repeat' }
                : {}),
            }}
          >
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="w-full h-px bg-background" style={{ top: `${i * 10}%` }} />
              ))}
            </div>
            <div
              className={`absolute top-4 w-2 bg-foreground/70 rounded-full shadow-md ${
                controlPosition === 'left' ? 'left-4' : 'right-4'
              }`}
              style={{ height: 'calc(100% - 16px)' }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-foreground rounded-full" style={{ top: `${i * 12}%` }} />
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-b from-muted-foreground to-foreground rounded-b-sm shadow-md" />
          </div>

          {/* Window Frame */}
          <div className={`absolute ${mountingType === 'inside' ? 'top-16' : 'top-12'} left-16 right-16 bottom-12`}>
            <div className="w-full h-full border-4 border-muted-foreground bg-background/50 shadow-inner">
              <div className="grid grid-cols-2 grid-rows-2 h-full gap-2 p-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-gradient-to-br from-muted/30 to-muted/50 border border-border" />
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Information Badges */}
      <div className="absolute bottom-3 left-3 flex gap-2 flex-wrap">
        <Badge variant="outline" className="bg-background/90">
          {isDouble ? 'Double Roller Blind' : 'Roller Blind'}
        </Badge>
        {!isDouble && (
          <Badge variant="secondary" className="bg-background/90">
            {transparency.replace('_', ' ')}
          </Badge>
        )}
        <Badge variant="secondary" className="bg-background/90">
          Mount: {mountingType}
        </Badge>
      </div>

      {/* Fabric name (single mode) */}
      {!isDouble && selectedFabric && (
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

import { DynamicWindowRenderer } from "../window-types/DynamicWindowRenderer";

interface WallpaperVisualizerProps {
  measurements: {
    wall_width: number;
    wall_height: number;
  };
  wallpaper: {
    image_url?: string;
    name?: string;
    roll_width?: number;
    pattern_repeat?: number;
  };
  className?: string;
}

export const WallpaperVisualizer = ({ measurements, wallpaper, className = "" }: WallpaperVisualizerProps) => {
  const hasImage = wallpaper?.image_url;
  const patternWidth = wallpaper?.roll_width || 53; // Default 53cm roll width
  
  return (
    <div className={`relative min-h-[400px] bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Wall with wallpaper pattern */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div 
          className="relative w-full h-full max-w-3xl max-h-[500px] shadow-2xl"
          style={{
            aspectRatio: `${measurements.wall_width} / ${measurements.wall_height}`
          }}
        >
          {/* Wall surface */}
          <div 
            className="absolute inset-0 border-4 border-gray-300 rounded-sm"
            style={{
              backgroundColor: hasImage ? 'transparent' : '#f5f5f0',
              backgroundImage: hasImage ? `url(${wallpaper.image_url})` : 'none',
              backgroundSize: `${patternWidth * 2}px auto`,
              backgroundRepeat: 'repeat',
              backgroundPosition: 'center'
            }}
          />
          
          {/* Measurement indicators */}
          <div className="absolute -top-8 left-0 right-0 flex justify-center">
            <div className="bg-blue-600 text-white px-3 py-1 text-xs font-medium rounded shadow-md">
              Width: {measurements.wall_width}cm
            </div>
          </div>
          
          <div className="absolute -left-8 top-0 bottom-0 flex items-center">
            <div className="bg-green-600 text-white px-3 py-1 text-xs font-medium rounded shadow-md transform -rotate-90">
              Height: {measurements.wall_height}cm
            </div>
          </div>
          
          {/* Pattern repeat indicator */}
          {wallpaper?.pattern_repeat && wallpaper.pattern_repeat > 0 && (
            <div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 text-xs rounded shadow">
              Pattern Repeat: {wallpaper.pattern_repeat}cm
            </div>
          )}
        </div>
      </div>
      
      {/* Product name label */}
      {wallpaper?.name && (
        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-2 rounded shadow">
          <div className="text-sm font-medium">{wallpaper.name}</div>
        </div>
      )}
    </div>
  );
};

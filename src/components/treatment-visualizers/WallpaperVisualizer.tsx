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
    color?: string;
  };
  className?: string;
}

export const WallpaperVisualizer = ({ measurements, wallpaper, className = "" }: WallpaperVisualizerProps) => {
  const hasImage = wallpaper?.image_url;
  const patternWidth = wallpaper?.roll_width || 53; // Default 53cm roll width
  const wallpaperColor = wallpaper?.color || '#E8E4D9'; // Soft neutral default
  
  return (
    <div className={`relative min-h-[400px] bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 rounded-lg overflow-hidden ${className}`}>
      {/* Room perspective background */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        {/* Floor shadow */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-black/10 rounded-full blur-md" />
        
        <div 
          className="relative w-full h-full max-w-3xl max-h-[500px] shadow-2xl rounded-sm"
          style={{
            aspectRatio: `${measurements.wall_width} / ${measurements.wall_height}`
          }}
        >
          {/* Wall surface with wallpaper */}
          <div 
            className="absolute inset-0 border-4 border-stone-300 rounded-sm overflow-hidden"
            style={{
              backgroundColor: hasImage ? 'transparent' : wallpaperColor,
              backgroundImage: hasImage ? `url(${wallpaper.image_url})` : 'none',
              backgroundSize: `${patternWidth * 2}px auto`,
              backgroundRepeat: 'repeat',
              backgroundPosition: 'center'
            }}
          >
            {/* Subtle texture overlay when no image */}
            {!hasImage && (
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent ${patternWidth}px,
                    rgba(0,0,0,0.03) ${patternWidth}px,
                    rgba(0,0,0,0.03) ${patternWidth + 1}px
                  )`
                }}
              />
            )}
            
            {/* Light reflection effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 pointer-events-none" />
          </div>
          
          {/* Baseboard */}
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-b from-stone-200 to-stone-300 border-t-2 border-stone-400" />
          
          {/* Crown molding */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-stone-300 to-stone-200 border-b border-stone-400" />
          
          {/* Measurement indicators */}
          <div className="absolute -top-8 left-0 right-0 flex justify-center">
            <div className="bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded shadow-md">
              Width: {measurements.wall_width}cm
            </div>
          </div>
          
          <div className="absolute -left-8 top-0 bottom-0 flex items-center">
            <div className="bg-emerald-600 text-white px-3 py-1 text-xs font-medium rounded shadow-md transform -rotate-90 whitespace-nowrap">
              Height: {measurements.wall_height}cm
            </div>
          </div>
          
          {/* Pattern repeat indicator */}
          {wallpaper?.pattern_repeat && wallpaper.pattern_repeat > 0 && (
            <div className="absolute bottom-8 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 text-xs rounded shadow border">
              Pattern Repeat: {wallpaper.pattern_repeat}cm
            </div>
          )}
          
          {/* Roll width indicator */}
          <div className="absolute top-6 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 text-xs rounded shadow border">
            Roll Width: {patternWidth}cm
          </div>
        </div>
      </div>
      
      {/* Product name label */}
      {wallpaper?.name && (
        <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border">
          <div className="text-sm font-semibold text-foreground">{wallpaper.name}</div>
          <div className="text-xs text-muted-foreground">Wallpaper</div>
        </div>
      )}
      
      {/* Visual type indicator */}
      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow border">
        <div className="text-xs font-medium text-foreground flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: wallpaperColor }} />
          Wall Treatment
        </div>
      </div>
    </div>
  );
};

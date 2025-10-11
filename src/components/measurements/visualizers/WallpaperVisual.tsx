import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Ruler, Maximize2, Wallpaper as WallpaperIcon } from "lucide-react";

interface WallpaperVisualProps {
  measurements: Record<string, any>;
  selectedWallpaper?: any;
  onMeasurementChange: (field: string, value: string) => void;
  readOnly?: boolean;
}

export const WallpaperVisual = ({
  measurements,
  selectedWallpaper,
  onMeasurementChange,
  readOnly = false
}: WallpaperVisualProps) => {
  const wallWidth = parseFloat(measurements.wall_width) || 0;
  const wallHeight = parseFloat(measurements.wall_height) || 0;
  
  // Wallpaper specifications from inventory
  const rollWidth = selectedWallpaper?.wallpaper_roll_width || 53; // cm
  const rollLength = selectedWallpaper?.wallpaper_roll_length || 10; // meters
  const patternRepeat = selectedWallpaper?.pattern_repeat_vertical || 0; // cm
  const soldBy = selectedWallpaper?.wallpaper_sold_by || 'per_roll';
  
  // Check if we have measurements
  const hasMeasurements = wallWidth > 0 && wallHeight > 0;
  
  // Calculate wallpaper usage
  const calculation = useMemo(() => {
    if (!wallWidth || !wallHeight || !selectedWallpaper) return null;
    
    const widthInCm = wallWidth;
    const heightInM = wallHeight / 100; // Convert cm to meters
    const rollWidthInM = rollWidth / 100; // Convert cm to meters
    
    // Calculate number of strips needed (accounting for pattern repeat)
    const stripsNeeded = Math.ceil(widthInCm / rollWidth);
    
    // Calculate usable length per strip (accounting for pattern matching)
    let lengthPerStrip = heightInM;
    if (patternRepeat > 0) {
      const repeatInM = patternRepeat / 100;
      // Add one pattern repeat for matching at top of each strip
      lengthPerStrip = heightInM + repeatInM;
      // Round up to nearest pattern repeat
      lengthPerStrip = Math.ceil(lengthPerStrip / repeatInM) * repeatInM;
    }
    
    // Calculate how many strips can be cut from one roll
    const stripsPerRoll = Math.floor(rollLength / lengthPerStrip);
    
    // Calculate total rolls needed
    const rollsNeeded = Math.ceil(stripsNeeded / stripsPerRoll);
    
    // Calculate total area
    const wallArea = (widthInCm / 100) * (wallHeight / 100); // m²
    const coverage = rollsNeeded * rollLength * rollWidthInM; // m²
    const waste = coverage - wallArea;
    const wastePercentage = (waste / wallArea) * 100;
    
    return {
      stripsNeeded,
      rollsNeeded,
      lengthPerStrip: lengthPerStrip.toFixed(2),
      stripsPerRoll,
      wallArea: wallArea.toFixed(2),
      coverage: coverage.toFixed(2),
      waste: waste.toFixed(2),
      wastePercentage: wastePercentage.toFixed(1)
    };
  }, [wallWidth, wallHeight, rollWidth, rollLength, patternRepeat, selectedWallpaper]);
  
  // Create wallpaper pattern for visual
  const createWallpaperPattern = () => {
    if (!selectedWallpaper?.image_url) {
      // Default geometric pattern
      return (
        <pattern id="wallpaper-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="#e5e7eb" />
          <rect x="0" y="0" width="20" height="20" fill="#d1d5db" />
          <rect x="20" y="20" width="20" height="20" fill="#d1d5db" />
        </pattern>
      );
    }
    
    return (
      <pattern id="wallpaper-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <image href={selectedWallpaper.image_url} x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" />
      </pattern>
    );
  };
  
  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Wall Visual - Full width on mobile, left side on desktop */}
      <div className="flex-1 lg:w-3/5">
        <Card className="bg-muted/30 h-full overflow-hidden">
          {!hasMeasurements ? (
            // Empty state - brick wall with tools
            <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
              <svg 
                viewBox="0 0 400 320" 
                className="w-full max-w-lg"
                style={{ aspectRatio: '5/4' }}
              >
                <defs>
                  {/* Brick pattern */}
                  <pattern id="brick-pattern" x="0" y="0" width="80" height="40" patternUnits="userSpaceOnUse">
                    <rect width="80" height="40" fill="#d4a574" />
                    {/* Horizontal mortar */}
                    <rect y="0" width="80" height="2" fill="#9e9e9e" />
                    <rect y="40" width="80" height="2" fill="#9e9e9e" />
                    {/* Vertical mortar - offset pattern */}
                    <rect x="0" y="0" width="2" height="20" fill="#9e9e9e" />
                    <rect x="40" y="20" width="2" height="20" fill="#9e9e9e" />
                    <rect x="80" y="0" width="2" height="20" fill="#9e9e9e" />
                    {/* Individual bricks for texture */}
                    <rect x="2" y="2" width="36" height="18" fill="#c4956a" />
                    <rect x="42" y="22" width="36" height="18" fill="#c4956a" />
                  </pattern>
                </defs>
                
                {/* Background room */}
                <rect x="0" y="0" width="400" height="320" fill="#f3f4f6" />
                
                {/* Floor */}
                <rect x="0" y="280" width="400" height="40" fill="#8b7355" />
                <rect x="0" y="280" width="400" height="3" fill="#6b5945" />
                
                {/* Brick wall */}
                <rect 
                  x="50" 
                  y="40" 
                  width="300" 
                  height="240" 
                  fill="url(#brick-pattern)"
                  stroke="#7d7d7d" 
                  strokeWidth="2"
                />
                
                {/* Bucket on the left */}
                <ellipse cx="90" cy="270" rx="20" ry="8" fill="#c0c0c0" />
                <rect x="70" y="230" width="40" height="40" fill="#d0d0d0" rx="2" />
                <ellipse cx="90" cy="230" rx="20" ry="8" fill="#e0e0e0" />
                <rect x="75" y="235" width="30" height="25" fill="#87ceeb" opacity="0.6" />
                
                {/* Paste brush in bucket */}
                <rect x="85" y="215" width="4" height="20" fill="#8b4513" />
                <ellipse cx="87" cy="213" rx="6" ry="3" fill="#daa520" />
                
                {/* Smoothing tool on the right */}
                <rect x="310" y="250" width="50" height="25" fill="#ffd700" rx="2" />
                <rect x="315" y="255" width="40" height="15" fill="#ffed4e" />
                <rect x="355" y="257" width="10" height="11" fill="#8b4513" />
                
                {/* Measuring tape */}
                <ellipse cx="280" cy="270" rx="15" ry="15" fill="#ffeb3b" />
                <ellipse cx="280" cy="270" rx="12" ry="12" fill="#fdd835" />
                <rect x="278" y="260" width="4" height="8" fill="#333" />
                <line x1="280" y1="268" x2="295" y2="268" stroke="#333" strokeWidth="2" />
                
                {/* Text prompt */}
                <text x="200" y="150" textAnchor="middle" fill="#64748b" fontSize="16" fontWeight="600">
                  Ready to Wallpaper
                </text>
                <text x="200" y="175" textAnchor="middle" fill="#94a3b8" fontSize="12">
                  Enter wall measurements to begin
                </text>
              </svg>
            </div>
          ) : (
            // Show visual when measurements exist
            <div className="flex flex-col items-center justify-center">
              <svg 
                viewBox="0 0 400 320" 
                className="w-full max-w-md"
                style={{ aspectRatio: '5/4' }}
              >
                <defs>
                  {createWallpaperPattern()}
                  <linearGradient id="wall-shadow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(0,0,0,0.1)" />
                    <stop offset="50%" stopColor="rgba(0,0,0,0)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
                  </linearGradient>
                </defs>
                
                {/* Room perspective */}
                <rect x="0" y="0" width="400" height="320" fill="#f9fafb" />
                
                {/* Floor */}
                <rect x="0" y="280" width="400" height="40" fill="#d1d5db" />
                
                {/* Main wall - only show wallpaper if selected */}
                <rect 
                  x="50" 
                  y="40" 
                  width="300" 
                  height="240" 
                  fill={selectedWallpaper ? "url(#wallpaper-pattern)" : "#ffffff"}
                  stroke="#9ca3af" 
                  strokeWidth="2"
                />
                
                {/* Wall shadow for depth */}
                <rect x="50" y="40" width="300" height="240" fill="url(#wall-shadow)" opacity="0.3" />
                
                {/* Width measurement line */}
                <line x1="50" y1="25" x2="350" y2="25" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
                <text x="200" y="18" textAnchor="middle" fill="#3b82f6" fontSize="12" fontWeight="bold">
                  {wallWidth}cm
                </text>
                
                {/* Height measurement line */}
                <line x1="365" y1="40" x2="365" y2="280" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowhead-down)" markerStart="url(#arrowhead-up)" />
                <text x="380" y="160" textAnchor="start" fill="#3b82f6" fontSize="12" fontWeight="bold">
                  {wallHeight}cm
                </text>
                
                {/* Arrow markers */}
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                    <polygon points="0 0, 10 5, 0 10" fill="#3b82f6" />
                  </marker>
                  <marker id="arrowhead-start" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                    <polygon points="10 0, 0 5, 10 10" fill="#3b82f6" />
                  </marker>
                  <marker id="arrowhead-down" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                    <polygon points="0 0, 5 10, 10 0" fill="#3b82f6" />
                  </marker>
                  <marker id="arrowhead-up" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                    <polygon points="0 10, 5 0, 10 10" fill="#3b82f6" />
                  </marker>
                </defs>
                
                {/* Pattern repeat indicator (if applicable) */}
                {patternRepeat > 0 && selectedWallpaper && (
                  <>
                    <line x1="55" y1="40" x2="55" y2={40 + (patternRepeat * 240 / wallHeight)} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,4" />
                    <text x="60" y={40 + (patternRepeat * 240 / wallHeight) / 2} fill="#f59e0b" fontSize="10" fontWeight="bold">
                      {patternRepeat}cm repeat
                    </text>
                  </>
                )}
              </svg>
              
              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs">
                {selectedWallpaper && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border border-border" style={{ background: 'url(#wallpaper-pattern)' }}></div>
                    <span className="text-muted-foreground">Selected Wallpaper</span>
                  </div>
                )}
                {patternRepeat > 0 && selectedWallpaper && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-amber-500 border-dashed"></div>
                    <span className="text-muted-foreground">Pattern Repeat</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
      
      {/* Measurement Inputs & Results - Right side on desktop */}
      <div className="lg:w-2/5 flex-shrink-0 space-y-4">
        {/* Measurement Inputs */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            Wall Measurements
          </h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="wall_width">Wall Width (cm)</Label>
              <Input
                id="wall_width"
                type="number"
                value={measurements.wall_width || ""}
                onChange={(e) => onMeasurementChange("wall_width", e.target.value)}
                placeholder="300"
                disabled={readOnly}
              />
            </div>
            <div>
              <Label htmlFor="wall_height">Wall Height (cm)</Label>
              <Input
                id="wall_height"
                type="number"
                value={measurements.wall_height || ""}
                onChange={(e) => onMeasurementChange("wall_height", e.target.value)}
                placeholder="240"
                disabled={readOnly}
              />
            </div>
          </div>
        </Card>
        
        {/* Calculation Results */}
        {calculation && selectedWallpaper && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Maximize2 className="h-4 w-4" />
              Wallpaper Requirements
            </h3>
            
            <div className="space-y-3">
              {/* Roll specifications */}
              <div className="grid grid-cols-2 gap-2 text-sm pb-3 border-b">
                <div>
                  <span className="text-muted-foreground">Roll Size:</span>
                  <p className="font-medium">{rollWidth}cm × {rollLength}m</p>
                </div>
                {patternRepeat > 0 && (
                  <div>
                    <span className="text-muted-foreground">Pattern Repeat:</span>
                    <p className="font-medium">{patternRepeat}cm</p>
                  </div>
                )}
              </div>
              
              {/* Main calculation */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-muted-foreground">Strips Needed:</span>
                    <p className="text-lg font-bold">{calculation.stripsNeeded}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Length per Strip:</span>
                    <p className="font-medium">{calculation.lengthPerStrip}m</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-muted-foreground">Rolls Required:</span>
                    <p className="text-2xl font-bold text-primary">{calculation.rollsNeeded}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Strips per Roll:</span>
                    <p className="font-medium">{calculation.stripsPerRoll}</p>
                  </div>
                </div>
              </div>
              
              {/* Coverage details */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t text-xs">
                <div>
                  <span className="text-muted-foreground">Wall Area:</span>
                  <p className="font-medium">{calculation.wallArea} m²</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Coverage:</span>
                  <p className="font-medium">{calculation.coverage} m²</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Waste:</span>
                  <Badge variant="secondary" className="text-xs">
                    {calculation.wastePercentage}%
                  </Badge>
                </div>
              </div>
              
              {/* Selling method */}
              <div className="pt-2 border-t">
                <span className="text-xs text-muted-foreground">Sold by:</span>
                <Badge variant="outline" className="ml-2">
                  {soldBy === 'per_roll' ? 'Per Roll' : soldBy === 'per_sqm' ? 'Per m²' : 'Per Unit'}
                </Badge>
              </div>
            </div>
          </Card>
        )}
        
        {hasMeasurements && !selectedWallpaper && (
          <Card className="p-4 bg-muted/30">
            <p className="text-sm text-muted-foreground text-center">
              Select a wallpaper from inventory to see usage calculations
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
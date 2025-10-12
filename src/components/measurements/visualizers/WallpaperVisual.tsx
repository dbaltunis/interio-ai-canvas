import { useMemo, useState as useStateReact } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Ruler, Maximize2, Info, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [isExplanationOpen, setIsExplanationOpen] = useStateReact(false);
  const wallWidth = parseFloat(measurements.wall_width) || 0;
  const wallHeight = parseFloat(measurements.wall_height) || 0;
  
  // Wallpaper specifications from inventory
  const rollWidth = selectedWallpaper?.wallpaper_roll_width || 53; // cm
  const rollLength = selectedWallpaper?.wallpaper_roll_length || 10; // meters
  const patternRepeat = selectedWallpaper?.pattern_repeat_vertical || 0; // cm
  const matchType = selectedWallpaper?.wallpaper_match_type || 'straight';
  const wasteFactor = selectedWallpaper?.wallpaper_waste_factor || 10; // percentage
  
  // Check if we have measurements
  const hasMeasurements = wallWidth > 0 && wallHeight > 0;
  
  // Calculate wallpaper usage with CORRECTED logic
  const calculation = useMemo(() => {
    if (!wallWidth || !wallHeight || !selectedWallpaper) return null;
    
    const widthInCm = wallWidth;
    const heightInCm = wallHeight;
    
    // Calculate length per strip based on pattern matching
    let lengthPerStripCm = heightInCm;
    let patternRepeatsInStrip = 0;
    
    if (patternRepeat > 0 && matchType !== 'none' && matchType !== 'random') {
      // Add ONE pattern repeat for matching
      lengthPerStripCm = heightInCm + patternRepeat;
      patternRepeatsInStrip = Math.ceil(heightInCm / patternRepeat);
    }
    
    const lengthPerStripM = lengthPerStripCm / 100; // Convert to meters
    
    // Calculate how many strips we need for the wall width
    const stripsNeeded = Math.ceil(widthInCm / rollWidth);
    
    // Calculate how many strips we can get from one roll
    const stripsPerRoll = Math.floor(rollLength / lengthPerStripM);
    
    // Calculate number of rolls needed
    const rollsNeeded = stripsPerRoll > 0 ? Math.ceil(stripsNeeded / stripsPerRoll) : 0;
    
    // Calculate leftover material
    const totalStripsFromRolls = rollsNeeded * stripsPerRoll;
    const leftoverStrips = totalStripsFromRolls - stripsNeeded;
    const leftoverLengthM = leftoverStrips * lengthPerStripM;
    
    // Calculate realistic waste (not inflated by pattern matching)
    const actualWastePercentage = wasteFactor; // Use configured waste factor
    
    return {
      stripsNeeded,
      rollsNeeded,
      lengthPerStripM: lengthPerStripM.toFixed(2),
      lengthPerStripCm: lengthPerStripCm.toFixed(1),
      stripsPerRoll,
      leftoverStrips,
      leftoverLengthM: leftoverLengthM.toFixed(2),
      wastePercentage: actualWastePercentage,
      patternRepeatsInStrip,
      matchType
    };
  }, [wallWidth, wallHeight, rollWidth, rollLength, patternRepeat, matchType, wasteFactor, selectedWallpaper]);
  
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
                  <pattern id="brick-pattern" x="0" y="0" width="80" height="40" patternUnits="userSpaceOnUse">
                    <rect width="80" height="40" fill="#d4a574" />
                    <rect y="0" width="80" height="2" fill="#9e9e9e" />
                    <rect y="40" width="80" height="2" fill="#9e9e9e" />
                    <rect x="0" y="0" width="2" height="20" fill="#9e9e9e" />
                    <rect x="40" y="20" width="2" height="20" fill="#9e9e9e" />
                    <rect x="80" y="0" width="2" height="20" fill="#9e9e9e" />
                    <rect x="2" y="2" width="36" height="18" fill="#c4956a" />
                    <rect x="42" y="22" width="36" height="18" fill="#c4956a" />
                  </pattern>
                </defs>
                <rect x="0" y="0" width="400" height="320" fill="#f3f4f6" />
                <rect x="0" y="280" width="400" height="40" fill="#8b7355" />
                <rect x="0" y="280" width="400" height="3" fill="#6b5945" />
                <rect x="50" y="40" width="300" height="240" fill="url(#brick-pattern)" stroke="#7d7d7d" strokeWidth="2" />
                <ellipse cx="90" cy="270" rx="20" ry="8" fill="#c0c0c0" />
                <rect x="70" y="230" width="40" height="40" fill="#d0d0d0" rx="2" />
                <ellipse cx="90" cy="230" rx="20" ry="8" fill="#e0e0e0" />
                <rect x="75" y="235" width="30" height="25" fill="#87ceeb" opacity="0.6" />
                <rect x="85" y="215" width="4" height="20" fill="#8b4513" />
                <ellipse cx="87" cy="213" rx="6" ry="3" fill="#daa520" />
                <rect x="310" y="250" width="50" height="25" fill="#ffd700" rx="2" />
                <rect x="315" y="255" width="40" height="15" fill="#ffed4e" />
                <rect x="355" y="257" width="10" height="11" fill="#8b4513" />
                <ellipse cx="280" cy="270" rx="15" ry="15" fill="#ffeb3b" />
                <ellipse cx="280" cy="270" rx="12" ry="12" fill="#fdd835" />
                <rect x="278" y="260" width="4" height="8" fill="#333" />
                <line x1="280" y1="268" x2="295" y2="268" stroke="#333" strokeWidth="2" />
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
            <div className="flex flex-col items-center justify-center h-full w-full">
              <svg 
                viewBox="0 0 450 320" 
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  {createWallpaperPattern()}
                  <linearGradient id="wall-shadow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(0,0,0,0.1)" />
                    <stop offset="50%" stopColor="rgba(0,0,0,0)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
                  </linearGradient>
                </defs>
                <rect x="0" y="0" width="450" height="320" fill="#f9fafb" />
                <rect x="0" y="280" width="450" height="40" fill="#d1d5db" />
                <rect x="50" y="40" width="300" height="240" fill={selectedWallpaper ? "url(#wallpaper-pattern)" : "#ffffff"} stroke="#9ca3af" strokeWidth="2" />
                <rect x="50" y="40" width="300" height="240" fill="url(#wall-shadow)" opacity="0.3" />
                <line x1="50" y1="25" x2="350" y2="25" stroke="#3b82f6" strokeWidth="1.5" />
                <polygon points="50,25 56,22 56,28" fill="#3b82f6" />
                <polygon points="350,25 344,22 344,28" fill="#3b82f6" />
                <text x="200" y="18" textAnchor="middle" fill="#3b82f6" fontSize="12" fontWeight="bold">
                  {wallWidth}cm
                </text>
                <line x1="375" y1="40" x2="375" y2="280" stroke="#3b82f6" strokeWidth="1.5" />
                <polygon points="375,40 372,46 378,46" fill="#3b82f6" />
                <polygon points="375,280 372,274 378,274" fill="#3b82f6" />
                <text x="390" y="160" textAnchor="start" fill="#3b82f6" fontSize="12" fontWeight="bold">
                  {wallHeight}cm
                </text>
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
                placeholder="222"
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
                placeholder="111"
                disabled={readOnly}
              />
            </div>
          </div>
        </Card>
        
        {/* Calculation Results */}
        {calculation && selectedWallpaper && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Maximize2 className="h-4 w-4" />
                Wallpaper Requirements
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-2">
                        <p className="font-semibold">Calculation Flow:</p>
                        <ol className="list-decimal list-inside space-y-1 text-xs">
                          <li>Wall height → Strip length needed (height + pattern repeat)</li>
                          <li>Wall width ÷ Roll width → Number of strips</li>
                          <li>Strips × Strip length → Total meters needed</li>
                          {selectedWallpaper?.wallpaper_sold_by === 'per_roll' && (
                            <li>Total meters ÷ Roll length → Rolls required</li>
                          )}
                        </ol>
                        <p className="text-xs pt-1">Expand below for detailed breakdown.</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h3>
            </div>
            
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
                    <p className="font-medium">{patternRepeat}cm ({matchType})</p>
                  </div>
                )}
              </div>
              
              {/* Selling method indicator */}
              <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded text-xs">
                <p className="text-muted-foreground">
                  <strong>Sold {selectedWallpaper?.wallpaper_sold_by === 'per_roll' ? 'by roll' : selectedWallpaper?.wallpaper_sold_by === 'per_sqm' ? 'per m²' : 'per meter'}:</strong> 
                  {selectedWallpaper?.wallpaper_sold_by === 'per_roll' 
                    ? ' Calculating total meters needed, then converting to rolls.'
                    : ' Calculating total meters needed for direct ordering.'}
                </p>
              </div>
              
              {/* Main calculations with tooltips */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-muted-foreground">Strips Needed</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Wall width ({wallWidth}cm) ÷ Roll width ({rollWidth}cm) = {calculation.stripsNeeded} strips</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-2xl font-bold">{calculation.stripsNeeded}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-muted-foreground">Length per Strip</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div className="space-y-1">
                            <p className="font-semibold text-xs mb-1">Using entered wall height:</p>
                            <span className="block">• Wall height: {wallHeight}cm</span>
                            {patternRepeat > 0 && matchType !== 'none' && matchType !== 'random' && (
                              <>
                                <span className="block">• Pattern repeat: +{patternRepeat}cm</span>
                                <span className="block">• Pattern repeats in strip: {calculation.patternRepeatsInStrip}</span>
                              </>
                            )}
                            <span className="block font-semibold pt-1">= {calculation.lengthPerStripCm}cm ({calculation.lengthPerStripM}m)</span>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-2xl font-bold">{calculation.lengthPerStripM}m</p>
                  <p className="text-xs text-muted-foreground">({calculation.lengthPerStripCm}cm)</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-muted-foreground">
                      {selectedWallpaper?.wallpaper_sold_by === 'per_roll' ? 'Rolls Required' : 'Meters Required'}
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          {selectedWallpaper?.wallpaper_sold_by === 'per_roll' ? (
                            <div className="space-y-1">
                              <p className="font-semibold text-xs mb-1">From total meters to rolls:</p>
                              <p>Total meters: {calculation.stripsNeeded} strips × {Number(calculation.lengthPerStripM)}m = {(calculation.stripsNeeded * Number(calculation.lengthPerStripM)).toFixed(2)}m</p>
                              <p>Strips needed ({calculation.stripsNeeded}) ÷ Strips per roll ({calculation.stripsPerRoll}) = {calculation.rollsNeeded} rolls</p>
                            </div>
                          ) : (
                            <p>Total meters: {calculation.stripsNeeded} strips × {Number(calculation.lengthPerStripM)}m = {(calculation.stripsNeeded * Number(calculation.lengthPerStripM)).toFixed(2)}m</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {selectedWallpaper?.wallpaper_sold_by === 'per_roll' 
                      ? calculation.rollsNeeded 
                      : `${(calculation.stripsNeeded * Number(calculation.lengthPerStripM)).toFixed(2)}m`}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-muted-foreground">Strips per Roll</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Roll length ({rollLength}m = {rollLength * 100}cm) ÷ Strip length ({calculation.lengthPerStripCm}cm) = {calculation.stripsPerRoll} complete strips</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-2xl font-bold">{calculation.stripsPerRoll}</p>
                </div>
              </div>

              {/* Waste Factor */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">Recommended Waste Allowance</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Additional material recommended for cutting errors, pattern matching adjustments, and future repairs</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="text-lg font-bold text-primary">{calculation.wastePercentage}%</span>
                </div>
              </div>

              {/* Leftover Material */}
              {calculation.leftoverStrips > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium text-sm mb-2">Leftover Material from {calculation.rollsNeeded} Roll{calculation.rollsNeeded > 1 ? 's' : ''}</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Leftover Strips:</span>
                      <p className="font-semibold">{calculation.leftoverStrips}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Leftover Length:</span>
                      <p className="font-semibold">{calculation.leftoverLengthM}m</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Can be used for smaller walls or kept for future repairs
                  </p>
                </div>
              )}
            </div>

            {/* How Calculations Work - Expandable */}
            <Collapsible
              open={isExplanationOpen}
              onOpenChange={setIsExplanationOpen}
              className="mt-4 pt-4 border-t"
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center justify-between w-full p-0 hover:bg-transparent"
                >
                  <span className="text-sm font-medium">How wallpaper calculations work</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isExplanationOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-3 text-sm">
                <ol className="space-y-3 list-decimal list-inside">
                  <li className="text-sm">
                    <strong>1. How strips are calculated:</strong>
                    <p className="text-muted-foreground mt-1 ml-5">
                      Wall width ({wallWidth}cm) ÷ Roll width ({rollWidth}cm) = <strong>{calculation.stripsNeeded} vertical strips</strong>
                    </p>
                  </li>

                  <li className="text-sm">
                    <strong>2. Strip length calculation:</strong>
                    <p className="text-muted-foreground mt-1 ml-5">
                      • Base wall height: {wallHeight}cm<br/>
                      {patternRepeat > 0 && matchType !== 'none' && matchType !== 'random' ? (
                        <>
                          • Pattern matching type: <strong>{matchType}</strong><br/>
                          • Pattern repeat: {patternRepeat}cm<br/>
                          • We add <strong>ONE</strong> pattern repeat to the wall height for matching<br/>
                          • Strip length needed: <strong>{calculation.lengthPerStripCm}cm ({calculation.lengthPerStripM}m)</strong>
                        </>
                      ) : (
                        <>• No pattern matching needed<br/>• Strip length: <strong>{calculation.lengthPerStripCm}cm</strong></>
                      )}
                    </p>
                  </li>

                  {patternRepeat > 0 && matchType !== 'none' && matchType !== 'random' && (
                    <li className="text-sm">
                      <strong>3. Pattern matching explained:</strong>
                      <p className="text-muted-foreground mt-1 ml-5">
                        <strong>First strip:</strong> Starts from the ceiling with the pattern aligned to the top.
                      </p>
                      <p className="text-muted-foreground mt-1 ml-5">
                        <strong>Subsequent strips:</strong> Each strip is cut slightly longer ({calculation.lengthPerStripCm}cm instead of {wallHeight}cm) so you can slide it up or down to match the pattern perfectly with the previous strip. The extra material is trimmed off at top and bottom after matching.
                      </p>
                      <p className="text-muted-foreground mt-1 ml-5">
                        This {patternRepeat}cm extra per strip ensures seamless pattern continuity across your wall.
                      </p>
                    </li>
                  )}

                  <li className="text-sm">
                    <strong>{patternRepeat > 0 ? '4' : '3'}. Rolls calculation:</strong>
                    <p className="text-muted-foreground mt-1 ml-5">
                      • Roll length: {rollLength}m ({rollLength * 100}cm)<br/>
                      • Strips per roll: {rollLength * 100}cm ÷ {calculation.lengthPerStripCm}cm = <strong>{calculation.stripsPerRoll} complete strips</strong><br/>
                      • Rolls needed: {calculation.stripsNeeded} strips ÷ {calculation.stripsPerRoll} strips/roll = <strong>{calculation.rollsNeeded} roll{calculation.rollsNeeded > 1 ? 's' : ''}</strong>
                    </p>
                  </li>

                  <li className="text-sm">
                    <strong>{patternRepeat > 0 ? '5' : '4'}. Reusing leftovers for other walls:</strong>
                    <p className="text-muted-foreground mt-1 ml-5">
                      <strong>Yes, you can reuse leftover strips!</strong> You have {calculation.leftoverStrips} leftover strip{calculation.leftoverStrips > 1 ? 's' : ''} ({calculation.leftoverLengthM}m total).
                    </p>
                    <p className="text-muted-foreground mt-1 ml-5">
                      <strong>Requirements for reuse:</strong>
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-9">
                      <li>New wall must be ≤ {calculation.lengthPerStripCm}cm tall (your strip length)</li>
                      {patternRepeat > 0 && matchType !== 'none' && matchType !== 'random' && (
                        <li>For pattern matching: account for pattern alignment - you may need to trim extra at top/bottom</li>
                      )}
                      <li>Store strips flat and protected from moisture and sunlight</li>
                      <li>Match dye lot numbers when combining with new rolls</li>
                    </ul>
                  </li>

                  <li className="text-sm">
                    <strong className="text-primary">Pro Tip:</strong>
                    <p className="text-muted-foreground mt-1 ml-5">
                      The {calculation.wastePercentage}% waste allowance is already factored into your order recommendation. However, consider ordering one extra roll if:
                    </p>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-muted-foreground ml-9">
                      <li>This is your first time installing wallpaper</li>
                      <li>The wall has complex features (windows, doors, outlets)</li>
                      <li>You want material for future repairs (dye lots vary between batches)</li>
                    </ul>
                  </li>
                </ol>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}
      </div>
    </div>
  );
};

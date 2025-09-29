import { useMemo } from "react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { MeasurementData, TreatmentData, VisualConfig } from "./types";

interface MeasurementVisualCoreProps {
  measurements: MeasurementData;
  treatmentData?: TreatmentData;
  config?: VisualConfig;
  className?: string;
}

export const MeasurementVisualCore = ({
  measurements,
  treatmentData,
  config = {},
  className = ""
}: MeasurementVisualCoreProps) => {
  const { units } = useMeasurementUnits();

  // Extract values with fallbacks
  const curtainType = treatmentData?.template?.curtain_type || measurements.curtain_type || "pair";
  const curtainSide = measurements.curtain_side || "left";
  const hardwareType = treatmentData?.template?.compatible_hardware?.[0]?.toLowerCase() || measurements.hardware_type || "rod";
  const poolingOption = measurements.pooling_option || "above_floor";
  const poolingAmount = measurements.pooling_amount || "";
  const windowType = measurements.window_type || config.windowType || "standard";

  // Helper functions
  const hasValue = (value: any) => {
    return value && value !== "" && value !== "0" && parseFloat(value) > 0;
  };

  const displayValue = (value: any) => {
    if (!hasValue(value)) return "";
    const unitSymbol = units.length === 'cm' ? 'cm' : '"';
    return `${value}${unitSymbol}`;
  };

  const getCurtainBottomPosition = () => {
    if (poolingOption === "touching_floor") {
      return "bottom-4";
    } else if (poolingOption === "below_floor" && hasValue(poolingAmount)) {
      return "bottom-0";
    } else {
      return "bottom-12";
    }
  };

  const visualHeight = config.compact ? "min-h-[300px]" : "min-h-[400px]";

  const hardwareName = hardwareType === "track" ? "Track" : "Rod";

  return (
    <div className={`relative container-level-2 rounded-lg p-8 ${visualHeight} overflow-visible ${className}`}>
      {/* Hardware - Track/Rod */}
      {windowType === 'bay' ? (
        // Bay Window Hardware - Three angled sections
        <>
          {/* Left Angled Hardware */}
          <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} left-12 w-20 transform -skew-y-12 origin-bottom`}>
            {hardwareType === "track" ? (
              <div className="w-full h-3 bg-muted-foreground relative">
                <div className="absolute -left-1 -top-0.5 w-2 h-4 bg-foreground"></div>
              </div>
            ) : (
              <div className="w-full h-2 bg-muted-foreground rounded-full relative">
                <div className="absolute -left-2 -top-1 w-4 h-4 bg-foreground rounded-full"></div>
              </div>
            )}
          </div>
          
          {/* Center Hardware */}
          <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} left-30 right-30 flex items-center`}>
            {hardwareType === "track" ? (
              <div className="w-full h-3 bg-muted-foreground relative"></div>
            ) : (
              <div className="w-full h-2 bg-muted-foreground rounded-full relative"></div>
            )}
          </div>
          
          {/* Right Angled Hardware */}
          <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} right-12 w-20 transform skew-y-12 origin-bottom`}>
            {hardwareType === "track" ? (
              <div className="w-full h-3 bg-muted-foreground relative">
                <div className="absolute -right-1 -top-0.5 w-2 h-4 bg-foreground"></div>
              </div>
            ) : (
              <div className="w-full h-2 bg-muted-foreground rounded-full relative">
                <div className="absolute -right-2 -top-1 w-4 h-4 bg-foreground rounded-full"></div>
              </div>
            )}
          </div>
        </>
      ) : (
        // Standard Hardware
        <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} left-12 right-12 flex items-center`}>
          {hardwareType === "track" ? (
            <div className="w-full h-3 bg-muted-foreground relative">
              <div className="absolute -left-1 -top-0.5 w-2 h-4 bg-foreground"></div>
              <div className="absolute -right-1 -top-0.5 w-2 h-4 bg-foreground"></div>
            </div>
          ) : (
            <div className="w-full h-2 bg-muted-foreground rounded-full relative">
              <div className="absolute -left-2 -top-1 w-4 h-4 bg-foreground rounded-full"></div>
              <div className="absolute -right-2 -top-1 w-4 h-4 bg-foreground rounded-full"></div>
            </div>
          )}
        </div>
      )}

      {/* Window Frame */}
      {windowType === 'bay' ? (
        // Bay Window - Three angled sections
        <>
          {/* Left Angled Window */}
          <div className="absolute top-24 left-12 w-20 bottom-16 transform -skew-y-12 origin-bottom">
            <div className="w-full h-full border-4 border-muted-foreground bg-background relative">
              <div className="grid grid-cols-1 grid-rows-3 h-full gap-1 p-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-muted border border-border"></div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Center Window */}
          <div className="absolute top-20 left-32 right-32 bottom-20">
            <div className="w-full h-full border-4 border-muted-foreground bg-background relative">
              <div className="grid grid-cols-2 grid-rows-3 h-full gap-1 p-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-muted border border-border"></div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Angled Window */}
          <div className="absolute top-24 right-12 w-20 bottom-16 transform skew-y-12 origin-bottom">
            <div className="w-full h-full border-4 border-muted-foreground bg-background relative">
              <div className="grid grid-cols-1 grid-rows-3 h-full gap-1 p-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-muted border border-border"></div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        // Standard Window
        <div className="absolute top-24 left-16 right-16 bottom-16">
          <div className="w-full h-full border-4 border-muted-foreground bg-background relative">
            <div className="grid grid-cols-2 grid-rows-3 h-full gap-1 p-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-muted border border-border"></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Curtain Panels */}
      {curtainType === "pair" ? (
        <>
          {/* Left Panel */}
          <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} left-14 w-8 ${getCurtainBottomPosition()} bg-primary/80 rounded-sm shadow-lg`}>
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-foreground rounded-full"></div>
            <div className="absolute top-2 bottom-2 left-1 w-0.5 bg-primary/80"></div>
            <div className="absolute top-2 bottom-2 left-2 w-0.5 bg-primary/60"></div>
            <div className="absolute top-2 bottom-2 left-3 w-0.5 bg-primary/50"></div>
            <div className="absolute top-2 bottom-2 left-4 w-0.5 bg-primary/40"></div>
            <div className="absolute top-2 bottom-2 left-5 w-0.5 bg-primary/30"></div>
            <div className="absolute top-2 bottom-2 left-6 w-0.5 bg-primary/20"></div>
            
            {/* Pooling visual effect */}
            {poolingOption === "below_floor" && hasValue(poolingAmount) && (
              <div className="absolute -bottom-4 left-0 w-full h-4 bg-primary/60 rounded-b-lg"></div>
            )}
          </div>
          
          {/* Right Panel */}
          <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} right-14 w-8 ${getCurtainBottomPosition()} bg-primary/80 rounded-sm shadow-lg`}>
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-foreground rounded-full"></div>
            <div className="absolute top-2 bottom-2 left-1 w-0.5 bg-primary/80"></div>
            <div className="absolute top-2 bottom-2 left-2 w-0.5 bg-primary/60"></div>
            <div className="absolute top-2 bottom-2 left-3 w-0.5 bg-primary/50"></div>
            <div className="absolute top-2 bottom-2 left-4 w-0.5 bg-primary/40"></div>
            <div className="absolute top-2 bottom-2 left-5 w-0.5 bg-primary/30"></div>
            <div className="absolute top-2 bottom-2 left-6 w-0.5 bg-primary/20"></div>
            
            {/* Pooling visual effect */}
            {poolingOption === "below_floor" && hasValue(poolingAmount) && (
              <div className="absolute -bottom-4 left-0 w-full h-4 bg-primary/60 rounded-b-lg"></div>
            )}
          </div>
        </>
      ) : (
        // Single Panel
        <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} ${curtainSide === "right" ? "right-14" : "left-14"} w-16 ${getCurtainBottomPosition()} bg-primary/80 rounded-sm shadow-lg`}>
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-foreground rounded-full"></div>
          <div className="absolute top-2 bottom-2 left-1 w-0.5 bg-primary/80"></div>
          <div className="absolute top-2 bottom-2 left-3 w-0.5 bg-primary/60"></div>
          <div className="absolute top-2 bottom-2 left-5 w-0.5 bg-primary/50"></div>
          <div className="absolute top-2 bottom-2 left-7 w-0.5 bg-primary/40"></div>
          <div className="absolute top-2 bottom-2 left-9 w-0.5 bg-primary/30"></div>
          <div className="absolute top-2 bottom-2 left-11 w-0.5 bg-primary/20"></div>
          <div className="absolute top-2 bottom-2 left-13 w-0.5 bg-primary/10"></div>
          
          {/* Pooling visual effect */}
          {poolingOption === "below_floor" && hasValue(poolingAmount) && (
            <div className="absolute -bottom-4 left-0 w-full h-4 bg-primary/60 rounded-b-lg"></div>
          )}
        </div>
      )}

      {/* Rail Width Measurement - Top of curtain track/rod */}
      {hasValue(measurements.rail_width) && (
        <div className={`absolute ${hardwareType === "track" ? "-top-4" : "top-8"} left-12 right-12 flex items-center z-10`}>
          {/* Left arrow */}
          <div className="w-0 h-0 border-t-2 border-b-2 border-r-4 border-transparent border-r-blue-600"></div>
          {/* Measurement line */}
          <div className="flex-1 border-t-2 border-blue-600 relative">
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg z-20 whitespace-nowrap">
              {hardwareName} Width: {displayValue(measurements.rail_width)}
            </span>
          </div>
          {/* Right arrow */}
          <div className="w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-blue-600"></div>
        </div>
      )}

      {/* Drop Measurement - Height of curtain */}
      {hasValue(measurements.drop) && (
        <div className={`absolute right-0 ${hardwareType === "track" ? "top-6" : "top-18"} ${poolingOption === "below_floor" && hasValue(poolingAmount) ? "bottom-8" : getCurtainBottomPosition() === "bottom-4" ? "bottom-4" : "bottom-12"} flex flex-col items-center z-10`}>
          {/* Top arrow */}
          <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-green-600"></div>
          {/* Measurement line */}
          <div className="flex-1 border-r-2 border-green-600 relative">
            <span className="absolute top-1/2 -right-16 transform -translate-y-1/2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg whitespace-nowrap">
              Drop: {displayValue(measurements.drop)}
            </span>
          </div>
          {/* Bottom arrow */}
          <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-green-600"></div>
        </div>
      )}

      {/* Pooling Measurement - When curtains pool on floor */}
      {poolingOption === "below_floor" && hasValue(poolingAmount) && (
        <div className="absolute bottom-0 left-16 right-16 flex items-center z-10">
          {/* Left arrow */}
          <div className="w-0 h-0 border-t-2 border-b-2 border-r-4 border-transparent border-r-orange-600"></div>
          {/* Measurement line */}
          <div className="flex-1 border-t-2 border-orange-600 relative">
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-orange-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg z-20 whitespace-nowrap">
              Pooling: {displayValue(poolingAmount)}
            </span>
          </div>
          {/* Right arrow */}
          <div className="w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-orange-600"></div>
        </div>
      )}

      {/* Floor Line */}
      <div className="absolute bottom-4 left-8 right-8 border-t-4 border-muted-foreground">
        <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-base font-bold text-muted-foreground">
          Floor Line
        </span>
      </div>

      {/* Pooling Information */}
      {poolingOption !== "above_floor" && (
        <div className="absolute bottom-2 right-8">
          <div className="text-xs font-semibold bg-background px-2 py-1 rounded border shadow-sm">
            {poolingOption === "touching_floor" ? "Touching Floor" : 
             poolingOption === "below_floor" ? `Below Floor: ${displayValue(poolingAmount)}` : 
             "Above Floor"}
          </div>
        </div>
      )}
    </div>
  );
};
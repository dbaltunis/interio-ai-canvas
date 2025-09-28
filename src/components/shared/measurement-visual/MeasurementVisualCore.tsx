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

  return (
    <div className={`relative container-level-2 rounded-lg p-8 ${visualHeight} overflow-visible ${className}`}>
      {/* Ceiling Line */}
      <div className="absolute top-4 left-8 right-8 border-t-4 border-card-foreground">
        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-base font-bold text-card-foreground">
          Ceiling Line
        </span>
      </div>

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
              <div className="w-full h-3 bg-muted-foreground relative">
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-semibold">
                  Bay Curtain Track
                </span>
              </div>
            ) : (
              <div className="w-full h-2 bg-muted-foreground rounded-full relative">
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-semibold">
                  Bay Curtain Rod
                </span>
              </div>
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
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-semibold">
                Curtain Track
              </span>
            </div>
          ) : (
            <div className="w-full h-2 bg-muted-foreground rounded-full relative">
              <div className="absolute -left-2 -top-1 w-4 h-4 bg-foreground rounded-full"></div>
              <div className="absolute -right-2 -top-1 w-4 h-4 bg-foreground rounded-full"></div>
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-semibold">
                Curtain Rod
              </span>
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

      {/* Measurement Labels with Values */}
      {hasValue(measurements.rail_width) && (
        <div className="absolute top-20 left-12 right-12">
          <div className="flex justify-between items-center">
            <div className="text-xs font-semibold bg-background px-2 py-1 rounded border shadow-sm">
              Width: {displayValue(measurements.rail_width)}
            </div>
          </div>
          <div className="border-t-2 border-dashed border-muted-foreground mt-2"></div>
        </div>
      )}

      {hasValue(measurements.drop) && (
        <div className="absolute top-32 left-4 bottom-20 flex flex-col justify-center">
          <div className="transform -rotate-90 text-xs font-semibold bg-background px-2 py-1 rounded border shadow-sm whitespace-nowrap">
            Drop: {displayValue(measurements.drop)}
          </div>
          <div className="border-l-2 border-dashed border-muted-foreground ml-8 h-full"></div>
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
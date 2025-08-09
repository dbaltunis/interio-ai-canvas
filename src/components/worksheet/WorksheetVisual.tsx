import React from "react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface WorksheetVisualProps {
  measurements: Record<string, any>;
  windowType: string;
  selectedTemplate?: any;
}

export const WorksheetVisual: React.FC<WorksheetVisualProps> = ({
  measurements,
  windowType,
  selectedTemplate,
}) => {
  // Derive visual options similarly to VisualMeasurementSheet
  const curtainType = selectedTemplate?.curtain_type || measurements.curtain_type || "pair";
  const curtainSide = measurements.curtain_side || "left";
  const hardwareType = (selectedTemplate?.compatible_hardware?.[0]?.toLowerCase?.() || measurements.hardware_type || "rod") as
    | "rod"
    | "track";
  const poolingOption = measurements.pooling_option || "above_floor"; // above_floor | touching_floor | below_floor
  const poolingAmount = measurements.pooling_amount || "";

  const { units } = useMeasurementUnits();

  const hasValue = (value: any) => value !== undefined && value !== null && String(value) !== "" && String(value) !== "0" && !isNaN(Number(value)) && Number(value) > 0;
  const displayValue = (value: any) => (hasValue(value) ? `${value}${units.length === "cm" ? "cm" : '"'}` : "");

  const getCurtainBottomPosition = () => {
    if (poolingOption === "touching_floor") return "bottom-4";
    if (poolingOption === "below_floor" && hasValue(poolingAmount)) return "bottom-0";
    return "bottom-12"; // above floor (default)
  };

  return (
    <div className="relative bg-gradient-to-br from-blue-50 to-gray-50 border-2 border-gray-300 rounded-lg p-8 min-h-[400px] shadow-inner overflow-visible">
      {/* Title (kept subtle for snapshots) */}
      <span className="sr-only">{windowType} visual</span>

      {/* Ceiling Line */}
      <div className="absolute top-4 left-8 right-8 border-t-2 border-gray-800">
        <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm font-semibold">Ceiling Line</span>
      </div>

      {/* Hardware - Track (on ceiling) or Rod (below ceiling) */}
      <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} left-12 right-12 flex items-center`}>
        {hardwareType === "track" ? (
          <div className="w-full h-3 bg-gray-500 relative">
            <div className="absolute -left-1 -top-0.5 w-2 h-4 bg-gray-600"></div>
            <div className="absolute -right-1 -top-0.5 w-2 h-4 bg-gray-600"></div>
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-semibold">Curtain Track</span>
          </div>
        ) : (
          <div className="w-full h-2 bg-gray-600 rounded-full relative">
            <div className="absolute -left-2 -top-1 w-4 h-4 bg-gray-700 rounded-full"></div>
            <div className="absolute -right-2 -top-1 w-4 h-4 bg-gray-700 rounded-full"></div>
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-semibold">Curtain Rod</span>
          </div>
        )}
      </div>

      {/* Window Frame */}
      <div className="absolute top-24 left-16 right-16 bottom-16">
        <div className="w-full h-full border-4 border-gray-400 bg-white relative">
          {/* Window Panes */}
          <div className="grid grid-cols-2 grid-rows-3 h-full gap-1 p-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-100 border border-gray-300"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Curtain Panels - Dynamic */}
      {curtainType === "pair" ? (
        <>
          {/* Left Panel */}
          <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} left-14 w-8 ${getCurtainBottomPosition()} bg-red-500 opacity-80 rounded-sm shadow-lg`}>
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-800 rounded-full"></div>
            <div className="absolute top-2 bottom-2 left-1 w-0.5 bg-red-800 opacity-60"></div>
            <div className="absolute top-2 bottom-2 left-2 w-0.5 bg-red-700 opacity-40"></div>
            <div className="absolute top-2 bottom-2 left-3 w-0.5 bg-red-600 opacity-30"></div>
            <div className="absolute top-2 bottom-2 left-4 w-0.5 bg-red-500 opacity-25"></div>
            <div className="absolute top-2 bottom-2 left-5 w-0.5 bg-red-400 opacity-20"></div>
            <div className="absolute top-2 bottom-2 left-6 w-0.5 bg-red-300 opacity-15"></div>
            {poolingOption === "below_floor" && hasValue(poolingAmount) && (
              <div className="absolute -bottom-4 left-0 w-full h-4 bg-red-500 opacity-60 rounded-b-lg"></div>
            )}
          </div>
          {/* Right Panel */}
          <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} right-14 w-8 ${getCurtainBottomPosition()} bg-red-500 opacity-80 rounded-sm shadow-lg`}>
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-800 rounded-full"></div>
            <div className="absolute top-2 bottom-2 left-1 w-0.5 bg-red-800 opacity-60"></div>
            <div className="absolute top-2 bottom-2 left-2 w-0.5 bg-red-700 opacity-40"></div>
            <div className="absolute top-2 bottom-2 left-3 w-0.5 bg-red-600 opacity-30"></div>
            <div className="absolute top-2 bottom-2 left-4 w-0.5 bg-red-500 opacity-25"></div>
            <div className="absolute top-2 bottom-2 left-5 w-0.5 bg-red-400 opacity-20"></div>
            <div className="absolute top-2 bottom-2 left-6 w-0.5 bg-red-300 opacity-15"></div>
            {poolingOption === "below_floor" && hasValue(poolingAmount) && (
              <div className="absolute -bottom-4 left-0 w-full h-4 bg-red-500 opacity-60 rounded-b-lg"></div>
            )}
          </div>
        </>
      ) : (
        /* Single Panel */
        <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} ${curtainSide === "left" ? "left-14" : "right-14"} w-12 ${getCurtainBottomPosition()} bg-red-500 opacity-80 rounded-sm shadow-lg`}>
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-800 rounded-full"></div>
          <div className="absolute top-2 bottom-2 left-1 w-0.5 bg-red-800 opacity-60"></div>
          <div className="absolute top-2 bottom-2 left-2 w-0.5 bg-red-700 opacity-40"></div>
          <div className="absolute top-2 bottom-2 left-3 w-0.5 bg-red-600 opacity-30"></div>
          <div className="absolute top-2 bottom-2 left-4 w-0.5 bg-red-500 opacity-25"></div>
          <div className="absolute top-2 bottom-2 left-5 w-0.5 bg-red-400 opacity-20"></div>
          <div className="absolute top-2 bottom-2 left-6 w-0.5 bg-red-300 opacity-15"></div>
          <div className="absolute top-2 bottom-2 left-7 w-0.5 bg-red-200 opacity-10"></div>
          <div className="absolute top-2 bottom-2 left-8 w-0.5 bg-red-100 opacity-5"></div>
          {poolingOption === "below_floor" && hasValue(poolingAmount) && (
            <div className="absolute -bottom-4 left-0 w-full h-4 bg-red-500 opacity-60 rounded-b-lg"></div>
          )}
        </div>
      )}

      {/* Rail Width measurement */}
      {hasValue(measurements.rail_width) && (
        <div className={`absolute ${hardwareType === "track" ? "-top-4" : "top-8"} left-12 right-12 flex items-center z-20`}>
          <div className="w-0 h-0 border-t-2 border-b-2 border-r-4 border-transparent border-r-blue-600"></div>
          <div className="flex-1 border-t-2 border-blue-600 relative">
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg z-30 whitespace-nowrap">
              Rail Width: {displayValue(measurements.rail_width)}
            </span>
          </div>
          <div className="w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-blue-600"></div>
        </div>
      )}
      {!hasValue(measurements.rail_width) && (
        <div className={`absolute ${hardwareType === "track" ? "-top-4" : "top-8"} left-12 right-12 flex items-center opacity-50 z-20`}>
          <div className="flex-1 border-t-2 border-dashed border-gray-400 relative">
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-400 text-white px-2 py-1 rounded text-xs font-medium z-30 whitespace-nowrap">
              Enter Rail Width →
            </span>
          </div>
        </div>
      )}

      {/* Window Width (A) */}
      {hasValue(measurements.measurement_a) && (
        <div className="absolute top-16 left-16 right-16 flex items-center z-15">
          <div className="w-0 h-0 border-t-2 border-b-2 border-r-4 border-transparent border-r-green-600"></div>
          <div className="flex-1 border-t-2 border-green-600 relative">
            <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg z-30 whitespace-nowrap">
              A: {displayValue(measurements.measurement_a)}
            </span>
          </div>
          <div className="w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-green-600"></div>
        </div>
      )}

      {/* Drop */}
      {hasValue(measurements.drop) && (
        <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} left-2 flex flex-col items-center z-15`}>
          <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-primary"></div>
          <div className={`${hardwareType === "track" ? "h-72" : "h-64"} border-l-2 border-primary relative`}>
            <span className="absolute -left-20 top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-bold whitespace-nowrap shadow-lg z-30">
              Drop: {displayValue(measurements.drop)}
            </span>
          </div>
          <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-primary"></div>
        </div>
      )}
      {!hasValue(measurements.drop) && (
        <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} left-2 flex flex-col items-center opacity-50 z-15`}>
          <div className={`${hardwareType === "track" ? "h-72" : "h-64"} border-l-2 border-dashed border-gray-400 relative`}>
            <span className="absolute -left-20 top-1/2 transform -translate-y-1/2 bg-gray-400 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap z-30">
              Enter Drop Height ↓
            </span>
          </div>
        </div>
      )}

      {/* Window Height (B) */}
      {hasValue(measurements.measurement_b) && (
        <div className="absolute top-24 left-6 bottom-16 flex flex-col items-center z-15">
          <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-orange-600"></div>
          <div className="flex-1 border-l-2 border-orange-600 relative">
            <span className="absolute -left-16 top-1/2 transform -translate-y-1/2 bg-orange-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap shadow-lg z-30">
              B: {displayValue(measurements.measurement_b)}
            </span>
          </div>
          <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-orange-600"></div>
        </div>
      )}

      {/* Rod to Ceiling (C) - only for rod */}
      {hasValue(measurements.measurement_c) && hardwareType === "rod" && (
        <div className="absolute top-4 right-4 flex flex-col items-center">
          <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-red-600"></div>
          <div className="h-12 border-l-2 border-red-600 relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
              C: {displayValue(measurements.measurement_c)}
            </span>
          </div>
          <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-red-600"></div>
        </div>
      )}

      {/* Floor Line */}
      <div className="absolute bottom-4 left-8 right-8 border-t-2 border-gray-800">
        <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-sm font-semibold">Floor</span>
      </div>

      {/* Pooling indicator */}
      {poolingOption === "below_floor" && hasValue(poolingAmount) && (
        <div className="absolute bottom-0 left-6 flex flex-col items-center">
          <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-amber-600"></div>
          <div className="h-4 border-l-2 border-amber-600 relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-amber-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
              Pooling: {displayValue(poolingAmount)}
            </span>
          </div>
          <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-amber-600"></div>
        </div>
      )}

      {/* Window to Floor (D) */}
      {hasValue(measurements.measurement_d) && (
        <div className="absolute bottom-4 right-8 flex flex-col items-center">
          <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-indigo-600"></div>
          <div className="h-12 border-l-2 border-indigo-600 relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
              D: {displayValue(measurements.measurement_d)}
            </span>
          </div>
          <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-indigo-600"></div>
        </div>
      )}

      {/* Total Height (E) */}
      {hasValue(measurements.measurement_e) && (
        <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} right-0 bottom-4 flex flex-col items-center`}>
          <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-secondary"></div>
          <div className="flex-1 border-l-2 border-secondary relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
              E: {displayValue(measurements.measurement_e)}
            </span>
          </div>
          <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-secondary"></div>
        </div>
      )}

      {/* Total Width (F) */}
      {hasValue(measurements.measurement_f) && (
        <div className="absolute bottom-0 left-4 right-4 flex items-center">
          <div className="w-0 h-0 border-t-2 border-b-2 border-r-4 border-transparent border-r-teal-600"></div>
          <div className="flex-1 border-t-2 border-teal-600 relative">
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-teal-600 text-white px-2 py-1 rounded text-xs font-bold">
              F: {displayValue(measurements.measurement_f)}
            </span>
          </div>
          <div className="w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-teal-600"></div>
        </div>
      )}
    </div>
  );
};

export default WorksheetVisual;

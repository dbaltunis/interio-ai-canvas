
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCurtainTemplates } from "@/hooks/useCurtainTemplates";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { useMemo } from "react";
import { FabricSelectionSection } from "./dynamic-options/FabricSelectionSection";
import { LiningOptionsSection } from "./dynamic-options/LiningOptionsSection";
import { HeadingOptionsSection } from "./dynamic-options/HeadingOptionsSection";
import { calculateFabricUsage } from "../job-creation/treatment-pricing/fabric-calculation/fabricUsageCalculator";

interface VisualMeasurementSheetProps {
  measurements: Record<string, any>;
  onMeasurementChange: (field: string, value: string) => void;
  readOnly?: boolean;
  windowType: string;
  selectedTemplate?: any;
  selectedFabric?: string;
  onFabricChange?: (fabricId: string) => void;
  selectedLining?: string;
  onLiningChange?: (liningType: string) => void;
  selectedHeading?: string;
  onHeadingChange?: (headingId: string) => void;
}

export const VisualMeasurementSheet = ({ 
  measurements, 
  onMeasurementChange, 
  readOnly = false,
  windowType,
  selectedTemplate,
  selectedFabric,
  onFabricChange,
  selectedLining,
  onLiningChange,
  selectedHeading,
  onHeadingChange
}: VisualMeasurementSheetProps) => {
  const handleInputChange = (field: string, value: string) => {
    if (!readOnly) {
      console.log(`Changing ${field} to:`, value);
      onMeasurementChange(field, value);
    }
  };

  // Use template data if available, fallback to measurements
  const curtainType = selectedTemplate?.curtain_type || measurements.curtain_type || "pair";
  const curtainSide = measurements.curtain_side || "left";
  const hardwareType = selectedTemplate?.compatible_hardware?.[0]?.toLowerCase() || measurements.hardware_type || "rod";
  const poolingOption = measurements.pooling_option || "above_floor";
  const poolingAmount = measurements.pooling_amount || "";

  console.log("Current curtain type:", curtainType);
  console.log("Current curtain side:", curtainSide);
  console.log("Current hardware type:", hardwareType);
  console.log("Current pooling option:", poolingOption);
  console.log("Current pooling amount:", poolingAmount);

  const { data: curtainTemplates = [] } = useCurtainTemplates();
  const { units } = useMeasurementUnits();
  const { data: inventory = [] } = useEnhancedInventory();

  // Calculate fabric usage when measurements and fabric change
  const fabricCalculation = useMemo(() => {
    if (!selectedFabric || !measurements.rail_width || !measurements.drop || !selectedTemplate) {
      return null;
    }

    const selectedFabricItem = inventory.find(item => item.id === selectedFabric);
    if (!selectedFabricItem) {
      return null;
    }

    try {
      // Use the same calculation method as CostCalculationSummary for consistency
      const width = parseFloat(measurements.rail_width);
      const height = parseFloat(measurements.drop);
      const pooling = parseFloat(measurements.pooling_amount || "0");
      const returns = parseFloat(measurements.returns || "0");
      
      const fabricWidthCm = selectedFabricItem.fabric_width || 137; // Default fabric width
      
      // Include all manufacturing allowances from template settings
      const headerHem = selectedTemplate.header_allowance || 8;
      const bottomHem = selectedTemplate.bottom_hem || 8;
      const sideHems = selectedTemplate.side_hems || 0; // Manufacturing side hems (both sides)
      const seamHems = selectedTemplate.seam_hems || 0; // Manufacturing seam allowances
      const returnLeft = selectedTemplate.return_left || 0; // Manufacturing return left
      const returnRight = selectedTemplate.return_right || 0; // Manufacturing return right
      
      // Calculate required width with fullness multiplier
      const requiredWidth = width * selectedTemplate.fullness_ratio;
      
      // Add side hems to width calculation (for curtain pairs, each curtain needs side hems)
      const curtainCount = selectedTemplate.curtain_type === 'pair' ? 2 : 1;
      const totalSideHems = sideHems * 2 * curtainCount; // Both sides of each curtain
      
      // Calculate total width including returns and side hems
      const totalWidthWithAllowances = requiredWidth + returnLeft + returnRight + totalSideHems;
      
      // Calculate how many fabric widths are needed (including all width allowances)
      const widthsRequired = Math.ceil(totalWidthWithAllowances / fabricWidthCm);
      
      // Calculate seam allowances for joining fabric pieces (when multiple widths needed)
      const totalSeamAllowance = widthsRequired > 1 ? (widthsRequired - 1) * seamHems * 2 : 0; // Both sides of each seam
      
      // Include pooling and vertical allowances in the total drop calculation  
      const totalDrop = height + headerHem + bottomHem + pooling;
      const wasteMultiplier = 1 + ((selectedTemplate.waste_percent || 0) / 100);
      
      // Calculate linear metres needed (drop + seam allowances) × number of widths
      const linearMeters = ((totalDrop + totalSeamAllowance) / 100) * widthsRequired * wasteMultiplier; // Convert cm to m
      
      // Get price per meter from various possible fields
      const pricePerMeter = selectedFabricItem.price_per_meter || 
                           selectedFabricItem.unit_price || 
                           selectedFabricItem.selling_price || 
                           0;
      
       console.log('VisualMeasurementSheet fabric calculation with proper hems:', {
        width,
        height,
        pooling,
        requiredWidth,
        totalWidthWithAllowances,
        totalDrop,
        widthsRequired,
        linearMeters,
        pricePerMeter,
        fabricWidthCm,
        curtainCount,
        fullnessRatio: selectedTemplate.fullness_ratio,
        wastePercent: selectedTemplate.waste_percent,
        manufacturingAllowances: {
          headerHem,
          bottomHem,
          sideHems,
          seamHems,
          returnLeft,
          returnRight,
          totalSideHems,
          totalSeamAllowance
        }
      });

      return {
        linearMeters: linearMeters,
        totalCost: linearMeters * pricePerMeter,
        pricePerMeter: pricePerMeter,
        widthsRequired: widthsRequired,
        railWidth: width,
        fullnessRatio: selectedTemplate.fullness_ratio,
        drop: height,
        headerHem: headerHem,
        bottomHem: bottomHem,
        pooling: pooling,
        totalDrop: totalDrop,
        returns: returnLeft + returnRight,
        wastePercent: selectedTemplate.waste_percent || 0,
        sideHems: sideHems,
        seamHems: seamHems,
        totalSeamAllowance: totalSeamAllowance,
        totalSideHems: totalSideHems,
        returnLeft: returnLeft,
        returnRight: returnRight,
        curtainCount: curtainCount,
        curtainType: selectedTemplate.curtain_type,
        totalWidthWithAllowances: totalWidthWithAllowances
      };
    } catch (error) {
      console.error('Error calculating fabric usage:', error);
    }

    return null;
  }, [selectedFabric, measurements.rail_width, measurements.drop, selectedTemplate, inventory]);
  
  // Helper function to check if measurement has value
  const hasValue = (value: any) => {
    return value && value !== "" && value !== "0" && parseFloat(value) > 0;
  };

  // Helper function to display measurement values
  const displayValue = (value: any) => {
    if (!hasValue(value)) return "";
    const unitSymbol = units.length === 'cm' ? 'cm' : '"';
    return `${value}${unitSymbol}`;
  };

  // Calculate curtain bottom position based on pooling
  const getCurtainBottomPosition = () => {
    if (poolingOption === "touching_floor") {
      return "bottom-4"; // Touching floor
    } else if (poolingOption === "below_floor" && hasValue(poolingAmount)) {
      return "bottom-0"; // Below floor level
    } else {
      return "bottom-12"; // Above floor (default)
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">Window Measurement Worksheet</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Visual Diagram */}
          <div className="flex-1">
            <div className="relative bg-gray-50 border-2 border-gray-300 rounded-lg p-8 min-h-[400px]">
              {/* Ceiling Line */}
              <div className="absolute top-4 left-8 right-8 border-t-2 border-gray-800">
                <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm font-semibold">
                  Ceiling Line
                </span>
              </div>

              {/* Hardware - Track (on ceiling) or Rod (below ceiling) */}
              <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} left-12 right-12 flex items-center`}>
                {hardwareType === "track" ? (
                  <div className="w-full h-3 bg-gray-500 relative">
                    <div className="absolute -left-1 -top-0.5 w-2 h-4 bg-gray-600"></div>
                    <div className="absolute -right-1 -top-0.5 w-2 h-4 bg-gray-600"></div>
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-semibold">
                      Curtain Track
                    </span>
                  </div>
                ) : (
                  <div className="w-full h-2 bg-gray-600 rounded-full relative">
                    <div className="absolute -left-2 -top-1 w-4 h-4 bg-gray-700 rounded-full"></div>
                    <div className="absolute -right-2 -top-1 w-4 h-4 bg-gray-700 rounded-full"></div>
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-semibold">
                      Curtain Rod
                    </span>
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

              {/* Curtain Panels - Dynamic based on curtain type, hardware type, and pooling */}
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
                    
                    {/* Pooling visual effect */}
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
                    
                    {/* Pooling visual effect */}
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
                  
                  {/* Pooling visual effect */}
                  {poolingOption === "below_floor" && hasValue(poolingAmount) && (
                    <div className="absolute -bottom-4 left-0 w-full h-4 bg-red-500 opacity-60 rounded-b-lg"></div>
                  )}
                </div>
              )}

              {/* Rail Width measurement - positioned near the hardware */}
              {hasValue(measurements.rail_width) && (
                <div className={`absolute ${hardwareType === "track" ? "top-0" : "top-12"} left-12 right-12 flex items-center`}>
                  <div className="w-0 h-0 border-t-2 border-b-2 border-r-4 border-transparent border-r-blue-600"></div>
                  <div className="flex-1 border-t-2 border-blue-600 relative">
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                      Rail Width: {displayValue(measurements.rail_width)}
                    </span>
                  </div>
                  <div className="w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-blue-600"></div>
                </div>
              )}

              {/* Window Width Measurement (A) */}
              {hasValue(measurements.measurement_a) && (
                <div className="absolute top-20 left-16 right-16 flex items-center">
                  <div className="w-0 h-0 border-t-2 border-b-2 border-r-4 border-transparent border-r-green-600"></div>
                  <div className="flex-1 border-t-2 border-green-600 relative">
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                      A: {displayValue(measurements.measurement_a)}
                    </span>
                  </div>
                  <div className="w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-green-600"></div>
                </div>
              )}

              {/* Curtain Drop measurement - from hardware to bottom of curtain */}
              {hasValue(measurements.drop) && (
                <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} left-4 flex flex-col items-center`}>
                  <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-primary"></div>
                  <div className={`${hardwareType === "track" ? "h-72" : "h-64"} border-l-2 border-primary relative`}>
                    <span className="absolute -left-20 top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                      Drop: {displayValue(measurements.drop)}
                    </span>
                  </div>
                  <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-primary"></div>
                </div>
              )}

              {/* Window Height Measurement (B) */}
              {hasValue(measurements.measurement_b) && (
                <div className="absolute top-24 left-8 bottom-16 flex flex-col items-center">
                  <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-orange-600"></div>
                  <div className="flex-1 border-l-2 border-orange-600 relative">
                    <span className="absolute -left-16 top-1/2 transform -translate-y-1/2 bg-orange-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                      B: {displayValue(measurements.measurement_b)}
                    </span>
                  </div>
                  <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-orange-600"></div>
                </div>
              )}

              {/* Rod to Ceiling measurement (C) - only for rod, not track */}
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
                <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-sm font-semibold">
                  Floor
                </span>
              </div>

              {/* Pooling measurement indicator */}
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

              {/* Window to Floor measurement (D) */}
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

              {/* Total Height measurement (E) - from hardware to floor */}
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

              {/* Total Width measurement (F) - from extension to extension */}
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

            {/* Measurement Guide */}
            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <p><strong>A:</strong> Window Width (inside frame to inside frame)</p>
              <p><strong>B:</strong> Window Height (inside frame top to bottom)</p>
              {hardwareType === "rod" && (
                <p><strong>C:</strong> Distance from Rod to Ceiling</p>
              )}
              <p><strong>D:</strong> Distance from Window Bottom to Floor</p>
              <p><strong>E:</strong> Total Height from {hardwareType === "track" ? "Track" : "Rod"} to Floor</p>
              <p><strong>F:</strong> Total Width including {hardwareType === "track" ? "Track" : "Rod"} Extensions</p>
            </div>

            {/* Additional Measurements for Curtain Makers */}
            <div className="mt-4">
              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                  <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Additional Measurements (for Curtain Makers)
                  <span className="text-xs text-gray-500 ml-auto">Click to expand</span>
                </summary>
                <div className="mt-3 p-3 bg-gray-50/50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="rod_extension_left" className="text-xs font-medium text-gray-700">
                        Left Extension
                      </Label>
                      <Input
                        id="rod_extension_left"
                        type="number"
                        step="0.25"
                        value={measurements.rod_extension_left || ""}
                        onChange={(e) => handleInputChange("rod_extension_left", e.target.value)}
                        placeholder="8-10"
                        readOnly={readOnly}
                        className="h-8 text-sm"
                      />
                      <p className="text-xs text-gray-500">How far {hardwareType === "track" ? "track" : "rod"} extends left</p>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="rod_extension_right" className="text-xs font-medium text-gray-700">
                        Right Extension
                      </Label>
                      <Input
                        id="rod_extension_right"
                        type="number"
                        step="0.25"
                        value={measurements.rod_extension_right || ""}
                        onChange={(e) => handleInputChange("rod_extension_right", e.target.value)}
                        placeholder="8-10"
                        readOnly={readOnly}
                        className="h-8 text-sm"
                      />
                      <p className="text-xs text-gray-500">How far {hardwareType === "track" ? "track" : "rod"} extends right</p>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="panel_overlap" className="text-xs font-medium text-gray-700">
                        Panel Overlap
                      </Label>
                      <Input
                        id="panel_overlap"
                        type="number"
                        step="0.25"
                        value={measurements.panel_overlap || ""}
                        onChange={(e) => handleInputChange("panel_overlap", e.target.value)}
                        placeholder="2-3"
                        readOnly={readOnly}
                        className="h-8 text-sm"
                      />
                      <p className="text-xs text-gray-500">Overlap in center</p>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="floor_clearance" className="text-xs font-medium text-gray-700">
                        Floor Clearance
                      </Label>
                      <Input
                        id="floor_clearance"
                        type="number"
                        step="0.25"
                        value={measurements.floor_clearance || ""}
                        onChange={(e) => handleInputChange("floor_clearance", e.target.value)}
                        placeholder="0.5"
                        readOnly={readOnly}
                        className="h-8 text-sm"
                      />
                      <p className="text-xs text-gray-500">Gap from floor</p>
                    </div>
                  </div>
                </div>
              </details>
            </div>

            {/* Detailed Window Measurements */}
            <div className="mt-4 border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium mb-3">Detailed Window Measurements</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="measurement_a" className="text-sm font-medium">A - Window Width</Label>
                  <p className="text-xs text-gray-600 mb-1">Inside frame width</p>
                  <Input
                    id="measurement_a"
                    type="number"
                    step="0.25"
                    value={measurements.measurement_a || ""}
                    onChange={(e) => handleInputChange("measurement_a", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="measurement_b" className="text-sm font-medium">B - Window Height</Label>
                  <p className="text-xs text-gray-600 mb-1">Inside frame height</p>
                  <Input
                    id="measurement_b"
                    type="number"
                    step="0.25"
                    value={measurements.measurement_b || ""}
                    onChange={(e) => handleInputChange("measurement_b", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                  />
                </div>
                {hardwareType === "rod" && (
                  <div>
                    <Label htmlFor="measurement_c" className="text-sm font-medium">C - Rod to Ceiling</Label>
                    <p className="text-xs text-gray-600 mb-1">Distance from rod to ceiling</p>
                    <Input
                      id="measurement_c"
                      type="number"
                      step="0.25"
                      value={measurements.measurement_c || ""}
                      onChange={(e) => handleInputChange("measurement_c", e.target.value)}
                      placeholder="0.00"
                      readOnly={readOnly}
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="measurement_d" className="text-sm font-medium">D - Window to Floor</Label>
                  <p className="text-xs text-gray-600 mb-1">Distance from window bottom to floor</p>
                  <Input
                    id="measurement_d"
                    type="number"
                    step="0.25"
                    value={measurements.measurement_d || ""}
                    onChange={(e) => handleInputChange("measurement_d", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="measurement_e" className="text-sm font-medium">E - Total Height</Label>
                  <p className="text-xs text-gray-600 mb-1">{hardwareType === "track" ? "Track" : "Rod"} to floor total height</p>
                  <Input
                    id="measurement_e"
                    type="number"
                    step="0.25"
                    value={measurements.measurement_e || ""}
                    onChange={(e) => handleInputChange("measurement_e", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="measurement_f" className="text-sm font-medium">F - Total Width</Label>
                  <p className="text-xs text-gray-600 mb-1">Total width including extensions</p>
                  <Input
                    id="measurement_f"
                    type="number"
                    step="0.25"
                    value={measurements.measurement_f || ""}
                    onChange={(e) => handleInputChange("measurement_f", e.target.value)}
                    placeholder="0.00"
                    readOnly={readOnly}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Measurement Inputs */}
          <div className="flex-1 space-y-4">
            {/* Hardware Type */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium mb-3 text-gray-800">Hardware Type</h4>
              <RadioGroup 
                value={hardwareType} 
                onValueChange={(value) => handleInputChange("hardware_type", value)}
                disabled={readOnly}
                className="flex flex-row space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rod" id="rod" />
                  <Label htmlFor="rod">Rod</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="track" id="track" />
                  <Label htmlFor="track">Track</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Curtain Configuration - Compact Design */}
            <div className="border border-blue-200 rounded-lg p-3 bg-blue-50/30">
              <h4 className="font-medium text-blue-800 mb-3 text-sm">Curtain Configuration</h4>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-medium mb-1 block text-gray-700">Curtain Type</Label>
                  <RadioGroup 
                    value={curtainType} 
                    onValueChange={(value) => {
                      console.log("Curtain type changed to:", value);
                      handleInputChange("curtain_type", value);
                    }}
                    disabled={readOnly}
                    className="flex flex-row gap-4"
                  >
                    <div className="flex items-center space-x-1.5">
                      <RadioGroupItem value="pair" id="pair" className="w-4 h-4" />
                      <Label htmlFor="pair" className="text-sm">Pair (Two panels)</Label>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <RadioGroupItem value="single" id="single" className="w-4 h-4" />
                      <Label htmlFor="single" className="text-sm">Single (One panel)</Label>
                    </div>
                  </RadioGroup>
                </div>

                {curtainType === "single" && (
                  <div>
                    <Label className="text-xs font-medium mb-1 block text-gray-700">Panel Position</Label>
                    <RadioGroup 
                      value={curtainSide} 
                      onValueChange={(value) => {
                        console.log("Panel side changed to:", value);
                        handleInputChange("curtain_side", value);
                      }}
                      disabled={readOnly}
                      className="flex flex-row gap-4"
                    >
                      <div className="flex items-center space-x-1.5">
                        <RadioGroupItem value="left" id="left" className="w-4 h-4" />
                        <Label htmlFor="left" className="text-sm">Left side</Label>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <RadioGroupItem value="right" id="right" className="w-4 h-4" />
                        <Label htmlFor="right" className="text-sm">Right side</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </div>
            </div>

            {/* Main Measurements - Compact Design */}
            <div className="bg-white border-2 border-green-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21l3-3 9.5-9.5a1.5 1.5 0 000-2.121L18.379 5.257a1.5 1.5 0 00-2.121 0L6.5 14.5 7 21z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Essential Measurements</h4>
                  <p className="text-xs text-gray-500">Required for accurate calculations</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">W</span>
                    <Label htmlFor="rail_width" className="text-sm font-medium text-gray-900">
                      {hardwareType === "track" ? "Track" : "Rail"} Width
                    </Label>
                  </div>
                  <div className="relative">
                    <Input
                      id="rail_width"
                      type="number"
                      step="0.25"
                      value={measurements.rail_width || ""}
                      onChange={(e) => handleInputChange("rail_width", e.target.value)}
                      placeholder="0.00"
                      readOnly={readOnly}
                      className="pr-16 font-semibold text-center border-2 focus:border-blue-500"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                       {units.length}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Total {hardwareType === "track" ? "track" : "rail"} length</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs">H</span>
                    <Label htmlFor="drop" className="text-sm font-medium text-gray-900">
                      Curtain Drop
                    </Label>
                  </div>
                  <div className="relative">
                    <Input
                      id="drop"
                      type="number"
                      step="0.25"
                      value={measurements.drop || ""}
                      onChange={(e) => handleInputChange("drop", e.target.value)}
                      placeholder="0.00"
                      readOnly={readOnly}
                      className="pr-16 font-semibold text-center border-2 focus:border-primary"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                      {units.length}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Length to curtain bottom</p>
                </div>
              </div>
            </div>

            {/* Pooling Configuration - Collapsible */}
            <div className="space-y-2">
              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors">
                  <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Pooling Configuration
                  <span className="text-xs text-amber-600 ml-auto">Optional - Click to configure</span>
                </summary>
                <div className="mt-3 p-4 bg-amber-50/50 rounded-lg border border-amber-200">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Pooling Position</Label>
                      <RadioGroup 
                        value={poolingOption} 
                        onValueChange={(value) => {
                          console.log("Pooling option changed to:", value);
                          handleInputChange("pooling_option", value);
                          
                          // Set default pooling amount when "below_floor" is selected
                          if (value === "below_floor" && (!poolingAmount || poolingAmount === "0")) {
                            const defaultValue = units.system === "imperial" ? "1" : "2"; // 1 inch or 2 cm
                            handleInputChange("pooling_amount", defaultValue);
                          }
                          // Clear pooling amount when not below floor
                          if (value !== "below_floor") {
                            handleInputChange("pooling_amount", "");
                          }
                        }}
                        disabled={readOnly}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="above_floor" id="above_floor" />
                          <Label htmlFor="above_floor">Above floor (hanging)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="touching_floor" id="touching_floor" />
                          <Label htmlFor="touching_floor">Touching floor</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="below_floor" id="below_floor" />
                          <Label htmlFor="below_floor">Below floor (pooling)</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {poolingOption === "below_floor" && (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="pooling_amount" className="text-sm font-medium">Pooling Amount</Label>
                          <p className="text-xs text-gray-600 mb-1">How much fabric pools on the floor</p>
                          <Input
                            id="pooling_amount"
                            type="number"
                            step="0.25"
                            value={poolingAmount}
                            onChange={(e) => handleInputChange("pooling_amount", e.target.value)}
                            placeholder="2.00"
                            readOnly={readOnly}
                            className="font-semibold"
                          />
                        </div>
                        
                        {/* Fabric Usage Impact Indicator */}
                        {hasValue(poolingAmount) && selectedFabric && fabricCalculation && (
                          <div className="p-2 bg-amber-100/50 border border-amber-300 rounded text-xs">
                            <div className="font-medium text-amber-800 mb-1">
                              ✓ Pooling included in fabric calculation
                            </div>
                            <div className="text-amber-700 space-y-1">
                              <div>• Pooling amount: {displayValue(poolingAmount)} added to drop</div>
                              <div>• Extra fabric: ~{((parseFloat(poolingAmount) / 100) * fabricCalculation.widthsRequired).toFixed(2)}m</div>
                              <div>• Total fabric: {fabricCalculation.linearMeters.toFixed(2)}m (includes pooling)</div>
                            </div>
                          </div>
                        )}
                        
                        {hasValue(poolingAmount) && !selectedFabric && (
                          <div className="p-2 bg-amber-100/50 border border-amber-300 rounded text-xs">
                            <div className="text-amber-700">
                              💡 Select a fabric above to see how pooling affects fabric usage
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </details>
            </div>

            {/* Treatment Options - Compact Style */}
            {selectedTemplate && (
              <div className="space-y-3">
                {/* Fabric Selection - Compact */}
                <div className="bg-white border-2 border-purple-200 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center">
                      <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5H9a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">Fabric Selection</h4>
                      <p className="text-xs text-gray-500">Choose material</p>
                    </div>
                  </div>
                  <FabricSelectionSection
                    selectedFabric={selectedFabric || ""}
                    onFabricChange={onFabricChange || (() => {})}
                    readOnly={readOnly}
                    fabricCalculation={fabricCalculation}
                    onMeasurementChange={onMeasurementChange}
                  />
                </div>

                {/* Lining Options - Compact */}
                {selectedTemplate?.lining_types && selectedTemplate.lining_types.length > 0 && (
                  <div className="bg-white border-2 border-purple-200 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center">
                        <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">Lining Options</h4>
                        <p className="text-xs text-gray-500">Interior backing</p>
                      </div>
                    </div>
                    <LiningOptionsSection
                      template={selectedTemplate}
                      selectedLining={selectedLining || "none"}
                      onLiningChange={onLiningChange || (() => {})}
                      readOnly={readOnly}
                    />
                  </div>
                )}

                {/* Heading Options - Compact */}

                {/* Heading Options - Compact */}
                <div className="bg-white border-2 border-orange-200 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-orange-100 rounded-md flex items-center justify-center">
                      <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">Heading Style</h4>
                      <p className="text-xs text-gray-500">Top treatment</p>
                    </div>
                  </div>
                   <HeadingOptionsSection
                     template={selectedTemplate}
                     selectedHeading={selectedHeading || "standard"}
                     onHeadingChange={onHeadingChange || (() => {})}
                     readOnly={readOnly}
                   />
                </div>
              </div>
            )}


          </div>
        </div>
      </CardContent>
    </Card>
  );
};

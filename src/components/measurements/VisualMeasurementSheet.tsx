
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCurtainTemplates } from "@/hooks/useCurtainTemplates";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { useMemo, useEffect } from "react";
import { FabricSelectionSection } from "./dynamic-options/FabricSelectionSection";
import { LiningOptionsSection } from "./dynamic-options/LiningOptionsSection";
import { HeadingOptionsSection } from "./dynamic-options/HeadingOptionsSection";
import { calculateFabricUsage } from "../job-creation/treatment-pricing/fabric-calculation/fabricUsageCalculator";
import { TreatmentPreviewEngine } from "../treatment-visualizers/TreatmentPreviewEngine";

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
  onFabricCalculationChange?: (calculation: any) => void;
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
  onHeadingChange,
  onFabricCalculationChange
}: VisualMeasurementSheetProps) => {
  const handleInputChange = (field: string, value: string) => {
    if (!readOnly) {
      console.log(`🔧 VisualMeasurementSheet: Changing ${field} to:`, value);
      onMeasurementChange(field, value);
    }
  };

  // Debug measurements prop
  console.log("🎯 VisualMeasurementSheet received measurements:", measurements);
  console.log("🎯 Specific values - rail_width:", measurements.rail_width, "drop:", measurements.drop);

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
  console.log("🎯 Current measurement units from settings:", units);
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

  // Notify parent when fabric calculation changes
  useEffect(() => {
    if (onFabricCalculationChange) {
      onFabricCalculationChange(fabricCalculation);
    }
  }, [fabricCalculation, onFabricCalculationChange]);
  
  // Helper function to check if measurement has value
  const hasValue = (value: any) => {
    return value && value !== "" && value !== "0" && parseFloat(value) > 0;
  };

  // Helper function to display measurement values
  const displayValue = (value: any) => {
    if (!hasValue(value)) return "";
    const unitLabels: Record<string, string> = {
      'mm': 'mm',
      'cm': 'cm', 
      'm': 'm',
      'inches': '"',
      'feet': "'"
    };
    const unitSymbol = unitLabels[units.length] || units.length;
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
    <div className="w-full container-level-1 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="container-level-2 border-b-2 border-border px-6 py-4">
        <h2 className="text-2xl font-bold text-card-foreground text-center">Window Measurement Worksheet</h2>
      </div>
      <div className="p-2">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Visual Diagram - Always visible on large screens */}
          <div className="lg:w-1/2 lg:flex-shrink-0 lg:sticky lg:top-4 lg:h-fit lg:max-h-[calc(100vh-120px)] lg:overflow-visible">
            <div className="relative container-level-2 rounded-lg p-8 min-h-[400px] overflow-visible">

              {/* Hardware - Track/Rod that follows window shape */}
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
                  
                  {/* Center Hardware - Extended to connect seamlessly */}
                  <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} left-30 right-30 flex items-center`}>
                    {hardwareType === "track" ? (
                      <div className="w-full h-3 bg-muted-foreground relative">
                      </div>
                    ) : (
                      <div className="w-full h-2 bg-muted-foreground rounded-full relative">
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
                // Standard Hardware - Original design
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

              {/* Dynamic Window Frame - Changes shape based on selected window type */}
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
                  
                  {/* Center Window - Aligned with skewed side windows */}
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
                // Standard Window - Original design
                <div className="absolute top-24 left-16 right-16 bottom-16">
                  <div className="w-full h-full border-4 border-muted-foreground bg-background relative">
                    {/* Window Panes */}
                    <div className="grid grid-cols-2 grid-rows-3 h-full gap-1 p-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-muted border border-border"></div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Curtain Panels - Dynamic based on curtain type, hardware type, and pooling */}
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
                /* Single Panel */
                <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} ${curtainSide === "left" ? "left-14" : "right-14"} w-12 ${getCurtainBottomPosition()} bg-primary/80 rounded-sm shadow-lg`}>
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-foreground rounded-full"></div>
                  <div className="absolute top-2 bottom-2 left-1 w-0.5 bg-primary/80"></div>
                  <div className="absolute top-2 bottom-2 left-2 w-0.5 bg-primary/60"></div>
                  <div className="absolute top-2 bottom-2 left-3 w-0.5 bg-primary/50"></div>
                  <div className="absolute top-2 bottom-2 left-4 w-0.5 bg-primary/40"></div>
                  <div className="absolute top-2 bottom-2 left-5 w-0.5 bg-primary/30"></div>
                  <div className="absolute top-2 bottom-2 left-6 w-0.5 bg-primary/20"></div>
                  <div className="absolute top-2 bottom-2 left-7 w-0.5 bg-primary/15"></div>
                  <div className="absolute top-2 bottom-2 left-8 w-0.5 bg-primary/10"></div>
                  
                  {/* Pooling visual effect */}
                  {poolingOption === "below_floor" && hasValue(poolingAmount) && (
                    <div className="absolute -bottom-4 left-0 w-full h-4 bg-primary/60 rounded-b-lg"></div>
                  )}
                </div>
              )}

              {/* Rail Width measurement - positioned near the hardware */}
              {hasValue(measurements.rail_width) && (
                <div className={`absolute ${hardwareType === "track" ? "-top-4" : "top-8"} left-12 right-12 flex items-center z-10`}>
                  <div className="w-0 h-0 border-t-2 border-b-2 border-r-4 border-transparent border-r-blue-600"></div>
                  <div className="flex-1 border-t-2 border-blue-600 relative">
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg z-20 whitespace-nowrap">
                      {hardwareType === "track" ? "Track Width" : "Rod Width"}: {displayValue(measurements.rail_width)}
                    </span>
                  </div>
                  <div className="w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-blue-600"></div>
                </div>
              )}
              
              {/* Rail Width placeholder when empty */}
              {!hasValue(measurements.rail_width) && (
                <div className={`absolute ${hardwareType === "track" ? "-top-4" : "top-8"} left-12 right-12 flex items-center opacity-50 z-10`}>
                  <div className="flex-1 border-t-2 border-dashed border-muted-foreground relative">
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium z-20 whitespace-nowrap">
                      Enter Rail Width →
                    </span>
                  </div>
                </div>
              )}

              {/* Window Width Measurement (A) */}
              {hasValue(measurements.measurement_a) && (
                <div className="absolute top-16 left-16 right-16 flex items-center z-15">
                  <div className="w-0 h-0 border-t-2 border-b-2 border-r-4 border-transparent border-r-green-600"></div>
                  <div className="flex-1 border-t-2 border-green-600 relative">
                    <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-bold shadow-lg z-30 whitespace-nowrap">
                      A: {displayValue(measurements.measurement_a)}
                    </span>
                  </div>
                  <div className="w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-green-600"></div>
                </div>
              )}

              {/* Curtain Drop measurement - RIGHT SIDE from hardware to bottom of curtain */}
              {hasValue(measurements.drop) && (
                <div className={`absolute right-0 ${hardwareType === "track" ? "top-6" : "top-16"} ${poolingOption === "below_floor" && hasValue(poolingAmount) ? "bottom-8" : getCurtainBottomPosition() === "bottom-4" ? "bottom-4" : "bottom-12"} flex flex-col items-center z-20`}>
                  <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-green-600"></div>
                  <div className="flex-1 border-r-2 border-green-600 relative">
                     <span className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg whitespace-nowrap z-30">
                       Drop: {displayValue(measurements.drop)}
                     </span>
                  </div>
                  <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-green-600"></div>
                </div>
              )}
              
              {/* Drop placeholder when empty */}
              {!hasValue(measurements.drop) && (
                <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} left-2 flex flex-col items-center opacity-50 z-15`}>
                  <div className={`${hardwareType === "track" ? "h-72" : "h-64"} border-l-2 border-dashed border-muted-foreground relative`}>
                    <span className="absolute -left-20 top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium whitespace-nowrap z-30">
                      Enter Drop Height ↓
                    </span>
                  </div>
                </div>
              )}

              {/* Window Height Measurement (B) */}
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

              {/* Rod to Ceiling measurement (C) - only for rod, not track */}
              {hasValue(measurements.measurement_c) && hardwareType === "rod" && (
                <div className="absolute top-4 right-4 flex flex-col items-center">
                  <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-red-600"></div>
                  <div className="h-12 border-l-2 border-primary relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                      C: {displayValue(measurements.measurement_c)}
                    </span>
                  </div>
                  <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-red-600"></div>
                </div>
              )}

              {/* Floor Line */}
              <div className="absolute bottom-4 left-8 right-8 border-t-4 border-muted-foreground">
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-base font-bold text-muted-foreground">
                  Floor Line
                </span>
              </div>

              {/* Pooling measurement indicator - HORIZONTAL AT BOTTOM */}
              {poolingOption === "below_floor" && hasValue(poolingAmount) && (
                <div className="absolute bottom-0 left-16 right-16 flex items-center z-10">
                  <div className="w-0 h-0 border-t-2 border-b-2 border-r-4 border-transparent border-r-orange-600"></div>
                  <div className="flex-1 border-t-2 border-orange-600 relative">
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-orange-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg z-20 whitespace-nowrap">
                      Pooling: {displayValue(poolingAmount)}
                    </span>
                  </div>
                  <div className="w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-orange-600"></div>
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

            {/* Measurement Guide - More User-Friendly */}
            <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <h5 className="font-medium text-primary mb-2 text-sm">What to Measure</h5>
              <div className="text-sm text-foreground space-y-1">
                <p><strong>Width (W):</strong> {hardwareType === "track" ? "Track" : "Rail"} width - how wide your curtain needs to be</p>
                <p><strong>Drop (H):</strong> Height from {hardwareType === "track" ? "track" : "rod"} to where curtain should end</p>
                {hasValue(measurements.rail_width) && hasValue(measurements.drop) && (
                  <div className="mt-2 p-2 bg-secondary/20 border border-secondary/30 rounded text-foreground">
                    ✓ Great! These measurements will update the visual above as you type
                  </div>
                )}
              </div>
            </div>

            {/* Additional Measurements for Curtain Makers - Collapsible */}
            <div className="mt-4">
              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground hover:text-muted-foreground transition-colors p-2 bg-muted rounded border">
                  <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  More Details for Curtain Makers
                  <span className="text-xs text-muted-foreground ml-auto">Optional measurements - Click to expand</span>
                </summary>
                
                <div className="mt-3 space-y-4">
                  {/* Professional Extension Measurements */}
                  <div className="p-3 bg-muted/50 rounded-lg border border-border">
                    <h6 className="font-medium text-foreground mb-3 text-sm">Hardware Extensions & Overlaps</h6>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="rod_extension_left" className="text-xs font-medium text-foreground">
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
                        <p className="text-xs text-muted-foreground">How far {hardwareType === "track" ? "track" : "rod"} extends left</p>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="rod_extension_right" className="text-xs font-medium text-foreground">
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
                        <p className="text-xs text-muted-foreground">How far {hardwareType === "track" ? "track" : "rod"} extends right</p>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="panel_overlap" className="text-xs font-medium text-foreground">
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
                        <p className="text-xs text-muted-foreground">Overlap in center</p>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="floor_clearance" className="text-xs font-medium text-foreground">
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
                        <p className="text-xs text-muted-foreground">Gap from floor</p>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Window Frame Measurements - Now Collapsible */}
                  <div className="bg-amber-50/50 border border-amber-200 rounded-lg">
                    <details className="group">
                      <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors p-3">
                        <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Detailed Window Frame Measurements (A, B, C, D, E, F)
                        <span className="text-xs text-amber-600 ml-auto">Professional measurements - Click to expand</span>
                      </summary>
                      
                      <div className="p-3 border-t border-amber-200">
                        <div className="mb-3 text-xs text-amber-700 bg-amber-100/50 p-2 rounded">
                          <strong>Note:</strong> These detailed measurements are primarily used by curtain manufacturers. 
                          The main measurements above (Width & Drop) are usually sufficient for most projects.
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="measurement_a" className="text-sm font-medium flex items-center gap-2">
                              <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xs">A</span>
                              Window Width (Inside Frame)
                            </Label>
                            <p className="text-xs text-muted-foreground mb-1">Measure inside the window frame from side to side</p>
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
                            <Label htmlFor="measurement_b" className="text-sm font-medium flex items-center gap-2">
                              <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xs">B</span>
                              Window Height (Inside Frame)
                            </Label>
                            <p className="text-xs text-muted-foreground mb-1">Measure inside the window frame from top to bottom</p>
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
                              <Label htmlFor="measurement_c" className="text-sm font-medium flex items-center gap-2">
                                <span className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xs">C</span>
                                Rod to Ceiling Distance
                              </Label>
                              <p className="text-xs text-muted-foreground mb-1">Distance from curtain rod to ceiling</p>
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
                            <Label htmlFor="measurement_d" className="text-sm font-medium flex items-center gap-2">
                              <span className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">D</span>
                              Window Bottom to Floor
                            </Label>
                            <p className="text-xs text-muted-foreground mb-1">Distance from bottom of window to floor</p>
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
                            <Label htmlFor="measurement_e" className="text-sm font-medium flex items-center gap-2">
                              <span className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs">E</span>
                              Total Height ({hardwareType === "track" ? "Track" : "Rod"} to Floor)
                            </Label>
                            <p className="text-xs text-muted-foreground mb-1">Full height from {hardwareType === "track" ? "track" : "rod"} to floor</p>
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
                            <Label htmlFor="measurement_f" className="text-sm font-medium flex items-center gap-2">
                              <span className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-xs">F</span>
                              Total Width (Including Extensions)
                            </Label>
                            <p className="text-xs text-muted-foreground mb-1">Full width including {hardwareType === "track" ? "track" : "rod"} extensions</p>
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
                    </details>
                  </div>
                </div>
              </details>
            </div>
          </div>

          {/* Measurement Inputs - Fixed scroll behavior */}
          <div className="lg:w-1/2 lg:flex-shrink-0 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto lg:pr-2 space-y-4 scroll-smooth">
            {/* Hardware Type */}
            <div className="bg-muted/20 border border-border rounded-lg p-4">
              <h4 className="font-medium mb-3 text-foreground">Hardware Type</h4>
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

            {/* Curtain Configuration - Professional Design */}
            <div className="container-level-1 rounded-lg p-4">
              <h4 className="text-lg font-bold text-card-foreground mb-4">Curtain Configuration</h4>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-semibold mb-3 block text-card-foreground">Curtain Type</Label>
                  <RadioGroup 
                    value={curtainType} 
                    onValueChange={(value) => {
                      console.log("Curtain type changed to:", value);
                      handleInputChange("curtain_type", value);
                    }}
                    disabled={readOnly}
                    className="grid grid-cols-2 gap-3"
                  >
                    <div className="container-level-3 rounded-lg p-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="pair" id="pair" className="w-4 h-4" />
                        <Label htmlFor="pair" className="text-sm font-medium text-card-foreground cursor-pointer flex-1">Pair (Two panels)</Label>
                      </div>
                    </div>
                    <div className="container-level-3 rounded-lg p-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="single" id="single" className="w-4 h-4" />
                        <Label htmlFor="single" className="text-sm font-medium text-card-foreground cursor-pointer flex-1">Single (One panel)</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {curtainType === "single" && (
                  <div>
                    <Label className="text-sm font-semibold mb-3 block text-card-foreground">Panel Position</Label>
                    <RadioGroup 
                      value={curtainSide} 
                      onValueChange={(value) => {
                        console.log("Panel side changed to:", value);
                        handleInputChange("curtain_side", value);
                      }}
                      disabled={readOnly}
                      className="grid grid-cols-2 gap-3"
                    >
                      <div className="container-level-3 rounded-lg p-3 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="left" id="left" className="w-4 h-4" />
                          <Label htmlFor="left" className="text-sm font-medium text-card-foreground cursor-pointer flex-1">Left side</Label>
                        </div>
                      </div>
                      <div className="container-level-3 rounded-lg p-3 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="right" id="right" className="w-4 h-4" />
                          <Label htmlFor="right" className="text-sm font-medium text-card-foreground cursor-pointer flex-1">Right side</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </div>
            </div>

            {/* Main Measurements - Compact Design */}
            <div className="container-level-1 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21l3-3 9.5-9.5a1.5 1.5 0 000-2.121L18.379 5.257a1.5 1.5 0 00-2.121 0L6.5 14.5 7 21z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-card-foreground">Essential Measurements</h4>
                  <p className="text-sm text-card-foreground">Required for accurate calculations</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">W</span>
                    <Label htmlFor="rail_width" className="text-base font-bold text-card-foreground">
                      {hardwareType === "track" ? "Track" : "Rail"} Width
                    </Label>
                  </div>
                  <div className="relative">
                      <Input
                       id="rail_width"
                       type="number"
                       inputMode="decimal"
                       step="0.25"
                       value={measurements.rail_width || ""}
                       onChange={(e) => {
                         console.log("🔧 Rail width input change:", e.target.value, "Current measurements:", measurements);
                         handleInputChange("rail_width", e.target.value);
                       }}
                       onFocus={(e) => {
                         e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                       }}
                       placeholder="0.00"
                       readOnly={readOnly}
                       className="h-12 pr-16 text-lg font-bold text-center container-level-2 border-2 border-border focus:border-primary text-card-foreground"
                     />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-card-foreground font-semibold text-sm bg-muted px-2 py-1 rounded">
                       {units.length}
                    </span>
                  </div>
                  <p className="text-sm text-card-foreground font-medium">Total {hardwareType === "track" ? "track" : "rail"} length</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground font-bold text-sm">H</span>
                    <Label htmlFor="drop" className="text-base font-bold text-card-foreground">
                      Curtain Drop
                    </Label>
                  </div>
                  <div className="relative">
                      <Input
                       id="drop"
                       type="number"
                       inputMode="decimal"
                       step="0.25"
                       value={measurements.drop || ""}
                       onChange={(e) => {
                         console.log("🔧 Drop input change:", e.target.value, "Current measurements:", measurements);
                         handleInputChange("drop", e.target.value);
                       }}
                       onFocus={(e) => {
                         e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                       }}
                       placeholder="0.00"
                       readOnly={readOnly}
                       className="h-12 pr-16 text-lg font-bold text-center container-level-2 border-2 border-border focus:border-primary text-card-foreground"
                     />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-card-foreground font-semibold text-sm bg-muted px-2 py-1 rounded">
                      {units.length}
                    </span>
                  </div>
                  <p className="text-sm text-card-foreground font-medium">Length to curtain bottom</p>
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
                          <p className="text-xs text-muted-foreground mb-1">How much fabric pools on the floor</p>
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
                      <h4 className="font-semibold text-foreground text-sm">Fabric Selection</h4>
                      <p className="text-xs text-muted-foreground">Choose material</p>
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
                  <div className="container-level-2 border-2 border-purple-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-card-foreground text-base">Lining Options</h4>
                        <p className="text-sm text-card-foreground/70">Interior backing</p>
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
                <div className="container-level-2 border-2 border-orange-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-card-foreground text-base">Heading Style</h4>
                      <p className="text-sm text-card-foreground/70">Top treatment</p>
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
      </div>
    </div>
  );
};

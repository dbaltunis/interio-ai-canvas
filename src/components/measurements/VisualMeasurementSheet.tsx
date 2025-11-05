import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurtainTemplates } from "@/hooks/useCurtainTemplates";
import { Switch } from "@/components/ui/switch";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { useMemo, useEffect, useRef } from "react";
import { FabricSelectionSection } from "./dynamic-options/FabricSelectionSection";
import { LiningOptionsSection } from "./dynamic-options/LiningOptionsSection";
import { HeadingOptionsSection } from "./dynamic-options/HeadingOptionsSection";
import { DynamicCurtainOptions } from "./dynamic-options/DynamicCurtainOptions";
import { calculateFabricUsage } from "../job-creation/treatment-pricing/fabric-calculation/fabricUsageCalculator";
import { TreatmentPreviewEngine } from "../treatment-visualizers/TreatmentPreviewEngine";
import { detectTreatmentType, getTreatmentConfig } from "@/utils/treatmentTypeDetection";
import { DynamicRollerBlindFields } from "./roller-blind-fields/DynamicRollerBlindFields";
import { RollerBlindVisual } from "./visualizers/RollerBlindVisual";
import { DynamicBlindVisual } from "./visualizers/DynamicBlindVisual";
import { WallpaperVisual } from "./visualizers/WallpaperVisual";
import { singularToDbValue } from "@/types/treatmentCategories";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calculator, Ruler } from "lucide-react";
import { AdaptiveFabricPricingDisplay } from "./fabric-pricing/AdaptiveFabricPricingDisplay";
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
  selectedEyeletRing?: string;
  onEyeletRingChange?: (ringId: string) => void;
  onFabricCalculationChange?: (calculation: any) => void;
  treatmentCategory?: import("@/utils/treatmentTypeDetection").TreatmentCategory;
  selectedOptions?: Array<{
    name: string;
    price: number;
  }>;
  onSelectedOptionsChange?: (options: Array<{
    name: string;
    price: number;
  }>) => void;
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
  selectedEyeletRing,
  onEyeletRingChange,
  onFabricCalculationChange,
  treatmentCategory = 'curtains' as import("@/utils/treatmentTypeDetection").TreatmentCategory,
  selectedOptions = [],
  onSelectedOptionsChange
}: VisualMeasurementSheetProps) => {
  // Use ref to track latest options during batch initialization
  const selectedOptionsRef = useRef(selectedOptions);

  // Keep ref in sync with props
  useEffect(() => {
    selectedOptionsRef.current = selectedOptions;
  }, [selectedOptions]);

  // Detect treatment type - use treatmentCategory prop if provided, otherwise detect from template
  const treatmentType = treatmentCategory || detectTreatmentType(selectedTemplate);
  const treatmentConfig = getTreatmentConfig(treatmentType);
  console.log("🎯 VisualMeasurementSheet - Treatment Detection:", {
    treatmentCategory,
    detectedType: detectTreatmentType(selectedTemplate),
    finalTreatmentType: treatmentType,
    selectedTemplate: selectedTemplate?.name,
    curtainType: selectedTemplate?.curtain_type,
    hasConfig: !!treatmentConfig
  });

  // Handle invalid treatment config - render after hooks to avoid breaking Rules of Hooks
  if (!treatmentConfig) {
    console.error('❌ VisualMeasurementSheet: Invalid treatment type:', treatmentType);
    return <div className="p-4 text-destructive">Invalid treatment type: {treatmentType}</div>;
  }
  const handleInputChange = (field: string, value: string) => {
    if (!readOnly) {
      console.log(`🔥🔥🔥 LEVEL 0: VisualMeasurementSheet handleInputChange:`, { field, value });
      onMeasurementChange(field, value);
    } else {
      console.log(`⚠️ VisualMeasurementSheet: Ignored change (readOnly):`, { field, value });
    }
  };

  // Handle option price changes from dynamic fields
  const handleOptionPriceChange = (optionKey: string, price: number, label: string, pricingMethod?: string, pricingGridData?: any) => {
    if (onSelectedOptionsChange) {
      // Use ref to get current state, update it, and set new state
      const currentOptions = selectedOptionsRef.current;
      const filteredOptions = currentOptions.filter(opt => !opt.name.startsWith(optionKey + ':'));
      const newOption = {
        name: `${optionKey}: ${label}`,
        price,
        pricingMethod: pricingMethod || 'fixed',
        optionKey,
        pricingGridData
      };
      const updatedOptions = [...filteredOptions, newOption];
      console.log(`🎯 handleOptionPriceChange - ${optionKey}:`, {
        currentOptions,
        newOption,
        pricingMethod,
        hasPricingGridData: !!pricingGridData,
        updatedOptions
      });

      // Update ref immediately for next call in the same batch
      selectedOptionsRef.current = updatedOptions;
      // Update state
      onSelectedOptionsChange(updatedOptions);
    }
  };

  // Debug measurements prop
  console.log("🎯 VisualMeasurementSheet received measurements:", measurements);
  console.log("🎯 Specific values - rail_width:", measurements.rail_width, "drop:", measurements.drop);

  // Use measurements as the source of truth for UI state, with fallbacks to template defaults
  // Default to "pair" if no curtain type is specified
  const curtainType = measurements.curtain_type || (selectedTemplate as any)?.panel_configuration || selectedTemplate?.curtain_type || "pair";
  const curtainSide = measurements.curtain_side || "left";
  const hardwareType = selectedTemplate?.compatible_hardware?.[0]?.toLowerCase() || measurements.hardware_type || "rod";
  const poolingOption = measurements.pooling_option || "above_floor";
  const poolingAmount = measurements.pooling_amount || "";
  console.log("Current curtain type:", curtainType);
  console.log("Current curtain side:", curtainSide);
  console.log("Current hardware type:", hardwareType);
  console.log("Current pooling option:", poolingOption);
  console.log("Current pooling amount:", poolingAmount);
  const {
    data: curtainTemplates = []
  } = useCurtainTemplates();
  const {
    units
  } = useMeasurementUnits();
  console.log("🎯 Current measurement units from settings:", units);
  const {
    data: inventory = []
  } = useEnhancedInventory();

  // Get selected fabric details for visualization
  const selectedFabricItem = selectedFabric ? inventory.find((item: any) => item.id === selectedFabric) : undefined;
  const fabricImageUrl = selectedFabricItem?.image_url ? selectedFabricItem.image_url.startsWith('http') ? selectedFabricItem.image_url : supabase.storage.from('business-assets').getPublicUrl(selectedFabricItem.image_url).data?.publicUrl : undefined;
  const fabricColor = selectedFabricItem?.color || 'hsl(var(--primary))';
  console.log("🎨 Fabric visualization data:", {
    selectedFabricItem,
    fabricImageUrl,
    fabricColor
  });

  // Auto-set curtain type to "pair" if not already set
  useEffect(() => {
    if (!measurements.curtain_type && !readOnly) {
      handleInputChange("curtain_type", "pair");
    }
  }, []);

  // Auto-set fabric rotation based on fabric width when fabric is first selected
  useEffect(() => {
    if (selectedFabricItem && measurements.fabric_rotated === undefined && !readOnly) {
      const fabricWidthCm = selectedFabricItem.fabric_width || 137;
      const isWideFabric = fabricWidthCm >= 250;
      // Wide fabrics (≥250cm) default to horizontal/railroaded (true)
      // Narrow fabrics (<250cm) default to vertical/standard (false)
      handleInputChange("fabric_rotated", isWideFabric.toString());
    }
  }, [selectedFabricItem]);

  // Calculate fabric usage when measurements and fabric change
  const fabricCalculation = useMemo(() => {
    console.log('🔥🔥🔥 LEVEL 3: fabricCalculation useMemo TRIGGERED', {
      selectedFabric,
      rail_width: measurements.rail_width,
      drop: measurements.drop,
      curtain_type: measurements.curtain_type,
      fabric_rotated: measurements.fabric_rotated,
      selected_pricing_method: measurements.selected_pricing_method,
      manufacturing_type: measurements.manufacturing_type,
      selected_heading: measurements.selected_heading,
      heading_fullness: measurements.heading_fullness,
      selected_lining: measurements.selected_lining,
    });
    
    if (!selectedFabric || !measurements.rail_width || !measurements.drop || !selectedTemplate) {
      console.log('⚠️ LEVEL 3: Missing required data for fabric calculation');
      return null;
    }
    const selectedFabricItem = inventory.find(item => item.id === selectedFabric);
    if (!selectedFabricItem) {
      return null;
    }
    try {
      // ✅ FIX: Enrich measurements with template settings and selected fabric data
      const enrichedMeasurements = {
        ...measurements,
        treatment_type_id: selectedTemplate.id,
        // Add template hems if not in measurements
        header_hem: measurements.header_hem || selectedTemplate.header_allowance || selectedTemplate.header_hem,
        bottom_hem: measurements.bottom_hem || selectedTemplate.bottom_hem || selectedTemplate.bottom_allowance,
        side_hem: measurements.side_hem || selectedTemplate.side_hem || selectedTemplate.side_hems,
        seam_hem: measurements.seam_hem || selectedTemplate.seam_allowance,
        // Add fabric properties
        fabric_width: selectedFabricItem.fabric_width,
        // Add pattern repeats from selected fabric
        pattern_repeat_vertical: selectedFabricItem.pattern_repeat_vertical,
        pattern_repeat_horizontal: selectedFabricItem.pattern_repeat_horizontal,
        // ✅ FIX: Add fullness from selected heading if available
        heading_fullness: measurements.heading_fullness || selectedTemplate.default_fullness,
        selected_heading: measurements.selected_heading,
        // Fabric rotation setting
        fabric_rotated: measurements.fabric_rotated === true || measurements.fabric_rotated === 'true',
      };
      
      // ✅ FIX: Pass heading inventory so calculator can look up fullness_ratio
      const headingInventory = inventory.filter(item => 
        item.category === 'heading' || 
        item.subcategory === 'heading' ||
        item.category === 'hardware' // Some headings might be in hardware category
      );
      
      const fabricItemWithHeadings = {
        ...selectedFabricItem,
        headingOptions: headingInventory
      };
      
      console.log('🎯 Enriched measurements before calculation:', {
        original: measurements,
        enriched: enrichedMeasurements,
        selectedFabric: selectedFabricItem.name,
        selectedHeading: measurements.selected_heading,
        headingInventoryCount: headingInventory.length,
        headingSample: headingInventory[0],
        templateHems: {
          header: selectedTemplate.header_allowance,
          bottom: selectedTemplate.bottom_hem,
          side: selectedTemplate.side_hem
        },
        fabricWidth: selectedFabricItem.fabric_width,
        patternRepeats: {
          vertical: selectedFabricItem.pattern_repeat_vertical,
          horizontal: selectedFabricItem.pattern_repeat_horizontal
        }
      });
      
      // Use the unified calculateFabricUsage function that handles both curtains AND blinds
      const result = calculateFabricUsage(
        enrichedMeasurements,
        [selectedTemplate],
        fabricItemWithHeadings
      );

      // Transform the result to match the expected format for display
      const width = parseFloat(measurements.rail_width);
      const height = parseFloat(measurements.drop);
      const pooling = parseFloat(measurements.pooling_amount || "0");
      const fabricWidthCm = selectedFabricItem.fabric_width || 137;
      
      // ✅ FIX: Read hems from measurements (which get initialized from template)
      const headerHem = parseFloat(enrichedMeasurements.header_hem as any) || 8;
      const bottomHem = parseFloat(enrichedMeasurements.bottom_hem as any) || 8;
      const sideHems = parseFloat(enrichedMeasurements.side_hem as any) || 0;
      const seamHems = parseFloat(enrichedMeasurements.seam_hem as any) || 0;
      // ✅ Returns should come from template (user confirmed this is correct)
      const returnLeft = selectedTemplate.return_left || 0;
      const returnRight = selectedTemplate.return_right || 0;
      
      const panelConfig = measurements.curtain_type || (selectedTemplate as any).panel_configuration || selectedTemplate.curtain_type;
      const curtainCount = panelConfig === 'pair' ? 2 : 1;
      const totalSideHems = sideHems * 2 * curtainCount;
      const totalDrop = height + headerHem + bottomHem + pooling;
      
      const pricePerMeter = selectedFabricItem.price_per_meter || selectedFabricItem.selling_price || 0;
      const fabricRotated = measurements.fabric_rotated === true || measurements.fabric_rotated === 'true';
      
      console.log('VisualMeasurementSheet using unified fabric calculator:', {
        treatmentCategory: selectedTemplate.treatment_category,
        isBlind: /blind/i.test(selectedTemplate.treatment_category || ''),
        result,
        measurements: { width, height, pooling }
      });

      const calculatedTotalCost = result.details?.sqm ? (result.details.sqm * pricePerMeter) : (result.meters * pricePerMeter);
      
      console.log('📊 VisualMeasurementSheet fabricCalculation:', {
        hasBlindData: !!result.details?.sqm,
        sqm: result.details?.sqm,
        linearMeters: result.meters,
        pricePerMeter,
        calculatedTotalCost,
        formula: result.details?.sqm 
          ? `${result.details.sqm.toFixed(2)} sqm × £${pricePerMeter.toFixed(2)} = £${calculatedTotalCost.toFixed(2)}`
          : `${result.meters.toFixed(2)} m × £${pricePerMeter.toFixed(2)} = £${calculatedTotalCost.toFixed(2)}`
      });
      
      const fabricCalcResult = {
        linearMeters: result.meters,
        totalCost: calculatedTotalCost,
        pricePerMeter: pricePerMeter,
        widthsRequired: result.widthsRequired || 1,
        railWidth: width,
        // ✅ FIX: Use dynamic heading_fullness from measurements instead of static template value
        fullnessRatio: parseFloat(enrichedMeasurements.heading_fullness as any) || selectedTemplate.fullness_ratio || 2.0,
        drop: height,
        headerHem: headerHem,
        bottomHem: bottomHem,
        pooling: pooling,
        totalDrop: totalDrop,
        returns: returnLeft + returnRight,
        wastePercent: selectedTemplate.waste_percent || 0,
        sideHems: sideHems,
        seamHems: seamHems,
        totalSeamAllowance: result.seamLaborHours || 0,
        totalSideHems: totalSideHems,
        returnLeft: returnLeft,
        returnRight: returnRight,
        curtainCount: curtainCount,
        curtainType: panelConfig,
        fabricRotated: fabricRotated,
        fabricOrientation: result.fabricOrientation || 'vertical',
        // Add blind-specific data if available
        sqm: result.details?.sqm,
        widthCalcNote: result.details?.widthCalcNote,
        heightCalcNote: result.details?.heightCalcNote
      };
      
      console.log('🎯 VisualMeasurementSheet FINAL fabricCalculation:', fabricCalcResult);
      
      return fabricCalcResult;
    } catch (error) {
      console.error('Error calculating fabric usage:', error);
    }
    return null;
  }, [
    selectedFabric, 
    measurements.rail_width, 
    measurements.drop, 
    measurements.curtain_type, 
    measurements.fabric_rotated,
    measurements.selected_pricing_method, // ✅ ADD: Triggers recalc when pricing method changes
    measurements.manufacturing_type, // ✅ ADD: Triggers recalc when manufacturing type changes
    measurements.selected_heading, // ✅ ADD: Triggers recalc when heading changes
    measurements.heading_fullness, // ✅ ADD: Triggers recalc when fullness changes
    measurements.selected_lining, // ✅ ADD: Triggers recalc when lining changes
    measurements.header_hem, // ✅ ADD: Triggers recalc when hems change
    measurements.bottom_hem,
    measurements.side_hem,
    measurements.seam_hem,
    selectedTemplate, 
    inventory
  ]);

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
  const formatPrice = (price: number) => {
    const currencySymbols: Record<string, string> = {
      'NZD': 'NZ$',
      'AUD': 'A$',
      'USD': '$',
      'GBP': '£',
      'EUR': '€',
      'ZAR': 'R'
    };
    const symbol = currencySymbols[units.currency] || units.currency;
    return `${symbol}${price.toFixed(2)}`;
  };
  return <div key={`${windowType}-${curtainType}-${hardwareType}-${poolingOption}`} className="w-full container-level-1 rounded-none md:rounded-lg overflow-hidden">
      {/* Header */}
      <div className="container-level-2 border-b-2 border-border px-2 py-1.5 md:px-6 md:py-4">
        <h2 className="text-base md:text-2xl font-bold text-card-foreground text-center">
          Window Measurement Worksheet
        </h2>
      </div>
      <div className="p-2 md:p-6 space-y-1 md:space-y-3">
        {/* Visual Diagram Section */}
        <div className="w-full">
          {/* Wallpaper uses its own full-width layout */}
          {treatmentCategory === 'wallpaper' ? <WallpaperVisual measurements={measurements} selectedWallpaper={selectedFabric ? inventory.find(item => item.id === selectedFabric) : undefined} onMeasurementChange={handleInputChange} readOnly={readOnly} /> : (/* Other treatments use the standard 2/5 + 3/5 layout */
        <div className="flex flex-col lg:flex-row gap-1.5 md:gap-3">
              {/* Visual Diagram */}
              <div className="w-full lg:w-2/5 flex-shrink-0 space-y-1.5 md:space-y-2">
                {/* Original Visual Diagram first */}
                {/* Specialized visualizers for panel glide, shutters, and awnings */}
                {(treatmentCategory === 'panel_glide' || treatmentCategory === 'plantation_shutters' || treatmentCategory === 'shutters' || treatmentCategory === 'awning') ? (
                  <TreatmentPreviewEngine
                    windowType={windowType}
                    treatmentType={treatmentCategory || treatmentType}
                    measurements={{
                      ...measurements,
                      width: parseFloat(measurements.rail_width || measurements.width || '200'),
                      height: parseFloat(measurements.drop || measurements.height || '200'),
                      drop: parseFloat(measurements.drop || measurements.height || '200'),
                      frame_type: measurements.frame_type,
                      control_type: measurements.control_type,
                      fabric_pattern: measurements.fabric_pattern,
                      valance_style: measurements.valance_style,
                      projection: measurements.projection
                    }}
                    template={selectedTemplate}
                    selectedItems={{
                      material: selectedFabric ? inventory.find(item => item.id === selectedFabric) : undefined
                    }}
                    hideDetails={true}
                  />
                ) :
                /* Blinds visual */
                (treatmentCategory === 'blinds' || treatmentCategory === 'roller_blinds' || treatmentCategory === 'venetian_blinds' || treatmentCategory === 'roman_blinds' || treatmentCategory === 'cellular_blinds' || treatmentCategory === 'cellular_shades' || treatmentCategory === 'vertical_blinds' || selectedTemplate?.curtain_type === 'roller_blind' || selectedTemplate?.curtain_type === 'roman_blind' || selectedTemplate?.curtain_type === 'venetian_blind' || selectedTemplate?.curtain_type === 'vertical_blind' || selectedTemplate?.curtain_type === 'cellular_blind' || selectedTemplate?.curtain_type === 'cellular_shade') ? <DynamicBlindVisual windowType={windowType} measurements={measurements} template={selectedTemplate} blindType={treatmentCategory === 'roller_blinds' || treatmentCategory === 'blinds' || selectedTemplate?.curtain_type === 'roller_blind' ? 'roller' : treatmentCategory === 'venetian_blinds' || selectedTemplate?.curtain_type === 'venetian_blind' ? 'venetian' : treatmentCategory === 'vertical_blinds' || selectedTemplate?.curtain_type === 'vertical_blind' ? 'vertical' : treatmentCategory === 'roman_blinds' || selectedTemplate?.curtain_type === 'roman_blind' ? 'roman' : treatmentCategory === 'cellular_blinds' || treatmentCategory === 'cellular_shades' || selectedTemplate?.curtain_type === 'cellular_blind' || selectedTemplate?.curtain_type === 'cellular_shade' ? 'cellular' : 'roller'} mountType={measurements.mount_type || 'outside'} chainSide={measurements.chain_side || 'right'} controlType={measurements.control_type} material={selectedFabricItem} /> : (/* Curtains visual */
            <div className="relative container-level-2 rounded-lg p-8 min-h-[400px] overflow-visible">

              {/* Hardware - Track/Rod that follows window shape */}
              {windowType === 'bay' ?
              // Bay Window Hardware - Three angled sections
              <>
                  {/* Left Angled Hardware */}
                  <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} left-12 w-20 transform -skew-y-12 origin-bottom`}>
                    {hardwareType === "track" ? <div className="w-full h-3 bg-muted-foreground relative">
                        <div className="absolute -left-1 -top-0.5 w-2 h-4 bg-foreground"></div>
                      </div> : <div className="w-full h-2 bg-muted-foreground rounded-full relative">
                        <div className="absolute -left-2 -top-1 w-4 h-4 bg-foreground rounded-full"></div>
                      </div>}
                  </div>
                  
                  {/* Center Hardware - Extended to connect seamlessly */}
                  <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} left-30 right-30 flex items-center`}>
                    {hardwareType === "track" ? <div className="w-full h-3 bg-muted-foreground relative">
                      </div> : <div className="w-full h-2 bg-muted-foreground rounded-full relative">
                      </div>}
                  </div>
                  
                  {/* Right Angled Hardware */}
                  <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} right-12 w-20 transform skew-y-12 origin-bottom`}>
                    {hardwareType === "track" ? <div className="w-full h-3 bg-muted-foreground relative">
                        <div className="absolute -right-1 -top-0.5 w-2 h-4 bg-foreground"></div>
                      </div> : <div className="w-full h-2 bg-muted-foreground rounded-full relative">
                        <div className="absolute -right-2 -top-1 w-4 h-4 bg-foreground rounded-full"></div>
                      </div>}
                  </div>
                </> :
              // Standard Hardware - Original design
              <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} left-12 right-12 flex items-center`}>
                  {hardwareType === "track" ? <div className="w-full h-3 bg-muted-foreground relative">
                      <div className="absolute -left-1 -top-0.5 w-2 h-4 bg-foreground"></div>
                      <div className="absolute -right-1 -top-0.5 w-2 h-4 bg-foreground"></div>
                    </div> : <div className="w-full h-2 bg-muted-foreground rounded-full relative">
                      <div className="absolute -left-2 -top-1 w-4 h-4 bg-foreground rounded-full"></div>
                      <div className="absolute -right-2 -top-1 w-4 h-4 bg-foreground rounded-full"></div>
                    </div>}
                </div>}

              {/* Dynamic Window Frame - Changes shape based on selected window type */}
              {windowType === 'bay' ?
              // Bay Window - Three angled sections
              <>
                  {/* Left Angled Window */}
                  <div className="absolute top-24 left-12 w-20 bottom-16 transform -skew-y-12 origin-bottom">
                    <div className="w-full h-full border-4 border-muted-foreground bg-background relative">
                      <div className="grid grid-cols-1 grid-rows-3 h-full gap-1 p-2">
                        {Array.from({
                        length: 3
                      }).map((_, i) => <div key={i} className="bg-muted border border-border"></div>)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Center Window - Aligned with skewed side windows */}
                  <div className="absolute top-20 left-32 right-32 bottom-20">
                    <div className="w-full h-full border-4 border-muted-foreground bg-background relative">
                      <div className="grid grid-cols-2 grid-rows-3 h-full gap-1 p-2">
                        {Array.from({
                        length: 6
                      }).map((_, i) => <div key={i} className="bg-muted border border-border"></div>)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Angled Window */}
                  <div className="absolute top-24 right-12 w-20 bottom-16 transform skew-y-12 origin-bottom">
                    <div className="w-full h-full border-4 border-muted-foreground bg-background relative">
                      <div className="grid grid-cols-1 grid-rows-3 h-full gap-1 p-2">
                        {Array.from({
                        length: 3
                      }).map((_, i) => <div key={i} className="bg-muted border border-border"></div>)}
                      </div>
                    </div>
                  </div>
                </> :
              // Standard Window - Original design
              <div className="absolute top-24 left-16 right-16 bottom-16">
                  <div className="w-full h-full border-4 border-muted-foreground bg-background relative">
                    {/* Window Panes */}
                    <div className="grid grid-cols-2 grid-rows-3 h-full gap-1 p-2">
                      {Array.from({
                      length: 6
                    }).map((_, i) => <div key={i} className="bg-muted border border-border"></div>)}
                    </div>
                  </div>
                </div>}

              {/* Curtain Panels - Dynamic based on curtain type, hardware type, and pooling */}
              {curtainType === "pair" ? <>
                  {/* Left Panel */}
                  <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} left-12 w-12 ${getCurtainBottomPosition()} rounded-sm shadow-lg overflow-hidden`} style={{
                  backgroundColor: fabricImageUrl ? 'transparent' : fabricColor,
                  backgroundImage: fabricImageUrl ? `url(${fabricImageUrl})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.9
                }}>
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-foreground rounded-full"></div>
                    {/* Pleat lines for depth effect */}
                    <div className="absolute top-2 bottom-2 left-1 w-0.5 bg-black/20"></div>
                    <div className="absolute top-2 bottom-2 left-2 w-0.5 bg-black/15"></div>
                    <div className="absolute top-2 bottom-2 left-3 w-0.5 bg-black/10"></div>
                    <div className="absolute top-2 bottom-2 left-4 w-0.5 bg-black/8"></div>
                    <div className="absolute top-2 bottom-2 left-5 w-0.5 bg-black/6"></div>
                    <div className="absolute top-2 bottom-2 left-6 w-0.5 bg-black/4"></div>
                    <div className="absolute top-2 bottom-2 left-7 w-0.5 bg-black/20"></div>
                    <div className="absolute top-2 bottom-2 left-8 w-0.5 bg-black/15"></div>
                    <div className="absolute top-2 bottom-2 left-9 w-0.5 bg-black/10"></div>
                    <div className="absolute top-2 bottom-2 left-10 w-0.5 bg-black/8"></div>
                    
                    {/* Pooling visual effect */}
                    {poolingOption === "below_floor" && hasValue(poolingAmount) && <div className="absolute -bottom-4 left-0 w-full h-4 rounded-b-lg" style={{
                    backgroundColor: fabricImageUrl ? 'transparent' : fabricColor,
                    backgroundImage: fabricImageUrl ? `url(${fabricImageUrl})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.7
                  }}></div>}
                  </div>
                  
                  {/* Right Panel */}
                  <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} right-12 w-12 ${getCurtainBottomPosition()} rounded-sm shadow-lg overflow-hidden`} style={{
                  backgroundColor: fabricImageUrl ? 'transparent' : fabricColor,
                  backgroundImage: fabricImageUrl ? `url(${fabricImageUrl})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.9
                }}>
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-foreground rounded-full"></div>
                    {/* Pleat lines for depth effect */}
                    <div className="absolute top-2 bottom-2 left-1 w-0.5 bg-black/20"></div>
                    <div className="absolute top-2 bottom-2 left-2 w-0.5 bg-black/15"></div>
                    <div className="absolute top-2 bottom-2 left-3 w-0.5 bg-black/10"></div>
                    <div className="absolute top-2 bottom-2 left-4 w-0.5 bg-black/8"></div>
                    <div className="absolute top-2 bottom-2 left-5 w-0.5 bg-black/6"></div>
                    <div className="absolute top-2 bottom-2 left-6 w-0.5 bg-black/4"></div>
                    <div className="absolute top-2 bottom-2 left-7 w-0.5 bg-black/20"></div>
                    <div className="absolute top-2 bottom-2 left-8 w-0.5 bg-black/15"></div>
                    <div className="absolute top-2 bottom-2 left-9 w-0.5 bg-black/10"></div>
                    <div className="absolute top-2 bottom-2 left-10 w-0.5 bg-black/8"></div>
                    
                    {/* Pooling visual effect */}
                    {poolingOption === "below_floor" && hasValue(poolingAmount) && <div className="absolute -bottom-4 left-0 w-full h-4 rounded-b-lg" style={{
                    backgroundColor: fabricImageUrl ? 'transparent' : fabricColor,
                    backgroundImage: fabricImageUrl ? `url(${fabricImageUrl})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.7
                  }}></div>}
                  </div>
                </> : (/* Single Panel - Consistent with pair styling */
              <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} ${curtainSide === "left" ? "left-12" : "right-12"} w-12 ${getCurtainBottomPosition()} rounded-sm shadow-lg overflow-hidden`} style={{
                backgroundColor: fabricImageUrl ? 'transparent' : fabricColor,
                backgroundImage: fabricImageUrl ? `url(${fabricImageUrl})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.9
              }}>
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-foreground rounded-full"></div>
                  {/* Pleat lines for depth effect */}
                  <div className="absolute top-2 bottom-2 left-1 w-0.5 bg-black/20"></div>
                  <div className="absolute top-2 bottom-2 left-2 w-0.5 bg-black/15"></div>
                  <div className="absolute top-2 bottom-2 left-3 w-0.5 bg-black/10"></div>
                  <div className="absolute top-2 bottom-2 left-4 w-0.5 bg-black/8"></div>
                  <div className="absolute top-2 bottom-2 left-5 w-0.5 bg-black/6"></div>
                  <div className="absolute top-2 bottom-2 left-6 w-0.5 bg-black/4"></div>
                  <div className="absolute top-2 bottom-2 left-7 w-0.5 bg-black/20"></div>
                  <div className="absolute top-2 bottom-2 left-8 w-0.5 bg-black/15"></div>
                  <div className="absolute top-2 bottom-2 left-9 w-0.5 bg-black/10"></div>
                  <div className="absolute top-2 bottom-2 left-10 w-0.5 bg-black/8"></div>
                  
                  {/* Pooling visual effect */}
                  {poolingOption === "below_floor" && hasValue(poolingAmount) && <div className="absolute -bottom-4 left-0 w-full h-4 rounded-b-lg" style={{
                  backgroundColor: fabricImageUrl ? 'transparent' : fabricColor,
                  backgroundImage: fabricImageUrl ? `url(${fabricImageUrl})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.7
                }}></div>}
                </div>)}

              {/* Rail Width measurement - positioned near the hardware */}
              {hasValue(measurements.rail_width) && <div className={`absolute ${hardwareType === "track" ? "-top-4" : "top-8"} left-12 right-12 flex items-center z-10`}>
                  <div className="w-0 h-0 border-t-2 border-b-2 border-r-4 border-transparent border-r-blue-600"></div>
                  <div className="flex-1 border-t-2 border-blue-600 relative">
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg z-20 whitespace-nowrap">
                      {hardwareType === "track" ? "Track Width" : "Rod Width"}: {displayValue(measurements.rail_width)}
                    </span>
                  </div>
                  <div className="w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-blue-600"></div>
                </div>}
              
              {/* Rail Width placeholder when empty */}
              {!hasValue(measurements.rail_width) && <div className={`absolute ${hardwareType === "track" ? "-top-4" : "top-8"} left-12 right-12 flex items-center opacity-50 z-10`}>
                  <div className="flex-1 border-t-2 border-dashed border-muted-foreground relative">
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium z-20 whitespace-nowrap">
                      Enter Rail Width →
                    </span>
                  </div>
                </div>}

              {/* Window Width Measurement (A) */}
              {hasValue(measurements.measurement_a) && <div className="absolute top-16 left-16 right-16 flex items-center z-15">
                  <div className="w-0 h-0 border-t-2 border-b-2 border-r-4 border-transparent border-r-green-600"></div>
                  <div className="flex-1 border-t-2 border-green-600 relative">
                    <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-bold shadow-lg z-30 whitespace-nowrap">
                      A: {displayValue(measurements.measurement_a)}
                    </span>
                  </div>
                  <div className="w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-green-600"></div>
                </div>}

              {/* Curtain Drop measurement - RIGHT SIDE from hardware to bottom of curtain */}
              {hasValue(measurements.drop) && <div className={`absolute right-0 ${hardwareType === "track" ? "top-6" : "top-18"} ${poolingOption === "below_floor" && hasValue(poolingAmount) ? "bottom-8" : getCurtainBottomPosition() === "bottom-4" ? "bottom-4" : "bottom-12"} flex flex-col items-center z-20`}>
                  <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-green-600"></div>
                  <div className="flex-1 border-r-2 border-green-600 relative">
                     <span className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg whitespace-nowrap z-30">
                       Drop: {displayValue(measurements.drop)}
                     </span>
                  </div>
                  <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-green-600"></div>
                </div>}
              
              {/* Drop placeholder when empty */}
              {!hasValue(measurements.drop) && <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} left-2 flex flex-col items-center opacity-50 z-15`}>
                  <div className={`${hardwareType === "track" ? "h-72" : "h-64"} border-l-2 border-dashed border-muted-foreground relative`}>
                    <span className="absolute -left-20 top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium whitespace-nowrap z-30">
                      Enter Drop Height ↓
                    </span>
                  </div>
                </div>}

              {/* Window Height Measurement (B) */}
              {hasValue(measurements.measurement_b) && <div className="absolute top-24 left-6 bottom-16 flex flex-col items-center z-15">
                  <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-orange-600"></div>
                  <div className="flex-1 border-l-2 border-orange-600 relative">
                    <span className="absolute -left-16 top-1/2 transform -translate-y-1/2 bg-orange-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap shadow-lg z-30">
                      B: {displayValue(measurements.measurement_b)}
                    </span>
                  </div>
                  <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-orange-600"></div>
                </div>}

              {/* Rod to Ceiling measurement (C) - only for rod, not track */}
              {hasValue(measurements.measurement_c) && hardwareType === "rod" && <div className="absolute top-4 right-4 flex flex-col items-center">
                  <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-red-600"></div>
                  <div className="h-12 border-l-2 border-primary relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                      C: {displayValue(measurements.measurement_c)}
                    </span>
                  </div>
                  <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-red-600"></div>
                </div>}

              {/* Floor Line */}
              <div className="absolute bottom-4 left-8 right-8 border-t-4 border-muted-foreground">
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-base font-bold text-muted-foreground">
                  Floor Line
                </span>
              </div>

              {/* Pooling measurement indicator - VERTICAL to measure pooled fabric height */}
              {poolingOption === "below_floor" && hasValue(poolingAmount) && <div className={`absolute -bottom-6 ${curtainType === "pair" ? "left-20" : curtainSide === "left" ? "left-20" : "right-20"} flex flex-col items-center z-30`}>
                  <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-orange-600"></div>
                  <div className="h-8 border-l-2 border-orange-600 relative">
                    <span className="absolute -left-24 top-1/2 transform -translate-y-1/2 bg-orange-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg z-40 whitespace-nowrap">
                      Pooling: {displayValue(poolingAmount)}
                    </span>
                  </div>
                  <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-orange-600"></div>
                </div>}

              {/* Window to Floor measurement (D) */}
              {hasValue(measurements.measurement_d) && <div className="absolute bottom-4 right-8 flex flex-col items-center">
                  <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-indigo-600"></div>
                  <div className="h-12 border-l-2 border-indigo-600 relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                      D: {displayValue(measurements.measurement_d)}
                    </span>
                  </div>
                  <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-indigo-600"></div>
                </div>}

              {/* Total Height measurement (E) - from hardware to floor */}
              {hasValue(measurements.measurement_e) && <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} right-0 bottom-4 flex flex-col items-center`}>
                  <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-secondary"></div>
                  <div className="flex-1 border-l-2 border-secondary relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                      E: {displayValue(measurements.measurement_e)}
                    </span>
                  </div>
                  <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-secondary"></div>
                </div>}

              {/* Total Width measurement (F) - from extension to extension */}
              {hasValue(measurements.measurement_f) && <div className="absolute bottom-0 left-4 right-4 flex items-center">
                  <div className="w-0 h-0 border-t-2 border-b-2 border-r-4 border-transparent border-r-teal-600"></div>
                  <div className="flex-1 border-t-2 border-teal-600 relative">
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-teal-600 text-white px-2 py-1 rounded text-xs font-bold">
                      F: {displayValue(measurements.measurement_f)}
                    </span>
                  </div>
                  <div className="w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-teal-600"></div>
                </div>}
              </div>)}
              {/* End of curtain visual conditional */}
              
              {/* Fabric & Pricing Calculations Section - Below Visual */}
              {selectedFabricItem && selectedTemplate && <AdaptiveFabricPricingDisplay selectedFabricItem={selectedFabricItem} fabricCalculation={fabricCalculation} template={selectedTemplate} measurements={measurements} treatmentCategory={treatmentCategory} />}
            </div>

            {/* Measurement Inputs Section */}
            <div className="lg:w-3/5 space-y-2">
              {/* ESSENTIAL MEASUREMENTS - Only show for curtains and blinds, NOT for wallpaper */}
              {treatmentCategory as string !== 'wallpaper' && <div className="container-level-1 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21l3-3 9.5-9.5a1.5 1.5 0 000-2.121L18.379 5.257a1.5 1.5 0 00-2.121 0L6.5 14.5 7 21z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-card-foreground">Enter measurements</h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs">W</span>
                      <Label htmlFor="rail_width" className="text-sm font-bold text-card-foreground">
                        {hardwareType === "track" ? "Track" : "Rail"} Width
                      </Label>
                    </div>
                    <div className="relative">
                        <Input id="rail_width" type="number" inputMode="decimal" step="0.25" value={measurements.rail_width || ""} onChange={e => {
                      console.log("🔧 Rail width input change:", e.target.value, "Current measurements:", measurements);
                      handleInputChange("rail_width", e.target.value);
                    }} onFocus={e => {
                      e.target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                      });
                    }} placeholder="0.00" readOnly={readOnly} className="h-11 pr-14 text-base font-bold text-center container-level-2 border-2 border-border focus:border-primary text-card-foreground" />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-card-foreground font-semibold text-xs bg-muted px-2 py-0.5 rounded">
                         {units.length}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs">H</span>
                      <Label htmlFor="drop" className="text-sm font-bold text-card-foreground">
                        Curtain Drop
                      </Label>
                    </div>
                    <div className="relative">
                        <Input id="drop" type="number" inputMode="decimal" step="0.25" value={measurements.drop || ""} onChange={e => {
                      console.log("🔧 Drop input change:", e.target.value, "Current measurements:", measurements);
                      handleInputChange("drop", e.target.value);
                    }} onFocus={e => {
                      e.target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                      });
                    }} placeholder="0.00" readOnly={readOnly} className="h-11 pr-14 text-base font-bold text-center container-level-2 border-2 border-border focus:border-primary text-card-foreground" />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-card-foreground font-semibold text-xs bg-muted px-2 py-0.5 rounded">
                        {units.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>}
              {/* End Essential Measurements */}

              {/* Curtain Configuration - Panel Setup (Only for curtains) */}
              {treatmentCategory === 'curtains' && <div className="container-level-1 rounded-lg p-3">
              <h4 className="text-base font-bold text-card-foreground mb-3">Curtain Configuration</h4>
              
              <div className="space-y-2">
                <div>
                  <Label className="text-xs font-semibold mb-2 block text-card-foreground">Curtain Type</Label>
                  <div className="text-[10px] text-muted-foreground mb-2">
                    Pair = 2 panels (4 side hems) | Single = 1 panel (2 side hems)
                  </div>
                  <RadioGroup value={curtainType} onValueChange={value => {
                    console.log("Curtain type changed to:", value);
                    handleInputChange("curtain_type", value);
                  }} disabled={readOnly} className="grid grid-cols-2 gap-2">
                    <div className="container-level-3 rounded-lg p-2 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pair" id="pair" className="w-4 h-4" />
                        <Label htmlFor="pair" className="text-xs font-medium text-card-foreground cursor-pointer flex-1">Pair (Two panels)</Label>
                      </div>
                    </div>
                    <div className="container-level-3 rounded-lg p-2 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="single" id="single" className="w-4 h-4" />
                        <Label htmlFor="single" className="text-xs font-medium text-card-foreground cursor-pointer flex-1">Single (One panel)</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {curtainType === "single" && <div>
                    <Label className="text-xs font-semibold mb-2 block text-card-foreground">Panel Position</Label>
                    <RadioGroup value={curtainSide} onValueChange={value => {
                    console.log("Panel side changed to:", value);
                    handleInputChange("curtain_side", value);
                  }} disabled={readOnly} className="grid grid-cols-2 gap-2">
                      <div className="container-level-3 rounded-lg p-2 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="left" id="left" className="w-4 h-4" />
                          <Label htmlFor="left" className="text-xs font-medium text-card-foreground cursor-pointer flex-1">Left side</Label>
                        </div>
                      </div>
                      <div className="container-level-3 rounded-lg p-2 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="right" id="right" className="w-4 h-4" />
                          <Label htmlFor="right" className="text-xs font-medium text-card-foreground cursor-pointer flex-1">Right side</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>}

                {/* Fabric Rotation Toggle */}
                {selectedFabricItem && measurements.rail_width && measurements.drop && <div className="mt-4 pt-3 border-t border-border">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <Label className="text-xs font-semibold text-card-foreground cursor-pointer">
                          Rotate Fabric 90°
                        </Label>
                        <div className="text-[10px] text-muted-foreground mt-1 space-y-1">
                          {(() => {
                          const fabricWidthCm = selectedFabricItem.fabric_width || 137;
                          const drop = parseFloat(measurements.drop) || 0;
                          const headerHem = parseFloat(measurements.header_allowance_cm) || 8;
                          const bottomHem = parseFloat(measurements.bottom_hem_cm) || 15;
                          const pooling = parseFloat(measurements.pooling_amount_cm) || 0;
                          const totalDrop = drop + headerHem + bottomHem + pooling;

                          // Use consistent thresholds with calculation logic
                          const isNarrowFabric = fabricWidthCm < 250;
                          const isWideFabric = fabricWidthCm >= 250;
                          const canRailroad = totalDrop <= fabricWidthCm;
                          const fabricRotated = measurements.fabric_rotated === true || measurements.fabric_rotated === 'true';
                          if (isWideFabric) {
                            // For wide fabrics: toggle ON = railroaded (default), toggle OFF = vertical
                            if (fabricRotated !== false) {
                              // Toggle is ON (default for wide fabrics)
                              if (canRailroad) {
                                return <>
                                      <p>✓ Wide fabric ({fabricWidthCm}cm) - railroaded (default)</p>
                                      <p className="text-primary">Fabric width for drop, buying length for curtain width</p>
                                    </>;
                              } else {
                                return <>
                                      <p>⚠ Wide fabric ({fabricWidthCm}cm) - cannot railroad</p>
                                      <p className="text-amber-600">Drop ({totalDrop.toFixed(0)}cm) exceeds fabric width - switch to vertical orientation</p>
                                    </>;
                              }
                            } else {
                              // Toggle is OFF - user manually switched to vertical
                              return <>
                                    <p>Wide fabric ({fabricWidthCm}cm) - switched to vertical orientation</p>
                                    <p className="text-primary">Buying drops of fabric, seaming for width</p>
                                  </>;
                            }
                          } else if (isNarrowFabric) {
                            // For narrow fabrics: toggle OFF = vertical (default), toggle ON = railroaded
                            if (fabricRotated) {
                              // Toggle is ON - user wants to railroad
                              if (canRailroad) {
                                return <>
                                      <p>Narrow fabric ({fabricWidthCm}cm) - rotated to railroaded</p>
                                      <p className="text-primary">Fabric width for drop, buying length for curtain width</p>
                                    </>;
                              } else {
                                return <>
                                      <p>⚠ Narrow fabric ({fabricWidthCm}cm) - cannot railroad</p>
                                      <p className="text-amber-600">Drop ({totalDrop.toFixed(0)}cm) exceeds fabric width ({fabricWidthCm}cm)</p>
                                    </>;
                              }
                            } else {
                              // Toggle is OFF (default for narrow fabrics) - vertical orientation
                              return <>
                                    <p>✓ Narrow fabric ({fabricWidthCm}cm) - standard vertical (default)</p>
                                    <p className="text-primary">Buying drops for height, seaming widths for curtain width</p>
                                  </>;
                            }
                          }
                          return <p>Standard fabric orientation</p>;
                        })()}
                        </div>
                      </div>
                      <Switch checked={measurements.fabric_rotated === true || measurements.fabric_rotated === 'true'} onCheckedChange={checked => {
                      console.log("Fabric rotation changed to:", checked);
                      handleInputChange("fabric_rotated", checked.toString());
                    }} disabled={readOnly || !selectedFabricItem || (() => {
                      const fabricWidthCm = selectedFabricItem.fabric_width || 137;
                      const drop = parseFloat(measurements.drop) || 0;
                      return drop >= fabricWidthCm;
                    })()} />
                    </div>
                  </div>}
              </div>
            </div>}


              {/* CURTAIN-SPECIFIC FIELDS - Dynamic Options from Template */}
              {treatmentType === 'curtains' && <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Curtain Options</CardTitle>
                    <p className="text-xs text-muted-foreground">Configure options from your template settings</p>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <DynamicCurtainOptions
                      measurements={measurements}
                      onChange={onMeasurementChange}
                      template={selectedTemplate}
                      selectedEyeletRing={measurements.selected_eyelet_ring}
                      onEyeletRingChange={(ringId) => onMeasurementChange('selected_eyelet_ring', ringId)}
                      onOptionPriceChange={(optionType, price, name) => {
                        console.log(`Option ${optionType} changed: ${name} - ${price}`);
                      }}
                    />
                  </CardContent>
                </Card>}

              {/* BLIND-SPECIFIC FIELDS - Dynamic Options */}
              {/* Show dynamic options for all blind and shutter types */}
              {(treatmentType === 'blinds' ||
                treatmentType === 'roller_blinds' || 
                treatmentType === 'venetian_blinds' || 
                treatmentType === 'roman_blinds' || 
                treatmentType === 'vertical_blinds' || 
                treatmentType === 'cellular_blinds' || 
                treatmentType === 'cellular_shades' || 
                treatmentType === 'panel_glide' || 
                treatmentType === 'plantation_shutters' ||
                treatmentType === 'shutters' ||
                treatmentType === 'awning') && (
                <div className="space-y-3">
                  <DynamicRollerBlindFields 
                    measurements={measurements} 
                    onChange={handleInputChange} 
                    templateId={selectedTemplate?.id} 
                    treatmentCategory={treatmentType} 
                    readOnly={readOnly} 
                    onOptionPriceChange={handleOptionPriceChange} 
                    selectedOptions={selectedOptions} 
                  />
                </div>
              )}

              {/* Additional Measurements for Curtain Makers - ONLY show for curtains */}
              {treatmentType === 'curtains' && <details className="group">
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
                        <Input id="rod_extension_left" type="number" step="0.25" value={measurements.rod_extension_left || ""} onChange={e => handleInputChange("rod_extension_left", e.target.value)} placeholder="8-10" readOnly={readOnly} className="h-8 text-sm" />
                        <p className="text-xs text-muted-foreground">How far {hardwareType === "track" ? "track" : "rod"} extends left</p>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="rod_extension_right" className="text-xs font-medium text-foreground">
                          Right Extension
                        </Label>
                        <Input id="rod_extension_right" type="number" step="0.25" value={measurements.rod_extension_right || ""} onChange={e => handleInputChange("rod_extension_right", e.target.value)} placeholder="8-10" readOnly={readOnly} className="h-8 text-sm" />
                        <p className="text-xs text-muted-foreground">How far {hardwareType === "track" ? "track" : "rod"} extends right</p>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="panel_overlap" className="text-xs font-medium text-foreground">
                          Panel Overlap
                        </Label>
                        <Input id="panel_overlap" type="number" step="0.25" value={measurements.panel_overlap || ""} onChange={e => handleInputChange("panel_overlap", e.target.value)} placeholder="2-3" readOnly={readOnly} className="h-8 text-sm" />
                        <p className="text-xs text-muted-foreground">Overlap in center</p>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="floor_clearance" className="text-xs font-medium text-foreground">
                          Floor Clearance
                        </Label>
                        <Input id="floor_clearance" type="number" step="0.25" value={measurements.floor_clearance || ""} onChange={e => handleInputChange("floor_clearance", e.target.value)} placeholder="0.5" readOnly={readOnly} className="h-8 text-sm" />
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
                            <Input id="measurement_a" type="number" step="0.25" value={measurements.measurement_a || ""} onChange={e => handleInputChange("measurement_a", e.target.value)} placeholder="0.00" readOnly={readOnly} />
                          </div>
                          <div>
                            <Label htmlFor="measurement_b" className="text-sm font-medium flex items-center gap-2">
                              <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xs">B</span>
                              Window Height (Inside Frame)
                            </Label>
                            <p className="text-xs text-muted-foreground mb-1">Measure inside the window frame from top to bottom</p>
                            <Input id="measurement_b" type="number" step="0.25" value={measurements.measurement_b || ""} onChange={e => handleInputChange("measurement_b", e.target.value)} placeholder="0.00" readOnly={readOnly} />
                          </div>
                          {hardwareType === "rod" && <div>
                              <Label htmlFor="measurement_c" className="text-sm font-medium flex items-center gap-2">
                                <span className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xs">C</span>
                                Rod to Ceiling Distance
                              </Label>
                              <p className="text-xs text-muted-foreground mb-1">Distance from curtain rod to ceiling</p>
                              <Input id="measurement_c" type="number" step="0.25" value={measurements.measurement_c || ""} onChange={e => handleInputChange("measurement_c", e.target.value)} placeholder="0.00" readOnly={readOnly} />
                            </div>}
                          <div>
                            <Label htmlFor="measurement_d" className="text-sm font-medium flex items-center gap-2">
                              <span className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">D</span>
                              Window Bottom to Floor
                            </Label>
                            <p className="text-xs text-muted-foreground mb-1">Distance from bottom of window to floor</p>
                            <Input id="measurement_d" type="number" step="0.25" value={measurements.measurement_d || ""} onChange={e => handleInputChange("measurement_d", e.target.value)} placeholder="0.00" readOnly={readOnly} />
                          </div>
                          <div>
                            <Label htmlFor="measurement_e" className="text-sm font-medium flex items-center gap-2">
                              <span className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs">E</span>
                              Total Height ({hardwareType === "track" ? "Track" : "Rod"} to Floor)
                            </Label>
                            <p className="text-xs text-muted-foreground mb-1">Full height from {hardwareType === "track" ? "track" : "rod"} to floor</p>
                            <Input id="measurement_e" type="number" step="0.25" value={measurements.measurement_e || ""} onChange={e => handleInputChange("measurement_e", e.target.value)} placeholder="0.00" readOnly={readOnly} />
                          </div>
                          <div>
                            <Label htmlFor="measurement_f" className="text-sm font-medium flex items-center gap-2">
                              <span className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-xs">F</span>
                              Total Width (Including Extensions)
                            </Label>
                            <p className="text-xs text-muted-foreground mb-1">Full width including {hardwareType === "track" ? "track" : "rod"} extensions</p>
                            <Input id="measurement_f" type="number" step="0.25" value={measurements.measurement_f || ""} onChange={e => handleInputChange("measurement_f", e.target.value)} placeholder="0.00" readOnly={readOnly} />
                          </div>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
              </details>}


            {/* Pooling Configuration - ONLY for curtains */}
            {treatmentCategory === 'curtains' && <div className="container-level-1 rounded-lg p-3">
                <h4 className="text-base font-bold text-card-foreground mb-3">Pooling Configuration</h4>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Pooling Position</Label>
                    <RadioGroup value={poolingOption} onValueChange={value => {
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
                  }} disabled={readOnly} className="space-y-2">
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

                  {poolingOption === "below_floor" && <div className="space-y-3">
                      <div>
                        <Label htmlFor="pooling_amount" className="text-sm font-medium">Pooling Amount</Label>
                        <p className="text-xs text-muted-foreground mb-1">How much fabric pools on the floor</p>
                        <Input id="pooling_amount" type="number" step="0.25" value={poolingAmount} onChange={e => handleInputChange("pooling_amount", e.target.value)} placeholder="2.00" readOnly={readOnly} className="font-semibold" />
                      </div>
                      
                      {/* Fabric Usage Impact Indicator */}
                      {hasValue(poolingAmount) && selectedFabric && fabricCalculation && <div className="p-2 bg-amber-100/50 border border-amber-300 rounded text-xs">
                          <div className="font-medium text-amber-800 mb-1">
                            ✓ Pooling included in fabric calculation
                          </div>
                          <div className="text-amber-700 space-y-1">
                            <div>• Pooling amount: {displayValue(poolingAmount)} added to drop</div>
                            <div>• Extra fabric: ~{(parseFloat(poolingAmount) / 100 * fabricCalculation.widthsRequired).toFixed(2)}{units.fabric}</div>
                            <div>• Total fabric: {fabricCalculation.linearMeters.toFixed(2)}{units.fabric} (includes pooling)</div>
                          </div>
                        </div>}
                      
                      {hasValue(poolingAmount) && !selectedFabric && <div className="p-2 bg-amber-100/50 border border-amber-300 rounded text-xs">
                          <div className="text-amber-700">
                            💡 Select a fabric above to see how pooling affects fabric usage
                          </div>
                        </div>}
                    </div>}
                </div>
              </div>}



          </div>
            </div>)}
        </div>
      </div>
    </div>;
};
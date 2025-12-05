import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurtainTemplates } from "@/hooks/useCurtainTemplates";
import { Switch } from "@/components/ui/switch";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { useMemo, useEffect, useRef, useState } from "react";
import { FabricSelectionSection } from "./dynamic-options/FabricSelectionSection";
import { LiningOptionsSection } from "./dynamic-options/LiningOptionsSection";
import { HeadingOptionsSection } from "./dynamic-options/HeadingOptionsSection";
import { DynamicCurtainOptions } from "./dynamic-options/DynamicCurtainOptions";
import { calculateFabricUsage } from "../job-creation/treatment-pricing/fabric-calculation/fabricUsageCalculator";
import { TreatmentPreviewEngine } from "../treatment-visualizers/TreatmentPreviewEngine";
import { detectTreatmentType, getTreatmentConfig, getMeasurementLabels } from "@/utils/treatmentTypeDetection";
import { DynamicRollerBlindFields } from "./roller-blind-fields/DynamicRollerBlindFields";
import { RollerBlindVisual } from "./visualizers/RollerBlindVisual";
import { DynamicBlindVisual } from "./visualizers/DynamicBlindVisual";
import { WallpaperVisual } from "./visualizers/WallpaperVisual";
import { singularToDbValue } from "@/types/treatmentCategories";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calculator, Ruler } from "lucide-react";
import { AdaptiveFabricPricingDisplay } from "./fabric-pricing/AdaptiveFabricPricingDisplay";
import { convertLength } from "@/hooks/useBusinessSettings";
import { useProjectFabricPools, calculateFabricNeeds, useUpdateProjectFabricPool, PoolUsage } from "@/hooks/useProjectFabricPool";
import { PoolUsageDisplay } from "./PoolUsageDisplay";
import { ProjectFabricPoolSummary } from "./ProjectFabricPoolSummary";
import { ColorSelector } from "./ColorSelector";
import { formatFromCM, getUnitLabel } from "@/utils/measurementFormatters";
import { getCurrencySymbol } from "@/utils/formatCurrency";
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
    pricingMethod?: string;
    optionKey?: string;
  }>;
  onSelectedOptionsChange?: (options: Array<{
    name: string;
    price: number;
    pricingMethod?: string;
    optionKey?: string;
  }>) => void;
  selectedMaterial?: any; // For blinds that use materials (venetian, vertical)
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
  onSelectedOptionsChange,
  selectedMaterial
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
  const measurementLabels = getMeasurementLabels(treatmentType);
  
  console.log("🎯 VisualMeasurementSheet - Treatment Detection:", {
    treatmentCategory,
    detectedType: detectTreatmentType(selectedTemplate),
    finalTreatmentType: treatmentType,
    selectedTemplate: selectedTemplate?.name,
    curtainType: selectedTemplate?.curtain_type,
    hasConfig: !!treatmentConfig,
    measurementLabels
  });

  // Handle invalid treatment config - render after hooks to avoid breaking Rules of Hooks
  if (!treatmentConfig) {
    console.error('❌ VisualMeasurementSheet: Invalid treatment type:', treatmentType);
    return <div className="p-4 text-destructive">Invalid treatment type: {treatmentType}</div>;
  }
  const handleInputChange = (field: string, value: string) => {
    if (!readOnly) {
      console.log(`🔥🔥🔥 LEVEL 0: VisualMeasurementSheet handleInputChange:`, {
        field,
        value,
        currentValue: measurements[field as keyof typeof measurements]
      });
      onMeasurementChange(field, value);
      
      // CRITICAL FIX: Force re-render by logging measurements state
      console.log(`🔄 After handleInputChange - measurements.${field}:`, measurements[field as keyof typeof measurements]);
    } else {
      console.log(`⚠️ VisualMeasurementSheet: Ignored change (readOnly):`, {
        field,
        value
      });
    }
  };

  // Handle option price changes from dynamic fields
  const handleOptionPriceChange = (optionKey: string, price: number, label: string, pricingMethod?: string, pricingGridData?: any) => {
    if (onSelectedOptionsChange) {
      // ⚠️ CRITICAL: Don't default to 'fixed' - require explicit pricing configuration
      if (!pricingMethod) {
        console.warn(`⚠️ No pricing method configured for ${optionKey}. User needs to set this up in settings.`);
      }
      
      // Use ref to get current state, update it, and set new state
      const currentOptions = selectedOptionsRef.current;
      const filteredOptions = currentOptions.filter(opt => !opt.name.startsWith(optionKey + ':'));
      const newOption = {
        name: `${optionKey}: ${label}`,
        price,
        pricingMethod: pricingMethod, // Don't default to 'fixed'
        optionKey,
        pricingGridData
      };
      const updatedOptions = [...filteredOptions, newOption];
      console.log(`🎯 handleOptionPriceChange - ${optionKey}:`, {
        currentOptions,
        newOption,
        pricingMethod: pricingMethod || '⚠️ NOT CONFIGURED',
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
  // Default to "pair" for curtains, "single" for roman blinds
  const defaultCurtainType = treatmentCategory === 'roman_blinds' ? 'single' : 'pair';
  const curtainType = measurements.curtain_type || (selectedTemplate as any)?.panel_configuration || selectedTemplate?.curtain_type || defaultCurtainType;
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

  // ✅ AUTO-SELECT fabric rotation based on fabric width threshold (200cm)
  // Fabric width > 200cm → horizontal/railroaded (fabric_rotated = true)
  // Fabric width ≤ 200cm → vertical/standard (fabric_rotated = false)
  const FABRIC_WIDTH_THRESHOLD_CM = 200;
  const previousFabricIdRef = useRef<string | null>(null);
  
  useEffect(() => {
    // Only auto-select for curtains/romans with valid fabric selection
    if (treatmentCategory !== 'curtains' && treatmentCategory !== 'roman_blinds') return;
    if (!selectedFabricItem || readOnly) return;
    
    const fabricWidthCm = selectedFabricItem.fabric_width || 137;
    const fabricChanged = previousFabricIdRef.current !== selectedFabric;
    
    // Only auto-select when fabric CHANGES (not on every render)
    if (fabricChanged && selectedFabric) {
      const shouldBeHorizontal = fabricWidthCm > FABRIC_WIDTH_THRESHOLD_CM;
      const currentRotated = measurements.fabric_rotated === true || measurements.fabric_rotated === 'true';
      
      // Auto-apply the correct orientation based on fabric width
      if (shouldBeHorizontal !== currentRotated) {
        console.log(`🔄 Auto-selecting fabric orientation: ${shouldBeHorizontal ? 'HORIZONTAL (railroaded)' : 'VERTICAL (standard)'} for fabric width ${fabricWidthCm}cm (threshold: ${FABRIC_WIDTH_THRESHOLD_CM}cm)`);
        handleInputChange("fabric_rotated", shouldBeHorizontal.toString());
      }
      
      previousFabricIdRef.current = selectedFabric;
    }
  }, [selectedFabric, selectedFabricItem, treatmentCategory, readOnly]);

  // CRITICAL FIX: Use a recalc trigger to force useMemo to re-run on changes
  const [recalcTrigger, setRecalcTrigger] = useState(0);
  
  // Watch for changes to critical fields and force recalculation
  useEffect(() => {
    console.log('🔄 CRITICAL MEASUREMENT CHANGED - forcing fabric recalculation:', {
      rail_width: measurements.rail_width,
      drop: measurements.drop,
      fabric_rotated: measurements.fabric_rotated,
      pooling_amount: measurements.pooling_amount
    });
    setRecalcTrigger(prev => prev + 1);
  }, [
    measurements.rail_width, 
    measurements.drop, 
    measurements.fabric_rotated,
    measurements.curtain_type,
    measurements.selected_heading,
    measurements.heading_fullness,
    measurements.pooling_amount,
    measurements.selected_lining,
    selectedFabric,
    units.length
  ]);

  // Calculate fabric usage when measurements and fabric change
  const fabricCalculation = useMemo(() => {
    console.log('🔥🔥🔥 LEVEL 3: fabricCalculation useMemo TRIGGERED', {
      recalcTrigger,
      selectedFabric,
      rail_width: measurements.rail_width,
      drop: measurements.drop,
      curtain_type: measurements.curtain_type,
      fabric_rotated: measurements.fabric_rotated,
      fabric_rotated_type: typeof measurements.fabric_rotated,
      selected_pricing_method: measurements.selected_pricing_method,
      manufacturing_type: measurements.manufacturing_type,
      selected_heading: measurements.selected_heading,
      heading_fullness: measurements.heading_fullness,
      selected_lining: measurements.selected_lining,
      pooling_amount: measurements.pooling_amount,
      units_length: units.length,
      timestamp: new Date().toISOString()
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
        fabric_rotated: measurements.fabric_rotated === true || measurements.fabric_rotated === 'true'
      };

      // ✅ FIX: Pass heading inventory so calculator can look up fullness_ratio
      const headingInventory = inventory.filter(item => item.category === 'heading' || item.subcategory === 'heading' || item.category === 'hardware' // Some headings might be in hardware category
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

      // ✅ FIX: Convert measurements from user's unit to cm BEFORE calculation
      const widthInUserUnit = parseFloat(measurements.rail_width);
      const heightInUserUnit = parseFloat(measurements.drop);
      const poolingInUserUnit = parseFloat(measurements.pooling_amount || "0");
      
      const width = convertLength(widthInUserUnit, units.length, 'cm');
      const height = convertLength(heightInUserUnit, units.length, 'cm');
      const pooling = convertLength(poolingInUserUnit, units.length, 'cm');

      // ✅ Create enriched measurements with converted values
      const enrichedMeasurementsWithConversion = {
        ...enrichedMeasurements,
        rail_width: width.toString(),
        drop: height.toString(),
        pooling_amount: pooling.toString()
      };

      // Use the unified calculateFabricUsage function that handles both curtains AND blinds
      const result = calculateFabricUsage(enrichedMeasurementsWithConversion, [selectedTemplate], fabricItemWithHeadings);

      // Transform the result to match the expected format for display
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
        measurements: {
          width,
          height,
          pooling
        }
      });
      const calculatedTotalCost = result.details?.sqm 
        ? result.details.sqm * pricePerMeter 
        : result.meters * pricePerMeter;
      console.log('📊 VisualMeasurementSheet fabricCalculation - FULL DEBUG:', {
        hasBlindData: !!result.details?.sqm,
        sqm: result.details?.sqm,
        resultMeters: result.meters,
        resultYards: result.yards,
        pricePerMeter,
        calculationFormula: result.details?.sqm 
          ? `${result.details.sqm} sqm × ${pricePerMeter} = ${calculatedTotalCost}`
          : `${result.meters} m × ${pricePerMeter} = ${calculatedTotalCost}`,
        calculatedTotalCost,
        widthsRequired: result.widthsRequired,
        fabricOrientation: result.fabricOrientation,
        fullResultObject: result
      });
      
      // ✅ CRITICAL FIX: Use actual calculated meters from orientationCalculator
      // The orientation calculator already accounts for:
      // - Vertical: widthsRequired × dropPerWidth  
      // - Horizontal: widthsRequired × requiredWidth (curtain width, NOT drop)
      // - Multiple horizontal pieces when drop > fabric width
      // DO NOT recalculate - trust the calculator!
      const orderedLinearMeters = result.meters; // Already includes waste
      const remnantMeters = 0; // Remnant tracking should be done at fabric pool level, not here
      
      // Calculate total width with fullness and all allowances for manufacturing cost calculation
      const fullnessRatioValue = parseFloat(enrichedMeasurements.heading_fullness as any) || 0;
      const requiredWidth = width * fullnessRatioValue;
      const totalWidthWithAllowances = requiredWidth + returnLeft + returnRight + totalSideHems;
      
      const fabricCalcResult = {
        linearMeters: result.meters, // Actual fabric used in calculation
        orderedLinearMeters: orderedLinearMeters, // = result.meters (trust the calculator)
        remnantMeters: 0, // Remnant calculation belongs in fabric pool tracking
        dropPerWidthMeters: result.meters / (result.widthsRequired || 1), // Meters per width
        totalCost: calculatedTotalCost,
        pricePerMeter: pricePerMeter,
        widthsRequired: result.widthsRequired || 1,
        railWidth: width,
        // ✅ FIX: Use dynamic heading_fullness from measurements, NO hardcoded fallbacks
        fullnessRatio: fullnessRatioValue,
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
        // ✅ FIX: Add totalWidthWithAllowances for manufacturing cost calculation
        totalWidthWithAllowances: totalWidthWithAllowances,
        // Add horizontal pieces info for leftover tracking (only when applicable)
        ...(result.horizontalPiecesNeeded && result.horizontalPiecesNeeded > 1 && { 
          horizontalPiecesNeeded: result.horizontalPiecesNeeded 
        }),
        ...(result.leftoverFromLastPiece && result.leftoverFromLastPiece > 0 && { 
          leftoverFromLastPiece: result.leftoverFromLastPiece 
        }),
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
    recalcTrigger, // CRITICAL: Force recalc when trigger changes
    selectedFabric, 
    selectedTemplate, 
    inventory
  ]);

  // Notify parent when fabric calculation changes
  useEffect(() => {
    console.log('🔄 VisualMeasurementSheet: Fabric calculation changed, notifying parent:', {
      hasFabricCalculation: !!fabricCalculation,
      totalCost: fabricCalculation?.totalCost,
      linearMeters: fabricCalculation?.linearMeters,
      pricePerMeter: fabricCalculation?.pricePerMeter,
      hasCallback: !!onFabricCalculationChange
    });
    
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
    const symbol = getCurrencySymbol(units.currency);
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
                {treatmentCategory === 'panel_glide' || treatmentCategory === 'plantation_shutters' || treatmentCategory === 'shutters' || treatmentCategory === 'awning' ? <TreatmentPreviewEngine windowType={windowType} treatmentType={treatmentCategory || treatmentType} measurements={{
              ...measurements,
              width: parseFloat(measurements.rail_width || measurements.width || '200'),
              height: parseFloat(measurements.drop || measurements.height || '200'),
              drop: parseFloat(measurements.drop || measurements.height || '200'),
              frame_type: measurements.frame_type,
              control_type: measurements.control_type,
              fabric_pattern: measurements.fabric_pattern,
              valance_style: measurements.valance_style,
              projection: measurements.projection
            }} template={selectedTemplate} selectedItems={{
              material: selectedFabric ? inventory.find(item => item.id === selectedFabric) : undefined
            }} hideDetails={true} /> : /* Blinds visual */
            treatmentCategory === 'blinds' || treatmentCategory === 'roller_blinds' || treatmentCategory === 'venetian_blinds' || treatmentCategory === 'roman_blinds' || treatmentCategory === 'cellular_blinds' || treatmentCategory === 'vertical_blinds' || selectedTemplate?.curtain_type === 'roller_blind' || selectedTemplate?.curtain_type === 'roman_blind' || selectedTemplate?.curtain_type === 'venetian_blind' || selectedTemplate?.curtain_type === 'vertical_blind' || selectedTemplate?.curtain_type === 'cellular_blind' || selectedTemplate?.curtain_type === 'cellular_shade' ? <DynamicBlindVisual windowType={windowType} measurements={measurements} template={selectedTemplate} blindType={treatmentCategory === 'roller_blinds' || treatmentCategory === 'blinds' || selectedTemplate?.curtain_type === 'roller_blind' ? 'roller' : treatmentCategory === 'venetian_blinds' || selectedTemplate?.curtain_type === 'venetian_blind' ? 'venetian' : treatmentCategory === 'vertical_blinds' || selectedTemplate?.curtain_type === 'vertical_blind' ? 'vertical' : treatmentCategory === 'roman_blinds' || selectedTemplate?.curtain_type === 'roman_blind' ? 'roman' : treatmentCategory === 'cellular_blinds' || selectedTemplate?.curtain_type === 'cellular_blind' || selectedTemplate?.curtain_type === 'cellular_shade' ? 'cellular' : 'roller'} mountType={measurements.mount_type || 'outside'} chainSide={measurements.chain_side || 'right'} controlType={measurements.control_type} material={selectedMaterial || selectedFabricItem} selectedColor={measurements.selected_color} /> : (/* Curtains visual */
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
              
              {/* Color Selection - for fabric or material with colors (from tags array or colors field) */}
              {(() => {
                // Helper to extract colors from an item - check tags array, colors array, or colors string
                const getColorsFromItem = (item: any): string[] => {
                  if (!item) return [];
                  // Check tags array first (primary storage)
                  if (Array.isArray(item.tags) && item.tags.length > 0) return item.tags;
                  // Check colors array
                  if (Array.isArray(item.colors) && item.colors.length > 0) return item.colors;
                  // Check colors as comma-separated string
                  if (typeof item.colors === 'string' && item.colors.trim()) {
                    return item.colors.split(',').map((c: string) => c.trim()).filter(Boolean);
                  }
                  return [];
                };
                
                // Get colors from fabric first, then material
                const fabricColors = getColorsFromItem(selectedFabricItem);
                const materialColors = getColorsFromItem(selectedMaterial);
                const availableColors = fabricColors.length > 0 ? fabricColors : materialColors;
                
                if (availableColors.length > 0) {
                  return (
                    <div className="container-level-1 rounded-lg p-3 mt-2">
                      <ColorSelector 
                        colors={availableColors}
                        selectedColor={measurements.selected_color}
                        onColorSelect={(color) => handleInputChange('selected_color', color)}
                        readOnly={readOnly}
                      />
                      {/* Visual feedback showing selected color */}
                      {measurements.selected_color && (
                        <div className="flex items-center gap-2 mt-3 p-2 bg-primary/10 rounded-lg border border-primary/20">
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-background shadow-sm" 
                            style={{ backgroundColor: measurements.selected_color.startsWith('#') ? measurements.selected_color : measurements.selected_color.toLowerCase() }}
                          />
                          <span className="text-sm font-medium text-foreground">Selected: {measurements.selected_color}</span>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })()}
              
              {/* Fabric & Pricing Calculations Section - Below Visual - Only for curtains/romans with fabric calculations */}
              {(treatmentCategory === 'curtains' || treatmentCategory === 'roman_blinds') && selectedFabricItem && selectedTemplate && <AdaptiveFabricPricingDisplay selectedFabricItem={selectedFabricItem} fabricCalculation={fabricCalculation} template={selectedTemplate} measurements={measurements} treatmentCategory={treatmentCategory} />}
              
              {/* Fabric Rotation Toggle - Moved from Curtain Configuration - Only for curtains/romans */}
              {(treatmentCategory === 'curtains' || treatmentCategory === 'roman_blinds') && selectedFabricItem && measurements.rail_width && measurements.drop && <div className="container-level-1 rounded-lg p-3 mt-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <Label className="text-sm font-semibold text-card-foreground cursor-pointer">
                        Rotate Fabric 90° (Manual)
                      </Label>
                      <div className="text-xs text-muted-foreground mt-1 space-y-1">
                      {(() => {
                      const fabricWidthCm = selectedFabricItem.fabric_width || 137;
                      // CRITICAL FIX: measurements.drop is in MM (database standard)
                      // Convert to CM for fabric rotation calculation
                      const dropMM = parseFloat(measurements.drop) || 0;
                      const drop = dropMM / 10; // Convert MM to CM
                      const headerHem = parseFloat(measurements.header_allowance_cm) || 8;
                      const bottomHem = parseFloat(measurements.bottom_hem_cm) || 15;
                      const pooling = parseFloat(measurements.pooling_amount_cm) || 0;
                      const totalDrop = drop + headerHem + bottomHem + pooling;
                      
                      console.log('🔄 Fabric rotation calculation:', {
                        dropMM,
                        dropCM: drop,
                        totalDropCM: totalDrop,
                        fabricWidthCm,
                        note: 'Converted MM to CM for display'
                      });

                      const fabricRotated = measurements.fabric_rotated === true || measurements.fabric_rotated === 'true';
                      const willNeedMultiplePieces = totalDrop > fabricWidthCm;
                      
                      // Show current status - default is always vertical unless user toggles
                      if (fabricRotated) {
                        // User has toggled ON - railroaded/horizontal orientation
                        if (willNeedMultiplePieces) {
                          const piecesNeeded = Math.ceil(totalDrop / fabricWidthCm);
                          const leftover = (piecesNeeded * fabricWidthCm) - totalDrop;
                          return <>
                                  <p>✓ Fabric rotated - railroaded with horizontal seaming</p>
                                  <p className="text-amber-600">Drop ({formatFromCM(totalDrop, units.length)}) exceeds fabric width ({formatFromCM(fabricWidthCm, units.length)})</p>
                                  <p className="text-muted-foreground">Requires {piecesNeeded} horizontal pieces with {(piecesNeeded - 1)} seam(s). Leftover: {formatFromCM(leftover, units.length)} tracked.</p>
                                </>;
                        } else {
                          return <>
                                  <p>✓ Fabric rotated - railroaded orientation</p>
                                  <p className="text-primary">Fabric width used for drop, buying length for curtain width</p>
                                </>;
                        }
                      } else {
                        // Default: vertical orientation (no rotation)
                        return <>
                                <p>✓ Standard vertical orientation (default)</p>
                                <p className="text-muted-foreground">Buying drops for height, seaming widths for curtain width. Toggle ON to railroad if fabric is wide enough.</p>
                              </>;
                      }
                    })()}
                      </div>
                    </div>
                    <Switch 
                      checked={measurements.fabric_rotated === true || measurements.fabric_rotated === 'true'} 
                      onCheckedChange={(checked) => {
                        console.log("🔄 Fabric rotation toggle clicked:", {
                          checked,
                          currentValue: measurements.fabric_rotated,
                          willChangeTo: checked.toString()
                        });
                        handleInputChange("fabric_rotated", checked.toString());
                      }} 
                      disabled={readOnly || !selectedFabricItem}
                    />
                  </div>
                </div>}
            </div>

            {/* Measurement Inputs Section */}
            <div className="lg:w-3/5 space-y-2">
              {/* ESSENTIAL MEASUREMENTS - Only show for curtains and blinds, NOT for wallpaper */}
              {treatmentCategory as string !== 'wallpaper' && <div className="container-level-1 rounded-lg p-3">
                

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs">W</span>
                      <Label htmlFor="rail_width" className="text-sm font-bold text-card-foreground">
                        {measurementLabels.width}
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
                        {measurementLabels.height}
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
              
              
              <div className="space-y-2">
                <div>
                  <Label className="text-xs font-semibold mb-2 block text-card-foreground">Curtain Type</Label>
                  
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

                {/* Pooling Configuration - Moved from below */}
                {selectedFabricItem && measurements.rail_width && measurements.drop && <div className="mt-4 pt-3 border-t border-border">
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs font-medium mb-2 block">Pooling Position</Label>
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
                            <Label htmlFor="above_floor" className="text-xs">Above floor (hanging)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="touching_floor" id="touching_floor" />
                            <Label htmlFor="touching_floor" className="text-xs">Touching floor</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="below_floor" id="below_floor" />
                            <Label htmlFor="below_floor" className="text-xs">Below floor (pooling)</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {poolingOption === "below_floor" && <div className="space-y-3">
                          <div>
                            <Label htmlFor="pooling_amount" className="text-xs font-medium">Pooling Amount</Label>
                            <p className="text-[10px] text-muted-foreground mb-1">How much fabric pools on the floor</p>
                            <Input id="pooling_amount" type="number" step="0.25" value={poolingAmount} onChange={e => handleInputChange("pooling_amount", e.target.value)} placeholder="2.00" readOnly={readOnly} className="font-semibold text-sm" />
                          </div>
                          
                          {/* Fabric Usage Impact Indicator */}
                          {hasValue(poolingAmount) && selectedFabric && fabricCalculation && <div className="p-2 bg-amber-100/50 border border-amber-300 rounded text-[10px]">
                              <div className="font-medium text-amber-800 mb-1">
                                ✓ Pooling included in fabric calculation
                              </div>
                              <div className="text-amber-700 space-y-1">
                                <div>• Pooling amount: {displayValue(poolingAmount)} added to drop</div>
                                <div>• Extra fabric: ~{(parseFloat(poolingAmount) / 100 * fabricCalculation.widthsRequired).toFixed(2)}{units.fabric}</div>
                                <div>• Total fabric: {fabricCalculation.linearMeters.toFixed(2)}{units.fabric} (includes pooling)</div>
                              </div>
                            </div>}
                          
                          {hasValue(poolingAmount) && !selectedFabric && <div className="p-2 bg-amber-100/50 border border-amber-300 rounded text-[10px]">
                              <div className="text-amber-700">
                                💡 Select a fabric above to see how pooling affects fabric usage
                              </div>
                            </div>}
                        </div>}
                    </div>
                  </div>}
              </div>
            </div>}

            {/* Roman Blind Configuration - Single/Double (Only for roman_blinds) */}
            {treatmentCategory === 'roman_blinds' && <div className="container-level-1 rounded-lg p-3">
              <div className="space-y-2">
                <div>
                  <Label className="text-xs font-semibold mb-2 block text-card-foreground">Roman Blind Configuration</Label>
                  
                  <RadioGroup value={curtainType || 'single'} onValueChange={value => {
                    console.log("Roman blind configuration changed to:", value);
                    handleInputChange("curtain_type", value);
                  }} disabled={readOnly} className="grid grid-cols-2 gap-2">
                    <div className="container-level-3 rounded-lg p-2 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="single" id="roman-single" className="w-4 h-4" />
                        <Label htmlFor="roman-single" className="text-xs font-medium text-card-foreground cursor-pointer flex-1">Single (One blind)</Label>
                      </div>
                    </div>
                    <div className="container-level-3 rounded-lg p-2 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="double" id="roman-double" className="w-4 h-4" />
                        <Label htmlFor="roman-double" className="text-xs font-medium text-card-foreground cursor-pointer flex-1">Double (Two blinds on one headrail)</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>}


              {/* CURTAIN-SPECIFIC FIELDS - Dynamic Options from Template - Only for curtains/romans */}
              {(treatmentType === 'curtains' || treatmentType === 'roman_blinds') && <div className="space-y-3 px-3">
                  <DynamicCurtainOptions 
                    measurements={measurements} 
                    onChange={onMeasurementChange} 
                    template={selectedTemplate} 
                    selectedEyeletRing={measurements.selected_eyelet_ring} 
                    onEyeletRingChange={ringId => onMeasurementChange('selected_eyelet_ring', ringId)} 
                    onHeadingChange={headingId => onMeasurementChange('selected_heading', headingId)}
                    onLiningChange={liningType => onMeasurementChange('selected_lining', liningType)}
                    onOptionPriceChange={(optionType, price, name) => {
                      console.log(`Option ${optionType} changed: ${name} - ${price}`);
                    }}
                    selectedOptions={selectedOptions}
                    onSelectedOptionsChange={onSelectedOptionsChange}
                  />
                </div>}

              {/* BLIND-SPECIFIC FIELDS - Dynamic Options */}
              {/* Show dynamic options for all blind and shutter types */}
              {(treatmentType === 'blinds' || treatmentType === 'roller_blinds' || treatmentType === 'venetian_blinds' || treatmentType === 'vertical_blinds' || treatmentType === 'cellular_blinds' || treatmentType === 'panel_glide' || treatmentType === 'plantation_shutters' || treatmentType === 'shutters' || treatmentType === 'awning') && (() => {
                console.log('📍 Rendering DynamicRollerBlindFields with:', {
                  treatmentType,
                  treatmentCategory,
                  templateId: selectedTemplate?.id,
                  templateName: selectedTemplate?.name,
                  templateCurtainType: selectedTemplate?.curtain_type,
                  selectedTemplateKeys: selectedTemplate ? Object.keys(selectedTemplate) : []
                });
                
                return (
                  <div className="space-y-3 px-3">
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
                );
              })()}

              {/* Additional Measurements for Curtain Makers - Hidden as per user request */}
              {/* {treatmentType === 'curtains' && <details className="group">... */}


          </div>
            </div>)}
        </div>
      </div>
    </div>;
};
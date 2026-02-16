import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ruler, Calculator, Scissors, Check } from "lucide-react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { getPriceFromGrid } from "@/hooks/usePricingGrids";
import { useFabricEnrichment } from "@/hooks/pricing/useFabricEnrichment";
import { convertLength } from "@/hooks/useBusinessSettings";
import { userInputToCM, fromCM, fromMM, validateMeasurement } from "@/utils/measurementBoundary";
import { PoolUsageDisplay } from "../PoolUsageDisplay";
import { PoolUsage } from "@/hooks/useProjectFabricPool";
import { detectTreatmentType, getMeasurementLabels } from "@/utils/treatmentTypeDetection";
import { PricingGridPreview } from "../PricingGridPreview";
import { formatDimensionsFromCM, formatFromCM, getUnitLabel } from "@/utils/measurementFormatters";
import { getCurrencySymbol } from "@/utils/formatCurrency";
import { getBlindHemDefaults, calculateBlindSqm } from "@/utils/blindCalculationDefaults";
// Centralized formulas used by orientationCalculator - calculations happen there, results passed via fabricCalculation prop
// CRITICAL: DO NOT call useCurtainEngine here - use ONLY the engineResult prop from parent
// See STOP_RECALCULATING.md for architecture decision

interface AdaptiveFabricPricingDisplayProps {
  selectedFabricItem: any;
  fabricCalculation: any;
  template: any;
  measurements: Record<string, any>;
  treatmentCategory: string;
  poolUsage?: PoolUsage | null;
  // Leftover fabric tracking
  leftoverFabricIds?: string[]; // IDs of leftover pieces being used
  usedLeftoverCount?: number; // How many widths come from leftover
  // Use leftover for horizontal seaming
  useLeftoverForHorizontal?: boolean;
  onToggleLeftoverForHorizontal?: () => void;
  /**
   * Pre-computed engine result from parent - SINGLE SOURCE OF TRUTH
   * For curtains/romans, this MUST be provided by parent (DynamicWindowWorksheet)
   * This component is DISPLAY-ONLY - it never calculates, only renders
   */
  engineResult?: any | null;
}
export const AdaptiveFabricPricingDisplay = ({
  selectedFabricItem,
  fabricCalculation,
  template,
  measurements,
  treatmentCategory,
  poolUsage,
  leftoverFabricIds = [],
  usedLeftoverCount = 0,
  useLeftoverForHorizontal = false,
  onToggleLeftoverForHorizontal,
  engineResult,
}: AdaptiveFabricPricingDisplayProps) => {
  const {
    units,
    getLengthUnitLabel,
    getFabricUnitLabel
  } = useMeasurementUnits();

  // CRITICAL: This component is DISPLAY-ONLY
  // engineResult comes from parent (DynamicWindowWorksheet calls useCurtainEngine once)
  // fabricCalculation comes from parent (VisualMeasurementSheet calculates once)
  // We NEVER recalculate here - only display the provided values

  // Log engine result for comparison (dev mode)
  if (engineResult && import.meta.env.DEV) {
    console.debug('[CURTAIN_ENGINE_RESULT]', {
      category: treatmentCategory,
      linear_meters: engineResult.linear_meters,
      fabric_cost: engineResult.fabric_cost,
      fullness: engineResult.formula_breakdown?.values?.fullness,
      total_width_cm: engineResult.formula_breakdown?.values?.total_width_cm,
      total_drop_cm: engineResult.formula_breakdown?.values?.total_drop_cm,
      widths_required: engineResult.widths_required,
      formula: engineResult.formula_breakdown?.formula_string,
    });
  }

  // NEW ENGINE: Determine if curtain engine is active and extract display values
  const isCurtainEngineActive =
    !!engineResult &&
    (treatmentCategory === "curtains" || treatmentCategory === "roman_blinds");

  // CRITICAL: No hardcoded fallbacks - use engine or fabricCalculation values only
  // If not found anywhere, displayFullness will be undefined and we show error state
  const displayFullness =
    isCurtainEngineActive && engineResult.fullness != null
      ? engineResult.fullness
      : (fabricCalculation?.fullnessRatio ??
         fabricCalculation?.fullness ??
         null); // NO template fallback here - user must select heading
  
  // Flag for missing fullness - show error instead of guessing
  const isFullnessMissing = displayFullness == null && 
    (treatmentCategory === "curtains" || treatmentCategory === "roman_blinds");

  const displayTotalWidthMm =
    isCurtainEngineActive && engineResult.totalWidthCm != null
      ? engineResult.totalWidthCm * 10 // cm → mm
      : fabricCalculation?.totalWidthMm;

  const displayTotalDropMm =
    isCurtainEngineActive && engineResult.totalDropCm != null
      ? engineResult.totalDropCm * 10 // cm → mm
      : fabricCalculation?.totalDropMm;

  // Use orderedLinearMeters (full widths purchased) to match fabric cost calculation
  // fabricCost = orderedLinearMeters × pricePerMeter, so formula display must use same quantity
  const displayLinearMeters =
    isCurtainEngineActive && engineResult.linear_meters != null
      ? engineResult.linear_meters
      : (fabricCalculation?.orderedLinearMeters ?? fabricCalculation?.linearMeters);

  const displayFabricCost =
    isCurtainEngineActive && engineResult.fabric_cost != null
      ? engineResult.fabric_cost
      : fabricCalculation?.fabricCost ?? fabricCalculation?.totalCost;

  // Detect treatment type and get measurement labels
  const treatmentType = detectTreatmentType(template);
  const measurementLabels = getMeasurementLabels(treatmentType);

  // Enrich fabric with pricing grid data if applicable
  const {
    enrichedFabric,
    isLoading: isEnrichingFabric,
    hasGrid: fabricHasGrid
  } = useFabricEnrichment({
    fabricItem: selectedFabricItem,
    formData: measurements
  });

  // Use enriched fabric for all calculations
  const fabricToUse = enrichedFabric || selectedFabricItem;
  const formatPrice = (price: number) => {
    const symbol = getCurrencySymbol(units.currency);
    return `${symbol}${price.toFixed(2)}`;
  };

  // CRITICAL: Format measurement with explicit source unit
  // Uses centralized measurementBoundary utilities for consistent conversion
  // fabricCalculation values are in CM, raw measurements are in user's display unit
  const formatMeasurement = (value: number, sourceUnit: 'mm' | 'cm' = 'mm') => {
    // Convert source to user's preferred unit using centralized utility
    const converted = sourceUnit === 'cm' 
      ? fromCM(value, units.length) 
      : fromMM(value, units.length);
    return `${converted.toFixed(1)}${getLengthUnitLabel()}`;
  };

  // Format fabric width from cm to user's preferred fabric unit
  const formatFabricWidth = (widthInCm: number) => {
    const converted = convertLength(widthInCm, 'cm', units.fabric);
    return `${converted.toFixed(1)}${getFabricUnitLabel()}`;
  };

  // ============= UNIT-AWARE FABRIC DISPLAY HELPERS =============
  // Convert meters to user's fabric unit
  const metersToFabricUnit = (meters: number): number => {
    if (units.fabric === 'yards') return meters * 1.09361;
    if (units.fabric === 'inches') return meters * 39.3701;
    if (units.fabric === 'cm') return meters * 100;
    return meters; // meters
  };

  // Get fabric unit suffix for display
  const getFabricUnitSuffix = (): string => {
    if (units.fabric === 'yards') return 'yd';
    if (units.fabric === 'inches') return 'in';
    if (units.fabric === 'cm') return 'cm';
    return 'm';
  };

  // Get full fabric unit label for headers
  const getFabricUnitFullLabel = (): string => {
    if (units.fabric === 'yards') return 'Linear Yards to Order';
    if (units.fabric === 'inches') return 'Linear Inches to Order';
    if (units.fabric === 'cm') return 'Linear Centimeters to Order';
    return 'Linear Meters to Order';
  };

  // Format price per fabric unit (adjusts price based on unit)
  const formatPricePerFabricUnit = (pricePerMeter: number): string => {
    let adjustedPrice = pricePerMeter;
    if (units.fabric === 'yards') adjustedPrice = pricePerMeter / 1.09361;
    else if (units.fabric === 'cm') adjustedPrice = pricePerMeter / 100;
    return `${formatPrice(adjustedPrice)}/${getFabricUnitSuffix()}`;
  };

  // Format fabric quantity with unit
  const formatFabricQuantity = (meters: number, decimals: number = 2): string => {
    return `${metersToFabricUnit(meters).toFixed(decimals)}${getFabricUnitSuffix()}`;
  };

  // Check if this treatment uses pricing grid - look at FABRIC item, not template
  // Templates just specify pricing_type, but the actual grid data comes from fabric
  const fabricUsesPricingGrid = fabricToUse?.pricing_grid_data || fabricToUse?.resolved_grid_data;
  // ✅ FIX: If fabric HAS a pricing grid, USE IT - regardless of template setting
  const usesPricingGrid = fabricUsesPricingGrid; // Fabric grid takes priority

  // Use fabric's pricing grid data, not template's
  const gridDataToUse = fabricToUse?.pricing_grid_data || fabricToUse?.resolved_grid_data;

  // Check if fabric is sold per sqm
  const isFabricPerSqm = fabricToUse?.price_per_unit === 'sqm';

  // Determine if this is a curtain-type treatment
  const isCurtainType = treatmentCategory === 'curtains' || treatmentCategory === 'roman_blinds' || template?.fullness_ratio > 1;

  // CRITICAL: Calculate grid price if applicable
  // ✅ FIX: measurements are in USER'S DISPLAY UNIT (cm, inches, mm), NOT always MM
  // Must convert from user's unit to CM for grid lookup
  // ✅ CURTAIN FIX: For curtains, apply fullness + hems + returns BEFORE grid lookup
  let gridPrice = 0;
  let gridWidthCm = 0;
  let gridDropCm = 0;
  let effectiveGridWidthCm = 0; // For display - shows what was used for lookup
  if (usesPricingGrid && gridDataToUse && measurements.rail_width && measurements.drop) {
    // ✅ CRITICAL FIX: measurements are in user's display unit, convert TO cm using centralized utility
    const rawWidth = parseFloat(measurements.rail_width);
    const rawDrop = parseFloat(measurements.drop);
    // Use centralized conversion utility
    const rawWidthCm = userInputToCM(rawWidth, units.length);
    const rawDropCm = userInputToCM(rawDrop, units.length);
    
    // ✅ CRITICAL: For CURTAINS/ROMAN, apply fullness + hems + returns BEFORE grid lookup
    const isCurtainForGrid = treatmentCategory === 'curtains' || treatmentCategory === 'roman_blinds';
    
    if (isCurtainForGrid) {
      // Get values from template (single source of truth) - values in CM
      const fullness = displayFullness || 1;
      const sideHemCm = (template?.side_hem || 0) * 2; // Both sides, already in CM
      const returnLeftCm = template?.return_left || 0;
      const returnRightCm = template?.return_right || 0;
      const returnsCm = returnLeftCm + returnRightCm;
      
      // Formula: (width + hems + returns) × fullness
      effectiveGridWidthCm = (rawWidthCm + sideHemCm + returnsCm) * fullness;
      gridWidthCm = effectiveGridWidthCm;
      gridDropCm = rawDropCm; // Drop stays as-is for grid lookup
      
      console.log('📊 CURTAIN GRID WIDTH CALCULATION:', {
        rawWidthCm,
        sideHemCm,
        returnsCm,
        fullness,
        formula: `(${rawWidthCm.toFixed(1)} + ${sideHemCm} + ${returnsCm}) × ${fullness} = ${effectiveGridWidthCm.toFixed(1)}cm`,
        effectiveGridWidthCm: effectiveGridWidthCm.toFixed(1),
        gridDropCm: gridDropCm.toFixed(1)
      });
    } else {
      // For blinds - use raw dimensions (correct for blinds)
      gridWidthCm = rawWidthCm;
      gridDropCm = rawDropCm;
      effectiveGridWidthCm = rawWidthCm;
    }
    
    gridPrice = getPriceFromGrid(gridDataToUse, gridWidthCm, gridDropCm);

    // ✅ IMPROVED ERROR HANDLING: If grid returns 0, log helpful diagnostic
    if (gridPrice === 0) {
      console.error('⚠️ GRID PRICE IS ZERO - Check:', {
        gridData: gridDataToUse,
        dimensions: `${gridWidthCm.toFixed(1)}cm × ${gridDropCm.toFixed(1)}cm`,
        isCurtain: isCurtainForGrid,
        possibleReasons: ['1. Dimensions outside grid range', '2. Grid data format incorrect', '3. Fabric pricing grid not properly assigned']
      });
    }
    console.log('📊 GRID PRICE DEBUG:', {
      rawInput: { width: rawWidth, drop: rawDrop, userUnit: units.length },
      rawCm: { width: rawWidthCm.toFixed(1), drop: rawDropCm.toFixed(1) },
      effectiveCm: { gridWidthCm: gridWidthCm.toFixed(1), gridDropCm: gridDropCm.toFixed(1) },
      isCurtainType: isCurtainForGrid,
      hasGridData: !!gridDataToUse,
      gridPrice,
      fabricName: fabricToUse?.name || 'NO FABRIC'
    });
  }

  // ✅ FIX: measurements are in USER'S DISPLAY UNIT, convert to CM using centralized utility
  const calculateSquareMeters = () => {
    if (!measurements.rail_width || !measurements.drop) return 0;
    const rawWidth = parseFloat(measurements.rail_width);
    const rawDrop = parseFloat(measurements.drop);
    // Use centralized conversion utility
    const widthCm = userInputToCM(rawWidth, units.length);
    const dropCm = userInputToCM(rawDrop, units.length);

    // Get hem defaults from template (centralized source)
    const hems = getBlindHemDefaults(template);

    // Calculate sqm with hems using centralized function
    const blindCalc = calculateBlindSqm(widthCm, dropCm, hems);
    console.log('📐 SQM CALCULATION (with hems):', {
      rawInput: { width: rawWidth, drop: rawDrop, userUnit: units.length },
      convertedCm: { widthCm, dropCm },
      hems,
      effectiveDimensions: `${blindCalc.effectiveWidthCm}cm × ${blindCalc.effectiveHeightCm}cm`,
      sqm: blindCalc.sqm,
      widthCalcNote: blindCalc.widthCalcNote,
      heightCalcNote: blindCalc.heightCalcNote
    });
    return blindCalc.sqm;
  };

  // Calculate linear meters for roller blinds - waste comes from template
  // ✅ FIX: measurements are in USER'S DISPLAY UNIT, convert to meters using centralized utility
  const calculateLinearMeters = () => {
    if (!measurements.drop) return 0;
    const rawDrop = parseFloat(measurements.drop);
    // Use centralized conversion - first to CM, then divide by 100 to get meters
    const dropCm = userInputToCM(rawDrop, units.length);
    const dropM = dropCm / 100;
    // Use template waste if configured, otherwise no waste (fail explicit)
    const wasteMultiplier = template?.waste_percent 
      ? 1 + (template.waste_percent / 100) 
      : 1; // No hidden waste if not configured
    return dropM * wasteMultiplier;
  };
  const renderPricingGridDisplay = () => <div className="space-y-4">
      {/* Pool Usage Display */}
      {poolUsage && <PoolUsageDisplay poolUsage={poolUsage} fabricName={fabricToUse.name} unit={getFabricUnitLabel()} />}
      
      {/* Selected Fabric */}
      <div className="container-level-3 rounded-md p-3 space-y-2">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Calculator className="w-3.5 h-3.5" />
          Fabric: {fabricToUse.name}
        </h4>
        <div className="text-xs space-y-1 text-muted-foreground">
            <div className="flex justify-between">
              <span>Width:</span>
              <span className={`font-medium ${fabricToUse.fabric_width ? 'text-foreground' : 'text-destructive'}`}>
                {fabricToUse.fabric_width ? formatFabricWidth(fabricToUse.fabric_width) : 'Not set - check inventory'}
              </span>
            </div>
          {fabricHasGrid && fabricToUse.resolved_grid_name && <div className="flex justify-between">
              <span>Pricing Grid:</span>
              <span className="font-medium text-foreground text-green-600">{fabricToUse.resolved_grid_name}</span>
            </div>}
        </div>
      </div>

      {/* Grid Price - Simple Display */}
      {(() => {
        // ✅ FIX: Apply markup to grid price for display
        const gridMarkup = fabricToUse?.pricing_grid_markup ?? 0;
        const markupMultiplier = gridMarkup > 0 ? (1 + gridMarkup / 100) : 1;
        const gridPriceWithMarkup = gridPrice * markupMultiplier;
        
        return (
          <div className="container-level-3 rounded-md p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Price</h4>
              {gridDataToUse && <PricingGridPreview gridData={gridDataToUse} gridName={fabricToUse?.resolved_grid_name || fabricToUse?.name} gridCode={fabricToUse?.resolved_grid_code} />}
            </div>
            <div className="text-xs space-y-1 text-muted-foreground">
              <div className="flex justify-between">
                <span>{isCurtainType ? 'Effective Width × Drop:' : 'Dimensions:'}</span>
                <span className="font-medium text-foreground">
                  {formatDimensionsFromCM(gridWidthCm, gridDropCm, units.length)}
                  {isCurtainType && effectiveGridWidthCm > 0 && (
                    <span className="text-muted-foreground text-xs ml-1">(with fullness)</span>
                  )}
                </span>
              </div>
              {gridMarkup > 0 && (
                <div className="flex justify-between">
                  <span>Base Grid Price:</span>
                  <span className="font-medium text-foreground">{formatPrice(gridPrice)}</span>
                </div>
              )}
              {gridMarkup > 0 && (
                <div className="flex justify-between">
                  <span>Markup ({gridMarkup}%):</span>
                  <span className="font-medium text-foreground">+{formatPrice(gridPriceWithMarkup - gridPrice)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 mt-2">
                <span className="font-medium">{gridMarkup > 0 ? 'Total Price:' : 'Grid Price:'}</span>
                <span className="font-medium text-foreground text-lg">{formatPrice(gridPriceWithMarkup)}</span>
              </div>
              <p className="text-xs text-muted-foreground italic pt-1">
                Pricing grid includes all material and manufacturing costs
              </p>
            </div>
          </div>
        );
      })()}
    </div>;
  const renderRollerBlindDisplay = () => {
    const sqm = calculateSquareMeters();
    const linearM = calculateLinearMeters();
    const fabricCost = isFabricPerSqm ? sqm * (fabricToUse.price_per_meter || 0) : linearM * (fabricToUse.price_per_meter || 0);
    return <div className="space-y-4">
        {/* Selected Fabric */}
        <div className="container-level-3 rounded-md p-3 space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Calculator className="w-3.5 h-3.5" />
            Fabric: {fabricToUse.name}
          </h4>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div className="flex justify-between">
              <span>Width:</span>
              <span className={`font-medium ${fabricToUse.fabric_width ? 'text-foreground' : 'text-destructive'}`}>
                {fabricToUse.fabric_width ? formatFabricWidth(fabricToUse.fabric_width) : 'Not set - check inventory'}
              </span>
            </div>
            {fabricHasGrid && fabricToUse.resolved_grid_name && <div className="flex justify-between">
                <span>Pricing Grid:</span>
                <span className="font-medium text-foreground text-green-600">{fabricToUse.resolved_grid_name}</span>
              </div>}
          </div>
        </div>

        {/* Fabric Cost - Hide for grid-priced blinds (redundant with Cost Summary) */}
        {!fabricHasGrid && <div className="container-level-3 rounded-md p-3 space-y-2">
            <h4 className="font-semibold text-sm">Fabric Cost</h4>
            <div className="text-xs space-y-1 text-muted-foreground">
              <div className="flex justify-between">
                <span>Dimensions:</span>
                <span className="font-medium text-foreground">
                  {formatMeasurement(parseFloat(measurements.rail_width) || 0)} × {formatMeasurement(parseFloat(measurements.drop) || 0)}
                </span>
              </div>
              {isFabricPerSqm ? <>
                  <div className="flex justify-between">
                    <span>Area:</span>
                    <span className="font-medium text-foreground">{sqm.toFixed(2)} {units.area === 'sq_feet' ? 'sq ft' : 'sqm'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per {units.area === 'sq_feet' ? 'sq ft' : 'sqm'}:</span>
                    <span className="font-medium text-foreground">{formatPrice(fabricToUse.price_per_meter || 0)}</span>
                  </div>
                </> : <>
                  <div className="flex justify-between">
                    <span>Linear {getFabricUnitLabel('long')}:</span>
                    <span className="font-medium text-foreground">{linearM.toFixed(2)} {getFabricUnitLabel()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per {getFabricUnitLabel()}:</span>
                    <span className="font-medium text-foreground">{formatPrice(fabricToUse.price_per_meter || 0)}</span>
                  </div>
                </>}
              <div className="flex justify-between border-t border-border pt-2 mt-2">
                <span className="font-medium">Fabric Cost:</span>
                <span className="font-medium text-foreground text-lg">{formatPrice(fabricCost)}</span>
              </div>
            </div>
          </div>}
      </div>;
  };
  const renderCurtainDisplay = () => {
    // Add null safety check
    if (!fabricCalculation) {
      return <div className="container-level-3 rounded-md p-3 text-center text-sm text-muted-foreground">
          No fabric calculation data available
        </div>;
    }

    // Check if this is a blind - show square meter calculation
    const isBlindTreatment = treatmentCategory === 'roman_blinds' || treatmentCategory === 'roller_blinds' || treatmentCategory === 'venetian_blinds' || treatmentCategory === 'vertical_blinds';
    if (isBlindTreatment && fabricCalculation.sqm) {
      console.log('🔍 AdaptiveFabricPricingDisplay BLIND rendering:', {
        isBlindTreatment,
        fabricCalculationSqm: fabricCalculation.sqm,
        totalCost: fabricCalculation.totalCost,
        pricePerMeter: fabricCalculation.pricePerMeter,
        fullFabricCalculation: fabricCalculation
      });
      return <div className="space-y-4">
          {/* Pool Usage Display - Show fabric source */}
          {poolUsage && <PoolUsageDisplay poolUsage={poolUsage} fabricName={selectedFabricItem?.name || fabricToUse.name} unit={getFabricUnitLabel()} />}
          
          {/* Fabric Information */}
          <div className="container-level-3 rounded-md p-3 space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Calculator className="w-3.5 h-3.5" />
              Selected Fabric
            </h4>
            <div className="text-xs space-y-1 text-muted-foreground">
              <div className="flex justify-between">
                <span>Fabric:</span>
                <span className="font-medium text-foreground">{selectedFabricItem?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Width:</span>
                <span className={`font-medium ${selectedFabricItem?.fabric_width ? 'text-foreground' : 'text-destructive'}`}>
                  {selectedFabricItem?.fabric_width ? formatFabricWidth(selectedFabricItem.fabric_width) : 'Not set - check inventory'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Price/sqm:</span>
                <span className="font-medium text-foreground">{formatPrice(fabricCalculation.pricePerMeter || 0)}</span>
              </div>
            </div>
          </div>

          {/* Blind Dimensions with Hems */}
          <div className="container-level-3 rounded-md p-3 space-y-2">
            <h4 className="font-semibold text-sm">Blind Dimensions</h4>
            <div className="text-xs space-y-1 text-muted-foreground">
              {fabricCalculation.widthCalcNote && <div className="text-xs text-muted-foreground">
                  {fabricCalculation.widthCalcNote}
                </div>}
              {fabricCalculation.heightCalcNote && <div className="text-xs text-muted-foreground">
                  {fabricCalculation.heightCalcNote}
                </div>}
            </div>
          </div>

          {/* Square Meter Calculation */}
          <div className="container-level-3 rounded-md p-3 bg-primary/5">
            <div className="text-xs space-y-2">
              <div className="flex justify-between font-medium">
                <span>Area Required:</span>
                <span className="text-foreground">{fabricCalculation.sqm.toFixed(2)} sqm</span>
              </div>
              <div className="flex justify-between font-medium text-base">
                <span>Fabric Cost:</span>
                <span className="text-foreground">{formatPrice(fabricCalculation.totalCost || 0)}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Area: {formatMeasurement(parseFloat(measurements.rail_width) || 0)} × {formatMeasurement(parseFloat(measurements.drop) || 0)}
              </div>
            </div>
          </div>
        </div>;
    }

    // Regular curtain display
    // CRITICAL: Show error state if fullness is missing
    if (isFullnessMissing) {
      return <div className="container-level-3 rounded-md p-3 border-destructive border bg-destructive/10">
          <div className="flex items-center gap-2 text-destructive">
            <Ruler className="w-4 h-4" />
            <span className="font-semibold text-sm">Fullness Not Configured</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Select a heading style to determine fullness ratio, or configure fullness in template settings.
          </p>
        </div>;
    }
    
    return <div className="space-y-4">
        {/* Pool Usage Display - Show fabric source */}
        {poolUsage && <PoolUsageDisplay poolUsage={poolUsage} fabricName={selectedFabricItem?.name || fabricToUse.name} unit={getFabricUnitLabel()} />}
        
        {/* Fabric Information */}
        <div className="container-level-3 rounded-md p-3 space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Calculator className="w-3.5 h-3.5" />
            Selected Fabric
          </h4>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div className="flex justify-between">
              <span>Fabric:</span>
              <span className="font-medium text-foreground">{selectedFabricItem?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Width:</span>
              <span className={`font-medium ${selectedFabricItem?.fabric_width ? 'text-foreground' : 'text-destructive'}`}>
                {selectedFabricItem?.fabric_width 
                  ? `${formatFabricWidth(selectedFabricItem.fabric_width)} (${(selectedFabricItem.fabric_width / 2.54).toFixed(0)}in)` 
                  : 'Not set - check inventory'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Price/meter:</span>
              <span className="font-medium text-foreground">{formatPrice(fabricCalculation.pricePerMeter || 0)}</span>
            </div>
          </div>
        </div>

        {/* Fabric Usage Breakdown */}
        <div className="container-level-3 rounded-md p-3 space-y-2">
          <h4 className="font-semibold text-sm">Fabric Usage Breakdown</h4>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div className="flex justify-between">
              <span>Fabric Width:</span>
              <span className={`font-medium ${selectedFabricItem?.fabric_width ? 'text-foreground' : 'text-destructive'}`}>
                {selectedFabricItem?.fabric_width 
                  ? `${formatFabricWidth(selectedFabricItem.fabric_width)} (${(selectedFabricItem.fabric_width / 2.54).toFixed(0)}in)` 
                  : 'Not set - check inventory'}
              </span>
            </div>
            
            {fabricCalculation.fabricOrientation === 'vertical' ? <>
                <div className="flex justify-between pt-2 mt-2 border-t border-border/30">
                  <span className="font-medium">Total Width:</span>
                  <span className="font-medium text-foreground">
                    {displayTotalWidthMm != null 
                      ? formatMeasurement(displayTotalWidthMm, 'mm')
                      : (() => {
                          // ✅ CRITICAL FIX: measurements.rail_width is in USER'S DISPLAY UNIT (inches, cm, mm)
                          // Must convert to MM before using in calculations
                          const rawRailWidth = parseFloat(measurements.rail_width) || 0;
                          const railWidthMM = convertLength(rawRailWidth, units.length, 'mm');
                          const fullness = displayFullness || 1;
                          const returnsMM = (fabricCalculation?.returns || 0) * 10;
                          const sideHemsMM = (fabricCalculation?.totalSideHems || 0) * 10;
                          const seamHemMM = (parseFloat(measurements.seam_hems) || 1) * 10;
                          const seamAllowanceMM = (fabricCalculation?.seamsRequired || 0) * seamHemMM * 2;
                          const totalWidthMM = railWidthMM * fullness + returnsMM + sideHemsMM + seamAllowanceMM;
                          return formatMeasurement(totalWidthMM, 'mm');
                        })()}
                  </span>
                </div>
                <div className="flex justify-between pl-2 text-muted-foreground/70">
                  <span>Rail Width × Fullness:</span>
                  <span>
                    {(() => {
                  // ✅ FIX: Convert from user's display unit to MM first
                  const rawRailWidth = parseFloat(measurements.rail_width) || 0;
                  const railWidthMM = convertLength(rawRailWidth, units.length, 'mm');
                  return formatMeasurement(railWidthMM * (displayFullness || 1), 'mm');
                })()}
                  </span>
                </div>
                <div className="flex justify-between pl-2 text-muted-foreground/70">
                  <span>Side Hems:</span>
                  <span>
                    {formatMeasurement(fabricCalculation.totalSideHems || 0, 'cm')}
                    {(() => {
                      const sideHem = template?.side_hems || template?.side_hem || 0;
                      const curtainType = measurements?.curtain_type || template?.panel_configuration || 'pair';
                      const curtainCount = curtainType === 'pair' || curtainType === 'double' ? 2 : 1;
                      if (sideHem > 0 && curtainCount > 1) {
                        return <span className="text-[10px] ml-1">({formatMeasurement(sideHem, 'cm')} × 2 sides × {curtainCount})</span>;
                      }
                      return null;
                    })()}
                  </span>
                </div>
                <div className="flex justify-between pl-2 text-muted-foreground/70">
                  <span>Returns (L+R):</span>
                  <span>{formatMeasurement(fabricCalculation.returns || 0, 'cm')}</span>
                </div>
                {fabricCalculation.seamsRequired > 0 && <div className="flex justify-between pl-2 text-muted-foreground/70">
                    <span>Seam Allowances:</span>
                    <span>{formatMeasurement((fabricCalculation.seamsRequired || 0) * (parseFloat(measurements.seam_hems) || 1) * 2, 'cm')} ({fabricCalculation.seamsRequired} seam(s) × 2)</span>
                  </div>}
                <div className="flex justify-between pl-2 pt-1 border-t border-border/20">
                  <span>Widths Required:</span>
                  <span className="font-medium text-foreground">
                    {/* ✅ SINGLE SOURCE OF TRUTH: Use engineResult when available */}
                    {engineResult?.widths_required ?? fabricCalculation.widthsRequired ?? 0} width(s)
                  </span>
                </div>
              </> : <>
                {/* Width Total - determines linear meters needed */}
                <div className="flex justify-between pt-2 mt-2 border-t border-border/30">
                  <span className="font-medium">Width Total:</span>
                  <span className="font-medium text-foreground"></span>
                </div>
                <div className="flex justify-between pl-2">
                  <span>Rail Width:</span>
                  <span className="font-medium text-foreground">
                    {fabricCalculation.railWidth ? formatMeasurement(fabricCalculation.railWidth, 'cm') // fabricCalculation stores in CM
                : formatMeasurement(measurements.rail_width || 0, 'mm') // raw measurements are in MM
                }
                  </span>
                </div>
                <div className="flex justify-between pl-2">
              <span>Fullness:</span>
              <span className={`font-medium ${displayFullness != null ? 'text-foreground' : 'text-destructive'}`}>
                {displayFullness != null ? `${displayFullness.toFixed(1)}x` : 'Select heading style'}
              </span>
                </div>
                <div className="flex justify-between pl-2">
                  <span>Returns (L+R):</span>
                  <span className="font-medium text-foreground">{formatMeasurement(fabricCalculation.returns || 0, 'cm')}</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span>Side Hems:</span>
                  <span className="font-medium text-foreground">
                    {formatMeasurement(fabricCalculation.totalSideHems || 0, 'cm')}
                    {(() => {
                      const sideHem = template?.side_hems || template?.side_hem || 0;
                      const curtainType = measurements?.curtain_type || template?.panel_configuration || 'pair';
                      const curtainCount = curtainType === 'pair' || curtainType === 'double' ? 2 : 1;
                      if (sideHem > 0 && curtainCount > 1) {
                        return <span className="text-[10px] ml-1 text-muted-foreground">({formatMeasurement(sideHem, 'cm')} × 2 × {curtainCount})</span>;
                      }
                      return null;
                    })()}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border/30 pt-2 mt-2">
                  <span className="font-medium">Total Width:</span>
                  <span className="font-medium text-foreground">
                    {displayTotalWidthMm != null
                      ? formatMeasurement(displayTotalWidthMm, 'mm')
                      : (() => {
                          const railWidthCM = fabricCalculation?.railWidth || (measurements.rail_width || 0) / 10;
                          const returnsCM = fabricCalculation?.returns || 0;
                          const sideHemsCM = fabricCalculation?.totalSideHems || 0;
                          const totalCM = railWidthCM * displayFullness + returnsCM + sideHemsCM;
                          return formatMeasurement(totalCM, 'cm');
                        })()}
                  </span>
                </div>
                
                {/* Height Total - how we cover the drop */}
                <div className="flex justify-between pt-2 mt-2 border-t border-border/30">
                  <span className="font-medium">Height Total:</span>
                  <span className="font-medium text-foreground"></span>
                </div>
                <div className="flex justify-between pl-2">
                  <span>Drop Height:</span>
                  <span className="font-medium text-foreground">
                    {fabricCalculation.drop ? formatMeasurement(fabricCalculation.drop, 'cm') // fabricCalculation stores in CM
                : formatMeasurement(measurements.drop || 0, 'mm') // raw measurements are in MM
                }
                  </span>
                </div>
                {fabricCalculation.horizontalPiecesNeeded && fabricCalculation.horizontalPiecesNeeded > 1 && <>
                    <div className="flex justify-between pl-2">
                      <span>Horizontal Pieces:</span>
                      <span className="font-medium text-foreground">{fabricCalculation.horizontalPiecesNeeded} piece(s)</span>
                    </div>
                    <div className="flex justify-between pl-2">
                      <span>Horizontal Seams:</span>
                      <span className="font-medium text-foreground">{fabricCalculation.horizontalPiecesNeeded - 1} seam(s)</span>
                    </div>
                  </>}
                {fabricCalculation.seamsRequired > 0 && <div className="flex justify-between pl-2">
                    <span>Seam Allowance:</span>
                    <span className="font-medium text-foreground">{formatMeasurement(fabricCalculation.seamsRequired * (measurements.seam_hem || 1) * 2)}</span>
                  </div>}
                
                {/* Warning when second width is needed for railroaded fabric - with Use Leftover option */}
                {fabricCalculation.horizontalPiecesNeeded && fabricCalculation.horizontalPiecesNeeded > 1 && <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-amber-800 dark:text-amber-200 font-medium">
                          ⚠️ Second width required
                        </p>
                        <p className="text-amber-700 dark:text-amber-300 text-xs mt-0.5">
                          Drop height exceeds fabric width by ~{(() => {
                      const fabricWidthCM = selectedFabricItem?.fabric_width;
                      if (!fabricWidthCM) return 'unknown (fabric width not set)';
                      const dropCM = fabricCalculation.drop || parseFloat(measurements.drop) / 10 || 0;
                      const shortfallCM = Math.max(0, dropCM - fabricWidthCM);
                      return formatMeasurement(shortfallCM, 'cm');
                    })()}
                        </p>
                      </div>
                      {onToggleLeftoverForHorizontal && <Button variant={useLeftoverForHorizontal ? "default" : "outline"} size="sm" onClick={onToggleLeftoverForHorizontal} className={useLeftoverForHorizontal ? "bg-green-600 hover:bg-green-700 text-white text-xs" : "text-xs border-amber-500 text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/30"}>
                          {useLeftoverForHorizontal ? <><Check className="h-3 w-3 mr-1" /> Using Leftover</> : <><Scissors className="h-3 w-3 mr-1" /> Use Leftover</>}
                        </Button>}
                    </div>
                    {useLeftoverForHorizontal && <div className="mt-2 text-xs text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 p-1.5 rounded border border-green-300 dark:border-green-700">
                        ✓ Leftover fabric will cover extra width - no additional fabric cost
                      </div>}
                  </div>}
              </>}
          </div>
        </div>

        {/* Height Calculations */}
        <div className="container-level-3 rounded-md p-3 space-y-2">
          <h4 className="font-semibold text-sm">Height Breakdown</h4>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div className="flex justify-between">
              <span>Drop Height:</span>
              <span className="font-medium text-foreground">{formatMeasurement(fabricCalculation.drop || 0, 'cm')}</span>
            </div>
            <div className="flex justify-between">
              <span>Header Hem:</span>
              <span className="font-medium text-foreground">+{formatMeasurement(fabricCalculation.headerHem || 0, 'cm')}</span>
            </div>
            <div className="flex justify-between">
              <span>Bottom Hem:</span>
              <span className="font-medium text-foreground">+{formatMeasurement(fabricCalculation.bottomHem || 0, 'cm')}</span>
            </div>
            {(fabricCalculation.pooling || 0) > 0 && <div className="flex justify-between">
                <span>Pooling:</span>
                <span className="font-medium text-foreground">+{formatMeasurement(fabricCalculation.pooling, 'cm')}</span>
              </div>}
            {/* REMOVED: Seam Allowance from Height Breakdown - it's a WIDTH calculation, not HEIGHT
               * Seam allowance is added to linear meters (width-based), not to Total Drop (height-based)
               * Displaying it here with a "+" made the math appear incorrect (108.5 + 5 + 5 + 1.4 ≠ 118.5)
               * The actual calculation correctly adds seams to linear meters in calculateTreatmentPricing.ts
               */}
            <div className="flex justify-between border-t border-border pt-1 mt-1">
              <span>Total Drop:</span>
              <span className="font-medium text-foreground">
                {displayTotalDropMm != null 
                  ? formatMeasurement(displayTotalDropMm, 'mm') 
                  : formatMeasurement(fabricCalculation.totalDrop || 0, 'cm')}
              </span>
            </div>
            {(fabricCalculation.wastePercent || 0) > 0 && <div className="flex justify-between">
                <span>Waste ({fabricCalculation.wastePercent}%):</span>
                <span className="font-medium text-foreground">+{formatMeasurement((fabricCalculation.totalDrop || 0) * (fabricCalculation.wastePercent || 0) / 100)}</span>
              </div>}
          </div>
        </div>

        {/* Pricing calculation section hidden */}
      </div>;
  };
  return <Card className="container-level-2">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="fabric-calculations" className="border-none">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-primary" />
              <span className="font-semibold">Fabric & Pricing Calculations</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            {usesPricingGrid ? renderPricingGridDisplay() : !isCurtainType ? renderRollerBlindDisplay() : renderCurtainDisplay()}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>;
};
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ruler, Calculator, Scissors, Check } from "lucide-react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { getPriceFromGrid } from "@/hooks/usePricingGrids";
import { useFabricEnrichment } from "@/hooks/pricing/useFabricEnrichment";
import { convertLength } from "@/hooks/useBusinessSettings";
import { PoolUsageDisplay } from "../PoolUsageDisplay";
import { PoolUsage } from "@/hooks/useProjectFabricPool";
import { detectTreatmentType, getMeasurementLabels } from "@/utils/treatmentTypeDetection";
import { PricingGridPreview } from "../PricingGridPreview";
import { formatDimensionsFromCM, formatFromCM, getUnitLabel } from "@/utils/measurementFormatters";
import { getCurrencySymbol } from "@/utils/formatCurrency";
import { getBlindHemDefaults, calculateBlindSqm } from "@/utils/blindCalculationDefaults";
import { useCurtainEngine } from "@/engine/useCurtainEngine";
// Centralized formulas used by orientationCalculator - calculations happen there, results passed via fabricCalculation prop

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
   * NEW: Pre-computed engine result from parent
   * When provided, this is used instead of calling useCurtainEngine internally
   * This ensures SINGLE SOURCE OF TRUTH - engine called once at parent level
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
  engineResult: engineResultProp,
}: AdaptiveFabricPricingDisplayProps) => {
  const {
    units,
    getLengthUnitLabel,
    getFabricUnitLabel
  } = useMeasurementUnits();

  // NEW ENGINE: Use pre-computed result from parent if provided, otherwise calculate locally
  // This ensures a single source of truth when parent passes the result
  const localEngineResult = useCurtainEngine({
    treatmentCategory,
    measurements,
    selectedTemplate: template,
    selectedFabric: selectedFabricItem,
    selectedOptions: [], // Options handled separately in this component
    units,
  });
  
  // Use prop if provided (single source from parent), otherwise use local calculation
  const engineResult = engineResultProp !== undefined ? engineResultProp : localEngineResult;

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

  const displayLinearMeters =
    isCurtainEngineActive && engineResult.linear_meters != null
      ? engineResult.linear_meters
      : fabricCalculation?.linearMeters;

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
  // fabricCalculation values are in CM, raw measurements are in MM
  const formatMeasurement = (value: number, sourceUnit: 'mm' | 'cm' = 'mm') => {
    // Convert source to MM first, then to user's preferred unit
    const valueMm = sourceUnit === 'cm' ? value * 10 : value;
    const converted = convertLength(valueMm, 'mm', units.length);
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
    // ✅ CRITICAL FIX: measurements are in user's display unit, convert TO cm
    const rawWidth = parseFloat(measurements.rail_width);
    const rawDrop = parseFloat(measurements.drop);
    // Convert from user's display unit (could be cm, inches, mm) to CM for grid lookup
    const rawWidthCm = convertLength(rawWidth, units.length, 'cm');
    const rawDropCm = convertLength(rawDrop, units.length, 'cm');
    
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

  // CRITICAL: Calculate square meters with hems - measurements are in MM
  // Uses centralized blind calculation defaults for consistency
  // ✅ FIX: measurements are in USER'S DISPLAY UNIT, convert to CM
  const calculateSquareMeters = () => {
    if (!measurements.rail_width || !measurements.drop) return 0;
    const rawWidth = parseFloat(measurements.rail_width);
    const rawDrop = parseFloat(measurements.drop);
    // ✅ CRITICAL FIX: Convert from user's display unit to CM
    const widthCm = convertLength(rawWidth, units.length, 'cm');
    const dropCm = convertLength(rawDrop, units.length, 'cm');

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
  // ✅ FIX: measurements are in USER'S DISPLAY UNIT, convert to meters
  const calculateLinearMeters = () => {
    if (!measurements.drop) return 0;
    const rawDrop = parseFloat(measurements.drop);
    // ✅ CRITICAL FIX: Convert from user's display unit to meters
    const dropM = convertLength(rawDrop, units.length, 'cm') / 100; // Convert to meters
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
        const gridMarkup = fabricToUse?.pricing_grid_markup || 0;
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
                {selectedFabricItem?.fabric_width ? formatFabricWidth(selectedFabricItem.fabric_width) : 'Not set - check inventory'}
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
                {selectedFabricItem?.fabric_width ? formatFabricWidth(selectedFabricItem.fabric_width) : 'Not set - check inventory'}
              </span>
            </div>
            
            {fabricCalculation.fabricOrientation === 'vertical' ? <>
                <div className="flex justify-between pt-2 mt-2 border-t border-border/30">
                  <span className="font-medium">Total Width:</span>
                  <span className="font-medium text-foreground">
                    {displayTotalWidthMm != null 
                      ? formatMeasurement(displayTotalWidthMm, 'mm')
                      : (() => {
                          // Fallback calculation if engine not active
                          const railWidthMM = parseFloat(measurements.rail_width) || 0;
                          const fullness = displayFullness;
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
                  const railWidthMM = parseFloat(measurements.rail_width) || 0;
                  return formatMeasurement(railWidthMM * displayFullness, 'mm');
                })()}
                  </span>
                </div>
                <div className="flex justify-between pl-2 text-muted-foreground/70">
                  <span>Side Hems:</span>
                  <span>{formatMeasurement(fabricCalculation.totalSideHems || 0, 'cm')}</span>
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
                  <span className="font-medium text-foreground">{fabricCalculation.widthsRequired || 0} width(s)</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span>Drops Used:</span>
                  <span className="font-medium text-foreground">{measurements.quantity || 1} drop(s)</span>
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
                  <span className="font-medium text-foreground">{formatMeasurement(fabricCalculation.totalSideHems || 0, 'cm')}</span>
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
            {(fabricCalculation.totalSeamAllowance || 0) > 0 && <div className="flex justify-between">
                <span>Seam Allowance:</span>
                <span className="font-medium text-foreground">+{formatMeasurement(fabricCalculation.totalSeamAllowance || 0, 'cm')}</span>
              </div>}
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

        {/* Total Calculation - Dynamic based on pricing method */}
        <div className="container-level-3 rounded-md p-3 bg-primary/5">
          <div className="text-xs space-y-2">
            {(() => {
            // ✅ FIX: Get pricing method from selected pricing method in measurements
            const selectedPricingMethod = measurements.selected_pricing_method ? template?.pricing_methods?.find((m: any) => m.id === measurements.selected_pricing_method) : null;

            // Determine pricing unit dynamically - prioritize selected method, then template
            const pricingMethod = selectedPricingMethod?.pricing_type || template?.makeup_pricing_method || template?.pricing_method || 'per_metre';
            const isByWidth = pricingMethod === 'per_width';
            const isByDrop = pricingMethod === 'per_drop';
            const isByPanel = pricingMethod === 'per_panel';
            const isBySqm = pricingMethod === 'per_sqm' || template?.pricing_type === 'per_sqm';
            const isByMetre = pricingMethod === 'per_metre' && !isByWidth && !isByDrop && !isByPanel && !isBySqm;

            // ✅ Detect horizontal/railroaded fabric early for use throughout
            const isHorizontal = fabricCalculation.fabricRotated === true || fabricCalculation.fabricOrientation === 'horizontal';
            console.log('💰 AdaptiveFabricPricingDisplay - Pricing method:', {
              selectedPricingMethodId: measurements.selected_pricing_method,
              selectedPricingMethod: selectedPricingMethod?.name,
              pricingType: pricingMethod,
              templateDefault: template?.makeup_pricing_method || template?.pricing_method,
              isHorizontal
            });

            // Calculate appropriate quantity based on method
            let quantity = 0;
            let unitLabel = '';
            let unitSuffix = '';
            let calculationText = '';
            let calculationBreakdown = '';

            // CRITICAL: Get the correct price based on how fabric is sold
            let pricePerUnit = 0;
            let totalCost = 0;
            if (isBySqm) {
              // For blinds with per_sqm pricing, get the sqm price from fabric
              pricePerUnit = selectedFabricItem?.selling_price || selectedFabricItem?.price_per_meter || selectedFabricItem?.unit_price || 0;
              console.log('💰 Getting fabric price for sqm blind:', {
                selectedFabricItem: selectedFabricItem?.name,
                selling_price: selectedFabricItem?.selling_price,
                price_per_meter: selectedFabricItem?.price_per_meter,
                unit_price: selectedFabricItem?.unit_price,
                pricePerUnit
              });

              // Square meter calculation - use sqm directly from fabricCalculation (includes hems and waste for blinds)
              let sqm = fabricCalculation.sqm || 0;

              // FALLBACK: If sqm is 0 or missing, calculate it with hems for blinds
              if (sqm === 0 && treatmentCategory && treatmentCategory.includes('blind')) {
                // ✅ CRITICAL: measurements.rail_width and drop are stored in MM, convert to CM
                const widthCm = (parseFloat(measurements.rail_width || '0')) / 10;
                const heightCm = (parseFloat(measurements.drop || '0')) / 10;
                const headerHem = template?.blind_header_hem_cm || template?.header_allowance || 8;
                const bottomHem = template?.blind_bottom_hem_cm || template?.bottom_hem || 8;
                const sideHem = template?.blind_side_hem_cm || 0;
                const wastePercent = template?.waste_percent || 0;
                const effectiveWidth = widthCm + sideHem * 2;
                const effectiveHeight = heightCm + headerHem + bottomHem;
                const sqmRaw = effectiveWidth * effectiveHeight / 10000;
                sqm = sqmRaw * (1 + wastePercent / 100);
                console.log('🔧 FALLBACK sqm calculation:', {
                  widthCm,
                  heightCm,
                  headerHem,
                  bottomHem,
                  sideHem,
                  wastePercent,
                  effectiveWidth,
                  effectiveHeight,
                  sqmRaw,
                  sqmWithWaste: sqm
                });
              }

              // Calculate total cost
              totalCost = sqm * pricePerUnit;
              quantity = sqm;
              unitLabel = 'Area Required';
              unitSuffix = ' sqm';
              calculationText = `${quantity.toFixed(2)} sqm × ${formatPrice(pricePerUnit)}/sqm`;

              // Show the actual dimensions used in calculation
              const widthForCalc = fabricCalculation.railWidth || parseFloat(measurements.rail_width || '0');
              const heightForCalc = fabricCalculation.totalDrop || fabricCalculation.drop || parseFloat(measurements.drop || '0');
              calculationBreakdown = `Width: ${widthForCalc.toFixed(0)}cm × Height: ${heightForCalc.toFixed(0)}cm = ${quantity.toFixed(2)} sqm × ${formatPrice(pricePerUnit)}/sqm = ${formatPrice(totalCost)}`;
            } else if (isByDrop) {
              // Per drop calculation
              pricePerUnit = fabricCalculation.pricePerMeter || selectedFabricItem?.selling_price || 0;
              quantity = fabricCalculation.widthsRequired || 1;
              totalCost = quantity * pricePerUnit;
              unitLabel = 'Drops Required';
              unitSuffix = ' drop(s)';
              calculationText = `${quantity.toFixed(0)} drops × ${formatPrice(pricePerUnit)}/drop`;
              calculationBreakdown = `${quantity} width(s) × ${(fabricCalculation.totalDrop || 0).toFixed(0)}cm drop × ${formatPrice(pricePerUnit)}/drop = ${formatPrice(totalCost)}`;
            } else if (isByPanel) {
              // Per panel calculation
              pricePerUnit = fabricCalculation.pricePerMeter || selectedFabricItem?.selling_price || 0;
              quantity = measurements.curtain_type === 'pair' ? 2 : 1;
              totalCost = quantity * pricePerUnit;
              unitLabel = 'Panels Required';
              unitSuffix = ' panel(s)';
              calculationText = `${quantity.toFixed(0)} panels × ${formatPrice(pricePerUnit)}/panel`;
              calculationBreakdown = `${quantity} panel(s) [${measurements.curtain_type || 'single'}] × ${formatPrice(pricePerUnit)}/panel = ${formatPrice(totalCost)}`;
            } else if (isByWidth) {
              // Per width calculation - charge per fabric width needed
              pricePerUnit = fabricCalculation.pricePerMeter || selectedFabricItem?.selling_price || 0;
              quantity = fabricCalculation.widthsRequired || 1;
              totalCost = quantity * pricePerUnit;
              unitLabel = 'Widths Required';
              unitSuffix = ' width(s)';
              calculationText = `${quantity.toFixed(0)} width(s) × ${formatPrice(pricePerUnit)}/width`;
              calculationBreakdown = `${quantity} fabric width(s) needed × ${formatPrice(pricePerUnit)}/width = ${formatPrice(totalCost)}`;
            } else {
              // Linear meter calculation (default)
              // ✅ FIX: For horizontal/railroaded fabric, show required WIDTH to order
              // For vertical, show total length needed
              pricePerUnit = fabricCalculation.pricePerMeter || selectedFabricItem?.selling_price || 0;
              if (isHorizontal) {
                // ✅ USE engine result or fabricCalculation.linearMeters
                // Use engine result if available, otherwise fall back to fabricCalculation
                const linearMeters = isCurtainEngineActive && displayLinearMeters != null
                  ? displayLinearMeters
                  : (fabricCalculation.linearMeters || 0);
                const horizontalPiecesNeeded = fabricCalculation.horizontalPiecesNeeded || 1;

                // ✅ CRITICAL FIX: When using leftover fabric, only charge for 1 piece
                const piecesToCharge = useLeftoverForHorizontal && horizontalPiecesNeeded > 1 ? 1 : horizontalPiecesNeeded;
                const totalLinearMetersToOrder = linearMeters * piecesToCharge;

                // 🔍 DEBUG: Log horizontal calculation
                console.log('🔧 HORIZONTAL DISPLAY CALCULATION:', {
                  linearMeters: `${linearMeters.toFixed(2)}m per piece`,
                  horizontalPiecesNeeded,
                  piecesToCharge,
                  useLeftoverForHorizontal,
                  totalLinearMetersToOrder: `${totalLinearMetersToOrder.toFixed(2)}m`,
                  calculation: `${linearMeters.toFixed(2)}m × ${piecesToCharge} pieces = ${totalLinearMetersToOrder.toFixed(2)}m`,
                  pricePerUnit: formatPrice(pricePerUnit),
                  totalCost: formatPrice(totalLinearMetersToOrder * pricePerUnit),
                  usingEngine: isCurtainEngineActive
                });
                quantity = totalLinearMetersToOrder;
                totalCost = isCurtainEngineActive && displayFabricCost != null
                  ? displayFabricCost
                  : quantity * pricePerUnit;
                unitLabel = getFabricUnitFullLabel();
                unitSuffix = getFabricUnitSuffix();
                const linearInUserUnit = metersToFabricUnit(linearMeters);
                const quantityInUserUnit = metersToFabricUnit(quantity);
                if (horizontalPiecesNeeded > 1) {
                  if (useLeftoverForHorizontal) {
                    // ✅ Using leftover - only charging for 1 piece
                    calculationText = `${linearInUserUnit.toFixed(2)}${unitSuffix} × 1 piece (using leftover) = ${quantityInUserUnit.toFixed(2)}${unitSuffix} × ${formatPricePerFabricUnit(pricePerUnit)}`;
                    calculationBreakdown = `Using leftover fabric for second piece. Charging for 1 piece: ${linearInUserUnit.toFixed(2)}${unitSuffix} × ${formatPricePerFabricUnit(pricePerUnit)} = ${formatPrice(totalCost)}`;
                  } else {
                    const totalInUserUnit = metersToFabricUnit(linearMeters * horizontalPiecesNeeded);
                    calculationText = `${linearInUserUnit.toFixed(2)}${unitSuffix} × ${horizontalPiecesNeeded} pieces = ${quantityInUserUnit.toFixed(2)}${unitSuffix} × ${formatPricePerFabricUnit(pricePerUnit)}`;
                    calculationBreakdown = `Railroaded fabric requiring ${horizontalPiecesNeeded} horizontal pieces. ${linearInUserUnit.toFixed(2)}${unitSuffix} per piece × ${horizontalPiecesNeeded} = ${totalInUserUnit.toFixed(2)}${unitSuffix} total × ${formatPricePerFabricUnit(pricePerUnit)} = ${formatPrice(linearMeters * horizontalPiecesNeeded * pricePerUnit)}`;
                  }
                } else {
                  calculationText = `${quantityInUserUnit.toFixed(2)}${unitSuffix} × ${formatPricePerFabricUnit(pricePerUnit)}`;
                  calculationBreakdown = `${linearInUserUnit.toFixed(2)}${unitSuffix} × ${formatPricePerFabricUnit(pricePerUnit)} = ${formatPrice(totalCost)}`;
                }
              } else {
                // Vertical/Standard: Show ORDERED fabric (full widths)
                // Use engine result if available, otherwise fall back to fabricCalculation
                const orderedMeters = isCurtainEngineActive && displayLinearMeters != null 
                  ? displayLinearMeters 
                  : (fabricCalculation.orderedLinearMeters || fabricCalculation.linearMeters || 0);
                const usedMeters = fabricCalculation.linearMeters || 0;
                const remnantMeters = fabricCalculation.remnantMeters || 0;
                quantity = orderedMeters;
                totalCost = isCurtainEngineActive && displayFabricCost != null 
                  ? displayFabricCost 
                  : quantity * pricePerUnit;
                unitLabel = getFabricUnitFullLabel();
                unitSuffix = getFabricUnitSuffix();
                const quantityInUserUnit = metersToFabricUnit(quantity);
                calculationText = `${quantityInUserUnit.toFixed(2)}${unitSuffix} × ${formatPricePerFabricUnit(pricePerUnit)}`;

                // ✅ TRANSPARENT CALCULATION BREAKDOWN
                // CRITICAL: measurements.drop is in MM (database standard), convert to CM for display
                // fabricCalculation.drop is already in CM if available
                const rawDropMm = parseFloat(measurements.drop) || 0;
                const rawDrop = fabricCalculation.drop || (rawDropMm / 10); // MM → CM
                const headerHem = fabricCalculation.details?.headerHem || template?.header_allowance || 0;
                const bottomHem = fabricCalculation.details?.bottomHem || template?.bottom_hem || 0;
                const poolingMm = parseFloat(measurements.pooling) || 0;
                const pooling = fabricCalculation.details?.pooling || (poolingMm / 10); // MM → CM
                const patternRepeat = fabricCalculation.details?.patternRepeat || 0;
                const totalSeamAllowance = fabricCalculation.details?.totalSeamAllowance || 0;
                const widthsRequired = fabricCalculation.widthsRequired || 0;

                // Calculate ACTUAL drop per width used in calculation (all values now in CM)
                const dropWithAllowances = rawDrop + headerHem + bottomHem + pooling + patternRepeat;
                const totalAllowances = headerHem + bottomHem + pooling + patternRepeat;
                console.log('🔍 FABRIC CALCULATION BREAKDOWN DEBUG:', {
                  widthsRequired,
                  rawDrop: `${rawDrop.toFixed(0)}cm`,
                  headerHem: `${headerHem.toFixed(0)}cm`,
                  bottomHem: `${bottomHem.toFixed(0)}cm`,
                  pooling: `${pooling.toFixed(0)}cm`,
                  patternRepeat: `${patternRepeat.toFixed(0)}cm`,
                  totalAllowances: `${totalAllowances.toFixed(0)}cm`,
                  dropWithAllowances: `${dropWithAllowances.toFixed(0)}cm`,
                  totalSeamAllowance: `${totalSeamAllowance.toFixed(0)}cm`,
                  finalQuantity: `${quantity.toFixed(2)}m`,
                  calculation: `${widthsRequired} × ${dropWithAllowances.toFixed(0)}cm + ${totalSeamAllowance.toFixed(0)}cm seams = ${((widthsRequired * dropWithAllowances + totalSeamAllowance) / 100).toFixed(2)}m`,
                  fabricCalculation
                });

                // Build transparent breakdown showing ALL components
                // quantityInUserUnit already declared above for calculationText
                const breakdownQuantity = metersToFabricUnit(quantity);
                if (totalAllowances > 0 || totalSeamAllowance > 0) {
                  let breakdownParts = `${widthsRequired} width(s) × ${dropWithAllowances.toFixed(0)}cm`;
                  if (totalAllowances > 0) {
                    breakdownParts += ` (${rawDrop.toFixed(0)}cm drop + ${totalAllowances.toFixed(0)}cm allowances)`;
                  }
                  if (totalSeamAllowance > 0) {
                    breakdownParts += ` + ${totalSeamAllowance.toFixed(0)}cm seams`;
                  }
                  calculationBreakdown = `${breakdownParts} = ${breakdownQuantity.toFixed(2)}${getFabricUnitSuffix()} × ${formatPricePerFabricUnit(pricePerUnit)} = ${formatPrice(totalCost)}`;
                } else {
                  // Fallback for simple cases
                  calculationBreakdown = `${widthsRequired} width(s) × ${dropWithAllowances.toFixed(0)}cm = ${breakdownQuantity.toFixed(2)}${getFabricUnitSuffix()} × ${formatPricePerFabricUnit(pricePerUnit)} = ${formatPrice(totalCost)}`;
                }
              }
            }

            // 🆕 Calculate seaming labor cost
            let seamingCost = 0;
            if (fabricCalculation.seamsCount && fabricCalculation.seamsCount > 0) {
              const laborRate = template?.labor_rate || 25; // Default $25/hour
              seamingCost = (fabricCalculation.seamLaborHours || 0) * laborRate;
              totalCost += seamingCost;
            }
            return <>
                  {/* Show selected pricing method name if available */}
                  {selectedPricingMethod && <div className="flex justify-between items-start pb-2 border-b border-border/50">
                      <span className="text-muted-foreground">Selected Method:</span>
                      <span className="text-foreground text-right font-medium">
                        {selectedPricingMethod.name}
                      </span>
                    </div>}
                  
                  <div className="flex justify-between items-start">
                    <span className="font-medium">Pricing Method:</span>
                    <span className="text-foreground text-right font-semibold">
                      {isBySqm ? 'Per Square Meter' : isByDrop ? 'Per Drop' : isByPanel ? 'Per Panel' : isByWidth ? 'Per Width' : 'Per Linear Meter'}
                    </span>
                  </div>
                  
                  {calculationBreakdown && <div className="text-xs text-muted-foreground bg-background/50 p-2 rounded font-medium">
                      {calculationBreakdown}
                    </div>}
                  
                  <div className="flex justify-between font-medium pt-1 border-t border-border/50">
                    <span>{unitLabel}:</span>
                    <span className="text-foreground">
                      {isByDrop || isByPanel ? quantity.toFixed(0) : metersToFabricUnit(quantity).toFixed(2)}{unitSuffix}
                    </span>
                  </div>
                  
                  {/* Show leftover information for horizontal/railroaded fabric */}
                  {isHorizontal && fabricCalculation.horizontalPiecesNeeded && (() => {
                const fabricWidthCm = selectedFabricItem?.fabric_width;
                if (!fabricWidthCm) return null;
                const totalDropCm = fabricCalculation.totalDrop || 0;
                const piecesNeeded = fabricCalculation.horizontalPiecesNeeded;
                const requiredWidthM = parseFloat(calculationText.split('×')[0]) / piecesNeeded || 0;

                // Calculate leftover
                const totalFabricOrderedHeightCm = fabricWidthCm * piecesNeeded;
                const leftoverHeightCm = totalFabricOrderedHeightCm - totalDropCm;
                const leftoverSqm = requiredWidthM * 100 * leftoverHeightCm / 10000;
                if (piecesNeeded > 1 || leftoverHeightCm > 10) {
                  return;
                }
                return null;
              })()}
                  
                  {/* Show remnant information if multiple widths - vertical orientation */}
                  {fabricCalculation.widthsRequired > 1 && fabricCalculation.remnantMeters > 0 && <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-3 mt-2">
                      <div className="flex items-start gap-2">
                        <span className="text-2xl">💡</span>
                        <div className="flex-1 space-y-1.5">
                          <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Leftover Fabric: {fabricCalculation.remnantMeters.toFixed(2)}m
                          </div>
                          <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                            This project will generate <strong>{fabricCalculation.remnantMeters.toFixed(2)}m</strong> of leftover fabric from cutting {fabricCalculation.widthsRequired} widths.
                          </p>
                          <div className="pt-1 space-y-1">
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                              ✓ <strong>Charged to this project</strong> - You're paying for this fabric now
                            </p>
                            <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                              ✓ <strong>Free for future use</strong> - When used in other treatments, this leftover won't be charged again
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                              ✓ <strong>Visible in inventory</strong> - Shows as available leftover with yellow badge
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>}
                  
                  {/* 🆕 Show seaming cost if applicable */}
                  {seamingCost > 0 && <div className="flex justify-between text-xs mt-2 pt-2 border-t border-border/50">
                      <span className="text-muted-foreground">+ Seaming Labor ({fabricCalculation.seamsCount} seam(s), {(fabricCalculation.seamLaborHours || 0).toFixed(2)}hrs):</span>
                      <span className="font-medium">{formatPrice(seamingCost)}</span>
                    </div>}
                  
                  <div className="flex justify-between font-semibold text-base pt-1">
                    <span>{seamingCost > 0 ? 'Total (Fabric + Labor):' : 'Fabric Cost:'}</span>
                    <span className="text-foreground">{formatPrice(totalCost)}</span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-1 bg-background/30 p-2 rounded">
                    <div className="font-medium mb-0.5">Formula:</div>
                    {/* Show width breakdown only if actively using leftover */}
                    {usedLeftoverCount > 0 && fabricCalculation.widthsRequired > 1 ? <div className="space-y-2">
                        <div className="space-y-1">
                          {Array.from({
                      length: fabricCalculation.widthsRequired
                    }).map((_, idx) => {
                      const isFromLeftover = idx < usedLeftoverCount;
                      const widthCost = isFromLeftover ? 0 : pricePerUnit;
                      const widthLabel = `Width ${idx + 1}`;
                      return <div key={idx} className="flex items-center gap-2 text-xs">
                                <span className={isFromLeftover ? "text-green-600 dark:text-green-400 font-medium" : ""}>
                                  {widthLabel}: {quantity.toFixed(2)}{unitSuffix}
                                </span>
                                {isFromLeftover ? <span className="text-green-600 dark:text-green-400 text-xs font-medium">
                                    (Reused - no charge)
                                  </span> : <span className="text-muted-foreground">
                                    × {formatPrice(pricePerUnit)}/unit = {formatPrice(widthCost)}
                                  </span>}
                              </div>;
                    })}
                        </div>
                        {usedLeftoverCount > 0 && <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded p-2 mt-1">
                            <div className="text-xs text-green-800 dark:text-green-200">
                              <p className="font-semibold mb-1">♻️ Reusing Leftover Fabric</p>
                              <p className="text-green-700 dark:text-green-300">
                                {usedLeftoverCount} width{usedLeftoverCount > 1 ? 's' : ''} from previous treatment(s) • Already paid for • No additional cost
                              </p>
                            </div>
                          </div>}
                        <div className="pt-1 mt-1 border-t border-border/30 font-medium">
                          Total: {fabricCalculation.widthsRequired} widths × {`${fabricCalculation.widthsRequired - usedLeftoverCount} new`} = {formatPrice(totalCost - seamingCost)}
                        </div>
                      </div> : calculationText}
                  </div>
                </>;
          })()}
          </div>
        </div>
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
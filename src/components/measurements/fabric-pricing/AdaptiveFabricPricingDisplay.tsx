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
  const displayFullness =
    isCurtainEngineActive && engineResult.fullness != null
      ? engineResult.fullness
      : (fabricCalculation?.fullnessRatio ??
         fabricCalculation?.fullness ??
         template?.fullness_ratio ??
         template?.default_fullness_ratio);
  
  // Flag for missing fullness - show error instead of guessing
  const isFullnessMissing = displayFullness == null && isCurtainEngineActive;

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
  // measurements.rail_width and measurements.drop are stored in MM
  let gridPrice = 0;
  let gridWidthCm = 0;
  let gridDropCm = 0;
  if (usesPricingGrid && gridDataToUse && measurements.rail_width && measurements.drop) {
    // Measurements are in mm from database
    const gridWidthMm = parseFloat(measurements.rail_width);
    const gridDropMm = parseFloat(measurements.drop);
    // Convert mm to cm for grid lookup and display
    gridWidthCm = gridWidthMm / 10;
    gridDropCm = gridDropMm / 10;
    gridPrice = getPriceFromGrid(gridDataToUse, gridWidthCm, gridDropCm);

    // ✅ IMPROVED ERROR HANDLING: If grid returns 0, log helpful diagnostic
    if (gridPrice === 0) {
      console.error('⚠️ GRID PRICE IS ZERO - Check:', {
        gridData: gridDataToUse,
        dimensions: `${gridWidthCm}cm × ${gridDropCm}cm`,
        possibleReasons: ['1. Dimensions outside grid range', '2. Grid data format incorrect', '3. Fabric pricing grid not properly assigned']
      });
    }
    console.log('📊 GRID PRICE DEBUG:', {
      railWidthMm: gridWidthMm,
      dropMm: gridDropMm,
      gridWidthCm,
      gridDropCm,
      hasGridData: !!gridDataToUse,
      gridDataStructure: gridDataToUse ? Object.keys(gridDataToUse) : 'NO DATA',
      gridPrice,
      fabricName: fabricToUse?.name || 'NO FABRIC',
      fabricHasGridData: !!(fabricToUse?.pricing_grid_data || fabricToUse?.resolved_grid_data),
      WARNING: gridPrice === 0 ? '⚠️ GRID RETURNING ZERO - Check: 1) Is fabric selected? 2) Does fabric have pricing grid assigned? 3) Are dimensions within grid range?' : '✅ Grid price calculated'
    });
  }

  // CRITICAL: Calculate square meters with hems - measurements are in MM
  // Uses centralized blind calculation defaults for consistency
  const calculateSquareMeters = () => {
    if (!measurements.rail_width || !measurements.drop) return 0;
    const widthMm = parseFloat(measurements.rail_width);
    const dropMm = parseFloat(measurements.drop);
    // Convert mm to cm for calculation
    const widthCm = widthMm / 10;
    const dropCm = dropMm / 10;

    // Get hem defaults from template (centralized source)
    const hems = getBlindHemDefaults(template);

    // Calculate sqm with hems using centralized function
    const blindCalc = calculateBlindSqm(widthCm, dropCm, hems);
    console.log('📐 SQM CALCULATION (with hems):', {
      widthMm,
      dropMm,
      widthCm,
      dropCm,
      hems,
      effectiveDimensions: `${blindCalc.effectiveWidthCm}cm × ${blindCalc.effectiveHeightCm}cm`,
      sqm: blindCalc.sqm,
      widthCalcNote: blindCalc.widthCalcNote,
      heightCalcNote: blindCalc.heightCalcNote
    });
    return blindCalc.sqm;
  };

  // Calculate linear meters for roller blinds (drop + 5% waste)
  const calculateLinearMeters = () => {
    if (!measurements.drop) return 0;
    const dropMm = parseFloat(measurements.drop);
    const dropM = dropMm / 1000;
    return dropM * 1.05; // 5% waste
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
      <div className="container-level-3 rounded-md p-3 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm">Price</h4>
          {gridDataToUse && <PricingGridPreview gridData={gridDataToUse} gridName={fabricToUse?.resolved_grid_name || fabricToUse?.name} gridCode={fabricToUse?.resolved_grid_code} />}
        </div>
        <div className="text-xs space-y-1 text-muted-foreground">
            <div className="flex justify-between">
              <span>Dimensions:</span>
              <span className="font-medium text-foreground">
                {formatDimensionsFromCM(gridWidthCm, gridDropCm, units.length)}
              </span>
            </div>
          <div className="flex justify-between border-t border-border pt-2 mt-2">
            <span className="font-medium">Grid Price:</span>
            <span className="font-medium text-foreground text-lg">{formatPrice(gridPrice)}</span>
          </div>
          <p className="text-xs text-muted-foreground italic pt-1">
            Pricing grid includes all material and manufacturing costs
          </p>
        </div>
      </div>
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
                    <span className="font-medium text-foreground">{sqm.toFixed(2)} sqm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per sqm:</span>
                    <span className="font-medium text-foreground">{formatPrice(fabricToUse.price_per_meter || 0)}</span>
                  </div>
                </> : <>
                  <div className="flex justify-between">
                    <span>Linear Meters:</span>
                    <span className="font-medium text-foreground">{linearM.toFixed(2)} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per meter:</span>
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
                const widthCm = parseFloat(measurements.rail_width || '0');
                const heightCm = parseFloat(measurements.drop || '0');
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
                unitLabel = 'Linear Meters to Order';
                unitSuffix = 'm';
                if (horizontalPiecesNeeded > 1) {
                  if (useLeftoverForHorizontal) {
                    // ✅ Using leftover - only charging for 1 piece
                    calculationText = `${linearMeters.toFixed(2)}m × 1 piece (using leftover) = ${quantity.toFixed(2)}m × ${formatPrice(pricePerUnit)}/m`;
                    calculationBreakdown = `Using leftover fabric for second piece. Charging for 1 piece: ${linearMeters.toFixed(2)}m × ${formatPrice(pricePerUnit)}/m = ${formatPrice(totalCost)}`;
                  } else {
                    calculationText = `${linearMeters.toFixed(2)}m × ${horizontalPiecesNeeded} pieces = ${quantity.toFixed(2)}m × ${formatPrice(pricePerUnit)}/m`;
                    calculationBreakdown = `Railroaded fabric requiring ${horizontalPiecesNeeded} horizontal pieces. ${linearMeters.toFixed(2)}m per piece × ${horizontalPiecesNeeded} = ${(linearMeters * horizontalPiecesNeeded).toFixed(2)}m total × ${formatPrice(pricePerUnit)}/m = ${formatPrice(linearMeters * horizontalPiecesNeeded * pricePerUnit)}`;
                  }
                } else {
                  calculationText = `${quantity.toFixed(2)}m × ${formatPrice(pricePerUnit)}/m`;
                  calculationBreakdown = `${linearMeters.toFixed(2)}m × ${formatPrice(pricePerUnit)}/m = ${formatPrice(totalCost)}`;
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
                unitLabel = 'Linear Meters to Order';
                unitSuffix = 'm';
                calculationText = `${quantity.toFixed(2)}m × ${formatPrice(pricePerUnit)}/m`;

                // ✅ TRANSPARENT CALCULATION BREAKDOWN
                // Extract all components to show accurate formula
                const rawDrop = fabricCalculation.drop || parseFloat(measurements.drop) || 0;
                const headerHem = fabricCalculation.details?.headerHem || template?.header_allowance || 0;
                const bottomHem = fabricCalculation.details?.bottomHem || template?.bottom_hem || 0;
                const pooling = fabricCalculation.details?.pooling || parseFloat(measurements.pooling) || 0;
                const patternRepeat = fabricCalculation.details?.patternRepeat || 0;
                const totalSeamAllowance = fabricCalculation.details?.totalSeamAllowance || 0;
                const widthsRequired = fabricCalculation.widthsRequired || 0;

                // Calculate ACTUAL drop per width used in calculation
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
                if (totalAllowances > 0 || totalSeamAllowance > 0) {
                  let breakdownParts = `${widthsRequired} width(s) × ${dropWithAllowances.toFixed(0)}cm`;
                  if (totalAllowances > 0) {
                    breakdownParts += ` (${rawDrop.toFixed(0)}cm drop + ${totalAllowances.toFixed(0)}cm allowances)`;
                  }
                  if (totalSeamAllowance > 0) {
                    breakdownParts += ` + ${totalSeamAllowance.toFixed(0)}cm seams`;
                  }
                  calculationBreakdown = `${breakdownParts} = ${quantity.toFixed(2)}m × ${formatPrice(pricePerUnit)}/m = ${formatPrice(totalCost)}`;
                } else {
                  // Fallback for simple cases
                  calculationBreakdown = `${widthsRequired} width(s) × ${dropWithAllowances.toFixed(0)}cm = ${quantity.toFixed(2)}m × ${formatPrice(pricePerUnit)}/m = ${formatPrice(totalCost)}`;
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
                      {isByDrop || isByPanel ? quantity.toFixed(0) : quantity.toFixed(2)}{unitSuffix}
                    </span>
                  </div>
                  
                  {/* Show leftover information for horizontal/railroaded fabric */}
                  {isHorizontal && fabricCalculation.horizontalPiecesNeeded && (() => {
                const fabricWidthCm = selectedFabricItem?.fabric_width || 137;
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
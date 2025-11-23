import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Ruler, Calculator } from "lucide-react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { getPriceFromGrid } from "@/hooks/usePricingGrids";
import { useFabricEnrichment } from "@/hooks/pricing/useFabricEnrichment";
import { convertLength } from "@/hooks/useBusinessSettings";
import { PoolUsageDisplay } from "../PoolUsageDisplay";
import { PoolUsage } from "@/hooks/useProjectFabricPool";
import { detectTreatmentType, getMeasurementLabels } from "@/utils/treatmentTypeDetection";

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
}

export const AdaptiveFabricPricingDisplay = ({
  selectedFabricItem,
  fabricCalculation,
  template,
  measurements,
  treatmentCategory,
  poolUsage,
  leftoverFabricIds = [],
  usedLeftoverCount = 0
}: AdaptiveFabricPricingDisplayProps) => {
  const { units, getLengthUnitLabel, getFabricUnitLabel } = useMeasurementUnits();
  
  // Detect treatment type and get measurement labels
  const treatmentType = detectTreatmentType(template);
  const measurementLabels = getMeasurementLabels(treatmentType);
  
  // Enrich fabric with pricing grid data if applicable
  const { enrichedFabric, isLoading: isEnrichingFabric, hasGrid: fabricHasGrid } = useFabricEnrichment({
    fabricItem: selectedFabricItem,
    formData: measurements
  });
  
  // Use enriched fabric for all calculations
  const fabricToUse = enrichedFabric || selectedFabricItem;

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

  // CRITICAL: Format measurement - measurements are stored in MM internally
  const formatMeasurement = (valueInMm: number) => {
    // First convert from mm to user's preferred unit
    const converted = convertLength(valueInMm, 'mm', units.length);
    return `${converted.toFixed(1)}${getLengthUnitLabel()}`;
  };

  // Format fabric width from cm to user's preferred fabric unit
  const formatFabricWidth = (widthInCm: number) => {
    const converted = convertLength(widthInCm, 'cm', units.fabric);
    return `${converted.toFixed(1)}${getFabricUnitLabel()}`;
  };

  // Check if this treatment uses pricing grid
  const usesPricingGrid = template?.pricing_type === 'pricing_grid' && template?.pricing_grid_data;
  
  // Check if fabric is sold per sqm
  const isFabricPerSqm = fabricToUse?.price_per_unit === 'sqm';
  
  // Determine if this is a curtain-type treatment
  const isCurtainType = treatmentCategory === 'curtains' || 
                        treatmentCategory === 'roman_blinds' ||
                        template?.fullness_ratio > 1;

  // CRITICAL: Calculate grid price if applicable
  // measurements.rail_width and measurements.drop are stored in MM
  let gridPrice = 0;
  let gridWidthMm = 0;
  let gridDropMm = 0;
  if (usesPricingGrid && measurements.rail_width && measurements.drop) {
    // Store as mm for proper conversion later
    gridWidthMm = parseFloat(measurements.rail_width);
    gridDropMm = parseFloat(measurements.drop);
    // getPriceFromGrid expects CM, so convert mm to cm
    const gridWidthCm = gridWidthMm / 10;
    const gridDropCm = gridDropMm / 10;
    gridPrice = getPriceFromGrid(template.pricing_grid_data, gridWidthCm, gridDropCm);
    console.log('📊 GRID PRICE CALCULATION:', {
      railWidthMm: gridWidthMm,
      dropMm: gridDropMm,
      gridWidthCm,
      gridDropCm,
      gridPrice
    });
  }

  // CRITICAL: Calculate square meters - measurements are in MM
  const calculateSquareMeters = () => {
    if (!measurements.rail_width || !measurements.drop) return 0;
    const widthMm = parseFloat(measurements.rail_width);
    const dropMm = parseFloat(measurements.drop);
    // Convert mm to m: divide by 1000
    const widthM = widthMm / 1000;
    const dropM = dropMm / 1000;
    const sqm = widthM * dropM;
    return sqm;
  };
  
  // Calculate linear meters for roller blinds (drop + 5% waste)
  const calculateLinearMeters = () => {
    if (!measurements.drop) return 0;
    const dropMm = parseFloat(measurements.drop);
    const dropM = dropMm / 1000;
    return dropM * 1.05; // 5% waste
  };

  const renderPricingGridDisplay = () => (
    <div className="space-y-4">
      {/* Pool Usage Display */}
      {poolUsage && (
        <PoolUsageDisplay
          poolUsage={poolUsage}
          fabricName={fabricToUse.name}
          unit={getFabricUnitLabel()}
        />
      )}
      
      {/* Selected Fabric */}
      <div className="container-level-3 rounded-md p-3 space-y-2">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Calculator className="w-3.5 h-3.5" />
          Fabric: {fabricToUse.name}
        </h4>
        <div className="text-xs space-y-1 text-muted-foreground">
          <div className="flex justify-between">
            <span>Width:</span>
            <span className="font-medium text-foreground">{formatFabricWidth(fabricToUse.fabric_width || 300)}</span>
          </div>
          {fabricHasGrid && fabricToUse.resolved_grid_name && (
            <div className="flex justify-between">
              <span>Pricing Grid:</span>
              <span className="font-medium text-foreground text-green-600">{fabricToUse.resolved_grid_name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid Price - Simple Display */}
      <div className="container-level-3 rounded-md p-3 space-y-2">
        <h4 className="font-semibold text-sm">Price</h4>
        <div className="text-xs space-y-1 text-muted-foreground">
          <div className="flex justify-between">
            <span>Dimensions:</span>
            <span className="font-medium text-foreground">
              {formatMeasurement(gridWidthMm)} × {formatMeasurement(gridDropMm)}
            </span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 mt-2">
            <span className="font-medium">Grid Price:</span>
            <span className="font-medium text-foreground text-lg">{formatPrice(gridPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRollerBlindDisplay = () => {
    const sqm = calculateSquareMeters();
    const linearM = calculateLinearMeters();
    const fabricCost = isFabricPerSqm 
      ? sqm * (fabricToUse.price_per_meter || 0)
      : linearM * (fabricToUse.price_per_meter || 0);
    
    return (
      <div className="space-y-4">
        {/* Selected Fabric */}
        <div className="container-level-3 rounded-md p-3 space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Calculator className="w-3.5 h-3.5" />
            Fabric: {fabricToUse.name}
          </h4>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div className="flex justify-between">
              <span>Width:</span>
              <span className="font-medium text-foreground">{formatFabricWidth(fabricToUse.fabric_width || 300)}</span>
            </div>
            {fabricHasGrid && fabricToUse.resolved_grid_name && (
              <div className="flex justify-between">
                <span>Pricing Grid:</span>
                <span className="font-medium text-foreground text-green-600">{fabricToUse.resolved_grid_name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Fabric Cost - Simple Display */}
        <div className="container-level-3 rounded-md p-3 space-y-2">
          <h4 className="font-semibold text-sm">Fabric Cost</h4>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div className="flex justify-between">
              <span>Dimensions:</span>
              <span className="font-medium text-foreground">
                {formatMeasurement(parseFloat(measurements.rail_width) || 0)} × {formatMeasurement(parseFloat(measurements.drop) || 0)}
              </span>
            </div>
            {isFabricPerSqm ? (
              <>
                <div className="flex justify-between">
                  <span>Area:</span>
                  <span className="font-medium text-foreground">{sqm.toFixed(2)} sqm</span>
                </div>
                <div className="flex justify-between">
                  <span>Price per sqm:</span>
                  <span className="font-medium text-foreground">{formatPrice(fabricToUse.price_per_meter || 0)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span>Linear Meters:</span>
                  <span className="font-medium text-foreground">{linearM.toFixed(2)} m</span>
                </div>
                <div className="flex justify-between">
                  <span>Price per meter:</span>
                  <span className="font-medium text-foreground">{formatPrice(fabricToUse.price_per_meter || 0)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between border-t border-border pt-2 mt-2">
              <span className="font-medium">Fabric Cost:</span>
              <span className="font-medium text-foreground text-lg">{formatPrice(fabricCost)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCurtainDisplay = () => {
    // Add null safety check
    if (!fabricCalculation) {
      return (
        <div className="container-level-3 rounded-md p-3 text-center text-sm text-muted-foreground">
          No fabric calculation data available
        </div>
      );
    }

    // Check if this is a blind - show square meter calculation
    const isBlindTreatment = treatmentCategory === 'roman_blinds' || treatmentCategory === 'roller_blinds' || 
                             treatmentCategory === 'venetian_blinds' || treatmentCategory === 'vertical_blinds';

    if (isBlindTreatment && fabricCalculation.sqm) {
      console.log('🔍 AdaptiveFabricPricingDisplay BLIND rendering:', {
        isBlindTreatment,
        fabricCalculationSqm: fabricCalculation.sqm,
        totalCost: fabricCalculation.totalCost,
        pricePerMeter: fabricCalculation.pricePerMeter,
        fullFabricCalculation: fabricCalculation
      });
      
      return (
        <div className="space-y-4">
          {/* Pool Usage Display - Show fabric source */}
          {poolUsage && (
            <PoolUsageDisplay
              poolUsage={poolUsage}
              fabricName={selectedFabricItem?.name || fabricToUse.name}
              unit={getFabricUnitLabel()}
            />
          )}
          
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
                <span className="font-medium text-foreground">{formatFabricWidth(selectedFabricItem?.fabric_width || 137)}</span>
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
              {fabricCalculation.widthCalcNote && (
                <div className="text-xs text-muted-foreground">
                  {fabricCalculation.widthCalcNote}
                </div>
              )}
              {fabricCalculation.heightCalcNote && (
                <div className="text-xs text-muted-foreground">
                  {fabricCalculation.heightCalcNote}
                </div>
              )}
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
        </div>
      );
    }

    // Regular curtain display
    return (
      <div className="space-y-4">
        {/* Pool Usage Display - Show fabric source */}
        {poolUsage && (
          <PoolUsageDisplay
            poolUsage={poolUsage}
            fabricName={selectedFabricItem?.name || fabricToUse.name}
            unit={getFabricUnitLabel()}
          />
        )}
        
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
              <span className="font-medium text-foreground">{formatFabricWidth(selectedFabricItem?.fabric_width || 137)}</span>
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
              <span className="font-medium text-foreground">{formatFabricWidth(selectedFabricItem?.fabric_width || 137)}</span>
            </div>
            
            {fabricCalculation.fabricOrientation === 'vertical' ? (
              <>
                <div className="flex justify-between pt-2 mt-2 border-t border-border/30">
                  <span className="font-medium">Total Width:</span>
                  <span className="font-medium text-foreground">
                    {formatMeasurement(
                      (parseFloat(measurements.rail_width) || 0) * (parseFloat(measurements.heading_fullness) || 1) +
                      (fabricCalculation.returns || 0) +
                      (fabricCalculation.totalSideHems || 0) +
                      ((fabricCalculation.seamsRequired || 0) * (parseFloat(measurements.seam_hems) || 1) * 2)
                    )}
                  </span>
                </div>
                <div className="flex justify-between pl-2 text-muted-foreground/70">
                  <span>Rail Width × Fullness:</span>
                  <span>{formatMeasurement((parseFloat(measurements.rail_width) || 0) * (parseFloat(measurements.heading_fullness) || 1))}</span>
                </div>
                <div className="flex justify-between pl-2 text-muted-foreground/70">
                  <span>Side Hems:</span>
                  <span>{formatMeasurement(fabricCalculation.totalSideHems || 0)}</span>
                </div>
                <div className="flex justify-between pl-2 text-muted-foreground/70">
                  <span>Returns (L+R):</span>
                  <span>{formatMeasurement(fabricCalculation.returns || 0)}</span>
                </div>
                {fabricCalculation.seamsRequired > 0 && (
                  <div className="flex justify-between pl-2 text-muted-foreground/70">
                    <span>Seam Allowances:</span>
                    <span>{formatMeasurement((fabricCalculation.seamsRequired || 0) * (parseFloat(measurements.seam_hems) || 1) * 2)} ({fabricCalculation.seamsRequired} seam(s) × 2)</span>
                  </div>
                )}
                <div className="flex justify-between pl-2 pt-1 border-t border-border/20">
                  <span>Widths Required:</span>
                  <span className="font-medium text-foreground">{fabricCalculation.widthsRequired || 0} width(s)</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span>Drops Used:</span>
                  <span className="font-medium text-foreground">{measurements.quantity || 1} drop(s)</span>
                </div>
              </>
            ) : (
              <>
                {/* Width Total - determines linear meters needed */}
                <div className="flex justify-between pt-2 mt-2 border-t border-border/30">
                  <span className="font-medium">Width Total:</span>
                  <span className="font-medium text-foreground"></span>
                </div>
                <div className="flex justify-between pl-2">
                  <span>Rail Width:</span>
                  <span className="font-medium text-foreground">{formatMeasurement(fabricCalculation.railWidth || measurements.rail_width || 0)}</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span>Fullness:</span>
                  <span className="font-medium text-foreground">{fabricCalculation.fullnessRatio || measurements.heading_fullness || 1}x</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span>Returns (L+R):</span>
                  <span className="font-medium text-foreground">{formatMeasurement(fabricCalculation.returns || 0)}</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span>Side Hems:</span>
                  <span className="font-medium text-foreground">{formatMeasurement(fabricCalculation.totalSideHems || 0)}</span>
                </div>
                <div className="flex justify-between border-t border-border/30 pt-2 mt-2">
                  <span className="font-medium">Total Width:</span>
                  <span className="font-medium text-foreground">
                    {formatMeasurement(
                      ((fabricCalculation.railWidth || measurements.rail_width || 0) * (fabricCalculation.fullnessRatio || measurements.heading_fullness || 1)) +
                      (fabricCalculation.returns || 0) +
                      (fabricCalculation.totalSideHems || 0)
                    )}
                  </span>
                </div>
                
                {/* Height Total - how we cover the drop */}
                <div className="flex justify-between pt-2 mt-2 border-t border-border/30">
                  <span className="font-medium">Height Total:</span>
                  <span className="font-medium text-foreground"></span>
                </div>
                <div className="flex justify-between pl-2">
                  <span>Drop Height:</span>
                  <span className="font-medium text-foreground">{formatMeasurement(fabricCalculation.drop || measurements.drop || 0)}</span>
                </div>
                {fabricCalculation.horizontalPiecesNeeded && fabricCalculation.horizontalPiecesNeeded > 1 && (
                  <>
                    <div className="flex justify-between pl-2">
                      <span>Horizontal Pieces:</span>
                      <span className="font-medium text-foreground">{fabricCalculation.horizontalPiecesNeeded} piece(s)</span>
                    </div>
                    <div className="flex justify-between pl-2">
                      <span>Horizontal Seams:</span>
                      <span className="font-medium text-foreground">{fabricCalculation.horizontalPiecesNeeded - 1} seam(s)</span>
                    </div>
                  </>
                )}
                {fabricCalculation.seamsRequired > 0 && (
                  <div className="flex justify-between pl-2">
                    <span>Seam Allowance:</span>
                    <span className="font-medium text-foreground">{formatMeasurement((fabricCalculation.seamsRequired * (measurements.seam_hem || 1) * 2))}</span>
                  </div>
                )}
                
                {/* Warning when second width is needed for railroaded fabric */}
                {fabricCalculation.horizontalPiecesNeeded && fabricCalculation.horizontalPiecesNeeded > 1 && (
                  <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-xs">
                    <p className="text-amber-800 dark:text-amber-200 font-medium">
                      ⚠️ Second width required: Drop height exceeds fabric width
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Height Calculations */}
        <div className="container-level-3 rounded-md p-3 space-y-2">
          <h4 className="font-semibold text-sm">Height Breakdown</h4>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div className="flex justify-between">
              <span>Drop Height:</span>
              <span className="font-medium text-foreground">{formatMeasurement(fabricCalculation.drop || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Header Hem:</span>
              <span className="font-medium text-foreground">+{formatMeasurement(fabricCalculation.headerHem || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Bottom Hem:</span>
              <span className="font-medium text-foreground">+{formatMeasurement(fabricCalculation.bottomHem || 0)}</span>
            </div>
            {(fabricCalculation.pooling || 0) > 0 && (
              <div className="flex justify-between">
                <span>Pooling:</span>
                <span className="font-medium text-foreground">+{formatMeasurement(fabricCalculation.pooling)}</span>
              </div>
            )}
            {(fabricCalculation.totalSeamAllowance || 0) > 0 && (
              <div className="flex justify-between">
                <span>Seam Allowance:</span>
                <span className="font-medium text-foreground">+{formatMeasurement(fabricCalculation.totalSeamAllowance || 0)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-1 mt-1">
              <span>Total Drop:</span>
              <span className="font-medium text-foreground">{formatMeasurement(fabricCalculation.totalDrop || 0)}</span>
            </div>
            {(fabricCalculation.wastePercent || 0) > 0 && (
              <div className="flex justify-between">
                <span>Waste ({fabricCalculation.wastePercent}%):</span>
                <span className="font-medium text-foreground">+{formatMeasurement((fabricCalculation.totalDrop || 0) * (fabricCalculation.wastePercent || 0) / 100)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Total Calculation - Dynamic based on pricing method */}
        <div className="container-level-3 rounded-md p-3 bg-primary/5">
          <div className="text-xs space-y-2">
            {(() => {
              // ✅ FIX: Get pricing method from selected pricing method in measurements
              const selectedPricingMethod = measurements.selected_pricing_method 
                ? template?.pricing_methods?.find((m: any) => m.id === measurements.selected_pricing_method)
                : null;
              
              // Determine pricing unit dynamically - prioritize selected method, then template
              const pricingMethod = selectedPricingMethod?.pricing_type 
                || template?.makeup_pricing_method 
                || template?.pricing_method 
                || 'per_metre';
              
              const isByDrop = pricingMethod === 'per_drop';
              const isByPanel = pricingMethod === 'per_panel';
              const isBySqm = pricingMethod === 'per_sqm' || template?.pricing_type === 'per_sqm';
              const isByMetre = pricingMethod === 'per_metre' || !pricingMethod;
              
              // ✅ Detect horizontal/railroaded fabric early for use throughout
              const isHorizontal = fabricCalculation.fabricRotated === true || 
                                  fabricCalculation.fabricOrientation === 'horizontal';
              
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
                  
                  const effectiveWidth = widthCm + (sideHem * 2);
                  const effectiveHeight = heightCm + headerHem + bottomHem;
                  const sqmRaw = (effectiveWidth * effectiveHeight) / 10000;
                  sqm = sqmRaw * (1 + wastePercent / 100);
                  
                  console.log('🔧 FALLBACK sqm calculation:', {
                    widthCm, heightCm, headerHem, bottomHem, sideHem, wastePercent,
                    effectiveWidth, effectiveHeight, sqmRaw, sqmWithWaste: sqm
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
              } else {
                // Linear meter calculation (default)
                // ✅ FIX: For horizontal/railroaded fabric, show required WIDTH to order
                // For vertical, show total length needed
                pricePerUnit = fabricCalculation.pricePerMeter || selectedFabricItem?.selling_price || 0;
                
                if (isHorizontal) {
                  // ✅ USE fabricCalculation.linearMeters DIRECTLY - SINGLE SOURCE OF TRUTH
                  // orientationCalculator already includes ALL allowances: side hems, returns, AND seam allowances
                  const linearMeters = fabricCalculation.linearMeters || 0;
                  const horizontalPiecesNeeded = fabricCalculation.horizontalPiecesNeeded || 1;
                  
                  // ✅ CRITICAL: Multiply by horizontal pieces for total meters to order
                  const totalLinearMetersToOrder = linearMeters * horizontalPiecesNeeded;
                  
                  // 🔍 DEBUG: Log horizontal calculation
                  console.log('🔧 HORIZONTAL DISPLAY CALCULATION:', {
                    linearMeters: `${linearMeters.toFixed(2)}m per piece`,
                    horizontalPiecesNeeded,
                    totalLinearMetersToOrder: `${totalLinearMetersToOrder.toFixed(2)}m`,
                    calculation: `${linearMeters.toFixed(2)}m × ${horizontalPiecesNeeded} pieces = ${totalLinearMetersToOrder.toFixed(2)}m`,
                    pricePerUnit: formatPrice(pricePerUnit),
                    totalCost: formatPrice(totalLinearMetersToOrder * pricePerUnit),
                    fabricCalculation
                  });
                  
                  quantity = totalLinearMetersToOrder;
                  totalCost = quantity * pricePerUnit;
                  unitLabel = 'Linear Meters to Order';
                  unitSuffix = 'm';
                  
                  if (horizontalPiecesNeeded > 1) {
                    calculationText = `${linearMeters.toFixed(2)}m × ${horizontalPiecesNeeded} pieces = ${quantity.toFixed(2)}m × ${formatPrice(pricePerUnit)}/m`;
                    calculationBreakdown = `Railroaded fabric requiring ${horizontalPiecesNeeded} horizontal pieces. ${linearMeters.toFixed(2)}m per piece × ${horizontalPiecesNeeded} = ${totalLinearMetersToOrder.toFixed(2)}m total × ${formatPrice(pricePerUnit)}/m = ${formatPrice(totalCost)}`;
                  } else {
                    calculationText = `${quantity.toFixed(2)}m × ${formatPrice(pricePerUnit)}/m`;
                    calculationBreakdown = `${linearMeters.toFixed(2)}m × ${formatPrice(pricePerUnit)}/m = ${formatPrice(totalCost)}`;
                  }
                } else {
                  // Vertical/Standard: Show ORDERED fabric (full widths)
                  const orderedMeters = fabricCalculation.orderedLinearMeters || fabricCalculation.linearMeters || 0;
                  const usedMeters = fabricCalculation.linearMeters || 0;
                  const remnantMeters = fabricCalculation.remnantMeters || 0;
                  
                  quantity = orderedMeters;
                  totalCost = quantity * pricePerUnit;
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
              
              return (
                <>
                  {/* Show selected pricing method name if available */}
                  {selectedPricingMethod && (
                    <div className="flex justify-between items-start pb-2 border-b border-border/50">
                      <span className="text-muted-foreground">Selected Method:</span>
                      <span className="text-foreground text-right font-medium">
                        {selectedPricingMethod.name}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start">
                    <span className="font-medium">Pricing Method:</span>
                    <span className="text-foreground text-right font-semibold">
                      {isBySqm ? 'Per Square Meter' : 
                       isByDrop ? 'Per Drop' : 
                       isByPanel ? 'Per Panel' : 
                       'Per Linear Meter'}
                    </span>
                  </div>
                  
                  {calculationBreakdown && (
                    <div className="text-xs text-muted-foreground bg-background/50 p-2 rounded font-medium">
                      {calculationBreakdown}
                    </div>
                  )}
                  
                  <div className="flex justify-between font-medium pt-1 border-t border-border/50">
                    <span>{unitLabel}:</span>
                    <span className="text-foreground">
                      {(isByDrop || isByPanel) ? quantity.toFixed(0) : quantity.toFixed(2)}{unitSuffix}
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
                    const leftoverSqm = (requiredWidthM * 100 * leftoverHeightCm) / 10000;
                    
                    if (piecesNeeded > 1 || leftoverHeightCm > 10) {
                      return (
                        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-3 mt-2">
                          <div className="flex items-start gap-2">
                            <span className="text-2xl">💡</span>
                            <div className="flex-1 space-y-1.5">
                              <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                Leftover Fabric
                              </div>
                              <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                                This order includes <strong>{formatFabricWidth(leftoverHeightCm)} × {formatFabricWidth(requiredWidthM * 100)}</strong> of extra fabric. You'll pay for it now, but it's <strong>free to use in future projects</strong>.
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  
                  {/* Show remnant information if multiple widths - vertical orientation */}
                  {fabricCalculation.widthsRequired > 1 && fabricCalculation.remnantMeters > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-3 mt-2">
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
                    </div>
                  )}
                  
                  {/* 🆕 Show seaming cost if applicable */}
                  {seamingCost > 0 && (
                    <div className="flex justify-between text-xs mt-2 pt-2 border-t border-border/50">
                      <span className="text-muted-foreground">+ Seaming Labor ({fabricCalculation.seamsCount} seam(s), {(fabricCalculation.seamLaborHours || 0).toFixed(2)}hrs):</span>
                      <span className="font-medium">{formatPrice(seamingCost)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between font-semibold text-base pt-1">
                    <span>{seamingCost > 0 ? 'Total (Fabric + Labor):' : 'Fabric Cost:'}</span>
                    <span className="text-foreground">{formatPrice(totalCost)}</span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-1 bg-background/30 p-2 rounded">
                    <div className="font-medium mb-0.5">Formula:</div>
                    {/* Show width breakdown only if actively using leftover */}
                    {usedLeftoverCount > 0 && fabricCalculation.widthsRequired > 1 ? (
                      <div className="space-y-2">
                        <div className="space-y-1">
                          {Array.from({ length: fabricCalculation.widthsRequired }).map((_, idx) => {
                            const isFromLeftover = idx < usedLeftoverCount;
                            const widthCost = isFromLeftover ? 0 : pricePerUnit;
                            const widthLabel = `Width ${idx + 1}`;
                            
                            return (
                              <div key={idx} className="flex items-center gap-2 text-xs">
                                <span className={isFromLeftover ? "text-green-600 dark:text-green-400 font-medium" : ""}>
                                  {widthLabel}: {quantity.toFixed(2)}{unitSuffix}
                                </span>
                                {isFromLeftover ? (
                                  <span className="text-green-600 dark:text-green-400 text-xs font-medium">
                                    (Reused - no charge)
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">
                                    × {formatPrice(pricePerUnit)}/unit = {formatPrice(widthCost)}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {usedLeftoverCount > 0 && (
                          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded p-2 mt-1">
                            <div className="text-xs text-green-800 dark:text-green-200">
                              <p className="font-semibold mb-1">♻️ Reusing Leftover Fabric</p>
                              <p className="text-green-700 dark:text-green-300">
                                {usedLeftoverCount} width{usedLeftoverCount > 1 ? 's' : ''} from previous treatment(s) • Already paid for • No additional cost
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="pt-1 mt-1 border-t border-border/30 font-medium">
                          Total: {fabricCalculation.widthsRequired} widths × {`${fabricCalculation.widthsRequired - usedLeftoverCount} new`} = {formatPrice(totalCost - seamingCost)}
                        </div>
                      </div>
                    ) : (
                      calculationText
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="container-level-2">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="fabric-calculations" className="border-none">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-primary" />
              <span className="font-semibold">Fabric & Pricing Calculations</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            {usesPricingGrid ? renderPricingGridDisplay() : 
             !isCurtainType ? renderRollerBlindDisplay() : 
             renderCurtainDisplay()}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};

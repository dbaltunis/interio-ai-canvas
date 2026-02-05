import { useEffect, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { userInputToCM } from "@/utils/measurementBoundary";
import { useHeadingOptions } from "@/hooks/useHeadingOptions";
import { calculateBlindCosts, isBlindCategory } from "./utils/blindCostCalculator";
import { calculateWallpaperCost } from "@/utils/wallpaperCalculations";
import { detectTreatmentType } from "@/utils/treatmentTypeDetection";
import type { CurtainTemplate } from "@/hooks/useCurtainTemplates";
import { safeParseFloat } from "@/utils/costCalculationErrors";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useFabricEnrichment } from "@/hooks/pricing/useFabricEnrichment";
import { getPriceFromGrid } from "@/hooks/usePricingGrids";
import { formatFromCM } from "@/utils/measurementFormatters";
import { getCurrencySymbol } from "@/utils/formatCurrency";
import { SavedCostBreakdownDisplay } from "./SavedCostBreakdownDisplay";
import { useMarkupSettings } from "@/hooks/useMarkupSettings";
import { applyMarkup, resolveMarkup } from "@/utils/pricing/markupResolver";
import { useUserRole } from "@/hooks/useUserRole";
import { QuoteSummaryTable, QuoteSummaryItem } from "./QuoteSummaryTable";

interface ManufacturingDetails {
  pricingType: string;
  pricePerUnit: number;
  quantity: number;
  quantityLabel: string;
  manufacturingType: 'hand' | 'machine';
}

/**
 * Engine result from useCurtainEngine - the SINGLE SOURCE OF TRUTH
 * All calculation values come from here, display components ONLY render
 */
interface EngineResult {
  linear_meters?: number;
  widths_required?: number;
  drops_per_width?: number;
  sqm?: number;
  fabric_cost: number;
  material_cost: number;
  options_cost: number;
  base_cost: number;
  subtotal: number;
  waste_amount: number;
  total: number;
  width_cm: number;
  drop_cm: number;
  fullness?: number;
  totalWidthCm?: number;
  totalDropCm?: number;
  formula_breakdown?: {
    steps: string[];
    values: Record<string, number | string>;
    formula_string: string;
  };
}

interface CostBreakdownItem {
  id: string;
  name: string;
  total_cost: number;
  category: string;
  quantity?: number;
  unit?: string;
  unit_price?: number;
  pricing_method?: string;
  uses_pricing_grid?: boolean;
  uses_leftover?: boolean;
  description?: string;
}

interface BlindCostsCallback {
  fabricCost: number;
  manufacturingCost: number;
  optionsCost: number;
  optionDetails: Array<{ name: string; cost: number; pricingMethod: string }>; // ✅ Individual option costs
  totalCost: number;
  squareMeters: number;
  displayText: string;
}

// ✅ NEW: Callback interface for curtains/romans - live calculated values
interface CurtainCostsCallback {
  fabricCost: number;
  liningCost: number;
  manufacturingCost: number;
  headingCost: number;
  headingName?: string;
  optionsCost: number;
  optionDetails: Array<{ name: string; cost: number; pricingMethod: string }>;
  totalCost: number;
  linearMeters: number;
}

interface CostCalculationSummaryProps {
  template: CurtainTemplate;
  measurements: any;
  selectedFabric?: any;
  selectedLining?: string;
  selectedHeading?: string;
  inventory: any[];
  fabricCalculation?: any;
  selectedOptions?: Array<{ 
    name: string; 
    price?: number; 
    pricingMethod?: string; 
    optionKey?: string; 
    pricingGridData?: any;
    calculatedPrice?: number;  // Pre-calculated price from calculateOptionPrices
    pricingDetails?: string;   // Pre-formatted pricing details string
    basePrice?: number;        // Original base price before calculation
  }>;
  calculatedFabricCost?: number;
  calculatedLiningCost?: number;
  calculatedManufacturingCost?: number;
  calculatedHeadingCost?: number;
  calculatedOptionsCost?: number;
  calculatedTotalCost?: number;
  fabricDisplayData?: {
    linearMeters: number;
    totalMeters: number;
    pricePerMeter: number;
    horizontalPieces: number;
    orientation: 'horizontal' | 'vertical';
    usesLeftover?: boolean;
    usesPricingGrid?: boolean; // ✅ For curtains using grid pricing
    gridPrice?: number; // ✅ Grid price when applicable
    gridName?: string; // ✅ Grid name for display
  };
  manufacturingDetails?: ManufacturingDetails;
  /** 
   * NEW: Engine result - when provided, this is the SINGLE SOURCE OF TRUTH
   * All display values come from here, no local calculations
   */
  engineResult?: EngineResult | null;
  /**
   * DISPLAY-ONLY MODE: When savedCostBreakdown is provided, display these values directly
   * without any recalculation. This eliminates the recalculation anti-pattern.
   */
  savedCostBreakdown?: CostBreakdownItem[];
  savedTotalCost?: number;
  /**
   * Callback to report live-calculated blind costs to parent for use during save.
   * This eliminates the recalculation anti-pattern by using the same values for display and save.
   */
  onBlindCostsCalculated?: (costs: BlindCostsCallback) => void;
  /**
   * Callback to report live-calculated curtain/roman costs to parent for use during save.
   * This eliminates the recalculation anti-pattern by using the same values for display and save.
   */
  onCurtainCostsCalculated?: (costs: CurtainCostsCallback) => void;
}

export const CostCalculationSummary = ({
  template,
  measurements,
  selectedFabric,
  selectedLining,
  selectedHeading,
  inventory,
  fabricCalculation,
  selectedOptions = [],
  calculatedFabricCost,
  calculatedLiningCost,
  calculatedManufacturingCost,
  calculatedHeadingCost,
  calculatedOptionsCost,
  calculatedTotalCost,
  fabricDisplayData,
  manufacturingDetails,
  engineResult,
  savedCostBreakdown,
  savedTotalCost,
  onBlindCostsCalculated,
  onCurtainCostsCalculated,
}: CostCalculationSummaryProps) => {
  const { units } = useMeasurementUnits();
  const { data: headingOptionsFromSettings = [] } = useHeadingOptions();
  const { data: markupSettings } = useMarkupSettings();
  const { data: roleData } = useUserRole();
  
  // ✅ COST VISIBILITY CONTROLS: Dealers and restricted users should only see quote prices
  const canViewCosts = roleData?.canViewVendorCosts ?? false;
  const canViewMarkup = roleData?.canViewMarkup ?? false;
  
  // ✅ CRITICAL: Refs for deferred callback to prevent infinite render loop
  // The blind costs are stored here during render, then reported via useEffect AFTER render
  const blindCostsRef = useRef<{ costs: BlindCostsCallback; key: string } | null>(null);
  const lastReportedBlindKeyRef = useRef<string>('');
  
  // ✅ NEW: Refs for curtain costs callback (same pattern)
  const curtainCostsRef = useRef<{ costs: CurtainCostsCallback; key: string } | null>(null);
  const lastReportedCurtainKeyRef = useRef<string>('');
  
  // ✅ FIX: Use state to track current keys - React properly observes state changes (not ref mutations)
  const [blindCostsKey, setBlindCostsKey] = useState<string>('');
  const [curtainCostsKey, setCurtainCostsKey] = useState<string>('');
  
  // ✅ Report blind costs to parent AFTER render, only when values change
  // Using state-based key instead of ref.current in dependency array
  useEffect(() => {
    if (!onBlindCostsCalculated || !blindCostsRef.current) return;
    
    const { costs, key } = blindCostsRef.current;
    if (key !== lastReportedBlindKeyRef.current) {
      console.log('💰 [CostCalculationSummary] Reporting blind costs change:', { key, costs });
      lastReportedBlindKeyRef.current = key;
      onBlindCostsCalculated(costs);
    }
  }, [onBlindCostsCalculated, blindCostsKey]); // ✅ FIX: Track state, not ref.current
  
  // ✅ NEW: Report curtain costs to parent AFTER render, only when values change
  useEffect(() => {
    if (!onCurtainCostsCalculated || !curtainCostsRef.current) return;
    
    const { costs, key } = curtainCostsRef.current;
    if (key !== lastReportedCurtainKeyRef.current) {
      console.log('💰 [CostCalculationSummary] Reporting curtain costs change:', { key, costs });
      lastReportedCurtainKeyRef.current = key;
      onCurtainCostsCalculated(costs);
    }
  }, [onCurtainCostsCalculated, curtainCostsKey]); // ✅ FIX: Track state, not ref.current
  
  // Enrich fabric with pricing grid data if applicable
  const { enrichedFabric } = useFabricEnrichment({
    fabricItem: selectedFabric,
    formData: measurements
  });
  
  // Use enriched fabric for all calculations
  const fabricToUse = enrichedFabric || selectedFabric;

  // ============================================================
  // DISPLAY-ONLY MODE: If saved breakdown provided, use it directly
  // This eliminates recalculation anti-pattern - no unit conversion errors
  // ============================================================
  if (savedCostBreakdown && savedCostBreakdown.length > 0 && savedTotalCost != null) {
    console.log('✅ [DISPLAY-ONLY] Using saved cost breakdown, no recalculation');
    return (
      <SavedCostBreakdownDisplay
        costBreakdown={savedCostBreakdown}
        totalCost={savedTotalCost}
        templateName={template?.name}
        treatmentCategory={detectTreatmentType(template)}
        selectedColor={measurements?.selected_color}
        canViewCosts={canViewCosts}
        canViewMarkup={canViewMarkup}
        markupSettings={markupSettings}
      />
    );
  }

  if (!template) {
    return (
      <div className="p-4 border rounded-lg bg-muted/50">
        <p className="text-sm text-muted-foreground">
          No template selected. Please select a template to see cost calculations.
        </p>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    const symbol = getCurrencySymbol(units.currency);
    return `${symbol}${price.toFixed(2)}`;
  };

  // ✅ UNIT-AWARE DISPLAY: Convert internal meters to user's fabric unit
  const fabricUnit = units.fabric || 'm'; // User's preferred fabric unit (m, yd, inches, cm)
  const fabricUnitLabel = fabricUnit === 'yards' ? 'yd' : fabricUnit === 'inches' ? 'in' : fabricUnit === 'cm' ? 'cm' : 'm';
  
  // Convert meters to user's fabric unit for display
  const metersToFabricUnit = (meters: number): number => {
    if (fabricUnit === 'yards') return meters * 1.09361;
    if (fabricUnit === 'inches') return meters * 39.3701;
    if (fabricUnit === 'cm') return meters * 100;
    return meters; // Default to meters
  };
  
  // Format fabric length with unit
  const formatFabricLength = (meters: number): string => {
    const converted = metersToFabricUnit(meters);
    return `${converted.toFixed(2)}${fabricUnitLabel}`;
  };
  
  // Format price per fabric unit (adjust price when unit changes)
  const formatPricePerFabricUnit = (pricePerMeter: number): string => {
    // Price per meter → price per user's unit
    let pricePerUnit = pricePerMeter;
    if (fabricUnit === 'yards') pricePerUnit = pricePerMeter / 1.09361; // $/m → $/yd
    if (fabricUnit === 'inches') pricePerUnit = pricePerMeter / 39.3701; // $/m → $/in
    if (fabricUnit === 'cm') pricePerUnit = pricePerMeter / 100; // $/m → $/cm
    return `${formatPrice(pricePerUnit)}/${fabricUnitLabel}`;
  };

  // Use proper treatment detection instead of template.treatment_category
  const treatmentCategory = detectTreatmentType(template);
  // CRITICAL: measurements are in USER'S DISPLAY UNIT
  // Use centralized conversion utility to convert to CM at calculation boundary
  const rawWidth = safeParseFloat(measurements.rail_width, 0);
  const rawHeight = safeParseFloat(measurements.drop, 0);
  const width = userInputToCM(rawWidth, units.length);
  const height = userInputToCM(rawHeight, units.length);

  console.log('🔍 CostCalculationSummary Debug:', {
    treatmentCategory,
    templateName: template.name,
    width,
    height,
    isBlind: isBlindCategory(treatmentCategory, template.name),
    measurements,
    selectedFabric: selectedFabric?.name
  });

  // Validation checks
  if (width <= 0 || height <= 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Missing Measurements</AlertTitle>
        <AlertDescription>
          Please enter valid width and height measurements to calculate costs.
        </AlertDescription>
      </Alert>
    );
  }

  // WALLPAPER: Add before blind check
  if (treatmentCategory === 'wallpaper' && measurements.wall_width && measurements.wall_height && fabricToUse) {
    const wallWidth = safeParseFloat(measurements.wall_width, 0);
    const wallHeight = safeParseFloat(measurements.wall_height, 0);
    
    if (wallWidth <= 0 || wallHeight <= 0) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invalid Wall Dimensions</AlertTitle>
          <AlertDescription>
            Please enter valid wall width and height for wallpaper calculation.
          </AlertDescription>
        </Alert>
      );
    }
    
    const wallpaperCalc = calculateWallpaperCost(wallWidth, wallHeight, fabricToUse);
    
    if (!wallpaperCalc) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Calculation Error</AlertTitle>
          <AlertDescription>
            Unable to calculate wallpaper costs. Please check measurements and wallpaper selection.
          </AlertDescription>
        </Alert>
      );
    }

    const markupPercentage = markupSettings?.default_markup_percentage || 0;

    return (
      <QuoteSummaryTable
        items={[{
          name: 'Wallpaper Material',
          details: `${wallpaperCalc.quantity.toFixed(2)} ${wallpaperCalc.unitLabel} (${wallpaperCalc.squareMeters.toFixed(2)} m²)`,
          price: wallpaperCalc.totalCost,
          category: 'fabric'
        }]}
        totalCost={wallpaperCalc.totalCost}
        markupPercentage={markupPercentage}
        canViewCosts={canViewCosts}
        canViewMarkup={canViewMarkup}
      />
    );
  }

  // BLINDS: Use clean calculator (check both category and template name)
  if (isBlindCategory(treatmentCategory, template.name) && width > 0 && height > 0) {
    try {
      // ✅ CRITICAL DEBUG: Log fabric enrichment status
      console.log('🔧 Calculating blind costs with:', {
        width,
        height,
        selectedOptions: selectedOptions?.length || 0,
        hasTemplate: !!template,
        hasFabric: !!fabricToUse,
        fabricName: fabricToUse?.name,
        // ✅ ENRICHMENT CHECK
        hasPricingGrid: !!fabricToUse?.pricing_grid_data,
        hasResolvedGridName: !!fabricToUse?.resolved_grid_name,
        pricingMethod: fabricToUse?.pricing_method,
        priceGroup: fabricToUse?.price_group,
        // ✅ If no grid, log why
        enrichmentMissing: fabricToUse?.price_group && !fabricToUse?.pricing_grid_data 
          ? 'HAS price_group but NO grid data - enrichment may have failed!' 
          : null
      });
      
      const blindCosts = calculateBlindCosts(width, height, template, fabricToUse, selectedOptions, measurements);
      
      console.log('✅ Blind calculator results:', blindCosts);
      
      // ✅ CRITICAL FIX: Store costs for useEffect to report to parent (NOT during render!)
      // The useEffect below will call onBlindCostsCalculated only when values change
      // ✅ FIX: Include option selection changes in key (same pattern as curtains) to trigger updates
      const optionSelectionKey = selectedOptions.map(o => `${o.name}-${(o as any).label || ''}`).join(',');
      const measurementKey = `${measurements?.rail_width || 0}-${measurements?.drop || 0}`;
      const computedBlindKey = `${blindCosts.fabricCost}-${blindCosts.manufacturingCost}-${blindCosts.optionsCost}-${blindCosts.totalCost}-${blindCosts.squareMeters}-${optionSelectionKey}-${measurementKey}`;
      
      // Use ref to track and report changes via useEffect (defined at component level)
      blindCostsRef.current = {
        costs: {
          fabricCost: blindCosts.fabricCost,
          manufacturingCost: blindCosts.manufacturingCost,
          optionsCost: blindCosts.optionsCost,
          optionDetails: blindCosts.optionDetails, // ✅ Include individual option costs
          totalCost: blindCosts.totalCost,
          squareMeters: blindCosts.squareMeters,
          displayText: blindCosts.displayText,
        },
        key: computedBlindKey,
      };
      
      // ✅ FIX: Update state to trigger useEffect (React observes state changes, not ref mutations)
      if (computedBlindKey !== blindCostsKey) {
        // Use setTimeout to avoid setting state during render
        setTimeout(() => setBlindCostsKey(computedBlindKey), 0);
      }

    // =========================================================
    // UNIFIED QUOTE SUMMARY for Blinds
    // - "Quote Summary" style for ALL users
    // - Shows prices for authorized users (canViewCosts = true)
    // - Shows "Included" for dealers (canViewCosts = false)
    // =========================================================
    
    // ✅ RESOLVE CATEGORY-SPECIFIC MARKUPS FOR BLINDS
    // Calculate implied markup from library pricing if both cost_price and selling_price exist
    const fabricCostPrice = fabricToUse?.cost_price || 0;
    const fabricSellingPrice = fabricToUse?.selling_price || 0;
    const hasLibraryPricing = fabricCostPrice > 0 && fabricSellingPrice > fabricCostPrice;
    const impliedMarkup = hasLibraryPricing 
      ? ((fabricSellingPrice - fabricCostPrice) / fabricCostPrice) * 100 
      : undefined;
    
    if (impliedMarkup && impliedMarkup > 0) {
      console.log('💰 [BLIND LIBRARY PRICING] Using implied markup:', {
        cost_price: fabricCostPrice,
        selling_price: fabricSellingPrice,
        impliedMarkup: `${impliedMarkup.toFixed(1)}%`,
        note: 'Prevents double-markup on library fabrics'
      });
    }
    
    const fabricMarkupResult = resolveMarkup({
      impliedMarkup, // ✅ Pass implied markup to prevent double-markup
      category: 'blinds',
      markupSettings
    });
    const fabricMarkupPercent = fabricMarkupResult.percentage;
    
    const mfgMarkupKey = 'blind_making';
    const mfgMarkupResult = resolveMarkup({
      category: mfgMarkupKey,
      markupSettings
    });
    const mfgMarkupPercent = mfgMarkupResult.percentage;
    
    // Default markup for display
    const markupPercentage = markupSettings?.default_markup_percentage || 0;

    // Build items for table display with per-item markup
    const tableItems: QuoteSummaryItem[] = [
      {
        name: isBlindCategory(treatmentCategory, template.name) ? 'Material' : 'Fabric',
        details: `${blindCosts.squareMeters.toFixed(2)} sqm`,
        price: blindCosts.fabricCost,
        category: 'fabric',
        markupPercentage: fabricMarkupPercent,
        sellingPrice: applyMarkup(blindCosts.fabricCost, fabricMarkupPercent)
      }
    ];

    if (blindCosts.manufacturingCost > 0) {
      tableItems.push({
        name: 'Making/Labor',
        details: '',
        price: blindCosts.manufacturingCost,
        category: 'manufacturing',
        markupPercentage: mfgMarkupPercent,  // ✅ Per-item markup
        sellingPrice: applyMarkup(blindCosts.manufacturingCost, mfgMarkupPercent)
      });
    }

    // Add options with category-specific markups
    selectedOptions
      .filter(opt => {
        const isLiningOption = opt.name?.toLowerCase().includes('lining');
        const isBlindTreatment = isBlindCategory(treatmentCategory, template.name);
        if (isLiningOption && isBlindTreatment) return false;
        return true;
      })
      .forEach(option => {
        const optAny = option as any;
        let displayPrice = optAny.calculatedPrice ?? option.price ?? 0;
        
        // Only recalculate if no calculatedPrice exists
        if (optAny.calculatedPrice === undefined) {
          if (option.pricingMethod === 'per-meter') {
            displayPrice = (option.price || 0) * (width / 100);
          } else if (option.pricingMethod === 'per-sqm') {
            displayPrice = (option.price || 0) * blindCosts.squareMeters;
          } else if (option.pricingMethod === 'pricing-grid' && option.pricingGridData) {
            displayPrice = getPriceFromGrid(option.pricingGridData, width, height);
          }
        }
        
        // Resolve option-specific markup
        const optionCategory = optAny.category || 'option';
        const optionMarkupResult = resolveMarkup({
          category: optionCategory,
          markupSettings
        });
        const optionMarkupPercent = optionMarkupResult.percentage;

        if (displayPrice > 0) {
          tableItems.push({
            name: option.name,
            details: optAny.pricingDetails || '',
            price: displayPrice,
            category: optionCategory,
            markupPercentage: optionMarkupPercent,
            sellingPrice: applyMarkup(displayPrice, optionMarkupPercent)
          });
        }
      });

    // Pass markupPercentage=0 since all items have sellingPrice pre-calculated
    return (
      <QuoteSummaryTable
        items={tableItems}
        totalCost={blindCosts.totalCost}
        markupPercentage={0}
        canViewCosts={canViewCosts}
        canViewMarkup={canViewMarkup}
        selectedColor={measurements?.selected_color}
      />
    );
    } catch (error) {
      console.error('Blind cost calculation error:', error);
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Calculation Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Unable to calculate blind costs. Please verify your inputs.'}
          </AlertDescription>
        </Alert>
      );
    }
  }

  // ============================================================
  // CURTAINS/ROMANS: Use engineResult as SINGLE SOURCE OF TRUTH
  // ============================================================
  
  // When engineResult is provided, use it exclusively - no fallbacks
  const useEngine = engineResult != null;
  
  // ✅ CRITICAL FIX: Calculate grid price for curtains when fabric has pricing_grid_data
  // This was missing - causing NZ$0.00 Cost Total despite grid price showing in display
  let gridPriceForCurtain = 0;
  const hasCurtainPricingGrid = fabricToUse?.pricing_grid_data && 
    (fabricToUse.pricing_method === 'pricing_grid' || template?.pricing_type === 'pricing_grid');
  
  if (hasCurtainPricingGrid) {
    // For curtains, we need effective width (with fullness) and drop
    const fullnessRatio = fabricCalculation?.fullnessRatio || measurements?.fullness_ratio || 1;
    const effectiveWidthCm = width * fullnessRatio; // Apply fullness to width
    const effectiveDropCm = height;
    
    gridPriceForCurtain = getPriceFromGrid(fabricToUse.pricing_grid_data, effectiveWidthCm, effectiveDropCm);
    
    // Apply markup if set
    const gridMarkup = fabricToUse.pricing_grid_markup || 0;
    if (gridMarkup > 0) {
      gridPriceForCurtain = gridPriceForCurtain * (1 + gridMarkup / 100);
    }
    
    console.log('📊 Curtain Grid Price Calculated:', {
      effectiveWidthCm,
      effectiveDropCm,
      fullnessRatio,
      gridPrice: gridPriceForCurtain,
      markup: gridMarkup,
      fabricName: fabricToUse.name
    });
  }
  
  // Fabric cost: GRID PRICE > prop > fabricCalculation.totalCost > engine > 0
  // ✅ CRITICAL FIX: Prioritize fabricCalculation.totalCost for consistent pricing
  // fabricCalculation.totalCost is calculated in useFabricCalculator with correct pieces multiplication
  const fabricCost = hasCurtainPricingGrid && gridPriceForCurtain > 0
    ? gridPriceForCurtain
    : (calculatedFabricCost != null && calculatedFabricCost > 0)
      ? calculatedFabricCost
      : (fabricCalculation?.totalCost ?? fabricCalculation?.fabricCost ?? (useEngine ? engineResult.fabric_cost : 0));
  
  // Linear meters: fabricDisplayData.totalMeters > engine > fabricCalculation > 0
  // ✅ CRITICAL: Use totalMeters from fabricDisplayData (parent passes the correct source)
  const linearMeters = fabricDisplayData?.totalMeters 
    ?? (useEngine ? (engineResult.linear_meters ?? 0) : (fabricCalculation?.linearMeters ?? 0));
  
  // Widths required: engine > fabricCalculation > 1
  const widthsRequired = useEngine
    ? (engineResult.widths_required ?? 1)
    : (fabricCalculation?.widthsRequired ?? 1);
  
  // Fullness: engine > fabricCalculation > show error
  const displayFullness = useEngine
    ? engineResult.fullness
    : fabricCalculation?.fullnessRatio;
  
  if (import.meta.env.DEV) {
    console.log('💰 CostSummary - Source:', {
      usingEngine: useEngine,
      hasCurtainPricingGrid,
      gridPriceForCurtain,
      engineLinearMeters: engineResult?.linear_meters,
      fabricCalcLinearMeters: fabricCalculation?.linearMeters,
      finalLinearMeters: linearMeters,
      engineFabricCost: engineResult?.fabric_cost,
      propFabricCost: calculatedFabricCost,
      finalFabricCost: fabricCost,
      fullness: displayFullness,
    });
  }
  
  const liningCost = safeParseFloat(calculatedLiningCost, 0);
  // ✅ FIX: Skip manufacturing cost if using pricing_grid (grid includes manufacturing)
  const manufacturingCost = hasCurtainPricingGrid ? 0 : safeParseFloat(calculatedManufacturingCost, 0);
  const headingCost = safeParseFloat(calculatedHeadingCost, 0);
  const optionsCost = safeParseFloat(calculatedOptionsCost, 0);
  const totalCost = calculatedTotalCost 
    ? safeParseFloat(calculatedTotalCost, 0)
    : (fabricCost + liningCost + manufacturingCost + headingCost + optionsCost);

  console.log('📊 Curtain costs:', {
    fabricCost,
    liningCost,
    manufacturingCost,
    headingCost,
    optionsCost,
    selectedOptionsCount: selectedOptions?.length,
    selectedOptionsDetails: selectedOptions?.map(opt => ({ name: opt.name, price: opt.price })),
    totalCost,
    calculatedTotalCostProp: calculatedTotalCost
  });

  // ✅ CRITICAL: Store curtain costs for useEffect to report to parent (NOT during render!)
  // This ensures save uses IDENTICAL values to what's displayed - no recalculation
  if (onCurtainCostsCalculated) {
    // ✅ FIX: Preserve all accessory fields for hardware itemization
    const optionDetails = selectedOptions.map(opt => {
      const optAny = opt as any;
      const isAccessory = optAny.category === 'hardware_accessory';
      const quantity = optAny.quantity || 1;
      const unitPrice = optAny.unit_price || 0;
      const pricingDetails = optAny.pricingDetails || '';
      
      // Build proper value/description for accessories: "3 × ₹15.00 (1 per 10cm)"
      let value = '';
      if (isAccessory && quantity > 0 && unitPrice > 0) {
        value = `${quantity} × ${unitPrice.toFixed(2)}`;
        if (pricingDetails) {
          value += ` (${pricingDetails})`;
        }
      } else if (optAny.value) {
        value = optAny.value;
      } else if (optAny.label) {
        value = optAny.label;
      } else if (opt.name && opt.name.includes(':')) {
        value = opt.name.substring(opt.name.indexOf(':') + 1).trim();
      } else {
        value = opt.name || '-';
      }
      
      return {
        name: opt.name || 'Unknown Option',
        value,
        cost: optAny.calculatedPrice ?? opt.price ?? 0,
        pricingMethod: opt.pricingMethod || 'fixed',
        // PRESERVE accessory fields for itemization
        category: optAny.category,
        quantity: quantity,
        unit_price: unitPrice,
        pricingDetails: pricingDetails,
        optionKey: optAny.optionKey,
        parentOptionKey: optAny.parentOptionKey,
      };
    });
    
    // ✅ FIX: Include selection changes in key for real-time updates
    const optionSelectionKey = selectedOptions.map(o => `${o.name}-${(o as any).value || (o as any).label || ''}`).join(',');
    const measurementKey = `${measurements?.rail_width || 0}-${measurements?.drop || 0}`;
    const headingKey = selectedHeading || 'none';
    
    // ✅ Resolve heading name from settings
    const resolvedHeadingName = (() => {
      if (!selectedHeading || selectedHeading === 'none' || selectedHeading === 'standard') {
        return 'Standard';
      }
      const headingFromSettings = headingOptionsFromSettings.find(h => h.id === selectedHeading);
      if (headingFromSettings) {
        return headingFromSettings.name;
      }
      // Check inventory as fallback
      const headingFromInventory = inventory?.find(item => item.id === selectedHeading && item.category === 'heading');
      if (headingFromInventory) {
        return headingFromInventory.name;
      }
      return selectedHeading; // Use ID as fallback
    })();
    
    const computedCurtainKey = `${fabricCost}-${liningCost}-${manufacturingCost}-${headingCost}-${optionsCost}-${totalCost}-${linearMeters}-${optionSelectionKey}-${measurementKey}-${headingKey}`;
    
    curtainCostsRef.current = {
      costs: {
        fabricCost,
        liningCost,
        manufacturingCost,
        headingCost,
        headingName: resolvedHeadingName,
        optionsCost,
        optionDetails,
        totalCost,
        linearMeters,
      },
      key: computedCurtainKey,
    };
    
    // ✅ FIX: Update state to trigger useEffect (React observes state changes, not ref mutations)
    if (computedCurtainKey !== curtainCostsKey) {
      // Use setTimeout to avoid setting state during render
      setTimeout(() => setCurtainCostsKey(computedCurtainKey), 0);
    }
  }

  // =========================================================
  // UNIFIED QUOTE SUMMARY VIEW for Curtains
  // - Clean "Quote Summary" layout for ALL users
  // - Shows actual prices for authorized users (canViewCosts = true)
  // - Shows "Included" for dealers/restricted users (canViewCosts = false)
  // =========================================================
  // =========================================================
  // CATEGORY-SPECIFIC MARKUP RESOLUTION FOR ALL ITEMS
  // Each item type uses its own markup from settings hierarchy
  // =========================================================
  
  // ✅ FIX: Calculate implied markup from library pricing (same as blinds section)
  // This prevents double-markup when fabric has both cost_price and selling_price
  const curtainFabricCostPrice = fabricToUse?.cost_price || 0;
  const curtainFabricSellingPrice = fabricToUse?.selling_price || 0;
  const curtainHasLibraryPricing = curtainFabricCostPrice > 0 && curtainFabricSellingPrice > curtainFabricCostPrice;
  const curtainImpliedMarkup = curtainHasLibraryPricing 
    ? ((curtainFabricSellingPrice - curtainFabricCostPrice) / curtainFabricCostPrice) * 100 
    : undefined;
  
  if (curtainImpliedMarkup && curtainImpliedMarkup > 0) {
    console.log('💰 [CURTAIN LIBRARY PRICING] Using implied markup:', {
      cost_price: curtainFabricCostPrice,
      selling_price: curtainFabricSellingPrice,
      impliedMarkup: `${curtainImpliedMarkup.toFixed(1)}%`,
      note: 'Prevents double-markup on library fabrics'
    });
  }
  
  // ✅ RESOLVE FABRIC MARKUP with priority: Product > Implied > Grid > Category
  const fabricMarkupResult = resolveMarkup({
    impliedMarkup: curtainImpliedMarkup, // Pass implied markup to prevent double-markup
    gridMarkup: fabricToUse?.pricing_grid_markup, // Pass grid markup if exists
    productMarkup: fabricToUse?.markup_percentage, // Pass product markup if exists
    category: treatmentCategory || 'curtains',
    markupSettings
  });
  const fabricMarkupPercent = fabricMarkupResult.percentage;
  
  // ✅ RESOLVE LINING MARKUP (specific 'lining' category or fallback to material)
  const liningMarkupResult = resolveMarkup({
    category: 'lining',
    markupSettings
  });
  const liningMarkupPercent = liningMarkupResult.percentage;
  
  // ✅ RESOLVE MANUFACTURING-SPECIFIC MARKUP (e.g., curtain_making/roman_making at 100%)
  const isRomanTreatment = template.name?.toLowerCase().includes('roman') || treatmentCategory?.includes('roman');
  const mfgMarkupKey = isRomanTreatment ? 'roman_making' : 'curtain_making';
  const mfgMarkupResult = resolveMarkup({
    category: mfgMarkupKey,
    markupSettings
  });
  const mfgMarkupPercent = mfgMarkupResult.percentage;
  
  // ✅ RESOLVE HEADING MARKUP
  const headingMarkupResult = resolveMarkup({
    category: 'heading',
    markupSettings
  });
  const headingMarkupPercent = headingMarkupResult.percentage;
  
  // Default markup for display/totals
  const markupPercentage = markupSettings?.default_markup_percentage || 0;

  // Build items for table display with per-item markup
  const tableItems: QuoteSummaryItem[] = [];

  // Fabric - with clear math display and category-specific markup
  if (fabricCost > 0) {
    let fabricDetails = '';
    if (fabricDisplayData) {
      if (fabricDisplayData.usesPricingGrid && fabricDisplayData.gridName) {
        fabricDetails = `Grid: ${fabricDisplayData.gridName}`;
      } else {
        const meters = fabricDisplayData.totalMeters;
        const pricePerUnit = fabricDisplayData.pricePerMeter;
        // ✅ FIX: Use consistent cost - either calculatedFabricCost prop or display-calculated value
        const consistentFabricCost = calculatedFabricCost ?? (meters * pricePerUnit);
        fabricDetails = `${formatFabricLength(meters)} × ${formatPricePerFabricUnit(pricePerUnit)} = ${formatPrice(consistentFabricCost)}`;
      }
    } else if (linearMeters > 0) {
      fabricDetails = `${linearMeters.toFixed(2)}m`;
    }
    
    tableItems.push({
      name: 'Fabric',
      details: fabricDetails,
      price: fabricCost,
      category: 'fabric',
      markupPercentage: fabricMarkupPercent,
      sellingPrice: applyMarkup(fabricCost, fabricMarkupPercent)
    });
  }

  // Lining - with category-specific markup
  if (liningCost > 0) {
    tableItems.push({
      name: 'Lining',
      details: '',
      price: liningCost,
      category: 'lining',
      markupPercentage: liningMarkupPercent,
      sellingPrice: applyMarkup(liningCost, liningMarkupPercent)
    });
  }

  // Making/Labor - with per-item markup and clear math display
  if (manufacturingCost > 0) {
    let mfgDetails = '';
    if (manufacturingDetails) {
      const { pricingType, pricePerUnit, quantity } = manufacturingDetails;
      if (pricingType === 'per_drop') {
        mfgDetails = `${formatPrice(pricePerUnit)}/drop × ${quantity} = ${formatPrice(manufacturingCost)}`;
      } else if (pricingType === 'per_panel') {
        mfgDetails = `${formatPrice(pricePerUnit)}/panel × ${quantity} = ${formatPrice(manufacturingCost)}`;
      } else if (pricingType === 'per_metre') {
        mfgDetails = `${formatPrice(pricePerUnit)}/m × ${quantity} = ${formatPrice(manufacturingCost)}`;
      }
    }
    
    tableItems.push({
      name: manufacturingDetails?.manufacturingType ? `Making/Labor (${manufacturingDetails.manufacturingType})` : 'Making/Labor',
      details: mfgDetails,
      price: manufacturingCost,
      category: 'manufacturing',
      markupPercentage: mfgMarkupPercent,  // ✅ Per-item markup
      sellingPrice: applyMarkup(manufacturingCost, mfgMarkupPercent)
    });
  }

  // Heading - with category-specific markup
  if (headingCost > 0) {
    tableItems.push({
      name: 'Heading',
      details: '',
      price: headingCost,
      category: 'heading',
      markupPercentage: headingMarkupPercent,
      sellingPrice: applyMarkup(headingCost, headingMarkupPercent)
    });
  }

  // Options - resolve markup per option category
  selectedOptions.forEach(option => {
    const optAny = option as any;
    const displayPrice = optAny.calculatedPrice ?? option.price ?? 0;
    const optionCategory = optAny.category || 'option';
    
    // Resolve option-specific markup
    const optionMarkupResult = resolveMarkup({
      category: optionCategory,
      markupSettings
    });
    const optionMarkupPercent = optionMarkupResult.percentage;
    
    tableItems.push({
      name: option.name,
      details: optAny.pricingDetails || '',
      price: displayPrice,
      category: optionCategory,
      markupPercentage: optionMarkupPercent,
      sellingPrice: applyMarkup(displayPrice, optionMarkupPercent)
    });
  });

  // Pass markupPercentage=0 since all items have sellingPrice pre-calculated
  return (
    <QuoteSummaryTable
      items={tableItems}
      totalCost={totalCost}
      markupPercentage={0}
      canViewCosts={canViewCosts}
      canViewMarkup={canViewMarkup}
      selectedColor={measurements?.selected_color}
    />
  );
};

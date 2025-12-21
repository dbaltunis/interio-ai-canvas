import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Info, Settings, AlertCircle, TrendingUp } from "lucide-react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { convertLength } from "@/hooks/useBusinessSettings";
import { useHeadingOptions } from "@/hooks/useHeadingOptions";
import { calculateBlindCosts, isBlindCategory } from "./utils/blindCostCalculator";
import { calculateWallpaperCost } from "@/utils/wallpaperCalculations";
import { detectTreatmentType } from "@/utils/treatmentTypeDetection";
import type { CurtainTemplate } from "@/hooks/useCurtainTemplates";
import { safeParseFloat } from "@/utils/costCalculationErrors";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useFabricEnrichment } from "@/hooks/pricing/useFabricEnrichment";
import { getPriceFromGrid } from "@/hooks/usePricingGrids";
import { getPricingMethodLabel, getPricingMethodSuffix, getLengthUnitLabel, getAreaUnitLabel } from "@/utils/pricingMethodLabels";
import { formatDimensionsFromCM, formatFromCM, getUnitLabel } from "@/utils/measurementFormatters";
import { PricingGridPreview } from "@/components/settings/tabs/products/pricing/PricingGridPreview";
import { getCurrencySymbol } from "@/utils/formatCurrency";
import { SavedCostBreakdownDisplay } from "./SavedCostBreakdownDisplay";
import { useMarkupSettings } from "@/hooks/useMarkupSettings";
import { applyMarkup, resolveMarkup } from "@/utils/pricing/markupResolver";

// Simple SVG icons
const FabricSwatchIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 6 L8 8 L6 10 L8 12 L6 14 L8 16 L6 18 L18 18 L16 16 L18 14 L16 12 L18 10 L16 8 L18 6 Z" />
    <line x1="8" y1="9" x2="16" y2="9" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="8" y1="15" x2="16" y2="15" />
  </svg>
);

const SewingMachineIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="16" width="18" height="4" rx="1" />
    <rect x="6" y="8" width="12" height="8" rx="1" />
    <rect x="10" y="6" width="4" height="2" rx="0.5" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <circle cx="8" cy="4" r="1" />
  </svg>
);

const AssemblyIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

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
  headingName?: string; // ✅ ADD: Heading name for correct display/save
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
  
  // ✅ CRITICAL: Refs for deferred callback to prevent infinite render loop
  // The blind costs are stored here during render, then reported via useEffect AFTER render
  const blindCostsRef = useRef<{ costs: BlindCostsCallback; key: string } | null>(null);
  const lastReportedBlindKeyRef = useRef<string>('');
  
  // ✅ NEW: Refs for curtain costs callback (same pattern)
  const curtainCostsRef = useRef<{ costs: CurtainCostsCallback; key: string } | null>(null);
  const lastReportedCurtainKeyRef = useRef<string>('');
  
  // ✅ Report blind costs to parent AFTER render, only when values change
  useEffect(() => {
    if (!onBlindCostsCalculated || !blindCostsRef.current) return;
    
    const { costs, key } = blindCostsRef.current;
    if (key !== lastReportedBlindKeyRef.current) {
      lastReportedBlindKeyRef.current = key;
      onBlindCostsCalculated(costs);
    }
  }, [onBlindCostsCalculated, blindCostsRef.current?.key]);
  
  // ✅ NEW: Report curtain costs to parent AFTER render, only when values change
  useEffect(() => {
    if (!onCurtainCostsCalculated || !curtainCostsRef.current) return;
    
    const { costs, key } = curtainCostsRef.current;
    if (key !== lastReportedCurtainKeyRef.current) {
      lastReportedCurtainKeyRef.current = key;
      onCurtainCostsCalculated(costs);
    }
  }, [onCurtainCostsCalculated, curtainCostsRef.current?.key]);
  
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
  // Convert from display unit → CM at calculation boundary
  const rawWidth = safeParseFloat(measurements.rail_width, 0);
  const rawHeight = safeParseFloat(measurements.drop, 0);
  const width = convertLength(rawWidth, units.length, 'cm');
  const height = convertLength(rawHeight, units.length, 'cm');

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

    return (
      <div className="bg-card border border-border rounded-lg p-3 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Calculator className="h-4 w-4 text-primary" />
          <h3 className="text-base font-semibold text-card-foreground">Wallpaper Cost Summary</h3>
        </div>

        <div className="grid gap-2 text-sm">
          {/* Wallpaper Material */}
          <div className="flex items-center justify-between py-1.5 border-b border-border/50">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FabricSwatchIcon className="h-3.5 w-3.5 text-primary shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-card-foreground font-medium">Wallpaper Material</span>
                <span className="text-xs text-muted-foreground truncate">
                  {fabricToUse.name} - {wallpaperCalc.quantity.toFixed(2)} {wallpaperCalc.unitLabel}{wallpaperCalc.quantity > 1 && wallpaperCalc.unitLabel !== 'm²' ? 's' : ''}
                </span>
              </div>
            </div>
            <span className="font-semibold text-card-foreground ml-2">{formatPrice(wallpaperCalc.totalCost)}</span>
          </div>
        </div>

        {/* Total */}
        <div className="border-t-2 border-primary/20 pt-2.5">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-card-foreground">Total</span>
            <span className="text-xl font-bold text-primary">{formatPrice(wallpaperCalc.totalCost)}</span>
          </div>
        </div>

        {/* Pricing Details */}
        <details className="text-xs text-muted-foreground group">
          <summary className="cursor-pointer font-medium text-card-foreground flex items-center gap-1.5 py-1.5 hover:text-primary transition-colors border-t border-border/50 pt-2">
            <Info className="h-3.5 w-3.5" />
            <span>Wallpaper Details</span>
            <span className="ml-auto text-xs group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="space-y-2 mt-3 pl-4 border-l-2 border-primary/20">
            <div className="space-y-0.5">
              <div className="text-card-foreground font-medium">Wallpaper: {fabricToUse.name}</div>
              <div>Wall Area: {wallpaperCalc.squareMeters.toFixed(2)} m²</div>
              <div>Strips Required: {wallpaperCalc.stripsNeeded}</div>
              <div>Total Length: {wallpaperCalc.totalMeters.toFixed(2)}m</div>
              {wallpaperCalc.soldBy === 'per_roll' && <div>Rolls: {wallpaperCalc.rollsNeeded}</div>}
              <div>Sold By: {wallpaperCalc.unitLabel}</div>
            </div>
          </div>
        </details>
      </div>
    );
  }

  // BLINDS: Use clean calculator (check both category and template name)
  if (isBlindCategory(treatmentCategory, template.name) && width > 0 && height > 0) {
    try {
      console.log('🔧 Calculating blind costs with:', {
        width,
        height,
        selectedOptions,
        hasTemplate: !!template,
        hasFabric: !!fabricToUse
      });
      
      const blindCosts = calculateBlindCosts(width, height, template, fabricToUse, selectedOptions, measurements);
      
      console.log('✅ Blind calculator results:', blindCosts);
      
      // ✅ CRITICAL FIX: Store costs for useEffect to report to parent (NOT during render!)
      // The useEffect below will call onBlindCostsCalculated only when values change
      const blindCostsKey = `${blindCosts.fabricCost}-${blindCosts.manufacturingCost}-${blindCosts.optionsCost}-${blindCosts.totalCost}-${blindCosts.squareMeters}`;
      
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
        key: blindCostsKey,
      };

    return (
      <div className="bg-card border border-border rounded-lg p-3 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Calculator className="h-4 w-4 text-primary" />
          <h3 className="text-base font-semibold text-card-foreground">Cost Summary</h3>
        </div>

        <div className="grid gap-2 text-sm">
          {/* Fabric */}
          <div className="flex items-center justify-between py-1.5 border-b border-border/50">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FabricSwatchIcon className="h-3.5 w-3.5 text-primary shrink-0" />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-card-foreground font-medium">{isBlindCategory(treatmentCategory, template.name) ? 'Material' : treatmentCategory === 'wallpaper' ? 'Wallpaper' : 'Fabric'}</span>
                  {/* Show selected color swatch */}
                  {measurements?.selected_color && (
                    <div className="flex items-center gap-1.5">
                      <div 
                        className="w-4 h-4 rounded-full border border-border shadow-sm" 
                        style={{ backgroundColor: measurements.selected_color.startsWith('#') ? measurements.selected_color : measurements.selected_color.toLowerCase() }}
                      />
                      <span className="text-xs text-muted-foreground capitalize">{measurements.selected_color}</span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground truncate">{blindCosts.displayText}</span>
              </div>
            </div>
            <span className="font-semibold text-card-foreground ml-2">{formatPrice(blindCosts.fabricCost)}</span>
          </div>

          {/* Manufacturing */}
          {blindCosts.manufacturingCost > 0 && (
            <div className="flex items-center justify-between py-1.5 border-b border-border/50">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <AssemblyIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-card-foreground font-medium">Assembly & Manufacturing</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {template?.pricing_type === 'pricing_grid' ? `Grid: ${formatDimensionsFromCM(width, height, units.length)}` : 'Labor cost'}
                  </span>
                </div>
              </div>
              <span className="font-semibold text-card-foreground ml-2">{formatPrice(blindCosts.manufacturingCost)}</span>
            </div>
          )}

          {/* Paid Options - Filter out treatment-inappropriate options */}
          {blindCosts.optionsCost > 0 && (
            <div className="py-1.5 border-b border-border/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Settings className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-card-foreground font-medium">Additional Options</span>
                </div>
                <span className="font-semibold text-card-foreground">{formatPrice(blindCosts.optionsCost)}</span>
              </div>
              <div className="pl-6 space-y-1.5">
                {selectedOptions
                  .filter(opt => {
                    // Filter out lining options for blind treatments
                    const isLiningOption = opt.name?.toLowerCase().includes('lining');
                    const isBlindTreatment = isBlindCategory(treatmentCategory, template.name);
                    if (isLiningOption && isBlindTreatment) return false;
                    
                    return (opt.price && opt.price > 0) || (opt.pricingMethod === 'pricing-grid' && opt.pricingGridData);
                  })
                  .map((option, index) => {
                    // Calculate actual price for this option based on method
                    let displayPrice = option.price || 0;
                    let pricingDetails = '';
                    
                    if (option.pricingMethod === 'per-meter') {
                      displayPrice = (option.price || 0) * (width / 100);
                      // ✅ UNIT-AWARE: Convert to user's fabric unit
                      pricingDetails = ` (${formatPricePerFabricUnit(option.price || 0)} × ${formatFabricLength(width / 100)})`;
                    } else if (option.pricingMethod === 'per-sqm') {
                      const sqm = blindCosts.squareMeters;
                      displayPrice = (option.price || 0) * sqm;
                      pricingDetails = ` (${formatPrice(option.price || 0)}/sqm × ${sqm.toFixed(2)}sqm)`;
                    } else if (option.pricingMethod === 'pricing-grid' && option.pricingGridData) {
                      // Check if it's width-only grid
                      if (Array.isArray(option.pricingGridData) && option.pricingGridData.length > 0 && 'width' in option.pricingGridData[0]) {
                        const widthValues = option.pricingGridData.map((entry: any) => parseInt(entry.width));
                        const closestWidth = widthValues.reduce((prev: number, curr: number) => {
                          return Math.abs(curr - width) < Math.abs(prev - width) ? curr : prev;
                        });
                        const matchingEntry = option.pricingGridData.find((entry: any) => parseInt(entry.width) === closestWidth);
                        displayPrice = matchingEntry ? parseFloat(matchingEntry.price) : 0;
                        pricingDetails = ` (Grid: ${formatFromCM(width, units.length)} → ${formatPrice(displayPrice)})`;
                      } else {
                        // Full 2D grid
                        displayPrice = getPriceFromGrid(option.pricingGridData, width, height);
                        pricingDetails = ` (Grid: ${formatDimensionsFromCM(width, height, units.length)} → ${formatPrice(displayPrice)})`;
                      }
                    } else if (option.pricingMethod === 'fixed' || !option.pricingMethod) {
                      pricingDetails = ' (Fixed)';
                    }
                    
                    return (
                      <div key={index} className="flex items-start justify-between text-xs">
                        <div className="flex-1 min-w-0 mr-2">
                          <div className="text-muted-foreground">• {option.name}</div>
                          {pricingDetails && (
                            <div className="text-[10px] text-muted-foreground/70 ml-2 mt-0.5">
                              {pricingDetails}
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-card-foreground whitespace-nowrap">
                          {formatPrice(displayPrice)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Cost Total */}
        <div className="border-t-2 border-primary/20 pt-2.5">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-card-foreground">Cost Total</span>
            <span className="text-xl font-bold text-primary">{formatPrice(blindCosts.totalCost)}</span>
          </div>
          
          {/* Quote Price - Shows retail price with markup for sales team */}
          {markupSettings && markupSettings.default_markup_percentage > 0 && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span className="font-semibold text-emerald-600">Quote Price</span>
                <span className="text-xs text-muted-foreground">({markupSettings.default_markup_percentage}% markup)</span>
              </div>
              <span className="text-xl font-bold text-emerald-600">
                {formatPrice(applyMarkup(blindCosts.totalCost, markupSettings.default_markup_percentage))}
              </span>
            </div>
          )}
        </div>

        {/* Pricing Details */}
        <details className="text-xs text-muted-foreground group">
          <summary className="cursor-pointer font-medium text-card-foreground flex items-center gap-1.5 py-1.5 hover:text-primary transition-colors border-t border-border/50 pt-2">
            <Info className="h-3.5 w-3.5" />
            <span>Pricing Details</span>
            <span className="ml-auto text-xs group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="space-y-2 mt-3 pl-4 border-l-2 border-primary/20">
            <div className="space-y-0.5">
              <div className="text-card-foreground font-medium">Template: {template.name}</div>
              <div className="flex items-center gap-2">
                <span>Method: {template.pricing_type}</span>
                {template.pricing_type === 'pricing_grid' && fabricToUse?.pricing_grid_data && (
                  <PricingGridPreview 
                    gridData={fabricToUse.pricing_grid_data} 
                    gridName={fabricToUse.name || 'Product Pricing'}
                  />
                )}
              </div>
              <div>Area: {blindCosts.squareMeters.toFixed(2)} sqm</div>
            </div>

            {selectedOptions && selectedOptions.length > 0 && (
              <div className="mt-3 pt-2 border-t border-border/30">
                <div className="font-medium text-card-foreground mb-1.5">Selected Options:</div>
                <div className="space-y-1">
                  {selectedOptions
                    .filter(opt => {
                      // Filter out lining options for blind treatments
                      const isLiningOption = opt.name?.toLowerCase().includes('lining');
                      const isBlindTreatment = isBlindCategory(treatmentCategory, template.name);
                      if (isLiningOption && isBlindTreatment) return false;
                      return true;
                    })
                    .map((option, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>• {option.name}</span>
                      <span className="font-medium text-card-foreground">
                        {option.price && option.price > 0 ? formatPrice(option.price) : 'Included'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </details>
      </div>
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
    const fullnessRatio = fabricCalculation?.fullnessRatio || measurements?.fullness_ratio || 2;
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
  
  // Fabric cost: GRID PRICE > prop > engine > 0
  // CRITICAL: For pricing_grid, use the calculated grid price
  const fabricCost = hasCurtainPricingGrid && gridPriceForCurtain > 0
    ? gridPriceForCurtain
    : (calculatedFabricCost != null && calculatedFabricCost > 0)
      ? calculatedFabricCost
      : (useEngine ? engineResult.fabric_cost : 0);
  
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
    // ✅ FIX: Add value field to optionDetails matching blind pattern
    const optionDetails = selectedOptions.map(opt => ({
      name: opt.name || 'Unknown Option',
      // Extract value from "name: value" format or use available fields
      value: (() => {
        if ((opt as any).value) return (opt as any).value;
        if ((opt as any).label) return (opt as any).label;
        if (opt.name && opt.name.includes(':')) {
          return opt.name.substring(opt.name.indexOf(':') + 1).trim();
        }
        return (opt as any).optionKey || opt.name || '-';
      })(),
      cost: (opt as any).calculatedPrice ?? opt.price ?? 0,
      pricingMethod: opt.pricingMethod || 'fixed'
    }));
    
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
    
    const curtainCostsKey = `${fabricCost}-${liningCost}-${manufacturingCost}-${headingCost}-${optionsCost}-${totalCost}-${linearMeters}-${optionSelectionKey}-${measurementKey}-${headingKey}`;
    
    curtainCostsRef.current = {
      costs: {
        fabricCost,
        liningCost,
        manufacturingCost,
        headingCost,
        headingName: resolvedHeadingName, // ✅ FIXED: Use resolved heading name
        optionsCost,
        optionDetails,
        totalCost,
        linearMeters,
      },
      key: curtainCostsKey,
    };
  }

  return (
    <div className="bg-card border border-border rounded-lg p-3 space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <Calculator className="h-4 w-4 text-primary" />
        <h3 className="text-base font-semibold text-card-foreground">Cost Summary</h3>
      </div>

      {/* Fabric calculation explanation */}
      {(fabricDisplayData || fabricCalculation?.fabricOrientation) && (
        <Alert className="py-2 px-3">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs leading-relaxed">
            {(() => {
              // ✅ SINGLE SOURCE OF TRUTH: Use engineResult → fabricDisplayData → fabricCalculation (in order)
              const orientation = fabricDisplayData?.orientation || fabricCalculation?.fabricOrientation || 'vertical';
              const widthsReq = fabricDisplayData?.horizontalPieces || fabricCalculation?.widthsRequired || 1;
              const horizontalPieces = fabricDisplayData?.horizontalPieces || fabricCalculation?.horizontalPiecesNeeded || 1;
              
              // ✅ CRITICAL FIX: Use unified source for meters - SAME as fabric line display
              const meters = engineResult?.linear_meters 
                ?? fabricDisplayData?.linearMeters 
                ?? fabricCalculation?.linearMeters 
                ?? 0;
              const pricePerM = fabricDisplayData?.pricePerMeter || fabricCalculation?.pricePerMeter || 0;
              
              if (orientation === 'horizontal') {
                if (horizontalPieces && horizontalPieces > 1) {
                  return (
                    <>
                      <strong className="text-amber-600">Railroaded with Horizontal Seaming:</strong>
                      <br />
                      Curtain height exceeds fabric width, requiring {horizontalPieces} horizontal pieces per panel with {horizontalPieces - 1} seam(s).
                      Total: {widthsReq} piece(s) × {meters.toFixed(2)}m = {formatPrice(meters * pricePerM)}
                      {fabricCalculation?.leftoverFromLastPiece && fabricCalculation.leftoverFromLastPiece > 0 && (
                        <><br />Leftover: {formatFromCM(fabricCalculation.leftoverFromLastPiece, units.length)} tracked for future use</>
                      )}
                    </>
                  );
                }
                return (
                  <>
                    <strong className="text-primary">Railroaded Fabric:</strong> Fabric rotated 90°. Using {widthsReq} piece(s) × {(meters/widthsReq).toFixed(2)}m each = {meters.toFixed(2)}m total
                  </>
                );
              } else {
                return (
                  <>
                    <strong className="text-primary">Standard Vertical:</strong> Using {widthsReq} fabric width(s) × {(meters/widthsReq).toFixed(2)}m per width = {meters.toFixed(2)}m total
                  </>
                );
              }
            })()}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-2 text-sm">
        {fabricCost > 0 && (
          <div className="flex flex-col py-1.5 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FabricSwatchIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-card-foreground font-medium">{isBlindCategory(treatmentCategory, template.name) ? 'Material' : treatmentCategory === 'wallpaper' ? 'Wallpaper' : 'Fabric'}</span>
                    {/* Show selected color swatch */}
                    {measurements?.selected_color && (
                      <div className="flex items-center gap-1.5">
                        <div 
                          className="w-4 h-4 rounded-full border border-border shadow-sm" 
                          style={{ backgroundColor: measurements.selected_color.startsWith('#') ? measurements.selected_color : measurements.selected_color.toLowerCase() }}
                        />
                        <span className="text-xs text-muted-foreground capitalize">{measurements.selected_color}</span>
                      </div>
                    )}
                  </div>
                  {fabricDisplayData ? (
                    <>
                      <span className="text-xs text-muted-foreground truncate">
                        {/* ✅ FIX: Show grid pricing info when applicable */}
                        {fabricDisplayData.usesPricingGrid && fabricDisplayData.gridName
                          ? `Grid: ${fabricDisplayData.gridName}`
                          : /* ✅ UNIT-AWARE DISPLAY: Convert meters to user's fabric unit */
                            /* CRITICAL: Check usesLeftover FIRST for horizontal fabric */
                            fabricDisplayData.usesLeftover && fabricDisplayData.orientation === 'horizontal'
                              ? `${formatFabricLength(fabricDisplayData.linearMeters)} × 1 piece (using leftover) = ${formatFabricLength(fabricDisplayData.totalMeters)} × ${formatPricePerFabricUnit(fabricDisplayData.pricePerMeter)}`
                              : fabricDisplayData.orientation === 'horizontal' && fabricDisplayData.horizontalPieces > 1
                                ? `${formatFabricLength(fabricDisplayData.linearMeters)} × ${fabricDisplayData.horizontalPieces} pieces = ${formatFabricLength(fabricDisplayData.totalMeters)} × ${formatPricePerFabricUnit(fabricDisplayData.pricePerMeter)}`
                                : `${formatFabricLength(fabricDisplayData.linearMeters)} × ${formatPricePerFabricUnit(fabricDisplayData.pricePerMeter)}`
                        }
                      </span>
                      <span className="text-xs text-muted-foreground/80 mt-0.5">
                        {fabricDisplayData.usesPricingGrid
                          ? `📊 Grid pricing applied (includes material & manufacturing)`
                          : fabricDisplayData.orientation === 'horizontal'
                            ? fabricDisplayData.usesLeftover 
                              ? `✓ Using leftover fabric - charged for 1 piece only`
                              : `⚡ Railroaded orientation: ${fabricDisplayData.horizontalPieces} piece(s) needed`
                            : `📏 Standard vertical: ${fabricDisplayData.horizontalPieces} width(s)`
                        }
                      </span>
                    </>
                  ) : fabricCalculation && (
                    <>
                      <span className="text-xs text-muted-foreground truncate">
                        {/* FALLBACK: Use fabricCalculation if fabricDisplayData not provided - UNIT-AWARE */}
                        {(() => {
                          const orientation = fabricCalculation.fabricOrientation || 'vertical';
                          const horizontalPieces = fabricCalculation.horizontalPiecesNeeded || 1;
                          const linearMeters = fabricCalculation.linearMeters || 0;
                          const pricePerM = fabricCalculation.pricePerMeter || 0;
                          
                          if (orientation === 'horizontal' && horizontalPieces > 1) {
                            const totalMeters = linearMeters * horizontalPieces;
                            return `${formatFabricLength(linearMeters)} × ${horizontalPieces} pieces = ${formatFabricLength(totalMeters)} × ${formatPricePerFabricUnit(pricePerM)}`;
                          }
                          return `${formatFabricLength(linearMeters)} × ${formatPricePerFabricUnit(pricePerM)}`;
                        })()}
                      </span>
                      {/* Orientation indicator */}
                      <span className="text-xs text-muted-foreground/80 mt-0.5">
                        {(() => {
                          const orientation = fabricCalculation.fabricOrientation || 'vertical';
                          const widthsReq = fabricCalculation.widthsRequired || 1;
                          const horizontalPieces = fabricCalculation.horizontalPiecesNeeded;
                          
                          if (orientation === 'horizontal') {
                            if (horizontalPieces && horizontalPieces > 1) {
                              return `⚡ Railroaded orientation: ${horizontalPieces} piece(s) needed`;
                            }
                            return `⚡ Railroaded orientation: ${widthsReq} piece(s) needed`;
                          } else {
                            return `📐 Standard vertical: ${widthsReq} width(s) needed`;
                          }
                        })()}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <span className="font-semibold text-card-foreground ml-2">{formatPrice(fabricCost)}</span>
            </div>
          </div>
        )}

        {manufacturingCost > 0 ? (
          <div className="flex justify-between py-1.5 border-b border-border/50">
            <div className="flex flex-col">
              <span className="text-card-foreground font-medium">
                Manufacturing {manufacturingDetails?.manufacturingType ? `(${manufacturingDetails.manufacturingType})` : ''}
              </span>
              {manufacturingDetails && manufacturingDetails.pricePerUnit > 0 && (
                <span className="text-xs text-muted-foreground">
                  {(() => {
                    const { pricingType, pricePerUnit, quantity, quantityLabel } = manufacturingDetails;
                    
                    if (pricingType === 'per_metre') {
                      // ✅ UNIT-AWARE: Convert meters to user's fabric unit
                      return `${formatPricePerFabricUnit(pricePerUnit)} × ${formatFabricLength(quantity)}`;
                    } else if (pricingType === 'per_panel') {
                      return `${formatPrice(pricePerUnit)}/panel × ${quantity} ${quantity === 1 ? 'panel' : 'panels'}`;
                    } else if (pricingType === 'per_drop') {
                      return `${formatPrice(pricePerUnit)}/drop × ${quantity} ${quantity === 1 ? 'drop' : 'drops'}`;
                    } else if (pricingType === 'height_range') {
                      return `${formatPrice(pricePerUnit)} (height range) × ${quantity} ${quantityLabel}`;
                    }
                    return quantityLabel || '';
                  })()}
                </span>
              )}
            </div>
            <span className="font-semibold text-card-foreground">{formatPrice(manufacturingCost)}</span>
          </div>
        ) : (
          /* CRITICAL: Show warning ONLY for curtains/romans when manufacturing not configured */
          /* ✅ FIX #4: Skip warning if using pricing grid (manufacturing included in grid price) */
          (() => {
            const treatmentCategory = template?.treatment_category?.toLowerCase() || '';
            const requiresManufacturing = ['curtains', 'curtain', 'romans', 'roman', 'roman_blinds', 'roman blind'].some(
              t => treatmentCategory.includes(t)
            );
            
            // ✅ FIX #4: Don't show warning if using pricing grid (grid includes manufacturing)
            const usingPricingGrid = fabricToUse?.pricing_grid_data || 
                                      template?.pricing_type === 'pricing_grid' ||
                                      template?.pricing_grid_data;
            
            if (!requiresManufacturing || usingPricingGrid) return null;
            
            return (
              <div className="flex justify-between py-1.5 border-b border-border/50 bg-amber-50 dark:bg-amber-950/30 -mx-4 px-4">
                <div className="flex flex-col">
                  <span className="text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1">
                    ⚠️ Manufacturing Not Configured
                  </span>
                  <span className="text-xs text-amber-600 dark:text-amber-500">
                    Set pricing in Settings → Templates → Pricing tab
                  </span>
                </div>
                <span className="font-semibold text-amber-700 dark:text-amber-400">{formatPrice(0)}</span>
              </div>
            );
          })()
        )}

        {/* ✅ LEGACY LINING DISPLAY REMOVED: Lining is now an OPTION with per-linear-meter pricing */}
        {/* Lining displays in the options list below with correct calculated price */}

        {headingCost > 0 && (
          <div className="flex justify-between py-1.5 border-b border-border/50">
            <span className="text-card-foreground font-medium">Heading</span>
            <span className="font-semibold text-card-foreground">{formatPrice(headingCost)}</span>
          </div>
        )}

        {/* Individual Options - Show calculated prices based on pricing method */}
        {selectedOptions && selectedOptions.length > 0 && selectedOptions.map((option, idx) => {
          const basePrice = option.price || 0;
          
          // Calculate actual price based on pricing method
          let calculatedPrice = basePrice;
          let pricingDetails = '';
          
          // Get dimensions from measurements for calculation
          // CRITICAL: Check the unit field - measurements may come in CM (user's unit) not MM
          const rawWidth = safeParseFloat(measurements?.rail_width, 0) || safeParseFloat(measurements?.width, 0);
          const rawHeight = safeParseFloat(measurements?.drop, 0) || safeParseFloat(measurements?.height, 0);
          const measurementUnit = measurements?.unit?.toLowerCase() || 'mm';
          
          // Convert to CM based on the actual unit
          let widthCm: number, heightCm: number;
          if (measurementUnit === 'cm') {
            // Already in CM - use directly
            widthCm = rawWidth;
            heightCm = rawHeight;
          } else if (measurementUnit === 'm') {
            // In meters - multiply by 100
            widthCm = rawWidth * 100;
            heightCm = rawHeight * 100;
          } else {
            // Assume MM (database standard) - divide by 10
            // But if value < 1000, it's likely already in CM
            widthCm = rawWidth > 10000 ? rawWidth / 10 : rawWidth;
            heightCm = rawHeight > 10000 ? rawHeight / 10 : rawHeight;
          }
          
          // ✅ SINGLE SOURCE OF TRUTH: Use engineResult → fabricDisplayData → fabricCalculation
          const fabricLinearMeters = engineResult?.linear_meters 
            ?? fabricDisplayData?.linearMeters 
            ?? fabricCalculation?.linearMeters 
            ?? (widthCm / 100);
          
          // CRITICAL: Hardware uses ACTUAL rail width, NOT fullness-adjusted fabric meters!
          // Hardware = tracks, poles, rods, rails - these are physical items matching window width
          const optionNameLower = (option.name || '').toLowerCase();
          const optionKeyLower = (option.optionKey || '').toLowerCase();
          const isHardware = optionNameLower.includes('hardware') || 
                            optionNameLower.includes('track') || 
                            optionNameLower.includes('pole') || 
                            optionNameLower.includes('rod') ||
                            optionNameLower.includes('rail') ||
                            optionKeyLower.includes('hardware') ||
                            optionKeyLower.includes('track') ||
                            optionKeyLower.includes('pole');
          
          // Hardware uses actual rail width in meters, fabric uses fullness-adjusted linear meters
          const metersForCalculation = isHardware ? (widthCm / 100) : fabricLinearMeters;
          
          // Check if hardware has a FIXED LENGTH in its name (e.g., "2.4m", "3m")
          // These should be priced as fixed units, not per-meter
          const fixedLengthMatch = optionNameLower.match(/(\d+\.?\d*)\s*m\b/);
          const hasFixedLength = isHardware && fixedLengthMatch;
          
          // Determine if metric based on units settings
          const isMetric = units?.length?.toLowerCase() !== 'imperial' && units?.length?.toLowerCase() !== 'in' && units?.length?.toLowerCase() !== 'ft';
          const lengthUnit = getLengthUnitLabel(isMetric);
          const areaUnit = getAreaUnitLabel(isMetric);
          
          if (option.pricingMethod === 'per-meter' && basePrice > 0) {
            if (hasFixedLength) {
              // Fixed-length item like "Curtain Track white 2.4m" - price is per unit
              calculatedPrice = basePrice;
              pricingDetails = `${formatPrice(basePrice)} per unit`;
            } else {
              calculatedPrice = basePrice * metersForCalculation;
              // ✅ UNIT-AWARE: Convert to user's fabric unit
              pricingDetails = `${formatPricePerFabricUnit(basePrice)} × ${formatFabricLength(metersForCalculation)}`;
            }
          } else if (option.pricingMethod === 'per-sqm' && basePrice > 0) {
            const sqm = (widthCm * heightCm) / 10000;
            calculatedPrice = basePrice * sqm;
            pricingDetails = `${formatPrice(basePrice)}/sqm × ${sqm.toFixed(2)}sqm`;
          } else if (option.pricingMethod === 'pricing-grid' && option.pricingGridData) {
            calculatedPrice = getPriceFromGrid(option.pricingGridData, widthCm, heightCm);
            pricingDetails = `Grid lookup`;
          }
          
          return (
            <div key={idx} className="flex justify-between py-1.5 border-b border-border/50">
              <div className="flex flex-col">
                <span className="text-card-foreground font-medium">{option.name}</span>
                {pricingDetails && calculatedPrice > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {pricingDetails}
                  </span>
                )}
              </div>
              <span className="font-semibold text-card-foreground">
                {calculatedPrice > 0 ? formatPrice(calculatedPrice) : <span className="text-muted-foreground text-sm">Included</span>}
              </span>
            </div>
          );
        })}
      </div>

      {/* Cost Total */}
      <div className="border-t-2 border-primary/20 pt-2.5">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-card-foreground">Cost Total</span>
          <span className="text-xl font-bold text-primary">{formatPrice(totalCost)}</span>
        </div>
        
        {/* Quote Price - Shows retail price with markup for sales team */}
        {markupSettings && markupSettings.default_markup_percentage > 0 && (
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <span className="font-semibold text-emerald-600">Quote Price</span>
              <span className="text-xs text-muted-foreground">({markupSettings.default_markup_percentage}% markup)</span>
            </div>
            <span className="text-xl font-bold text-emerald-600">
              {formatPrice(applyMarkup(totalCost, markupSettings.default_markup_percentage))}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

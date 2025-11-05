import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Info, Settings, AlertCircle } from "lucide-react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { useHeadingOptions } from "@/hooks/useHeadingOptions";
import { calculateBlindCosts, isBlindCategory } from "./utils/blindCostCalculator";
import { calculateWallpaperCost } from "@/utils/wallpaperCalculations";
import { detectTreatmentType } from "@/utils/treatmentTypeDetection";
import type { CurtainTemplate } from "@/hooks/useCurtainTemplates";
import { safeParseFloat } from "@/utils/costCalculationErrors";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useFabricEnrichment } from "@/hooks/pricing/useFabricEnrichment";
import { getPriceFromGrid } from "@/hooks/usePricingGrids";

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
}

export const CostCalculationSummary = ({
  template,
  measurements,
  selectedFabric,
  selectedLining,
  selectedHeading,
  inventory,
  selectedOptions = [],
  calculatedFabricCost,
  calculatedLiningCost,
  calculatedManufacturingCost,
  calculatedHeadingCost,
  calculatedOptionsCost,
  calculatedTotalCost
}: CostCalculationSummaryProps) => {
  const { units } = useMeasurementUnits();
  const { data: headingOptionsFromSettings = [] } = useHeadingOptions();
  
  // Enrich fabric with pricing grid data if applicable
  const { enrichedFabric } = useFabricEnrichment({
    fabricItem: selectedFabric,
    formData: measurements
  });
  
  // Use enriched fabric for all calculations
  const fabricToUse = enrichedFabric || selectedFabric;

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

  // Use proper treatment detection instead of template.treatment_category
  const treatmentCategory = detectTreatmentType(template);
  const width = safeParseFloat(measurements.rail_width, 0);
  const height = safeParseFloat(measurements.drop, 0);

  console.log('🔍 CostCalculationSummary Debug:', {
    treatmentCategory,
    templateName: template.name,
    curtainType: template.curtain_type,
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
                <span className="text-card-foreground font-medium">Fabric Material</span>
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
                    {template?.pricing_type === 'pricing_grid' ? `Grid: ${width}cm × ${height}cm` : 'Labor cost'}
                  </span>
                </div>
              </div>
              <span className="font-semibold text-card-foreground ml-2">{formatPrice(blindCosts.manufacturingCost)}</span>
            </div>
          )}

          {/* Paid Options */}
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
                  .filter(opt => (opt.price && opt.price > 0) || (opt.pricingMethod === 'pricing-grid' && opt.pricingGridData))
                  .map((option, index) => {
                    // Calculate actual price for this option based on method
                    let displayPrice = option.price || 0;
                    let pricingDetails = '';
                    
                    if (option.pricingMethod === 'per-meter') {
                      displayPrice = (option.price || 0) * (width / 100);
                      pricingDetails = ` (${(option.price || 0).toFixed(2)}/m × ${(width / 100).toFixed(2)}m)`;
                    } else if (option.pricingMethod === 'per-sqm') {
                      const sqm = blindCosts.squareMeters;
                      displayPrice = (option.price || 0) * sqm;
                      pricingDetails = ` (${(option.price || 0).toFixed(2)}/sqm × ${sqm.toFixed(2)}sqm)`;
                    } else if (option.pricingMethod === 'pricing-grid' && option.pricingGridData) {
                      // Check if it's width-only grid
                      if (Array.isArray(option.pricingGridData) && option.pricingGridData.length > 0 && 'width' in option.pricingGridData[0]) {
                        const widthValues = option.pricingGridData.map((entry: any) => parseInt(entry.width));
                        const closestWidth = widthValues.reduce((prev: number, curr: number) => {
                          return Math.abs(curr - width) < Math.abs(prev - width) ? curr : prev;
                        });
                        const matchingEntry = option.pricingGridData.find((entry: any) => parseInt(entry.width) === closestWidth);
                        displayPrice = matchingEntry ? parseFloat(matchingEntry.price) : 0;
                        pricingDetails = ` (Grid: ${width}cm → ${formatPrice(displayPrice)})`;
                      } else {
                        // Full 2D grid
                        displayPrice = getPriceFromGrid(option.pricingGridData, width, height);
                        pricingDetails = ` (Grid: ${width}cm × ${height}cm → ${formatPrice(displayPrice)})`;
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

        {/* Total */}
        <div className="border-t-2 border-primary/20 pt-2.5">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-card-foreground">Total</span>
            <span className="text-xl font-bold text-primary">{formatPrice(blindCosts.totalCost)}</span>
          </div>
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
              <div>Method: {template.pricing_type}</div>
              <div>Area: {blindCosts.squareMeters.toFixed(2)} sqm</div>
              {template.waste_percent > 0 && <div>Waste: {template.waste_percent}%</div>}
            </div>

            {selectedOptions && selectedOptions.length > 0 && (
              <div className="mt-3 pt-2 border-t border-border/30">
                <div className="font-medium text-card-foreground mb-1.5">Selected Options:</div>
                <div className="space-y-1">
                  {selectedOptions.map((option, index) => (
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

  // CURTAINS: Use pre-calculated values or default to 0
  const fabricCost = safeParseFloat(calculatedFabricCost, 0);
  const liningCost = safeParseFloat(calculatedLiningCost, 0);
  const manufacturingCost = safeParseFloat(calculatedManufacturingCost, 0);
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
    totalCost
  });

  return (
    <div className="bg-card border border-border rounded-lg p-3 space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <Calculator className="h-4 w-4 text-primary" />
        <h3 className="text-base font-semibold text-card-foreground">Cost Summary</h3>
      </div>

      <div className="grid gap-2 text-sm">
        {fabricCost > 0 && (
          <div className="flex justify-between py-1.5 border-b border-border/50">
            <span className="text-card-foreground font-medium">Fabric Material</span>
            <span className="font-semibold text-card-foreground">{formatPrice(fabricCost)}</span>
          </div>
        )}

        {manufacturingCost > 0 && (
          <div className="flex justify-between py-1.5 border-b border-border/50">
            <span className="text-card-foreground font-medium">Manufacturing</span>
            <span className="font-semibold text-card-foreground">{formatPrice(manufacturingCost)}</span>
          </div>
        )}

        {liningCost > 0 && (
          <div className="flex justify-between py-1.5 border-b border-border/50">
            <span className="text-card-foreground font-medium">Lining</span>
            <span className="font-semibold text-card-foreground">{formatPrice(liningCost)}</span>
          </div>
        )}

        {headingCost > 0 && (
          <div className="flex justify-between py-1.5 border-b border-border/50">
            <span className="text-card-foreground font-medium">Heading</span>
            <span className="font-semibold text-card-foreground">{formatPrice(headingCost)}</span>
          </div>
        )}

        {optionsCost > 0 && (
          <div className="flex justify-between py-1.5 border-b border-border/50">
            <span className="text-card-foreground font-medium">Additional Options</span>
            <span className="font-semibold text-card-foreground">{formatPrice(optionsCost)}</span>
          </div>
        )}
      </div>

      <div className="border-t-2 border-primary/20 pt-2.5">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-card-foreground">Total</span>
          <span className="text-xl font-bold text-primary">{formatPrice(totalCost)}</span>
        </div>
      </div>
    </div>
  );
};

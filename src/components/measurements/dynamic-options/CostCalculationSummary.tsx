import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calculator, DollarSign, Info, Settings } from "lucide-react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { useHeadingOptions } from "@/hooks/useHeadingOptions";
import { getPriceFromGrid } from "@/hooks/usePricingGrids";
import { calculateBlindCost, calculateShutterCost } from "@/utils/blindCostCalculations";
import { isBlind, calculateFabricUsage } from "@/components/job-creation/treatment-pricing/fabric-calculation/fabricUsageCalculator";
import type { CurtainTemplate } from "@/hooks/useCurtainTemplates";

// Simple black outline SVG icons
const CurtainIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {/* Curtain rod */}
    <line x1="2" y1="4" x2="22" y2="4" />
    {/* Curtain panels */}
    <path d="M5 4 Q7 8 5 12 Q7 16 5 20" />
    <path d="M9 4 Q11 8 9 12 Q11 16 9 20" />
    <path d="M13 4 Q15 8 13 12 Q15 16 13 20" />
    <path d="M17 4 Q19 8 17 12 Q19 16 17 20" />
  </svg>
);

const FabricSwatchIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {/* Main fabric swatch with zigzag edges */}
    <path d="M6 6 L8 8 L6 10 L8 12 L6 14 L8 16 L6 18 L18 18 L16 16 L18 14 L16 12 L18 10 L16 8 L18 6 Z" />
    {/* Fabric texture lines */}
    <line x1="8" y1="9" x2="16" y2="9" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="8" y1="15" x2="16" y2="15" />
  </svg>
);

const SewingMachineIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {/* Machine base */}
    <rect x="3" y="16" width="18" height="4" rx="1" />
    {/* Machine body */}
    <rect x="6" y="8" width="12" height="8" rx="1" />
    {/* Needle arm */}
    <rect x="10" y="6" width="4" height="2" rx="0.5" />
    {/* Needle */}
    <line x1="12" y1="8" x2="12" y2="12" />
    {/* Thread spool */}
    <circle cx="8" cy="4" r="1" />
  </svg>
);

const AssemblyIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {/* Wrench */}
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
  selectedOptions?: Array<{ name: string; price?: number }>;
  // CRITICAL: Pre-calculated costs from calculateTreatmentPricing
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
  fabricCalculation,
  selectedOptions = [],
  calculatedFabricCost,
  calculatedLiningCost,
  calculatedManufacturingCost,
  calculatedHeadingCost,
  calculatedOptionsCost,
  calculatedTotalCost
}: CostCalculationSummaryProps) => {
  // Hooks MUST be called before any conditional returns to avoid hook violations
  const { units } = useMeasurementUnits();
  const { data: headingOptionsFromSettings = [] } = useHeadingOptions();

  // Early return AFTER hooks if template is null
  if (!template) {
    return (
      <div className="p-4 border rounded-lg bg-muted/50">
        <p className="text-sm text-muted-foreground">
          No template selected. Please select a curtain template to see cost calculations.
        </p>
      </div>
    );
  }

  // Format price helper using user's currency
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

  // CRITICAL: Detect blinds/shutters and use specialized calculation
  const treatmentCategory = template.treatment_category?.toLowerCase() || '';
  const isBlindsOrShutters = treatmentCategory.includes('blind') || treatmentCategory.includes('shutter');

  if (isBlindsOrShutters) {
    const width = parseFloat(measurements.rail_width) || 0;
    const height = parseFloat(measurements.drop) || 0;
    
    // Format selected options
    const blindOptions = selectedOptions.map(opt => ({
      name: opt.name,
      price: opt.price || 0
    }));
    
    const blindResult = treatmentCategory.includes('shutter')
      ? calculateShutterCost(width, height, template, selectedFabric, blindOptions)
      : calculateBlindCost(width, height, template, selectedFabric, blindOptions);
    
    return (
      <Card className="bg-card/50 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Cost Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Material</span>
              <span className="font-semibold">{formatPrice(blindResult.fabricCost)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Assembly</span>
              <span className="font-semibold">{formatPrice(blindResult.manufacturingCost)}</span>
            </div>
            {blindResult.optionsCost > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Options</span>
                <span className="font-semibold">{formatPrice(blindResult.optionsCost)}</span>
              </div>
            )}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-bold">Total</span>
                <span className="font-bold text-lg text-primary">{formatPrice(blindResult.totalCost)}</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            <div>Template: {template.name}</div>
            <div>Method: {template.pricing_type || 'per_sqm'}</div>
            {selectedOptions.length > 0 && (
              <div className="mt-1">
                <div className="font-medium">Selected Options:</div>
                {selectedOptions.map((opt, idx) => (
                  <div key={idx}>• {opt.name}{opt.price > 0 ? ` ${formatPrice(opt.price)}` : ' Included'}</div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Hooks are now called at the top of the component before any conditional logic

  const width = parseFloat(measurements.rail_width || measurements.measurement_a || '0');
  const height = parseFloat(measurements.drop || measurements.measurement_b || '0');
  const pooling = parseFloat(measurements.pooling_amount || '0');

  // Manufacturing allowances from template
  const initialPanelConfig = (template as any).panel_configuration || template.curtain_type;
  const curtainCount = initialPanelConfig === 'pair' ? 2 : 1;
  const sideHems = template.side_hems || 0;
  const totalSideHems = sideHems * 2 * curtainCount;
  const returnLeft = template.return_left || 0;
  const returnRight = template.return_right || 0;
  const seamHems = template.seam_hems || 0;
  const requiredWidth = width * (template.fullness_ratio || 2);
  const totalWidthWithAllowances = requiredWidth + returnLeft + returnRight + totalSideHems;
  const fabricWidthCm = selectedFabric?.fabric_width_cm || selectedFabric?.fabric_width || 137;
  const widthsRequired = Math.ceil(totalWidthWithAllowances / fabricWidthCm);
  const totalSeamAllowance = widthsRequired > 1 ? (widthsRequired - 1) * seamHems * 2 : 0;

  // formatPrice is now defined at the top of the component

  // Calculate fabric usage METRICS ONLY (no cost calculation)
  const calculateFabricUsage = () => {
    if (!width || !height) return { 
      linearMeters: 0, 
      squareMeters: 0, 
      fabricWidth: 0,
      totalDrop: 0,
      widthsRequired: 0
    };

    const fabricWidthCm = selectedFabric?.fabric_width_cm || selectedFabric?.fabric_width || 137;
    const headerHem = template.header_allowance || 8;
    const bottomHem = template.bottom_hem || 8;
    const totalDrop = height + headerHem + bottomHem + pooling;
    const wasteMultiplier = 1 + ((template.waste_percent || 0) / 100);
    const linearMeters = ((totalDrop + totalSeamAllowance) / 100) * widthsRequired * wasteMultiplier;
    const squareMeters = linearMeters * (fabricWidthCm / 100);

    return { 
      linearMeters, 
      squareMeters, 
      fabricWidth: fabricWidthCm,
      totalDrop,
      widthsRequired
    };
  };

  // Get lining display name only - cost calculation handled elsewhere
  const getLiningName = () => {
    if (!selectedLining || selectedLining === 'none') return '';
    const liningType = template.lining_types?.find(l => l.type === selectedLining);
    return liningType?.type || selectedLining;
  };

  // Get heading display name only - cost calculation handled elsewhere
  const getHeadingName = () => {
    if (!selectedHeading || selectedHeading === 'standard') return template.heading_name || 'Standard';
    const headingOption = headingOptionsFromSettings.find(h => h.id === selectedHeading);
    if (headingOption) return headingOption.name;
    const headingItem = inventory.find(item => item.id === selectedHeading);
    return headingItem?.name || selectedHeading;
  };

  // All cost calculations are handled by calculateTreatmentPricing - this component is DISPLAY ONLY

  // Get fabric usage metrics only
  const fabricUsage = calculateFabricUsage();
  
  // Get fabric display info
  const fabricName = selectedFabric?.name || "No fabric selected";
  const fabricPriceDisplay = selectedFabric?.selling_price || selectedFabric?.unit_price || selectedFabric?.price_per_meter || 0;
  
  // CRITICAL: Use ONLY pre-calculated costs from calculateTreatmentPricing (single source of truth)
  // This component is DISPLAY ONLY - all calculations happen in calculateTreatmentPricing
  const finalFabricCostToDisplay = calculatedFabricCost || 0;
  const finalLiningCostToDisplay = calculatedLiningCost || 0;
  const finalManufacturingCostToDisplay = calculatedManufacturingCost || 0;
  const finalHeadingCostToDisplay = calculatedHeadingCost || 0;
  const finalOptionsCostToDisplay = calculatedOptionsCost || 0;
  const totalCost = calculatedTotalCost || 0;
  
  // Get linear meters from fabricCalculation if available, otherwise from our metrics
  const finalLinearMeters = fabricCalculation?.linearMeters || fabricUsage.linearMeters;
  const finalSquareMeters = fabricCalculation?.sqm || fabricCalculation?.squareMeters || fabricUsage.squareMeters;

  console.log('🎨 CostCalculationSummary DISPLAYING (from calculateTreatmentPricing):', {
    fabricCost: finalFabricCostToDisplay,
    liningCost: finalLiningCostToDisplay,
    headingCost: finalHeadingCostToDisplay,
    manufacturingCost: finalManufacturingCostToDisplay,
    optionsCost: finalOptionsCostToDisplay,
    totalCost,
    linearMeters: finalLinearMeters,
    squareMeters: finalSquareMeters,
    pricingType: template.pricing_type
  });

  // Detect product type for dynamic labels
  const productCategory = (template as any).category?.toLowerCase() || template.name?.toLowerCase() || '';
  const templateType = (template as any).template_type?.toLowerCase() || '';
  const isBlind = productCategory.includes('blind') || productCategory.includes('shade') || templateType.includes('blind') || templateType.includes('shade');
  const isRollerBlind = productCategory.includes('roller');
  const isWallpaper = productCategory.includes('wallpaper') || productCategory.includes('wall covering');
  const isCurtain = productCategory.includes('curtain') || (!isBlind && !isWallpaper);
  const panelCount = initialPanelConfig === 'pair' ? 2 : 1;

  // Dynamic labels based on product type
  const getManufacturingLabel = () => {
    if (isBlind) return 'Assembly';
    return 'Manufacturing';
  };

  const getPerUnitLabel = () => {
    if (isRollerBlind) return 'Per blind';
    if (isBlind) return 'Per unit';
    return 'Per panel';
  };

  const ManufacturingIcon = isBlind ? AssemblyIcon : SewingMachineIcon;

  // Wallpaper simplified view
  if (isWallpaper) {
    const wallpaperOptionsCost = finalOptionsCostToDisplay;
    
    // Calculate wallpaper requirements from measurements
    const wallWidth = parseFloat(measurements.wall_width || '0');
    const wallHeight = parseFloat(measurements.wall_height || '0');
    
    // Get wallpaper specs from selected fabric
    const rollWidth = selectedFabric?.wallpaper_roll_width || 53; // cm
    const rollLength = selectedFabric?.wallpaper_roll_length || 10; // meters
    const patternRepeat = selectedFabric?.pattern_repeat_vertical || 0; // cm
    const matchType = selectedFabric?.wallpaper_match_type || 'straight';
    
    // Calculate length per strip based on pattern matching
    let lengthPerStripCm = wallHeight;
    if (patternRepeat > 0 && matchType !== 'none' && matchType !== 'random') {
      lengthPerStripCm = wallHeight + patternRepeat;
    }
    const lengthPerStripM = lengthPerStripCm / 100;
    
    // Calculate strips needed
    const stripsNeeded = Math.ceil(wallWidth / rollWidth);
    
    // Calculate total meters needed
    const totalMeters = stripsNeeded * lengthPerStripM;
    
    // Calculate rolls needed
    const stripsPerRoll = Math.floor(rollLength / lengthPerStripM);
    const rollsNeeded = stripsPerRoll > 0 ? Math.ceil(stripsNeeded / stripsPerRoll) : 0;
    
    const pricePerUnit = selectedFabric?.unit_price || selectedFabric?.selling_price || selectedFabric?.price_per_meter || 0;
    const soldBy = selectedFabric?.wallpaper_sold_by || 'per_meter';
    
    let quantity = totalMeters;
    let unitLabel = 'meter';
    
    if (soldBy === 'per_roll') {
      quantity = rollsNeeded;
      unitLabel = 'roll';
    } else if (soldBy === 'per_sqm') {
      const wallWidthM = wallWidth / 100;
      const wallHeightM = wallHeight / 100;
      quantity = wallWidthM * wallHeightM;
      unitLabel = 'm²';
    }
    
    const wallpaperCost = quantity * pricePerUnit;
    const finalTotal = wallpaperCost + wallpaperOptionsCost;
    
    console.log('💰 Wallpaper cost calculation:', {
      wallWidth,
      wallHeight,
      rollWidth,
      rollLength,
      patternRepeat,
      lengthPerStripM,
      stripsNeeded,
      totalMeters,
      rollsNeeded,
      soldBy,
      quantity,
      pricePerUnit,
      wallpaperCost,
      optionsCost: wallpaperOptionsCost,
      finalTotal
    });
    
    return (
      <div className="bg-card border border-border rounded-lg p-3 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Calculator className="h-4 w-4 text-primary" />
          <h3 className="text-base font-semibold text-card-foreground">Cost Summary</h3>
        </div>

        {/* Cost Breakdown */}
        <div className="grid gap-1.5 text-sm">
          {/* Wallpaper Cost */}
          <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
            <div className="flex items-center gap-2">
              <FabricSwatchIcon className="h-4 w-4 text-primary" />
              <span className="font-medium">Wallpaper</span>
            </div>
            <span className="font-semibold">{formatPrice(wallpaperCost)}</span>
          </div>
          <div className="text-xs text-muted-foreground pl-8 pb-2">
            {quantity.toFixed(2)} {unitLabel}{quantity !== 1 ? 's' : ''} × {formatPrice(pricePerUnit)}/{unitLabel}
            {selectedFabric?.name && <div className="mt-0.5">"{selectedFabric.name}"</div>}
          </div>

          {/* Options if any */}
          {wallpaperOptionsCost > 0 && (
            <>
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-primary" />
                  <span className="font-medium">Options</span>
                </div>
                <span className="font-semibold">{formatPrice(wallpaperOptionsCost)}</span>
              </div>
              {selectedOptions.length > 0 && (
                <div className="text-xs text-muted-foreground pl-8 pb-2 space-y-0.5">
                  {selectedOptions.map((option, idx) => (
                    <div key={idx}>• {option.name} - {formatPrice(option.price || 0)}</div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Total */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="font-semibold">Total</span>
          </div>
          <span className="font-bold text-lg text-primary">{formatPrice(finalTotal)}</span>
        </div>
      </div>
    );
  }

  // Original detailed view for curtains and blinds
  return (
    <div className="bg-card border border-border rounded-lg p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <Calculator className="h-4 w-4 text-primary" />
        <h3 className="text-base font-semibold text-card-foreground">Cost Summary</h3>
      </div>

      {/* Cost Breakdown - Compact Grid Layout */}
      <div className="grid gap-1.5 text-sm">
        {/* Fabric */}
        <div className="flex items-center justify-between py-1.5">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FabricSwatchIcon className="h-3.5 w-3.5 text-primary shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-card-foreground font-medium">Fabric Material</span>
              <span className="text-xs text-muted-foreground truncate">
                {/* Show sqm for blinds, linear meters for curtains */}
                {treatmentCategory.includes('blind') && finalSquareMeters > 0 
                  ? `${finalSquareMeters.toFixed(2)} sqm × ${formatPrice(fabricPriceDisplay)}/sqm`
                  : `${finalLinearMeters.toFixed(2)}${units.fabric === 'yards' ? 'yd' : 'm'} × ${formatPrice(fabricPriceDisplay)}/${units.fabric === 'yards' ? 'yd' : 'm'}`
                }
              </span>
            </div>
          </div>
          <span className="font-medium text-card-foreground ml-2">{formatPrice(finalFabricCostToDisplay)}</span>
        </div>

        {/* Lining */}
        {selectedLining && selectedLining !== 'none' && finalLiningCostToDisplay > 0 && (
          <div className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FabricSwatchIcon className="h-3.5 w-3.5 text-primary shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-card-foreground font-medium">Lining</span>
                <span className="text-xs text-muted-foreground truncate">{getLiningName()}</span>
              </div>
            </div>
            <span className="font-medium text-card-foreground ml-2">{formatPrice(finalLiningCostToDisplay)}</span>
          </div>
        )}

        {/* Heading */}
        {finalHeadingCostToDisplay > 0 && (
          <div className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="w-3.5 h-3.5 border-b-2 border-primary shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-card-foreground font-medium">Heading</span>
                <span className="text-xs text-muted-foreground truncate">{getHeadingName()}</span>
              </div>
            </div>
            <span className="font-medium text-card-foreground ml-2">{formatPrice(finalHeadingCostToDisplay)}</span>
          </div>
        )}

        {/* Manufacturing/Assembly with detailed breakdown */}
        {finalManufacturingCostToDisplay > 0 && (
          <div className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <SewingMachineIcon className="h-3.5 w-3.5 text-primary shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-card-foreground font-medium">{getManufacturingLabel()}</span>
                <span className="text-xs text-muted-foreground truncate">
                  {(() => {
                    const manufacturingType = measurements.manufacturing_type || template.manufacturing_type || 'machine';
                    const isHandFinished = manufacturingType === 'hand';
                    const pricingMethods = (template as any).pricing_methods || [];
                    const selectedMethodId = measurements.selected_pricing_method;
                    const selectedMethod = pricingMethods.find((m: any) => m.id === selectedMethodId) || pricingMethods[0];
                    
                    const pricePerMetre = isHandFinished 
                      ? (selectedMethod?.hand_price_per_metre || template.hand_price_per_metre || 0)
                      : (selectedMethod?.machine_price_per_metre || template.machine_price_per_metre || 0);
                    
                    if (pricePerMetre > 0) {
                      return `${finalLinearMeters.toFixed(2)}${units.fabric === 'yards' ? 'yd' : 'm'} × ${formatPrice(pricePerMetre)}/${units.fabric === 'yards' ? 'yd' : 'm'} sewing`;
                    }
                    return 'Makeup service';
                  })()}
                </span>
              </div>
            </div>
            <span className="font-medium text-card-foreground ml-2">{formatPrice(finalManufacturingCostToDisplay)}</span>
          </div>
        )}

        {/* Options */}
        {finalOptionsCostToDisplay > 0 && (
          <div className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Settings className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-card-foreground font-medium">Options</span>
            </div>
            <span className="font-medium text-card-foreground ml-2">{formatPrice(finalOptionsCostToDisplay)}</span>
          </div>
        )}
      </div>

      {/* Total - More Compact */}
      <div className="border-t border-border pt-2.5 space-y-0.5">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-card-foreground">Total</span>
          <span className="text-lg font-bold text-primary">{formatPrice(totalCost)}</span>
        </div>
        {isCurtain && panelCount > 1 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{getPerUnitLabel()}</span>
            <span>{formatPrice(totalCost / panelCount)}</span>
          </div>
        )}
      </div>

      {/* Collapsible Details */}
      <details className="text-xs text-muted-foreground group">
        <summary className="cursor-pointer font-medium text-card-foreground flex items-center gap-1.5 py-1 hover:text-primary transition-colors">
          <Info className="h-3 w-3" />
          <span>Pricing Details</span>
          <span className="ml-auto text-xs group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="space-y-1 mt-2 pl-4 border-l-2 border-border">
          <div>Template: {template.name}</div>
          <div>Method: {template.pricing_type}</div>
          
          {/* Selected Options */}
          {selectedOptions && selectedOptions.length > 0 && (
            <div className="mt-2">
              <div className="font-medium text-card-foreground mb-1">Selected Options:</div>
              {selectedOptions.map((option, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span>• {option.name}</span>
                  <span className="text-card-foreground font-medium">
                    {option.price > 0 ? formatPrice(option.price) : 'Included'}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {template.pricing_type === 'pricing_grid' && (
            <div className="mt-1.5 p-1.5 bg-primary/5 rounded text-xs">
              <div className="font-medium text-primary">Grid:</div>
              <div>W: {width}cm × H: {height}cm</div>
              <div>Price: {formatPrice(finalManufacturingCostToDisplay)}</div>
            </div>
          )}
          {template.pricing_type === 'per_metre' && (
            <div className="mt-1.5 p-1.5 bg-primary/5 rounded text-xs">
              <div>{formatPrice(template.machine_price_per_metre || 0)}/m × {finalLinearMeters.toFixed(2)}m</div>
            </div>
          )}
          {(template.pricing_type === 'per_panel' || template.pricing_type === 'per_drop') && (
            <div className="mt-1.5 p-1.5 bg-primary/5 rounded text-xs">
              <div>{(width/100).toFixed(2)}m × {(height/100).toFixed(2)}m = {(width/100 * height/100).toFixed(2)}m²</div>
            </div>
          )}
          <div className="mt-1">Waste: {template.waste_percent || 5}%</div>
        </div>
      </details>
    </div>
  );
};
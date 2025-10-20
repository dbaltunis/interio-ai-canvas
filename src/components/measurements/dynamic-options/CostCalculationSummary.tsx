import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Info, Settings } from "lucide-react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { useHeadingOptions } from "@/hooks/useHeadingOptions";
import { calculateBlindCosts, isBlindCategory } from "./utils/blindCostCalculator";
import type { CurtainTemplate } from "@/hooks/useCurtainTemplates";

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
  selectedOptions?: Array<{ name: string; price?: number }>;
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

  const treatmentCategory = template.treatment_category?.toLowerCase() || '';
  const width = parseFloat(measurements.rail_width) || 0;
  const height = parseFloat(measurements.drop) || 0;

  console.log('🔍 CostCalculationSummary Debug:', {
    treatmentCategory,
    width,
    height,
    isBlind: isBlindCategory(treatmentCategory),
    measurements,
    template: template.name
  });

  // BLINDS: Use clean calculator
  if (isBlindCategory(treatmentCategory) && width > 0 && height > 0) {
    const blindCosts = calculateBlindCosts(width, height, template, selectedFabric, selectedOptions);
    
    console.log('✅ Using blind calculator, costs:', blindCosts);

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
              <div className="pl-6 space-y-1">
                {selectedOptions.filter(opt => opt.price && opt.price > 0).map((option, index) => (
                  <div key={index} className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>• {option.name}</span>
                    <span className="font-medium">{formatPrice(option.price || 0)}</span>
                  </div>
                ))}
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
  }

  // CURTAINS: Use pre-calculated values or default to 0
  const fabricCost = calculatedFabricCost || 0;
  const liningCost = calculatedLiningCost || 0;
  const manufacturingCost = calculatedManufacturingCost || 0;
  const headingCost = calculatedHeadingCost || 0;
  const optionsCost = calculatedOptionsCost || 0;
  const totalCost = calculatedTotalCost || (fabricCost + liningCost + manufacturingCost + headingCost + optionsCost);

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

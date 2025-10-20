import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Ruler, Calculator } from "lucide-react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { getPriceFromGrid } from "@/hooks/usePricingGrids";

interface AdaptiveFabricPricingDisplayProps {
  selectedFabricItem: any;
  fabricCalculation: any;
  template: any;
  measurements: Record<string, any>;
  treatmentCategory: string;
}

export const AdaptiveFabricPricingDisplay = ({
  selectedFabricItem,
  fabricCalculation,
  template,
  measurements,
  treatmentCategory
}: AdaptiveFabricPricingDisplayProps) => {
  const { units, getLengthUnitLabel, getFabricUnitLabel } = useMeasurementUnits();

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

  // Check if this treatment uses pricing grid
  const usesPricingGrid = template?.pricing_type === 'pricing_grid' && template?.pricing_grid_data;
  
  // Check if fabric is sold per sqm
  const isFabricPerSqm = selectedFabricItem?.price_per_unit === 'sqm';
  
  // Determine if this is a curtain-type treatment
  const isCurtainType = treatmentCategory === 'curtains' || 
                        treatmentCategory === 'roman_blinds' ||
                        template?.fullness_ratio > 1;

  // Calculate grid price if applicable
  let gridPrice = 0;
  let gridWidth = 0;
  let gridDrop = 0;
  if (usesPricingGrid && measurements.rail_width && measurements.drop) {
    gridWidth = parseFloat(measurements.rail_width);
    gridDrop = parseFloat(measurements.drop);
    gridPrice = getPriceFromGrid(template.pricing_grid_data, gridWidth, gridDrop);
  }

  // Calculate square meters for fabric if sold per sqm
  const calculateSquareMeters = () => {
    if (!measurements.rail_width || !measurements.drop) return 0;
    const widthM = parseFloat(measurements.rail_width) / 100;
    const heightM = parseFloat(measurements.drop) / 100;
    return widthM * heightM;
  };

  const renderPricingGridDisplay = () => (
    <div className="space-y-4">
      {/* Selected Fabric */}
      <div className="container-level-3 rounded-md p-3 space-y-2">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Calculator className="w-3.5 h-3.5" />
          Selected Fabric
        </h4>
        <div className="text-xs space-y-1 text-muted-foreground">
          <div className="flex justify-between">
            <span>Fabric:</span>
            <span className="font-medium text-foreground">{selectedFabricItem.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Width:</span>
            <span className="font-medium text-foreground">{selectedFabricItem.fabric_width || 300}cm</span>
          </div>
          {selectedFabricItem.price_per_meter && (
            <div className="flex justify-between">
              <span>Price/{isFabricPerSqm ? 'sqm' : 'meter'}:</span>
              <span className="font-medium text-foreground">{formatPrice(selectedFabricItem.price_per_meter)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Grid Calculation */}
      <div className="container-level-3 rounded-md p-3 space-y-2">
        <h4 className="font-semibold text-sm">Pricing Grid Calculation</h4>
        <div className="text-xs space-y-1 text-muted-foreground">
          <div className="flex justify-between">
            <span>Width:</span>
            <span className="font-medium text-foreground">{gridWidth}cm</span>
          </div>
          <div className="flex justify-between">
            <span>Drop:</span>
            <span className="font-medium text-foreground">{gridDrop}cm</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 mt-2">
            <span className="font-medium">Grid Price:</span>
            <span className="font-medium text-foreground">{formatPrice(gridPrice)}</span>
          </div>
        </div>
      </div>

      {/* Fabric Usage (simplified for roller blinds) */}
      {isFabricPerSqm && (
        <div className="container-level-3 rounded-md p-3 space-y-2">
          <h4 className="font-semibold text-sm">Fabric Usage</h4>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div className="flex justify-between">
              <span>Area Required:</span>
              <span className="font-medium text-foreground">{calculateSquareMeters().toFixed(2)} sqm</span>
            </div>
            <div className="flex justify-between">
              <span>Fabric Cost:</span>
              <span className="font-medium text-foreground">
                {formatPrice(calculateSquareMeters() * (selectedFabricItem.price_per_meter || 0))}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Calculation: {calculateSquareMeters().toFixed(2)} sqm × {formatPrice(selectedFabricItem.price_per_meter || 0)}/sqm
            </div>
          </div>
        </div>
      )}

      {template.waste_percent > 0 && (
        <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-2 rounded">
          <span className="font-medium">Waste:</span> {template.waste_percent}%
        </div>
      )}
    </div>
  );

  const renderRollerBlindDisplay = () => (
    <div className="space-y-4">
      {/* Selected Fabric */}
      <div className="container-level-3 rounded-md p-3 space-y-2">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Calculator className="w-3.5 h-3.5" />
          Selected Fabric
        </h4>
        <div className="text-xs space-y-1 text-muted-foreground">
          <div className="flex justify-between">
            <span>Fabric:</span>
            <span className="font-medium text-foreground">{selectedFabricItem.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Width:</span>
            <span className="font-medium text-foreground">{selectedFabricItem.fabric_width || 300}cm</span>
          </div>
          <div className="flex justify-between">
            <span>Price/{isFabricPerSqm ? 'sqm' : 'meter'}:</span>
            <span className="font-medium text-foreground">{formatPrice(selectedFabricItem.price_per_meter || 0)}</span>
          </div>
        </div>
      </div>

      {/* Fabric Usage */}
      <div className="container-level-3 rounded-md p-3 space-y-2">
        <h4 className="font-semibold text-sm">Fabric Usage</h4>
        <div className="text-xs space-y-1 text-muted-foreground">
          <div className="flex justify-between">
            <span>Blind Width:</span>
            <span className="font-medium text-foreground">{measurements.rail_width || 0}cm</span>
          </div>
          <div className="flex justify-between">
            <span>Blind Drop:</span>
            <span className="font-medium text-foreground">{measurements.drop || 0}cm</span>
          </div>
          {isFabricPerSqm ? (
            <>
              <div className="flex justify-between border-t border-border pt-1 mt-1">
                <span>Area Required:</span>
                <span className="font-medium text-foreground">{calculateSquareMeters().toFixed(2)} sqm</span>
              </div>
              <div className="flex justify-between">
                <span>Fabric Cost:</span>
                <span className="font-medium text-foreground">
                  {formatPrice(calculateSquareMeters() * (selectedFabricItem.price_per_meter || 0))}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between border-t border-border pt-1 mt-1">
                <span>Linear Meters:</span>
                <span className="font-medium text-foreground">
                  {((parseFloat(measurements.drop || 0) / 100) * 1.05).toFixed(2)}m
                </span>
              </div>
              <div className="flex justify-between">
                <span>Fabric Cost:</span>
                <span className="font-medium text-foreground">
                  {formatPrice(((parseFloat(measurements.drop || 0) / 100) * 1.05) * (selectedFabricItem.price_per_meter || 0))}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

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
      return (
        <div className="space-y-4">
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
                <span className="font-medium text-foreground">{selectedFabricItem?.fabric_width || 137}cm</span>
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
                Calculation: {fabricCalculation.sqm.toFixed(2)} sqm × {formatPrice(fabricCalculation.pricePerMeter || 0)}/sqm
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Regular curtain display
    return (
      <div className="space-y-4">
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
              <span className="font-medium text-foreground">{selectedFabricItem?.fabric_width || 137}cm</span>
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
              <span>Rail Width:</span>
              <span className="font-medium text-foreground">{fabricCalculation.railWidth || 0}cm</span>
            </div>
            <div className="flex justify-between">
              <span>Fullness Ratio:</span>
              <span className="font-medium text-foreground">{treatmentCategory === 'roman_blinds' ? '1' : (fabricCalculation.fullnessRatio || 0)}x</span>
            </div>
            <div className="flex justify-between">
              <span>Required Width:</span>
              <span className="font-medium text-foreground">{((fabricCalculation.railWidth || 0) * (fabricCalculation.fullnessRatio || 0)).toFixed(1)}cm</span>
            </div>
            <div className="flex justify-between">
              <span>Returns (L+R):</span>
              <span className="font-medium text-foreground">{fabricCalculation.returns || 0}cm</span>
            </div>
            {(fabricCalculation.totalSideHems || 0) > 0 && (
              <div className="flex justify-between">
                <span>Side Hems:</span>
                <span className="font-medium text-foreground">{fabricCalculation.totalSideHems}cm</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-1 mt-1">
              <span>Widths Required:</span>
              <span className="font-medium text-foreground">{fabricCalculation.widthsRequired || 0} width(s)</span>
            </div>
          </div>
        </div>

        {/* Height Calculations */}
        <div className="container-level-3 rounded-md p-3 space-y-2">
          <h4 className="font-semibold text-sm">Height Breakdown</h4>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div className="flex justify-between">
              <span>Drop Height:</span>
              <span className="font-medium text-foreground">{fabricCalculation.drop || 0}cm</span>
            </div>
            <div className="flex justify-between">
              <span>Header Hem:</span>
              <span className="font-medium text-foreground">+{fabricCalculation.headerHem || 0}cm</span>
            </div>
            <div className="flex justify-between">
              <span>Bottom Hem:</span>
              <span className="font-medium text-foreground">+{fabricCalculation.bottomHem || 0}cm</span>
            </div>
            {(fabricCalculation.pooling || 0) > 0 && (
              <div className="flex justify-between">
                <span>Pooling:</span>
                <span className="font-medium text-foreground">+{fabricCalculation.pooling}cm</span>
              </div>
            )}
            {(fabricCalculation.totalSeamAllowance || 0) > 0 && (
              <div className="flex justify-between">
                <span>Seam Allowance:</span>
                <span className="font-medium text-foreground">+{fabricCalculation.totalSeamAllowance.toFixed(1)}cm</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-1 mt-1">
              <span>Total Drop:</span>
              <span className="font-medium text-foreground">{(fabricCalculation.totalDrop || 0).toFixed(1)}cm</span>
            </div>
            {(fabricCalculation.wastePercent || 0) > 0 && (
              <div className="flex justify-between">
                <span>Waste ({fabricCalculation.wastePercent}%):</span>
                <span className="font-medium text-foreground">+{((fabricCalculation.totalDrop || 0) * (fabricCalculation.wastePercent || 0) / 100).toFixed(1)}cm</span>
              </div>
            )}
          </div>
        </div>

        {/* Total Calculation - Dynamic based on pricing method */}
        <div className="container-level-3 rounded-md p-3 bg-primary/5">
          <div className="text-xs space-y-2">
            {(() => {
              // Determine pricing unit dynamically from template
              const pricingMethod = template?.makeup_pricing_method || template?.pricing_method || 'per_metre';
              const isByDrop = pricingMethod === 'per_drop';
              const isByPanel = pricingMethod === 'per_panel';
              const isBySqm = pricingMethod === 'per_sqm' || template?.pricing_type === 'per_sqm';
              const isByMetre = pricingMethod === 'per_metre' || !pricingMethod;
              
              // Calculate appropriate quantity based on method
              let quantity = 0;
              let unitLabel = '';
              let unitSuffix = '';
              let calculationText = '';
              let calculationBreakdown = '';
              
              if (isBySqm) {
                // Square meter calculation
                const sqm = fabricCalculation.sqm || ((fabricCalculation.railWidth || 0) * (fabricCalculation.totalDrop || 0) / 10000);
                quantity = sqm;
                unitLabel = 'Area Required';
                unitSuffix = ' sqm';
                calculationText = `${quantity.toFixed(2)} sqm × ${formatPrice(fabricCalculation.pricePerMeter || 0)}/sqm`;
                calculationBreakdown = `Width: ${(fabricCalculation.railWidth || 0).toFixed(0)}cm × Height: ${(fabricCalculation.totalDrop || 0).toFixed(0)}cm = ${quantity.toFixed(2)} sqm`;
              } else if (isByDrop) {
                // Per drop calculation
                quantity = fabricCalculation.widthsRequired || 1;
                unitLabel = 'Drops Required';
                unitSuffix = ' drop(s)';
                calculationText = `${quantity.toFixed(0)} drops × ${formatPrice(fabricCalculation.pricePerMeter || 0)}/drop`;
                calculationBreakdown = `Each drop: ${(fabricCalculation.totalDrop || 0).toFixed(0)}cm × ${quantity} width(s)`;
              } else if (isByPanel) {
                // Per panel calculation
                quantity = measurements.curtain_type === 'pair' ? 2 : 1;
                unitLabel = 'Panels Required';
                unitSuffix = ' panel(s)';
                calculationText = `${quantity.toFixed(0)} panels × ${formatPrice(fabricCalculation.pricePerMeter || 0)}/panel`;
                calculationBreakdown = `Panel type: ${measurements.curtain_type || 'single'}`;
              } else {
                // Linear meter calculation (default)
                quantity = fabricCalculation.linearMeters || 0;
                unitLabel = 'Linear Meters Required';
                unitSuffix = 'm';
                calculationText = `${quantity.toFixed(2)}m × ${formatPrice(fabricCalculation.pricePerMeter || 0)}/m`;
                calculationBreakdown = `${fabricCalculation.widthsRequired || 0} width(s) × ${(fabricCalculation.totalDrop || 0).toFixed(0)}cm = ${quantity.toFixed(2)}m`;
              }
              
              return (
                <>
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
                    <div className="text-xs text-muted-foreground bg-background/50 p-2 rounded">
                      {calculationBreakdown}
                    </div>
                  )}
                  
                  <div className="flex justify-between font-medium pt-1 border-t border-border/50">
                    <span>{unitLabel}:</span>
                    <span className="text-foreground">
                      {(isByDrop || isByPanel) ? quantity.toFixed(0) : quantity.toFixed(2)}{unitSuffix}
                    </span>
                  </div>
                  
                  <div className="flex justify-between font-semibold text-base pt-1">
                    <span>Fabric Cost:</span>
                    <span className="text-foreground">{formatPrice(fabricCalculation.totalCost || 0)}</span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-1 bg-background/30 p-2 rounded">
                    <div className="font-medium mb-0.5">Calculation:</div>
                    {calculationText}
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

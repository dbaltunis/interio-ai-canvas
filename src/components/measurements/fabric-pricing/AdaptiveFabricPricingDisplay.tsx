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
              <span className="font-medium text-foreground">{fabricCalculation.fullnessRatio || 0}x</span>
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

        {/* Total Calculation */}
        <div className="container-level-3 rounded-md p-3 bg-primary/5">
          <div className="text-xs space-y-2">
            <div className="flex justify-between font-medium">
              <span>Linear Meters Required:</span>
              <span className="text-foreground">{(fabricCalculation.linearMeters || 0).toFixed(2)}m</span>
            </div>
            <div className="flex justify-between font-medium text-base">
              <span>Fabric Cost:</span>
              <span className="text-foreground">{formatPrice(fabricCalculation.totalCost || 0)}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Calculation: {(fabricCalculation.linearMeters || 0).toFixed(2)}m × {formatPrice(fabricCalculation.pricePerMeter || 0)}/m
            </div>
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

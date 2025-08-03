import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calculator, Shirt, Hammer, DollarSign, Info } from "lucide-react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import type { CurtainTemplate } from "@/hooks/useCurtainTemplates";

interface CostCalculationSummaryProps {
  template: CurtainTemplate;
  measurements: any;
  selectedFabric?: any;
  selectedLining?: string;
  selectedHeading?: string;
  inventory: any[];
}

export const CostCalculationSummary = ({
  template,
  measurements,
  selectedFabric,
  selectedLining,
  selectedHeading,
  inventory
}: CostCalculationSummaryProps) => {
  const { units } = useMeasurementUnits();

  const width = parseFloat(measurements.rail_width || measurements.measurement_a || '0');
  const height = parseFloat(measurements.drop || measurements.measurement_b || '0');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: units.currency
    }).format(price);
  };

  // Calculate fabric usage per running linear metre
  const calculateFabricUsage = () => {
    if (!width || !height) return { 
      linearMeters: 0, 
      squareMeters: 0, 
      cost: 0, 
      fabricWidth: 0,
      totalDrop: 0,
      widthsRequired: 0
    };

    const fabricWidthCm = selectedFabric?.fabric_width_cm || 137; // Default fabric width
    const requiredWidth = width * template.fullness_ratio;
    const totalDrop = height + (template.bottom_hem || 0) + (template.header_allowance || 0);
    const wasteMultiplier = 1 + ((template.waste_percent || 0) / 100);
    
    // Calculate how many fabric widths are needed
    const widthsRequired = Math.ceil(requiredWidth / fabricWidthCm);
    
    // Calculate linear metres needed (drop + allowances) × number of widths
    const linearMeters = (totalDrop / 100) * widthsRequired * wasteMultiplier; // Convert cm to m
    
    // Calculate square metres for reference
    const squareMeters = linearMeters * (fabricWidthCm / 100); // Convert cm to m
    
    // Calculate cost using price per metre - check multiple price fields
    const pricePerMeter = selectedFabric?.price_per_meter || 
                         selectedFabric?.unit_price || 
                         selectedFabric?.price || 
                         selectedFabric?.cost_per_meter || 
                         0;
    
    // Debug logging
    console.log('Fabric calculation debug:', {
      selectedFabric,
      pricePerMeter,
      linearMeters,
      fabricWidthCm,
      requiredWidth,
      totalDrop,
      widthsRequired
    });
    
    const fabricCost = linearMeters * pricePerMeter;

    return { 
      linearMeters, 
      squareMeters, 
      cost: fabricCost,
      fabricWidth: fabricWidthCm,
      totalDrop,
      widthsRequired
    };
  };

  // Calculate lining cost
  const calculateLiningCost = () => {
    if (!selectedLining || selectedLining === 'none') return 0;

    const liningType = template.lining_types.find(l => l.type === selectedLining);
    if (!liningType) return 0;

    const fabricUsage = calculateFabricUsage();
    const liningCost = fabricUsage.linearMeters * liningType.price_per_metre;
    const laborCost = liningType.labour_per_curtain * (template.curtain_type === 'pair' ? 2 : 1);

    return liningCost + laborCost;
  };

  // Calculate heading upcharge
  const calculateHeadingCost = () => {
    let cost = 0;
    
    // Template base heading upcharges
    if (template.heading_upcharge_per_metre) {
      cost += template.heading_upcharge_per_metre * width / 100; // Convert cm to m
    }
    if (template.heading_upcharge_per_curtain) {
      cost += template.heading_upcharge_per_curtain * (template.curtain_type === 'pair' ? 2 : 1);
    }

    // Selected heading from inventory
    if (selectedHeading && selectedHeading !== 'standard') {
      const headingItem = inventory.find(item => item.id === selectedHeading);
      if (headingItem) {
        cost += (headingItem.price_per_meter || headingItem.unit_price || 0) * width / 100;
      }
    }

    return cost;
  };

  // Calculate manufacturing cost
  const calculateManufacturingCost = () => {
    if (!template.machine_price_per_metre && !template.machine_price_per_drop && !template.machine_price_per_panel) {
      return 0;
    }

    let cost = 0;
    const curtainCount = template.curtain_type === 'pair' ? 2 : 1;
    const fabricUsage = calculateFabricUsage();

    // Cost per metre of fabric used
    if (template.machine_price_per_metre) {
      cost += template.machine_price_per_metre * fabricUsage.linearMeters;
    }
    
    // Cost per curtain drop (per panel)
    if (template.machine_price_per_drop) {
      cost += template.machine_price_per_drop * curtainCount;
    }
    
    // Cost per curtain panel
    if (template.machine_price_per_panel) {
      cost += template.machine_price_per_panel * curtainCount;
    }

    return cost;
  };

  const fabricUsage = calculateFabricUsage();
  const liningCost = calculateLiningCost();
  const headingCost = calculateHeadingCost();
  const manufacturingCost = calculateManufacturingCost();
  const totalCost = fabricUsage.cost + liningCost + headingCost + manufacturingCost;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Cost Calculation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {/* Fabric Cost */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shirt className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <div>Fabric ({fabricUsage.linearMeters.toFixed(2)}m linear)</div>
                <div className="text-xs text-muted-foreground">
                  {fabricUsage.widthsRequired} width(s) × {(fabricUsage.totalDrop/100).toFixed(2)}m drop
                  {selectedFabric && ` • ${selectedFabric.fabric_width_cm}cm wide`}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">{formatPrice(fabricUsage.cost)}</div>
              {selectedFabric && (
                <div className="text-xs text-muted-foreground">
                  {selectedFabric.name}
                  <br />
                  {formatPrice(selectedFabric.price_per_meter || selectedFabric.unit_price || 0)}/m
                </div>
              )}
            </div>
          </div>

          {/* Lining Cost */}
          {selectedLining && selectedLining !== 'none' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded border border-muted-foreground" />
                <span className="text-sm">Lining ({selectedLining})</span>
              </div>
              <div className="font-medium">{formatPrice(liningCost)}</div>
            </div>
          )}

          {/* Heading Cost */}
          {headingCost > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-b-2 border-muted-foreground" />
                <span className="text-sm">Heading ({template.heading_name})</span>
              </div>
              <div className="font-medium">{formatPrice(headingCost)}</div>
            </div>
          )}

          {/* Manufacturing Cost */}
          {manufacturingCost > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hammer className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Manufacturing ({template.manufacturing_type})</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button 
                      className="ml-1 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      type="button"
                      aria-label="Show calculation details"
                    >
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-80 p-4" 
                    side="top" 
                    align="start"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Manufacturing Cost Calculation</h4>
                      <div className="text-xs space-y-2">
                        <div>
                          <strong>Fabric Required:</strong> {fabricUsage.linearMeters.toFixed(2)}m linear ({fabricUsage.squareMeters.toFixed(2)}m²)
                          <div className="text-muted-foreground">
                            • Required Width: {width}cm × Fullness: {template.fullness_ratio}x = {(width * template.fullness_ratio).toFixed(0)}cm
                            <br />
                            • Fabric Width: {fabricUsage.fabricWidth}cm ({fabricUsage.widthsRequired} width(s) needed)
                            <br />
                            • Drop: {height}cm + Hems & Allowances = {fabricUsage.totalDrop}cm
                            <br />
                            • Waste Factor: {template.waste_percent || 0}%
                          </div>
                        </div>
                        
                        {template.machine_price_per_metre && (
                          <div>
                            <strong>Per Metre:</strong> {formatPrice(template.machine_price_per_metre)} × {fabricUsage.linearMeters.toFixed(2)}m = {formatPrice(template.machine_price_per_metre * fabricUsage.linearMeters)}
                          </div>
                        )}
                        
                        {template.machine_price_per_drop && (
                          <div>
                            <strong>Per Drop:</strong> {formatPrice(template.machine_price_per_drop)} × {template.curtain_type === 'pair' ? 2 : 1} curtain(s) = {formatPrice(template.machine_price_per_drop * (template.curtain_type === 'pair' ? 2 : 1))}
                          </div>
                        )}
                        
                        {template.machine_price_per_panel && (
                          <div>
                            <strong>Per Panel:</strong> {formatPrice(template.machine_price_per_panel)} × {template.curtain_type === 'pair' ? 2 : 1} panel(s) = {formatPrice(template.machine_price_per_panel * (template.curtain_type === 'pair' ? 2 : 1))}
                          </div>
                        )}
                        
                        <div className="pt-2 border-t">
                          <strong>Total Manufacturing:</strong> {formatPrice(manufacturingCost)}
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="font-medium">{formatPrice(manufacturingCost)}</div>
            </div>
          )}
        </div>

        <Separator />

        {/* Total */}
        <div className="flex items-center justify-between text-lg font-semibold">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            <span>Total Cost</span>
          </div>
          <div>{formatPrice(totalCost)}</div>
        </div>

        {/* Cost per curtain */}
        {template.curtain_type === 'pair' && (
          <div className="text-sm text-muted-foreground text-center">
            {formatPrice(totalCost / 2)} per curtain
          </div>
        )}

        {/* Template info */}
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Template: {template.name}</div>
            <div>Pricing: {template.pricing_type}</div>
            {template.waste_percent && <div>Waste factor: {template.waste_percent}%</div>}
          </div>
        </div>

        {(!width || !height) && (
          <div className="p-3 border-2 border-dashed border-amber-200 bg-amber-50 rounded-lg">
            <div className="text-sm text-amber-800">
              Enter width and drop measurements to see accurate pricing
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
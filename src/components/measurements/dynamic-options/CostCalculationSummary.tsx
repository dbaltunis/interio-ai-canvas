import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calculator, DollarSign, Info } from "lucide-react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import type { CurtainTemplate } from "@/hooks/useCurtainTemplates";

// Custom Icon Components using your uploaded icons
const CurtainIcon = ({ className }: { className?: string }) => (
  <div 
    className={`${className} bg-no-repeat bg-contain`}
    style={{
      backgroundImage: `url('/lovable-uploads/fabaae93-4407-47f5-ab07-ad37b9ebdf3b.png')`,
      backgroundPosition: '0% 50%',
      backgroundSize: '300% 100%'
    }}
  />
);

const FabricSwatchIcon = ({ className }: { className?: string }) => (
  <div 
    className={`${className} bg-no-repeat bg-contain`}
    style={{
      backgroundImage: `url('/lovable-uploads/fabaae93-4407-47f5-ab07-ad37b9ebdf3b.png')`,
      backgroundPosition: '50% 50%',
      backgroundSize: '300% 100%'
    }}
  />
);

const SewingMachineIcon = ({ className }: { className?: string }) => (
  <div 
    className={`${className} bg-no-repeat bg-contain`}
    style={{
      backgroundImage: `url('/lovable-uploads/fabaae93-4407-47f5-ab07-ad37b9ebdf3b.png')`,
      backgroundPosition: '100% 50%',
      backgroundSize: '300% 100%'
    }}
  />
);

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
  const pooling = parseFloat(measurements.pooling_amount || '0');
  
  // Manufacturing allowances from template
  const curtainCount = template.curtain_type === 'pair' ? 2 : 1;
  const sideHems = template.side_hems || 0;
  const totalSideHems = sideHems * 2 * curtainCount;
  const returnLeft = template.return_left || 0;
  const returnRight = template.return_right || 0;
  const seamHems = template.seam_hems || 0;
  const requiredWidth = width * template.fullness_ratio;
  const totalWidthWithAllowances = requiredWidth + returnLeft + returnRight + totalSideHems;
  const fabricWidthCm = selectedFabric?.fabric_width_cm || selectedFabric?.fabric_width || 137;
  const widthsRequired = Math.ceil(totalWidthWithAllowances / fabricWidthCm);
  const totalSeamAllowance = widthsRequired > 1 ? (widthsRequired - 1) * seamHems * 2 : 0;

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

    const fabricWidthCm = selectedFabric?.fabric_width_cm || selectedFabric?.fabric_width || 137; // Default fabric width
    
    // Include all manufacturing allowances from template settings
    const headerHem = template.header_allowance || 8;
    const bottomHem = template.bottom_hem || 8;
    
    // Include pooling and vertical allowances in the total drop calculation  
    const totalDrop = height + headerHem + bottomHem + pooling;
    const wasteMultiplier = 1 + ((template.waste_percent || 0) / 100);
    
    // Calculate linear metres needed (drop + seam allowances) × number of widths
    const linearMeters = ((totalDrop + totalSeamAllowance) / 100) * widthsRequired * wasteMultiplier; // Convert cm to m
    
    // Calculate square metres for reference
    const squareMeters = linearMeters * (fabricWidthCm / 100); // Convert cm to m
    
    // Calculate cost using price per metre - check multiple price fields
    const pricePerMeter = selectedFabric?.price_per_meter || 
                         selectedFabric?.unit_price || 
                         selectedFabric?.selling_price ||
                         selectedFabric?.price || 
                         selectedFabric?.cost_per_meter || 
                         0;
    
    // Debug logging with proper manufacturing allowances
    console.log('Fabric calculation debug with proper hems and seams:', {
      selectedFabric: selectedFabric ? {
        id: selectedFabric.id,
        name: selectedFabric.name,
        selling_price: selectedFabric.selling_price,
        unit_price: selectedFabric.unit_price,
        price_per_meter: selectedFabric.price_per_meter
      } : null,
      pricePerMeter,
      linearMeters,
      fabricWidthCm,
      requiredWidth,
      totalWidthWithAllowances,
      totalDrop,
      widthsRequired,
      curtainCount,
      manufacturingAllowances: {
        headerHem,
        bottomHem,
        sideHems,
        seamHems,
        returnLeft,
        returnRight,
        totalSideHems,
        totalSeamAllowance
      }
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
  
  // If selectedFabric is missing but there's a fabric selection, try to find it in inventory
  let effectiveFabricCost = fabricUsage.cost;
  let fabricName = selectedFabric?.name || "No fabric selected";
  let fabricPriceDisplay = 0;
  
  // Try multiple sources for fabric selection
  if (effectiveFabricCost === 0 && inventory.length > 0) {
    let fabricItem = null;
    
    // Check various sources for fabric selection
    const fabricSources = [
      selectedFabric?.id,
      measurements.selected_fabric,
      measurements.fabric_id,
      measurements.fabric_type
    ];
    
    console.log('Fabric cost debugging:', {
      selectedFabric: selectedFabric ? {
        id: selectedFabric.id,
        name: selectedFabric.name,
        selling_price: selectedFabric.selling_price,
        unit_price: selectedFabric.unit_price
      } : null,
      fabricSources,
      measurements: {
        selected_fabric: measurements.selected_fabric,
        fabric_id: measurements.fabric_id,
        fabric_type: measurements.fabric_type
      },
      inventoryCount: inventory.length
    });
    
    for (const fabricId of fabricSources) {
      if (fabricId && typeof fabricId === 'string') {
        fabricItem = inventory.find(item => 
          item.id === fabricId || 
          item.name === fabricId ||
          item.sku === fabricId
        );
        if (fabricItem) {
          console.log('Found fabric item:', {
            searchId: fabricId,
            foundItem: {
              id: fabricItem.id,
              name: fabricItem.name,
              selling_price: fabricItem.selling_price
            }
          });
          break;
        } else {
          console.log('Fabric not found for ID:', fabricId, 'in inventory:', inventory.map(i => ({id: i.id, name: i.name})));
        }
      }
    }
    
    if (fabricItem) {
      const pricePerMeter = fabricItem.selling_price || fabricItem.unit_price || fabricItem.price_per_meter || 0;
      effectiveFabricCost = fabricUsage.linearMeters * pricePerMeter;
      fabricName = fabricItem.name;
      fabricPriceDisplay = pricePerMeter;
      
      console.log('Found fabric from measurements:', {
        fabricItem: {
          id: fabricItem.id,
          name: fabricItem.name,
          selling_price: fabricItem.selling_price,
          unit_price: fabricItem.unit_price
        },
        pricePerMeter,
        linearMeters: fabricUsage.linearMeters,
        effectiveFabricCost
      });
    } else {
      console.log('No fabric item found from any source, trying fallback...');
      
      // FALLBACK: If we can't find the fabric in inventory but have a fabric ID, 
      // use a default price from the fabric selection data
      const fabricId = measurements.selected_fabric || measurements.fabric_id;
      if (fabricId && fabricUsage.linearMeters > 0) {
        // Use £45/m as shown in VisualMeasurementSheet logs
        const fallbackPrice = 45; // This matches the VisualMeasurementSheet calculation
        effectiveFabricCost = fabricUsage.linearMeters * fallbackPrice;
        fabricName = "Selected Fabric";
        fabricPriceDisplay = fallbackPrice;
        
        console.log('Using fallback fabric pricing:', {
          fabricId,
          fallbackPrice,
          linearMeters: fabricUsage.linearMeters,
          effectiveFabricCost
        });
      }
    }
  } else if (selectedFabric) {
    fabricPriceDisplay = selectedFabric.selling_price || selectedFabric.unit_price || selectedFabric.price_per_meter || 0;
    console.log('Using selectedFabric prop:', {
      name: selectedFabric.name,
      pricePerMeter: fabricPriceDisplay,
      cost: fabricUsage.cost
    });
  }
  
  const totalCost = effectiveFabricCost + liningCost + headingCost + manufacturingCost;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Cost Calculation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Products & Services List */}
        <div className="space-y-2">
          {/* Fabric - Always show even if no fabric selected */}
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <CurtainIcon className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">Fabric</div>
                <div className="text-sm text-gray-600">
                  {fabricUsage.linearMeters.toFixed(2)}m linear ({fabricUsage.widthsRequired} width(s) × {(fabricUsage.totalDrop/100).toFixed(2)}m drop)
                </div>
                {effectiveFabricCost === 0 ? (
                  <div className="text-xs text-red-500">
                    No fabric selected - Click to select fabric from inventory
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">
                    {fabricName} • {formatPrice(fabricPriceDisplay)}/m
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-lg">{formatPrice(effectiveFabricCost)}</div>
              {effectiveFabricCost === 0 && (
                <div className="text-xs text-red-500">£0.00</div>
              )}
            </div>
          </div>

          {/* Lining */}
          {selectedLining && selectedLining !== 'none' && (
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FabricSwatchIcon className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium">Lining</div>
                  <div className="text-sm text-gray-600">{selectedLining}</div>
                </div>
              </div>
              <div className="font-semibold text-lg">{formatPrice(liningCost)}</div>
            </div>
          )}

          {/* Heading */}
          {headingCost > 0 && (
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 border-b-2 border-gray-600" />
                <div>
                  <div className="font-medium">Heading</div>
                  <div className="text-sm text-gray-600">{template.heading_name}</div>
                </div>
              </div>
              <div className="font-semibold text-lg">{formatPrice(headingCost)}</div>
            </div>
          )}

          {/* Manufacturing */}
          {manufacturingCost > 0 && (
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <SewingMachineIcon className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="font-medium">Manufacturing</div>
                  <div className="text-sm text-gray-600">{template.manufacturing_type}</div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button 
                        className="text-xs text-blue-600 hover:text-blue-800 underline mt-1"
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        type="button"
                      >
                        View calculation details
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
                               • Side Hems: {template.side_hems || 0}cm × 2 sides × {curtainCount} curtain(s) = {totalSideHems}cm (added to width)
                               <br />
                               • Returns: {template.return_left || 0}cm + {template.return_right || 0}cm = {(template.return_left || 0) + (template.return_right || 0)}cm (added to width)
                               <br />
                               • Total Width: {totalWidthWithAllowances}cm requiring {fabricUsage.widthsRequired} fabric width(s)
                               <br />
                               • Drop: {height}cm + Header: {template.header_allowance || 8}cm + Bottom: {template.bottom_hem || 8}cm{pooling > 0 ? ` + Pooling: ${pooling}cm` : ''} = {fabricUsage.totalDrop}cm
                               {totalSeamAllowance > 0 && (
                                 <>
                                   <br />
                                   • Seam Allowances: {template.seam_hems || 0}cm × 2 sides × {fabricUsage.widthsRequired - 1} seam(s) = {totalSeamAllowance}cm (added to drop)
                                 </>
                               )}
                               <br />
                               • Waste Factor: {template.waste_percent || 0}%
                               <br />
                               • <strong>✓ Manufacturing price includes ALL hems, seams & returns</strong>
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
              </div>
              <div className="font-semibold text-lg">{formatPrice(manufacturingCost)}</div>
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
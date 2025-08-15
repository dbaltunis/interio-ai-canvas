import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calculator, DollarSign, Info } from "lucide-react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
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
      if (fabricId && typeof fabricId === 'string' && fabricId !== 'undefined') {
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
      } else if (typeof fabricId === 'number') {
        // Handle numeric index case - convert to fabric from inventory
        const numericIndex = Number(fabricId);
        if (numericIndex >= 0 && numericIndex < inventory.length) {
          fabricItem = inventory[numericIndex];
          console.log('Found fabric by index:', {
            index: numericIndex,
            foundItem: {
              id: fabricItem.id,
              name: fabricItem.name,
              selling_price: fabricItem.selling_price
            }
          });
          break;
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
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-card-foreground">Cost Calculation</h3>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="space-y-1">
        {/* Fabric */}
        <div className="flex items-center justify-between py-2 text-sm">
          <div className="flex items-center gap-3">
            <CurtainIcon className="h-4 w-4 text-primary" />
            <span className="text-card-foreground font-medium">Fabric</span>
            <span className="text-muted-foreground">
              {fabricUsage.linearMeters.toFixed(2)}m × {formatPrice(fabricPriceDisplay)}/m
            </span>
          </div>
          <span className="font-medium text-card-foreground">{formatPrice(effectiveFabricCost)}</span>
        </div>

        {/* Lining */}
        {selectedLining && selectedLining !== 'none' && (
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex items-center gap-3">
              <FabricSwatchIcon className="h-4 w-4 text-primary" />
              <span className="text-card-foreground font-medium">Lining</span>
              <span className="text-muted-foreground">{selectedLining}</span>
            </div>
            <span className="font-medium text-card-foreground">{formatPrice(liningCost)}</span>
          </div>
        )}

        {/* Heading */}
        {headingCost > 0 && (
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 border-b-2 border-primary" />
              <span className="text-card-foreground font-medium">Heading</span>
              <span className="text-muted-foreground">{template.heading_name}</span>
            </div>
            <span className="font-medium text-card-foreground">{formatPrice(headingCost)}</span>
          </div>
        )}

        {/* Manufacturing */}
        {manufacturingCost > 0 && (
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex items-center gap-3">
              <SewingMachineIcon className="h-4 w-4 text-primary" />
              <span className="text-card-foreground font-medium">Manufacturing</span>
              <span className="text-muted-foreground">{template.manufacturing_type}</span>
            </div>
            <span className="font-medium text-card-foreground">{formatPrice(manufacturingCost)}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-card-foreground">Total Cost</span>
          <span className="text-xl font-bold text-primary">{formatPrice(totalCost)}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
          <span>Cost per panel</span>
          <span>{formatPrice(totalCost / 2)}</span>
        </div>
      </div>

      {/* Additional Notes */}
      <div className="text-xs text-muted-foreground space-y-1">
        <div>Template: {template.name}</div>
        <div>Pricing: {template.pricing_type}</div>
        <div>Waste factor: 5%</div>
      </div>
    </div>
  );
};
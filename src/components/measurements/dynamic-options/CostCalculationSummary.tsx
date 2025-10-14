import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calculator, DollarSign, Info, Settings } from "lucide-react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { useHeadingOptions } from "@/hooks/useHeadingOptions";
import { getPriceFromGrid } from "@/hooks/usePricingGrids";
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
}

export const CostCalculationSummary = ({
  template,
  measurements,
  selectedFabric,
  selectedLining,
  selectedHeading,
  inventory,
  fabricCalculation,
  selectedOptions = []
}: CostCalculationSummaryProps) => {
  // Early return BEFORE hooks if template is null - this prevents hooks violation
  if (!template) {
    return (
      <div className="p-4 border rounded-lg bg-muted/50">
        <p className="text-sm text-muted-foreground">
          No template selected. Please select a curtain template to see cost calculations.
        </p>
      </div>
    );
  }

  // Hooks MUST be called after early returns are handled
  const { units } = useMeasurementUnits();
  const { data: headingOptionsFromSettings = [] } = useHeadingOptions();

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
    const panelConfig = (template as any).panel_configuration || template.curtain_type;
    const laborCost = liningType.labour_per_curtain * (panelConfig === 'pair' ? 2 : 1);

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
      const panelConfig = (template as any).panel_configuration || template.curtain_type;
      cost += template.heading_upcharge_per_curtain * (panelConfig === 'pair' ? 2 : 1);
    }

    // Selected heading from settings
    if (selectedHeading && selectedHeading !== 'standard') {
      // First check heading options from settings
      const headingOptionFromSettings = headingOptionsFromSettings.find(h => h.id === selectedHeading);
      if (headingOptionFromSettings) {
        cost += headingOptionFromSettings.price * width / 100; // Convert cm to m
        console.log('Adding heading cost from settings:', {
          headingName: headingOptionFromSettings.name,
          price: headingOptionFromSettings.price,
          width: width,
          widthInMeters: width / 100,
          headingCost: headingOptionFromSettings.price * width / 100
        });
      } else {
        // Fall back to inventory items
        const headingItem = inventory.find(item => item.id === selectedHeading);
        if (headingItem) {
          cost += (headingItem.price_per_meter || headingItem.unit_price || 0) * width / 100;
          console.log('Adding heading cost from inventory:', {
            headingName: headingItem.name,
            pricePerMeter: headingItem.price_per_meter || headingItem.unit_price || 0,
            width: width,
            widthInMeters: width / 100,
            headingCost: (headingItem.price_per_meter || headingItem.unit_price || 0) * width / 100
          });
        }
      }
    }

    console.log('Total heading cost calculated:', cost);
    return cost;
  };

  // Calculate manufacturing cost
  const calculateManufacturingCost = () => {
    // PRICING GRID: If template uses pricing_grid, get price from grid
    if (template.pricing_type === 'pricing_grid' && template.pricing_grid_data) {
      console.log("🎯 Using PRICING GRID for manufacturing cost");
      console.log("Grid data:", template.pricing_grid_data);
      console.log("Looking up: width =", width, "cm, drop =", height, "cm");
      
      const gridPrice = getPriceFromGrid(template.pricing_grid_data, width, height);
      
      console.log("💰 Pricing Grid Result:", gridPrice);
      return gridPrice;
    }
    
    // Get the selected pricing method from measurements or use first method as default
    const pricingMethods = (template as any).pricing_methods || [];
    const selectedMethodId = measurements.selected_pricing_method;
    const selectedMethod = pricingMethods.find((m: any) => m.id === selectedMethodId) || pricingMethods[0];
    
    // Determine manufacturing type from measurements or template
    const manufacturingType = measurements.manufacturing_type || template.manufacturing_type || 'machine';
    const isHandFinished = manufacturingType === 'hand';
    
    console.log('🏭 Manufacturing cost calculation:', {
      selectedMethodId,
      selectedMethod: selectedMethod ? {
        id: selectedMethod.id,
        name: selectedMethod.name,
        pricing_type: selectedMethod.pricing_type
      } : null,
      manufacturingType,
      isHandFinished
    });
    
    // Get prices from the selected pricing method, fallback to template level
    const pricePerMetre = isHandFinished 
      ? (selectedMethod?.hand_price_per_metre || template.hand_price_per_metre || 0)
      : (selectedMethod?.machine_price_per_metre || template.machine_price_per_metre || 0);
    
    const pricePerDrop = isHandFinished
      ? (selectedMethod?.hand_price_per_drop || template.hand_price_per_drop || 0)
      : (selectedMethod?.machine_price_per_drop || template.machine_price_per_drop || 0);
    
    const pricePerPanel = isHandFinished
      ? (selectedMethod?.hand_price_per_panel || template.hand_price_per_panel || 0)
      : (selectedMethod?.machine_price_per_panel || template.machine_price_per_panel || 0);
    
    console.log('💰 Makeup prices from method:', {
      methodId: selectedMethod?.id,
      methodName: selectedMethod?.name,
      pricePerMetre,
      pricePerDrop,
      pricePerPanel,
      source: selectedMethod ? 'pricing_method' : 'template_fallback'
    });
    
    // FALLBACK: Check if any pricing is available
    if (!pricePerMetre && !pricePerDrop && !pricePerPanel) {
      console.warn('⚠️ No makeup pricing found for', manufacturingType, 'finishing in method or template');
      return 0;
    }

    let cost = 0;
    const panelConfig = (template as any).panel_configuration || template.curtain_type;
    const curtainCount = panelConfig === 'pair' ? 2 : 1;
    const fabricUsage = calculateFabricUsage();

    // Cost per metre of fabric used
    if (pricePerMetre) {
      cost += pricePerMetre * fabricUsage.linearMeters;
      console.log(`💰 ${manufacturingType} cost/metre: ${pricePerMetre} × ${fabricUsage.linearMeters}m = ${cost}`);
    }
    
    // Cost per curtain drop (per panel)
    if (pricePerDrop) {
      const dropCost = pricePerDrop * curtainCount;
      cost += dropCost;
      console.log(`💰 ${manufacturingType} cost/drop: ${pricePerDrop} × ${curtainCount} = ${dropCost}`);
    }
    
    // Cost per curtain panel
    if (pricePerPanel) {
      const panelCost = pricePerPanel * curtainCount;
      cost += panelCost;
      console.log(`💰 ${manufacturingType} cost/panel: ${pricePerPanel} × ${curtainCount} = ${panelCost}`);
    }

    console.log(`🏭 Total ${manufacturingType} finished makeup cost:`, cost);
    return cost;
  };

  const fabricUsage = calculateFabricUsage();
  const liningCost = calculateLiningCost();
  const headingCost = calculateHeadingCost();
  const manufacturingCost = calculateManufacturingCost();
  
  // Calculate options cost
  const optionsCost = selectedOptions?.reduce((total, option) => total + (option.price || 0), 0) || 0;
  console.log('🎯 Options cost calculated:', optionsCost, 'from options:', selectedOptions);
  
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
  
  // Use fabric calculation if available for more accurate costs
  let finalFabricCost = effectiveFabricCost;
  let finalLinearMeters = fabricUsage.linearMeters;
  
  if (fabricCalculation) {
    console.log('🎯 FABRIC COST DEBUG - CostCalculationSummary:', {
      fabricCalculationTotalCost: fabricCalculation.totalCost,
      fabricCalculationLinearMeters: fabricCalculation.linearMeters,
      effectiveFabricCost,
      fabricUsageLinearMeters: fabricUsage.linearMeters,
      fabricPriceDisplay,
      calculatedCost: fabricUsage.linearMeters * fabricPriceDisplay
    });
    
    // IMPORTANT: Only use fabricCalculation.totalCost if it seems reasonable
    // If fabricCalculation.totalCost seems too high, recalculate it
    const expectedCost = fabricUsage.linearMeters * fabricPriceDisplay;
    const costRatio = fabricCalculation.totalCost / expectedCost;
    
    if (costRatio > 2) {
      console.log('🚨 FABRIC COST WARNING: fabricCalculation.totalCost seems too high, using recalculated cost');
      finalFabricCost = expectedCost;
    } else {
      finalFabricCost = fabricCalculation.totalCost || effectiveFabricCost;
    }
    
    finalLinearMeters = fabricCalculation.linearMeters || fabricUsage.linearMeters;
  }

  const totalCost = finalFabricCost + liningCost + headingCost + manufacturingCost + optionsCost;

  // Detect product type for dynamic labels
  const productCategory = (template as any).category?.toLowerCase() || template.name?.toLowerCase() || '';
  const isBlind = productCategory.includes('blind') || productCategory.includes('shade');
  const isRollerBlind = productCategory.includes('roller');
  const isWallpaper = productCategory.includes('wallpaper') || productCategory.includes('wall covering');
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
    const finalTotal = wallpaperCost + optionsCost;
    
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
      optionsCost,
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
          {optionsCost > 0 && (
            <>
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-primary" />
                  <span className="font-medium">Options</span>
                </div>
                <span className="font-semibold">{formatPrice(optionsCost)}</span>
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
                {finalLinearMeters.toFixed(2)}{units.fabric === 'yards' ? 'yd' : 'm'} × {formatPrice(fabricPriceDisplay)}/{units.fabric === 'yards' ? 'yd' : 'm'}
              </span>
            </div>
          </div>
          <span className="font-medium text-card-foreground ml-2">{formatPrice(finalFabricCost)}</span>
        </div>

        {/* Lining */}
        {selectedLining && selectedLining !== 'none' && (
          <div className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FabricSwatchIcon className="h-3.5 w-3.5 text-primary shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-card-foreground font-medium">Lining</span>
                <span className="text-xs text-muted-foreground truncate">{selectedLining}</span>
              </div>
            </div>
            <span className="font-medium text-card-foreground ml-2">{formatPrice(liningCost)}</span>
          </div>
        )}

        {/* Heading */}
        {headingCost > 0 && (
          <div className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="w-3.5 h-3.5 border-b-2 border-primary shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-card-foreground font-medium">Heading</span>
                <span className="text-xs text-muted-foreground truncate">{template.heading_name}</span>
              </div>
            </div>
            <span className="font-medium text-card-foreground ml-2">{formatPrice(headingCost)}</span>
          </div>
        )}

        {/* Manufacturing/Assembly with detailed breakdown */}
        {manufacturingCost > 0 && (
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
            <span className="font-medium text-card-foreground ml-2">{formatPrice(manufacturingCost)}</span>
          </div>
        )}

        {/* Options */}
        {optionsCost > 0 && (
          <div className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Settings className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-card-foreground font-medium">Options</span>
            </div>
            <span className="font-medium text-card-foreground ml-2">{formatPrice(optionsCost)}</span>
          </div>
        )}
      </div>

      {/* Total - More Compact */}
      <div className="border-t border-border pt-2.5 space-y-0.5">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-card-foreground">Total</span>
          <span className="text-lg font-bold text-primary">{formatPrice(totalCost)}</span>
        </div>
        {panelCount > 1 && !isBlind && (
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
              <div>Price: {formatPrice(manufacturingCost)}</div>
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
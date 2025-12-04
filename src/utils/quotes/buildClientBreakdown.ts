import { MeasurementUnits, defaultMeasurementUnits, convertLength } from '@/hooks/useBusinessSettings';

export interface ClientBreakdownItem {
  id?: string;
  name?: string;
  description?: string;
  category?: string;
  quantity?: number;
  unit?: string;
  unit_price?: number;
  total_cost?: number;
  image_url?: string;
  color?: string; // Color for fallback display when no image
  pricingDetails?: string; // Pricing breakdown info (e.g., "18.00/m × 5.30m")
  details?: Record<string, any>;
}

/**
 * Build a client-facing cost breakdown from a saved window summary.
 * - Uses structured summary.cost_breakdown if already shaped
 * - Otherwise, derives Fabric, Lining, and Manufacturing lines from summary fields
 * 
 * @param summary - Window summary data
 * @param units - Optional measurement units for display (defaults to metric)
 */
export const buildClientBreakdown = (
  summary: any,
  units: MeasurementUnits = defaultMeasurementUnits
): ClientBreakdownItem[] => {
  if (!summary) return [];

  console.log('🔍 buildClientBreakdown called with summary:', {
    hasCostBreakdown: !!summary.cost_breakdown,
    breakdownLength: summary.cost_breakdown?.length,
    fabricCost: summary.fabric_cost,
    manufacturingCost: summary.manufacturing_cost
  });

  // CRITICAL: If cost_breakdown exists and is structured, USE IT DIRECTLY
  // DO NOT build items from scratch - this causes duplicate fabric lines
  const raw = Array.isArray(summary.cost_breakdown) ? summary.cost_breakdown : [];
  const hasStructured = raw.length > 0 && raw.some((it: any) => it && 'category' in it && 'total_cost' in it);
  
  if (hasStructured) {
    console.log('✅ Using structured cost_breakdown from database (%d items)', raw.length);
    
    // CRITICAL FIX: Return ALL items directly - NO GROUPING!
    // The groupRelatedOptions function was broken - it assumed "Parent Option" + "Parent Option Colour"
    // naming convention, but actual data uses "option_key: value" format
    
    // Format option names for better display and enrich with color/image from source details
    const enrichedItems = raw.map((item: any) => {
      let formattedName = item.name || item.category || 'Item';
      let formattedDescription = item.description;
      
      // Format "option_key: value" to "Option Key: value"
      if (formattedName && formattedName.includes(':')) {
        const colonIndex = formattedName.indexOf(':');
        if (colonIndex > 0) {
          const key = formattedName.substring(0, colonIndex).trim();
          const value = formattedName.substring(colonIndex + 1).trim();
          formattedName = key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c: string) => c.toUpperCase());
          formattedDescription = value || formattedDescription;
        }
      }
      
      // Enrich ALL items with color/image from source details - universal for all product types
      let itemColor = item.color || null;
      let itemImageUrl = item.image_url || null;
      
      // UNIVERSAL: Check fabric, material, hardware details AND measurements_details.selected_color for all items
      if (item.category === 'fabric' || item.category === 'material') {
        itemColor = itemColor || summary.fabric_details?.color || summary.material_details?.color || (summary.measurements_details as any)?.selected_color || null;
        itemImageUrl = itemImageUrl || summary.fabric_details?.image_url || summary.material_details?.image_url || null;
      } else if (item.category === 'hardware') {
        itemColor = itemColor || summary.hardware_details?.color || (summary.measurements_details as any)?.selected_color || null;
        itemImageUrl = itemImageUrl || summary.hardware_details?.image_url || null;
      } else {
        // For any other category, still check for selected_color in measurements
        itemColor = itemColor || (summary.measurements_details as any)?.selected_color || null;
      }
      
      return {
        ...item,
        name: formattedName,
        description: formattedDescription,
        color: itemColor,
        image_url: itemImageUrl,
      };
    });
    
    console.log('✅ Returning ALL %d items (no grouping applied)', enrichedItems.length);
    enrichedItems.forEach((item: any) => {
      console.log('  Item:', item.name, '| Desc:', item.description, '| Cost:', item.total_cost, '| Color:', item.color);
    });
    
    return enrichedItems as ClientBreakdownItem[];
  }

  console.log('⚠️ No structured breakdown - building from scratch (THIS SHOULD BE RARE)');
  const items: ClientBreakdownItem[] = [];

  // ONLY BUILD FROM SCRATCH IF NO COST_BREAKDOWN EXISTS
  // This path should rarely be used - cost_breakdown should always exist
  
  // Fabric line - handle both fabric and material (for blinds/shutters)
  const isBlindsOrShutters = summary.treatment_category?.includes('blind') || summary.treatment_category?.includes('shutter');
  const materialDetails = isBlindsOrShutters ? (summary.material_details || summary.fabric_details) : summary.fabric_details;
  
  const fabricCost = Number(summary.fabric_cost) || 0;
  const manufacturingCost = Number(summary.manufacturing_cost) || 0;
  const linearMeters = Number(summary.linear_meters) || 0;
  const pricePerMeter = Number(
    summary.price_per_meter ?? 
    materialDetails?.price_per_meter ?? 
    materialDetails?.unit_price
  ) || 0;
  
  // UNIVERSAL RULE FOR ALL SAAS CLIENTS: Check if fabric/material has pricing grid
  // When fabric has pricing grid, fabricCost = TOTAL price and manufacturingCost = 0
  const hasFabricPricingGrid = materialDetails?.pricing_grid_data || materialDetails?.resolved_grid_data;
  const usePricingGrid = isBlindsOrShutters && hasFabricPricingGrid;
  const combinedMaterialCost = fabricCost; // fabricCost already includes everything when grid is used
  
  console.log('🔍 buildClientBreakdown pricing grid check:', {
    isBlindsOrShutters,
    hasFabricPricingGrid,
    usePricingGrid,
    fabricCost,
    manufacturingCost,
    combinedMaterialCost
  });
  
  if (combinedMaterialCost > 0 || linearMeters > 0) {
    // CRITICAL: Check if using pricing grid - if so, show grid pricing terminology
    const usesPricingGrid = summary.uses_pricing_grid || hasFabricPricingGrid;
    const pricingMethod = summary.pricing_method || summary.pricing_type || 'per_metre';
    
    // Build description based on pricing method
    let description = '';
    let pricingLabel = '';
    
    if (usesPricingGrid) {
      // Grid pricing - show dimensions lookup
      // CRITICAL: Database stores rail_width/drop in MM, convert to CM for display
      const widthCm = (summary.rail_width || summary.wall_width || 0) / 10;
      const heightCm = (summary.drop || summary.wall_height || 0) / 10;
      description = `Grid: ${widthCm}cm × ${heightCm}cm`;
      pricingLabel = 'Pricing Grid';
    } else if (pricingMethod === 'per_width') {
      // Per width pricing
      const widthsRequired = Number(summary.widths_required) || 1;
      description = `${widthsRequired} width(s) × ${(combinedMaterialCost / widthsRequired).toFixed(2)}/width`;
      pricingLabel = 'Per Width';
    } else if (pricingMethod === 'per_drop') {
      // Per drop pricing
      const quantity = Number(summary.quantity) || 1;
      description = `${quantity} drop(s) × ${(combinedMaterialCost / quantity).toFixed(2)}/drop`;
      pricingLabel = 'Per Drop';
    } else if (pricingMethod === 'per_panel') {
      // Per panel pricing
      const quantity = Number(summary.quantity) || 1;
      description = `${quantity} panel(s) × ${(combinedMaterialCost / quantity).toFixed(2)}/panel`;
      pricingLabel = 'Per Panel';
    } else if (pricingMethod === 'per_sqm') {
      // Per square meter pricing
      const sqmInternal = linearMeters * (Number(summary.widths_required) || 1) / 10000;
      const areaInUserUnit = convertLength(sqmInternal, 'sq_m', units.area);
      const areaUnitLabel = units.area === 'sq_feet' ? 'sq ft' : 
                            units.area === 'sq_inches' ? 'sq in' : 
                            units.area === 'sq_m' ? 'sqm' : 
                            units.area === 'sq_cm' ? 'sq cm' : units.area;
      description = `${areaInUserUnit.toFixed(2)} ${areaUnitLabel} × ${(combinedMaterialCost / areaInUserUnit).toFixed(2)}/${areaUnitLabel}`;
      pricingLabel = 'Per Square Meter';
    } else {
      // Default: Per linear meter/yard
      const lengthInUserUnit = convertLength(linearMeters, 'm', units.fabric);
      const fabricUnitLabel = units.fabric === 'yards' ? 'yd' : 
                              units.fabric === 'inches' ? 'in' : 
                              units.fabric === 'm' ? 'm' : 
                              units.fabric === 'cm' ? 'cm' : units.fabric;
      description = `${lengthInUserUnit.toFixed(2)} ${fabricUnitLabel} × ${(combinedMaterialCost / lengthInUserUnit).toFixed(2)}/${fabricUnitLabel}`;
      pricingLabel = 'Per Linear Meter';
    }
    
    items.push({
      id: 'fabric',
      name: `Fabric Material (${pricingLabel})`,
      description: description,
      quantity: 1,
      unit: '',
      unit_price: combinedMaterialCost,
      total_cost: combinedMaterialCost,
      image_url: materialDetails?.image_url || summary.fabric_details?.image_url || null,
      color: materialDetails?.color || summary.fabric_details?.color || null,
      category: 'fabric',
      details: {
        widths_required: summary.widths_required,
        linear_meters: linearMeters,
        price_per_meter: pricePerMeter,
        pricing_method: pricingMethod,
        pricing_label: pricingLabel
      },
    });
  }

  // Lining line (optional)
  if (Number(summary.lining_cost) > 0) {
    // Convert length to user's preferred fabric unit
    const linearMetersInternal = Number(summary.linear_meters) || 0;
    const lengthInUserUnit = convertLength(linearMetersInternal, 'm', units.fabric);
    
    const fabricUnitLabel = units.fabric === 'yards' ? 'yd' : 
                            units.fabric === 'inches' ? 'in' : 
                            units.fabric === 'm' ? 'm' : 
                            units.fabric === 'cm' ? 'cm' : units.fabric;
    
    items.push({
      id: 'lining',
      name: summary.lining_details?.type || 'Lining',
      description: summary.lining_details?.type,
      quantity: lengthInUserUnit,
      unit: fabricUnitLabel,
      unit_price: Number(summary.lining_details?.price_per_metre ?? summary.lining_details?.price_per_meter) || undefined,
      total_cost: Number(summary.lining_cost) || 0,
      image_url: summary.lining_details?.image_url || null,
      color: summary.lining_details?.color || null,
      category: 'lining',
      details: summary.lining_details || undefined,
    });
  }

  // Heading (if present as separate charge)
  if (Number(summary.heading_cost) > 0) {
    items.push({
      id: 'heading',
      name: 'Heading',
      description: summary.heading_details?.type ?? summary.heading_type,
      total_cost: Number(summary.heading_cost) || 0,
      category: 'heading',
      details: summary.heading_details || undefined,
    });
  }

  // Selected Options - These are pre-formatted client-facing options
  // CRITICAL: selected_options is the ONLY source for displaying treatment options in quotes
  // CRITICAL FIX: Display ALL options - NO GROUPING, NO FILTERING!
  // Zero-cost options are meaningful selections that clients need to see (e.g., "Mount Type: Inside Mount")
  if (summary.selected_options && Array.isArray(summary.selected_options)) {
    console.log('📋 Processing %d selected_options (NO grouping/filtering)', summary.selected_options.length);
    
    summary.selected_options.forEach((option: any, index: number) => {
      let formattedName = option.name || option.label || 'Option';
      let formattedDescription = option.description;
      
      // Format "option_key: value" to "Option Key: value"
      if (formattedName && formattedName.includes(':')) {
        const colonIndex = formattedName.indexOf(':');
        if (colonIndex > 0) {
          const key = formattedName.substring(0, colonIndex).trim();
          const value = formattedName.substring(colonIndex + 1).trim();
          formattedName = key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c: string) => c.toUpperCase());
          formattedDescription = value || formattedDescription;
        }
      }
      
      // CRITICAL: Use calculatedPrice (based on pricing method) if available, otherwise fall back to base price
      const price = Number(option.calculatedPrice || option.price || option.cost || option.total_cost || option.unit_price || 0);
      const basePrice = Number(option.basePrice || option.price || 0);
      
      items.push({
        id: option.id || `option-${index}`,
        name: formattedName,
        description: formattedDescription && formattedDescription !== formattedName ? formattedDescription : undefined,
        total_cost: price,
        unit_price: basePrice, // Show base rate for reference
        quantity: 1,
        image_url: option.image_url,
        color: option.color || null,
        category: 'option',
        pricingDetails: option.pricingDetails || '',
        details: option,
      });
      
      console.log('  Added option:', formattedName, '| Desc:', formattedDescription, '| Cost:', price);
    });
  }

  // Manufacturing/Assembly - UNIVERSAL RULE: only show if NOT using fabric pricing grid
  // When fabric has pricing grid, manufacturingCost is already included in fabricCost
  if (!usePricingGrid && manufacturingCost > 0) {
    items.push({
      id: 'manufacturing',
      name: 'Manufacturing',
      description: summary.manufacturing_type || 'machine',
      total_cost: manufacturingCost,
      category: 'manufacturing',
      details: { type: summary.manufacturing_type || 'machine' },
    });
  }

  return items;
};

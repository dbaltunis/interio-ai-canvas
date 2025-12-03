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
  details?: Record<string, any>;
}

/**
 * Helper function to group related options (parent + sub-options)
 * Matches patterns like:
 * - "Headrail Selection" + "Headrail Selection Colour" → ONE ROW: "Headrail Selection" with description "standard headrail, colour: white"
 * - "Control Type" + "Control Type Colour" + "Control Type Length" → ONE ROW with combined description
 */
const groupRelatedOptions = (options: any[]): any[] => {
  if (!options || options.length === 0) return [];
  
  const grouped = new Map<string, any>();
  const processed = new Set<string>();
  
  // First pass: identify parent options (base names without attributes)
  const parentMap = new Map<string, any>();
  options.forEach(option => {
    const name = (option.name || '').trim();
    
    // Check if this is a parent (doesn't end with common attribute keywords)
    const hasAttributeSuffix = /\s+(Colour|Color|Length|Chain Side|Side|Size|Type|Width|Height|Finish|Material|Direction)$/i.test(name);
    
    if (!hasAttributeSuffix) {
      parentMap.set(name.toLowerCase(), {
        originalName: name,
        option: option
      });
    }
  });
  
  // Second pass: group sub-options with their parents
  parentMap.forEach((parentData, parentKey) => {
    const parent = parentData.option;
    const parentName = parentData.originalName;
    
    // Find all sub-options that start with this parent name
    const relatedOptions = options.filter(opt => {
      const optName = (opt.name || '').trim();
      return optName.toLowerCase().startsWith(parentKey + ' ') && optName !== parentName;
    });
    
    // Extract parent description (the main value like "standard headrail")
    let parentDesc = (parent.description || '').trim();
    // Remove redundant prefix if it exists
    if (parentDesc.toLowerCase().includes(parentKey)) {
      parentDesc = parentDesc.replace(new RegExp(`^${parentKey}:?\\s*`, 'i'), '').trim();
    }
    
    // Collect sub-option descriptions and sum costs
    const subDescriptions: string[] = [];
    let totalCost = Number(parent.total_cost || 0);
    
    relatedOptions.forEach(subOpt => {
      const subCost = Number(subOpt.total_cost || 0);
      totalCost += subCost;
      
      // Extract the sub-attribute part (e.g., "colour: white" from "headrail selection - colour: white")
      let subDesc = (subOpt.description || '').trim();
      
      // Try to extract after dash or colon
      const afterDash = subDesc.match(/[-–]\s*(.+)$/);
      if (afterDash) {
        subDescriptions.push(afterDash[1].trim());
      } else if (subDesc && !subDesc.toLowerCase().includes(parentKey)) {
        // If no dash, use the whole description (unless it repeats parent name)
        subDescriptions.push(subDesc);
      }
      
      processed.add(subOpt.id || subOpt.name);
    });
    
    // Combine descriptions: parent description + all sub-descriptions
    const finalDescription = subDescriptions.length > 0
      ? `${parentDesc}, ${subDescriptions.join(', ')}`
      : parentDesc;
    
    grouped.set(parentKey, {
      id: parent.id,
      name: parentName,
      description: finalDescription,
      total_cost: totalCost,
      unit_price: totalCost,
      quantity: 1,
      category: 'option',
      image_url: parent.image_url,
      details: parent.details,
    });
    
    processed.add(parent.id || parent.name);
  });
  
  return Array.from(grouped.values());
};

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
    
    // Apply grouping logic to existing breakdown items
    // Separate options from other items
    const options = raw.filter((item: any) => item.category === 'option');
    const nonOptions = raw.filter((item: any) => item.category !== 'option');
    
    console.log('🔍 BEFORE GROUPING - Total options:', options.length);
    options.forEach((opt: any) => {
      console.log('  Option:', opt.name, '| Description:', opt.description, '| Cost:', opt.total_cost);
    });
    
    // Group related options
    const groupedOptions = groupRelatedOptions(options);
    
    console.log('🔍 AFTER GROUPING - Total grouped options:', groupedOptions.length);
    groupedOptions.forEach((opt: any) => {
      console.log('  Grouped:', opt.name, '| Description:', opt.description, '| Cost:', opt.total_cost);
    });
    
    // Combine and return
    return [...nonOptions, ...groupedOptions] as ClientBreakdownItem[];
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
  // Filter out options with zero price AND no meaningful selection (avoid clutter)
  if (summary.selected_options && Array.isArray(summary.selected_options)) {
    const filteredOptions = summary.selected_options
      .filter((option: any) => {
        const price = Number(option.price || option.cost || option.total_cost || option.unit_price || 0);
        // Include option if: it has a price > 0 OR it represents a meaningful selection (not just a default)
        return price > 0 || (option.description && !option.description.toLowerCase().includes('included'));
      });
    
    // Group related options (parent + sub-options like Colour, Length, Chain Side)
    const groupedOptions = groupRelatedOptions(filteredOptions);
    
    groupedOptions.forEach((option: any, index: number) => {
      items.push({
        id: option.id || `option-${index}`,
        name: option.name || option.label || 'Option',
        description: option.description && option.description !== option.name ? option.description : undefined,
        total_cost: option.total_cost,
        unit_price: option.unit_price,
        quantity: 1,
        image_url: option.image_url,
        color: option.color || null,
        category: 'option',
        details: option,
      });
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

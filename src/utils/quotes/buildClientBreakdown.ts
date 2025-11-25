
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
  details?: Record<string, any>;
}

/**
 * Helper function to group related options (parent + sub-options)
 * Matches patterns like:
 * - "headrail_selection" + "headrail_selection_colour" → "Headrail Selection - STANDARD HEADRAIL, colour: white"
 * - "control_type" + "control_type_colour" + "control_type_length" → "Control Type - Chain, colour: White, length: 500"
 */
const groupRelatedOptions = (options: any[]): any[] => {
  if (!options || options.length === 0) return [];
  
  const grouped = new Map<string, any>();
  const processed = new Set<string>();
  
  // First pass: identify all unique base option names
  const baseNames = new Set<string>();
  options.forEach(option => {
    const name = (option.name || option.id || '').toLowerCase();
    
    // Check if this is a sub-option (has underscore suffix like _colour, _length, etc.)
    const match = name.match(/^(.+)_(colour|color|length|chain_side|side|size|type|width|height|finish|material)$/);
    if (match) {
      baseNames.add(match[1]);
    } else {
      baseNames.add(name);
    }
  });
  
  // Second pass: group options by base name
  baseNames.forEach(baseName => {
    const relatedOptions = options.filter(opt => {
      const name = (opt.name || opt.id || '').toLowerCase();
      return name === baseName || name.startsWith(baseName + '_');
    });
    
    if (relatedOptions.length === 0) return;
    
    // Find the parent (base) option
    const parent = relatedOptions.find(opt => {
      const name = (opt.name || opt.id || '').toLowerCase();
      return name === baseName;
    });
    
    if (!parent) return;
    
    // Extract parent description (the main value like "STANDARD HEADRAIL")
    let parentDesc = parent.description || parent.name || '';
    // Remove redundant prefix like "headrail_selection: " to get just "STANDARD HEADRAIL"
    parentDesc = parentDesc.replace(/^[^:]+:\s*/, '').trim();
    
    // Collect sub-option descriptions
    const subDescriptions: string[] = [];
    let totalCost = Number(parent.total_cost || parent.price || parent.cost || 0);
    
    relatedOptions.forEach(opt => {
      const name = (opt.name || opt.id || '').toLowerCase();
      if (name !== baseName) {
        // This is a sub-option
        const cost = Number(opt.total_cost || opt.price || opt.cost || 0);
        totalCost += cost;
        
        // Extract the sub-attribute (e.g., "colour: white" from "Headrail selection - colour: white")
        let subDesc = opt.description || '';
        const colonMatch = subDesc.match(/[-–:]\s*(.+)$/);
        if (colonMatch) {
          subDescriptions.push(colonMatch[1].trim());
        } else if (subDesc) {
          // Fallback: just use the description
          subDescriptions.push(subDesc);
        }
        
        processed.add(opt.id || opt.name);
      }
    });
    
    // Format the display name (convert snake_case to Title Case)
    const displayName = baseName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Combine descriptions
    const finalDescription = subDescriptions.length > 0
      ? `${parentDesc}, ${subDescriptions.join(', ')}`
      : parentDesc;
    
    grouped.set(baseName, {
      id: parent.id,
      name: displayName,
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
 */
export const buildClientBreakdown = (summary: any): ClientBreakdownItem[] => {
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
    
    // Group related options
    const groupedOptions = groupRelatedOptions(options);
    
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
    const sqm = linearMeters * (Number(summary.widths_required) || 1) / 10000; // Convert cm to sqm
    items.push({
      id: 'fabric',
      name: 'Fabric Material',
      description: `${sqm.toFixed(2)} sqm × ${(combinedMaterialCost / sqm).toFixed(2)}/sqm`,
      quantity: sqm,
      unit: 'sqm',
      unit_price: combinedMaterialCost / sqm,
      total_cost: combinedMaterialCost,
      image_url: materialDetails?.image_url || summary.fabric_details?.image_url || null,
      category: 'fabric',
      details: {
        widths_required: summary.widths_required,
        linear_meters: linearMeters,
        price_per_meter: pricePerMeter,
      },
    });
  }

  // Lining line (optional)
  if (Number(summary.lining_cost) > 0) {
    items.push({
      id: 'lining',
      name: summary.lining_details?.type || 'Lining',
      description: summary.lining_details?.type,
      quantity: Number(summary.linear_meters) || 0,
      unit: 'm',
      unit_price: Number(summary.lining_details?.price_per_metre ?? summary.lining_details?.price_per_meter) || undefined,
      total_cost: Number(summary.lining_cost) || 0,
      image_url: summary.lining_details?.image_url || null,
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

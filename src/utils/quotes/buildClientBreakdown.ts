
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
 * Example: "Headrail Selection" + "Headrail Selection Colour" → "Headrail Selection - STANDARD HEADRAIL, colour: white"
 */
const groupRelatedOptions = (options: any[]): any[] => {
  if (!options || options.length === 0) return [];
  
  // Map to store grouped options by parent name
  const groups = new Map<string, any>();
  const processedIndices = new Set<number>();
  
  options.forEach((option, idx) => {
    if (processedIndices.has(idx)) return;
    
    const optionName = option.name || option.label || '';
    const optionDescription = option.description || '';
    const price = Number(option.price || option.cost || option.total_cost || option.unit_price || 0);
    
    // Check if this is a sub-option (contains additional attributes like Colour, Length, Chain Side)
    const isSubOption = /\s+(Colour|Color|Length|Chain Side|Size|Type|Width|Height|Depth|Finish|Material)\s*$/i.test(optionName);
    
    if (isSubOption) {
      // Extract parent name by removing the attribute suffix
      const parentName = optionName.replace(/\s+(Colour|Color|Length|Chain Side|Size|Type|Width|Height|Depth|Finish|Material)\s*$/i, '').trim();
      
      // Find or create parent group
      if (groups.has(parentName)) {
        const parent = groups.get(parentName)!;
        
        // Extract the sub-attribute description (e.g., "colour: white" from "Headrail selection - colour: white")
        const subDescription = extractSubDescription(optionDescription, optionName);
        
        // Append to parent description
        if (subDescription) {
          parent.description = parent.description 
            ? `${parent.description}, ${subDescription}` 
            : subDescription;
        }
        
        // Sum prices
        parent.total_cost = (parent.total_cost || 0) + price;
        parent.unit_price = (parent.unit_price || 0) + price;
        
        processedIndices.add(idx);
      }
    } else {
      // This is a parent option - check if we already have it from a previous sub-option
      if (!groups.has(optionName)) {
        groups.set(optionName, {
          id: option.id,
          name: optionName,
          label: optionName,
          description: optionDescription,
          price,
          cost: price,
          total_cost: price,
          unit_price: price,
          image_url: option.image_url,
          details: option.details,
        });
      } else {
        // Merge with existing group
        const existing = groups.get(optionName)!;
        existing.total_cost = (existing.total_cost || 0) + price;
        existing.unit_price = (existing.unit_price || 0) + price;
      }
      processedIndices.add(idx);
    }
  });
  
  return Array.from(groups.values());
};

/**
 * Extract sub-attribute description from option description
 * Example: "Headrail selection - colour: white" → "colour: white"
 */
const extractSubDescription = (description: string, optionName: string): string => {
  if (!description) return '';
  
  // Try to extract the attribute part after a dash or colon
  const dashMatch = description.match(/[-–]\s*(.+)$/);
  if (dashMatch) return dashMatch[1].trim();
  
  // Try to extract just the attribute type and value
  const attributeMatch = optionName.match(/\s+(Colour|Color|Length|Chain Side|Size|Type|Width|Height|Depth|Finish|Material)\s*$/i);
  if (attributeMatch) {
    const attribute = attributeMatch[1].toLowerCase();
    // Extract value from description
    const valueMatch = description.match(new RegExp(`${attribute}[:\\s]+(.+?)(?:,|$)`, 'i'));
    if (valueMatch) return `${attribute}: ${valueMatch[1].trim()}`;
  }
  
  return description;
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

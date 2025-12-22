import { MeasurementUnits, defaultMeasurementUnits, convertLength } from '@/hooks/useBusinessSettings';
import { MarkupSettings, defaultMarkupSettings } from '@/hooks/useMarkupSettings';
import { resolveMarkup, applyMarkup } from '@/utils/pricing/markupResolver';

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
 * CRITICAL: Apply markup to a breakdown item's prices
 * This ensures ALL client-facing prices include the selling markup
 */
const applyMarkupToItem = (
  item: ClientBreakdownItem,
  markupSettings?: MarkupSettings,
  treatmentCategory?: string
): ClientBreakdownItem => {
  if (!markupSettings) return item;
  
  // Resolve markup based on item category and treatment category
  const markupResult = resolveMarkup({
    category: treatmentCategory || item.category,
    subcategory: item.category,
    markupSettings
  });
  
  const markupPercentage = markupResult.percentage;
  if (markupPercentage <= 0) return item;
  
  // Apply markup to prices
  const costPrice = Number(item.total_cost) || 0;
  const unitCost = Number(item.unit_price) || 0;
  
  return {
    ...item,
    total_cost: applyMarkup(costPrice, markupPercentage),
    unit_price: unitCost > 0 ? applyMarkup(unitCost, markupPercentage) : undefined
  };
};

/**
 * Group related options together (e.g., "Headrail Selection" + "Headrail Selection Colour")
 * into a single row with combined description and prices.
 * 
 * Pattern detection:
 * - Parent: "headrail_selection" or "Headrail Selection"
 * - Child: "headrail_selection_colour" or "Headrail Selection Colour"
 * 
 * Result: Combined row "Headrail Selection: STANDARD HEADRAIL - Colour: dark"
 */
const groupRelatedOptions = (items: ClientBreakdownItem[]): ClientBreakdownItem[] => {
  if (!items || items.length === 0) return [];
  
  // UNIVERSAL GROUPING: Apply to ALL items regardless of category (options, lining, hardware, etc.)
  // Any items following parent-child naming pattern will be grouped
  
  // Extract type key from name (e.g., "Lining Types: Blockout Lining" → "Lining Types")
  // This ensures we match on the TYPE, not the selected VALUE
  const extractTypeKey = (name: string): string => {
    if (!name) return '';
    const colonIndex = name.indexOf(':');
    if (colonIndex > 0) {
      return name.substring(0, colonIndex).trim();
    }
    return name; // No colon, use full name
  };
  
  // Normalize a name for matching (lowercase, replace spaces/dashes with underscores, collapse multiple underscores)
  const normalizeKey = (name: string) => {
    return (name || '')
      .toLowerCase()
      .replace(/[\s\-]+/g, '_')           // Replace spaces AND dashes with underscore
      .replace(/[^a-z0-9_]/g, '')         // Remove other special chars
      .replace(/_+/g, '_')                 // Collapse multiple underscores to single
      .replace(/^_|_$/g, '');              // Trim leading/trailing underscores
  };
  
  // Build a map of parent options and their children
  const parentMap = new Map<string, ClientBreakdownItem>();
  const childMap = new Map<string, { parent: string; item: ClientBreakdownItem }>();
  
  // Common child suffixes that indicate a sub-option (MUST include both singular AND plural forms)
  const childSuffixes = [
    '_colour', '_colours', '_color', '_colors',     // Color variations
    '_size', '_sizes',                               // Size variations
    '_style', '_styles',                             // Style variations
    '_finish', '_finishes',                          // Finish variations
    '_material', '_materials',                       // Material variations
    '_track', '_tracks',                             // Hardware tracks
    '_rod', '_rods',                                 // Hardware rods
    '_width', '_length', '_height',                  // Dimension options
    '_chain', '_chains',                             // Chain side options
    '_slat', '_slats',                               // Slat options
    '_vane', '_vanes',                               // Vane options
    '_louvre', '_louvres',                           // Louvre options
  ];
  // NOTE: Removed _type/_types, _option/_options, _control/_controls, _mount/_mounts
  // because these are PARENT category name patterns (e.g., "Lining Types", "Mount Type"), NOT child indicators
  
  // First pass: identify all items and potential parent-child relationships
  items.forEach(item => {
    // Extract type key before colon, then normalize
    const typeKey = extractTypeKey(item.name || '');
    const normalizedName = normalizeKey(typeKey);
    
    // Check if this is a child option (has a suffix that indicates it belongs to a parent)
    let isChild = false;
    for (const suffix of childSuffixes) {
      if (normalizedName.endsWith(suffix)) {
        const parentKey = normalizedName.slice(0, -suffix.length);
        childMap.set(normalizedName, { parent: parentKey, item });
        isChild = true;
        break;
      }
    }
    
    if (!isChild) {
      parentMap.set(normalizedName, item);
    }
  });
  
  // Second pass: merge children into parents
  const processedParents = new Set<string>();
  const result: ClientBreakdownItem[] = [];
  
  parentMap.forEach((parentItem, parentKey) => {
    if (processedParents.has(parentKey)) return;
    processedParents.add(parentKey);
    
    // Find all children for this parent
    const children: { suffix: string; item: ClientBreakdownItem }[] = [];
    childMap.forEach((childData, childKey) => {
      if (childData.parent === parentKey) {
        const suffix = childKey.slice(parentKey.length + 1); // +1 for underscore
        children.push({ suffix, item: childData.item });
      }
    });
    
    if (children.length === 0) {
      // No children, add parent as-is
      result.push(parentItem);
    } else {
      // Merge children into parent
      // Format: "STANDARD HEADRAIL; colour: dark" (parent value; child suffix: child value)
      let mergedDescription = parentItem.description || '';
      let mergedPrice = Number(parentItem.total_cost) || 0;
      
      children.forEach(({ suffix, item: childItem }) => {
        // Format suffix nicely (colour -> Colour)
        const formattedSuffix = suffix
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c: string) => c.toUpperCase());
        
        // Get ONLY the child's actual value, not its full name
        // Child description might be "dark" or might be "Headrail selection - colour: dark"
        // We want just the actual value part
        let childValue = childItem.description || '';
        
        // If child value contains the parent name or suffix name, extract just the value
        // e.g., "Headrail selection - colour: dark" -> "dark"
        if (childValue.toLowerCase().includes(suffix.replace(/_/g, ' '))) {
          // Try to extract value after colon
          const colonIndex = childValue.lastIndexOf(':');
          if (colonIndex > -1) {
            childValue = childValue.substring(colonIndex + 1).trim();
          }
        }
        
        // If still empty, try childItem.name as fallback
        if (!childValue) {
          childValue = childItem.name || '';
        }
        
        if (childValue) {
          // Use semicolon separator for cleaner look
          mergedDescription += mergedDescription ? `; ${formattedSuffix}: ${childValue}` : `${formattedSuffix}: ${childValue}`;
        }
        
        // Add child price to total
        mergedPrice += Number(childItem.total_cost) || 0;
      });
      
      result.push({
        ...parentItem,
        description: mergedDescription,
        total_cost: mergedPrice,
        // Keep original unit_price from parent for display
      });
    }
  });
  
  // Add any orphan children (children without matching parents)
  childMap.forEach((childData, childKey) => {
    const parentExists = parentMap.has(childData.parent);
    if (!parentExists) {
      result.push(childData.item);
    }
  });
  
  console.log('🔗 groupRelatedOptions:', {
    inputCount: items.length,
    outputCount: result.length,
    groupedItems: items.length - result.length
  });
  
  return result;
};

/**
 * Build a client-facing SELLING PRICE breakdown from a saved window summary.
 * - Uses structured summary.cost_breakdown if already shaped
 * - Otherwise, derives Fabric, Lining, and Manufacturing lines from summary fields
 * - CRITICAL: When markupSettings provided, ALL prices are converted to SELLING prices (cost + markup)
 * 
 * @param summary - Window summary data
 * @param units - Optional measurement units for display (defaults to metric)
 * @param markupSettings - Optional markup settings to convert costs to selling prices
 */
export const buildClientBreakdown = (
  summary: any,
  units: MeasurementUnits = defaultMeasurementUnits,
  markupSettings?: MarkupSettings
): ClientBreakdownItem[] => {
  if (!summary) return [];
  
  const treatmentCategory = summary.treatment_category || summary.treatment_type;

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
    
    // Format option names for better display and enrich with color/image from source details
    const enrichedItems = raw.map((item: any) => {
      let formattedName = item.name || item.category || 'Item';
      let formattedDescription = '-';
      
      // CRITICAL FIX: ALWAYS extract value from "option_key: value" format as description FIRST
      if (formattedName && formattedName.includes(':')) {
        const colonIndex = formattedName.indexOf(':');
        if (colonIndex > 0) {
          const key = formattedName.substring(0, colonIndex).trim();
          const value = formattedName.substring(colonIndex + 1).trim();
          formattedName = key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c: string) => c.toUpperCase());
          // ALWAYS set description from extracted value - never leave empty
          formattedDescription = value || '-';
        }
      }
      
      // Use explicit item.description as override ONLY if it has meaningful content
      if (item.description && item.description !== '-' && item.description.trim().length > 0) {
        formattedDescription = item.description;
      }
      
      // Enrich items with color/image from source details
      // CRITICAL RULES:
      // 1. Template/treatment rows: show template image
      // 2. Fabric/material rows: show fabric image OR color swatch fallback
      // 3. Option rows: show option image ONLY if it has one, NO color fallback
      let itemColor: string | null = null;
      let itemImageUrl = item.image_url || null;
      
      if (item.category === 'fabric' || item.category === 'material') {
        // For fabric/material rows: use fabric/material image OR color as fallback
        const fabricImage = summary.fabric_details?.image_url || summary.material_details?.image_url;
        const fabricColor = summary.fabric_details?.color || summary.material_details?.color || (summary.measurements_details as any)?.selected_color;
        
        itemImageUrl = fabricImage || null;
        itemColor = fabricColor || null; // Color fallback ONLY for fabric/material
      } else if (item.category === 'hardware') {
        // Hardware: image and color from hardware details
        itemImageUrl = itemImageUrl || summary.hardware_details?.image_url || null;
        itemColor = item.color || summary.hardware_details?.color || null;
      } else if (item.category === 'template' || item.category === 'treatment') {
        // Template row gets template image, no color
        itemImageUrl = itemImageUrl || summary.template_details?.image_url || summary.treatment_image_url || null;
        itemColor = null;
      } else if (item.category === 'option' || item.category === 'options') {
        // OPTIONS: ONLY show image if option has one, NO color fallback
        itemImageUrl = item.image_url || null;
        itemColor = null; // Explicitly no color for options
      } else {
        // Other categories: no automatic color assignment
        itemColor = null;
      }
      
      return {
        ...item,
        name: formattedName,
        description: formattedDescription,
        color: itemColor,
        image_url: itemImageUrl,
      };
    });
    
    // Apply smart grouping to merge related options (e.g., "Headrail Selection" + "Headrail Selection Colour")
    const groupedItems = groupRelatedOptions(enrichedItems);
    
    // CRITICAL: Apply markup to ALL items to convert cost prices to SELLING prices
    const itemsWithMarkup = markupSettings 
      ? groupedItems.map((item: any) => applyMarkupToItem(item as ClientBreakdownItem, markupSettings, treatmentCategory))
      : groupedItems;
    
    console.log('✅ Returning %d items after grouping (original: %d), markup applied: %s', 
      itemsWithMarkup.length, enrichedItems.length, !!markupSettings);
    itemsWithMarkup.forEach((item: any) => {
      console.log('  Item:', item.name, '| Desc:', item.description, '| Selling Price:', item.total_cost, '| Color:', item.color);
    });
    
    return itemsWithMarkup as ClientBreakdownItem[];
  }

  console.log('⚠️ No structured breakdown - building from scratch (THIS SHOULD BE RARE)');
  const items: ClientBreakdownItem[] = [];

  // ONLY BUILD FROM SCRATCH IF NO COST_BREAKDOWN EXISTS
  // This path should rarely be used - cost_breakdown should always exist
  
  // Fabric line - handle both fabric and material (for blinds/shutters)
  const isBlindsOrShutters = summary.treatment_category?.includes('blind') || summary.treatment_category?.includes('shutter');
  
  // Source-aware label: Material for blinds/shutters, Wallpaper for wallcoverings, Fabric for curtains/romans
  const getMaterialLabel = (): string => {
    const treatmentCategory = summary.treatment_category;
    const hasWallpaper = treatmentCategory === 'wallpaper' || 
                         summary.fabric_details?.category === 'wallcovering';
    if (hasWallpaper) return 'Wallpaper';
    if (treatmentCategory?.includes('blind') || treatmentCategory?.includes('shutter')) return 'Material';
    return 'Fabric';
  };
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
      name: `${getMaterialLabel()} (${pricingLabel})`,
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
  // Apply smart grouping to merge related options (e.g., "Headrail Selection" + "Headrail Selection Colour")
  if (summary.selected_options && Array.isArray(summary.selected_options)) {
    console.log('📋 Processing %d selected_options with smart grouping', summary.selected_options.length);
    
    const optionItems: ClientBreakdownItem[] = [];
    
    summary.selected_options.forEach((option: any, index: number) => {
      let formattedName = option.name || option.label || 'Option';
      let formattedDescription = '-';
      
      // Priority 1: Extract from optionKey if available
      if (option.optionKey) {
        formattedName = option.optionKey
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c: string) => c.toUpperCase());
        formattedDescription = option.label || option.value || '-';
      }
      // Priority 2: Extract from "option_key: value" format
      else if (formattedName && formattedName.includes(':')) {
        const colonIndex = formattedName.indexOf(':');
        if (colonIndex > 0) {
          const key = formattedName.substring(0, colonIndex).trim();
          const value = formattedName.substring(colonIndex + 1).trim();
          formattedName = key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c: string) => c.toUpperCase());
          // ALWAYS set description from extracted value - never leave empty
          formattedDescription = value || '-';
        }
      }
      
      // Priority 3: Use explicit option.description as override if meaningful
      if (option.description && option.description !== '-' && option.description.trim().length > 0) {
        formattedDescription = option.description;
      }
      
      // CRITICAL: Use calculatedPrice (based on pricing method) if available, otherwise fall back to base price
      const price = Number(option.calculatedPrice || option.price || option.cost || option.total_cost || option.unit_price || 0);
      const basePrice = Number(option.basePrice || option.price || 0);
      
      // CRITICAL: Options only show image if they have one - NO color fallback
      optionItems.push({
        id: option.id || `option-${index}`,
        name: formattedName,
        description: formattedDescription !== '-' ? formattedDescription : undefined,
        total_cost: price,
        unit_price: basePrice, // Show base rate for reference
        quantity: 1,
        image_url: option.image_url || null, // Only option's own image
        color: null, // NO color fallback for options
        category: 'option',
        pricingDetails: option.pricingDetails || '',
        details: option,
      });
    });
    
    // Apply smart grouping to merge related options
    const groupedOptions = groupRelatedOptions(optionItems);
    
    groupedOptions.forEach((option) => {
      items.push(option);
      console.log('  Added option:', option.name, '| Desc:', option.description, '| Cost:', option.total_cost);
    });
    
    console.log('📋 Options after grouping: %d (original: %d)', groupedOptions.length, optionItems.length);
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

  // CRITICAL: Apply markup to ALL items to convert cost prices to SELLING prices
  const itemsWithMarkup = markupSettings 
    ? items.map(item => applyMarkupToItem(item, markupSettings, treatmentCategory))
    : items;

  return itemsWithMarkup;
};

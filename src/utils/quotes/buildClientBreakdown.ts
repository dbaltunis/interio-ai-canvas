
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
 * Build a client-facing cost breakdown from a saved window summary.
 * - Uses structured summary.cost_breakdown if already shaped
 * - Otherwise, derives Fabric, Lining, and Manufacturing lines from summary fields
 */
export const buildClientBreakdown = (summary: any): ClientBreakdownItem[] => {
  if (!summary) return [];

  const raw = Array.isArray(summary.cost_breakdown) ? summary.cost_breakdown : [];
  const hasStructured = raw.some((it: any) => it && 'category' in it && 'total_cost' in it);
  if (hasStructured) return raw as ClientBreakdownItem[];

  const items: ClientBreakdownItem[] = [];

  // Fabric line - handle both fabric and material (for blinds/shutters)
  const isBlindsOrShutters = summary.treatment_category?.includes('blind') || summary.treatment_category?.includes('shutter');
  const materialDetails = isBlindsOrShutters ? (summary.material_details || summary.fabric_details) : summary.fabric_details;
  
  const fabricCost = Number(summary.fabric_cost) || 0;
  const linearMeters = Number(summary.linear_meters) || 0;
  const pricePerMeter = Number(
    summary.price_per_meter ?? 
    materialDetails?.price_per_meter ?? 
    materialDetails?.unit_price
  ) || 0;
  
  if (fabricCost > 0 || linearMeters > 0) {
    items.push({
      id: 'fabric',
      name: materialDetails?.name || summary.fabric_details?.name || 'Fabric Material',
      description: materialDetails?.name
        ? `${materialDetails.name} • ${linearMeters.toFixed(2)}m • ${summary.widths_required || 1} width(s)`
        : `${linearMeters.toFixed(2)}m • ${summary.widths_required || 1} width(s)`,
      quantity: linearMeters,
      unit: 'm',
      unit_price: pricePerMeter,
      total_cost: fabricCost,
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

  // Selected Options (from measurements.selected_options)
  if (summary.selected_options && Array.isArray(summary.selected_options)) {
    summary.selected_options.forEach((option: any, index: number) => {
      // Try multiple possible price fields
      const price = Number(option.price || option.cost || option.total_cost || option.unit_price || 0);
      
      // Always add options regardless of price - even zero-price options should be visible
      items.push({
        id: option.id || `option-${index}`,
        name: option.name || option.label || 'Option',
        description: option.description || option.name,
        total_cost: price,
        unit_price: price,
        quantity: 1,
        image_url: option.image_url,
        category: 'option',
        details: option,
      });
    });
  }

  // Manufacturing/Assembly
  const manufacturingCost = Number(summary.manufacturing_cost) || 0;
  const manufacturingType = summary.manufacturing_type || 'machine';
  
  if (manufacturingCost > 0) {
    items.push({
      id: 'manufacturing',
      name: 'Manufacturing',
      description: manufacturingType,
      total_cost: manufacturingCost,
      category: 'manufacturing',
      details: { type: manufacturingType },
    });
  }

  return items;
};

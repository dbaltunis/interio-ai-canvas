
export interface ClientBreakdownItem {
  id?: string;
  name?: string;
  description?: string;
  category?: string;
  quantity?: number;
  unit?: string;
  unit_price?: number;
  total_cost?: number;
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

  // Fabric line
  items.push({
    id: 'fabric',
    name: summary.fabric_details?.name || 'Fabric',
    description: summary.fabric_details?.name
      ? `${summary.fabric_details.name} • ${summary.linear_meters ?? ''}m • ${summary.widths_required} width(s)`
      : `${summary.linear_meters ?? ''}m • ${summary.widths_required} width(s)`,
    quantity: Number(summary.linear_meters) || 0,
    unit: 'm',
    unit_price: Number(
      summary.price_per_meter ?? summary.fabric_details?.price_per_meter ?? summary.fabric_details?.unit_price
    ) || 0,
    total_cost: Number(summary.fabric_cost) || 0,
    category: 'fabric',
    details: {
      widths_required: summary.widths_required,
      linear_meters: summary.linear_meters,
      price_per_meter: summary.price_per_meter ?? summary.fabric_details?.price_per_meter ?? summary.fabric_details?.unit_price,
    },
  });

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

  // Manufacturing
  items.push({
    id: 'manufacturing',
    name: 'Manufacturing',
    description: summary.manufacturing_type,
    total_cost: Number(summary.manufacturing_cost) || 0,
    category: 'manufacturing',
    details: { type: summary.manufacturing_type },
  });

  return items;
};

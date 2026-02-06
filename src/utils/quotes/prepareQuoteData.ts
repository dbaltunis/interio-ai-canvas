import { buildClientBreakdown, ClientBreakdownItem } from './buildClientBreakdown';
import { isManufacturedItem, detectTreatmentCategory } from '@/utils/treatmentTypeUtils';

export interface PreparedQuoteItem {
  id: string;
  name: string;
  description?: string;
  quantity?: number;
  unit?: string;
  unit_price?: number;
  total: number;
  image_url?: string;
  breakdown?: ClientBreakdownItem[];
  room_name?: string;
  room_id?: string;
  surface_name?: string;
  treatment_type?: string;
}

export interface PreparedQuoteData {
  items: PreparedQuoteItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  taxInclusive: boolean;
}

/**
 * Prepares quote data in a standardized format for both screen and PDF rendering
 * CRITICAL: Uses total_selling (retail price with markup) for customer-facing quotes
 */
export const prepareQuoteData = (
  projectData: any,
  showDetailedBreakdown: boolean = false
): PreparedQuoteData => {
  const items: PreparedQuoteItem[] = [];
  const projectSummaries = projectData?.windowSummaries;
  const businessSettings = projectData?.businessSettings;
  const pricingSettings = businessSettings?.pricing_settings as any;
  const taxRate = (businessSettings?.tax_rate || 0) / 100;
  const taxInclusive = pricingSettings?.tax_inclusive || false;
  const currency = businessSettings?.currency || 'GBP';

  // Process window summaries
  if (projectSummaries?.windows && projectSummaries.windows.length > 0) {
    projectSummaries.windows.forEach((window: any) => {
      const summary = window.summary;
      // CRITICAL: Use total_selling (retail price) if available, fallback to total_cost
      const itemTotal = Number(summary?.total_selling) || Number(summary?.total_cost) || 0;

      if (summary && itemTotal > 0) {
        // Build detailed breakdown
        const breakdown = showDetailedBreakdown ? buildClientBreakdown(summary) : undefined;

        // Extract treatment details using centralized detection
        const treatmentCategory = detectTreatmentCategory({
          treatmentCategory: summary.treatment_category,
          treatmentType: summary.treatment_type,
          templateName: summary.template_name
        }) || summary.treatment_category || summary.treatment_type || '';
        const isBlindsOrShutters = isManufacturedItem(treatmentCategory);

        // Get material details (fabric for curtains, material for blinds)
        const materialDetails = isBlindsOrShutters ? (summary.material_details || {}) : (summary.fabric_details || {});
        const fabricDetails = summary.fabric_details || {};

        // Determine product name - prefer template name for clarity
        const templateName = summary.template_name || '';
        const materialName = materialDetails.name || fabricDetails.name || '';
        const productName = templateName || materialName || window.surface_name || 'Window Treatment';
        const productImage = materialDetails.image_url || fabricDetails.image_url;

        // Get measurements for display
        const widthCm = summary.rail_width ? (summary.rail_width / 10).toFixed(0) : '';
        const dropCm = summary.drop ? (summary.drop / 10).toFixed(0) : '';
        const dimensions = widthCm && dropCm ? `${widthCm}cm × ${dropCm}cm` : '';

        items.push({
          id: window.window_id,
          name: productName,
          description: dimensions || treatmentCategory,
          quantity: 1,
          unit_price: itemTotal, // For single items, unit_price = total
          total: itemTotal,
          image_url: productImage,
          breakdown,
          room_name: window.room_name,
          room_id: window.room_id,
          surface_name: window.surface_name,
          treatment_type: templateName || treatmentCategory
        });
      }
    });
  }

  // Calculate totals
  const baseSubtotal = items.reduce((sum, item) => sum + item.total, 0);
  
  let subtotal: number;
  let taxAmount: number;
  let total: number;
  
  if (taxInclusive) {
    total = baseSubtotal;
    subtotal = baseSubtotal / (1 + taxRate);
    taxAmount = total - subtotal;
  } else {
    subtotal = baseSubtotal;
    taxAmount = subtotal * taxRate;
    total = subtotal + taxAmount;
  }

  return {
    items,
    subtotal,
    taxAmount,
    total,
    currency,
    taxInclusive
  };
};

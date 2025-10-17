import { buildClientBreakdown, ClientBreakdownItem } from './buildClientBreakdown';

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
      if (window.summary && window.summary.total_cost > 0) {
        const summary = window.summary;
        
        // Build detailed breakdown
        const breakdown = showDetailedBreakdown ? buildClientBreakdown(summary) : undefined;
        
        // Extract treatment details
        const treatmentCategory = summary.treatment_category || summary.treatment_type || '';
        const isBlindsOrShutters = treatmentCategory?.includes('blind') || treatmentCategory?.includes('shutter');
        
        // Get material details (fabric for curtains, material for blinds)
        const materialDetails = isBlindsOrShutters ? (summary.material_details || {}) : (summary.fabric_details || {});
        const fabricDetails = summary.fabric_details || {};
        
        // Determine product name and image
        const productName = materialDetails.name || fabricDetails.name || window.surface_name || 'Window Treatment';
        const productImage = materialDetails.image_url || fabricDetails.image_url;
        
        items.push({
          id: window.window_id,
          name: productName,
          description: summary.template_name || treatmentCategory,
          quantity: 1,
          total: summary.total_cost,
          image_url: productImage,
          breakdown,
          room_name: window.room_name,
          room_id: window.room_id,
          surface_name: window.surface_name,
          treatment_type: summary.template_name
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

/**
 * Shared utility for calculating discount amounts across the application.
 * Used by useQuotationSync and useQuoteDiscount to ensure consistent calculations.
 */

export interface DiscountConfig {
  type: 'percentage' | 'fixed' | null;
  value: number | null;
  scope: 'all' | 'fabrics_only' | 'selected_items' | null;
  selectedItems?: string[] | null;
}

/**
 * Calculate discount amount based on configuration.
 * 
 * @param items - Quote line items
 * @param config - Discount configuration (type, value, scope)
 * @param subtotal - RETAIL PRICE (with markup applied), NOT cost price.
 *                   Discount is applied to the selling price, not the cost.
 * @returns The calculated discount amount
 */
export const calculateDiscountAmount = (
  items: any[],
  config: DiscountConfig,
  subtotal: number
): number => {
  // Guard: No discount if config is incomplete
  if (!config.type || config.value === null || config.value === undefined || !config.scope) {
    return 0;
  }

  let discountableAmount = 0;

  if (config.scope === 'all') {
    discountableAmount = subtotal;
  } else if (config.scope === 'fabrics_only') {
    // Filter items that contain fabric-related keywords
    const fabricItems = items.filter(item => {
      const searchText = [
        item.name || '',
        item.description || ''
      ].filter(Boolean).join(' ').toLowerCase();
      
      return searchText.includes('fabric') || 
             searchText.includes('material') ||
             searchText.includes('textile') ||
             searchText.includes('curtain') ||
             searchText.includes('drape') ||
             searchText.includes('blind') ||
             searchText.includes('roman') ||
             searchText.includes('roller');
    });
    
    discountableAmount = fabricItems.reduce((sum, item) => {
      // Support multiple price field names
      const price = item.total || item.total_price || item.total_cost || 
                   (item.unit_price && item.quantity ? item.unit_price * item.quantity : 0) || 0;
      return sum + price;
    }, 0);
  } else if (config.scope === 'selected_items' && config.selectedItems) {
    const selectedSet = new Set(config.selectedItems);
    discountableAmount = items
      .filter(item => selectedSet.has(item.id))
      .reduce((sum, item) => {
        const price = item.total || item.total_price || item.total_cost || 
                     (item.unit_price && item.quantity ? item.unit_price * item.quantity : 0) || 0;
        return sum + price;
      }, 0);
  }

  // Calculate based on discount type
  if (config.type === 'percentage') {
    return (discountableAmount * config.value) / 100;
  } else {
    // Fixed amount: cap at discountable amount
    return Math.min(config.value, discountableAmount);
  }
};

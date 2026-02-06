/**
 * QuoteSummaryTable - Unified Spreadsheet-Style Quote Summary
 * ============================================================
 * Clean table-based layout for ALL treatment types.
 * No icons, just clarity. Professional spreadsheet appearance.
 * 
 * Features:
 * - Per-item markup support (manufacturing uses specific markup)
 * - Clear math display: "1.85m × £26.50/m = £49.03"
 * - Optional exclusion checkboxes for quotes
 * - Permission-safe: dealers see selling prices only
 */

import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { getCurrencySymbol } from "@/utils/formatCurrency";
import { applyMarkup } from "@/utils/pricing/markupResolver";
import { groupHardwareItems, filterMeaningfulHardwareItems } from "@/utils/quotes/groupHardwareItems";

export interface QuoteSummaryItem {
  name: string;
  details?: string;
  price: number;          // Cost price
  category?: string;
  quantity?: number;
  unitPrice?: number;
  // Per-item markup support
  markupPercentage?: number;  // Override global markup for this item
  sellingPrice?: number;      // Pre-calculated selling price (takes precedence)
}

interface QuoteSummaryTableProps {
  items: QuoteSummaryItem[];
  totalCost: number;
  markupPercentage?: number;
  canViewCosts?: boolean;
  canViewMarkup?: boolean;
  selectedColor?: string;
  // NOTE: Exclusion feature removed - was causing quote breakage
  // Exclusion should be implemented in document layer only (PDF generation)
}

export const QuoteSummaryTable = ({
  items,
  totalCost,
  markupPercentage = 0,
  canViewCosts = true,
  canViewMarkup = true,
  selectedColor
}: QuoteSummaryTableProps) => {
  const { units } = useMeasurementUnits();
  
  const formatPrice = (price: number) => {
    const symbol = getCurrencySymbol(units.currency);
    return `${symbol}${price.toFixed(2)}`;
  };

  /**
   * Get selling price for an item, respecting per-item markup overrides
   * Priority: item.sellingPrice → item.markupPercentage → global markupPercentage
   */
  const getItemSellingPrice = (item: QuoteSummaryItem): number => {
    // 1. Use pre-calculated selling price if available
    if (item.sellingPrice !== undefined && item.sellingPrice > 0) {
      return item.sellingPrice;
    }
    
    // 2. Use item-specific markup if provided
    if (item.markupPercentage !== undefined && item.markupPercentage > 0) {
      return applyMarkup(item.price, item.markupPercentage);
    }
    
    // 3. Fall back to global markup
    return markupPercentage > 0 ? applyMarkup(item.price, markupPercentage) : item.price;
  };

  /**
   * Extract quantity-only from details for dealers (hide cost prices)
   * "1.85m × £26.50/m = £49.03" → "1.85m"
   * "£100/drop × 1 = £100" → "1 drop"
   */
  const extractQuantityOnly = (details?: string): string => {
    if (!details) return '';
    
    // Pattern: "X × Y = Z" - extract the quantity part
    const parts = details.split('×');
    if (parts.length >= 2) {
      // Check which side has the quantity (not the price)
      const left = parts[0].trim();
      const right = parts[1].split('=')[0].trim();
      
      // If left starts with currency symbol, use right; otherwise use left
      if (left.match(/^[£$€₹]/)) {
        return right;
      }
      return left;
    }
    
    // Pattern: "X sqm" or just measurement - keep as is
    if (details.match(/^\d+\.?\d*\s*(sqm|m|cm|drops?|panels?)$/i)) {
      return details;
    }
    
    return details;
  };

  // Group hardware items for cleaner display
  const { hardwareGroup } = groupHardwareItems(items.map(item => ({
    ...item,
    total_cost: item.price,
    calculatedPrice: item.price
  })));

  // Flatten hardware items
  const filteredHardwareItems = hardwareGroup ? filterMeaningfulHardwareItems(hardwareGroup.items) : [];
  
  // Non-hardware items
  const nonHardwareItems = items.filter(item => 
    !item.category?.includes('hardware') && 
    item.category !== 'hardware_accessory'
  );

  // Calculate totals - all items included (no exclusion feature)
  const adjustedTotalCost = items.reduce((sum, item) => sum + item.price, 0);
  
  // Calculate quote price with per-item markups
  const adjustedQuotePrice = items.reduce((sum, item) => {
    return sum + getItemSellingPrice(item);
  }, 0);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-muted/30 px-2 sm:px-3 py-2 border-b border-border">
        <h3 className="text-xs sm:text-sm font-semibold text-foreground">Quote Summary</h3>
      </div>

      {/* Table with horizontal scroll for mobile */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[280px]">
          <thead className="bg-muted/20 text-xs text-muted-foreground">
            <tr>
              <th className="text-left px-2 sm:px-3 py-2 font-medium text-xs sm:text-sm">Item</th>
              <th className="text-left px-2 sm:px-3 py-2 font-medium text-xs sm:text-sm hidden sm:table-cell">Details</th>
              <th className="text-right px-2 sm:px-3 py-2 font-medium text-xs sm:text-sm">Price</th>
            </tr>
          </thead>
        <tbody>
          {/* Non-hardware items first */}
          {nonHardwareItems.map((item, index) => {
            const sellingPrice = getItemSellingPrice(item);
            const displayDetails = canViewCosts 
              ? item.details 
              : extractQuantityOnly(item.details);
            
            return (
              <tr 
                key={`item-${index}`} 
                className="border-b border-border/50"
              >
                <td className="px-2 sm:px-3 py-2 font-medium text-foreground text-xs sm:text-sm">
                  {item.name}
                  {index === 0 && selectedColor && (
                    <span className="ml-2 text-xs text-muted-foreground capitalize">({selectedColor})</span>
                  )}
                  {/* Mobile: show details below item name */}
                  {displayDetails && (
                    <span className="sm:hidden block text-muted-foreground font-normal text-xs mt-0.5">
                      {displayDetails}
                    </span>
                  )}
                </td>
                <td className="px-2 sm:px-3 py-2 text-muted-foreground text-xs sm:text-sm hidden sm:table-cell">
                  {displayDetails || (item.quantity && item.unitPrice ? `${item.quantity} × ${formatPrice(item.unitPrice)}` : '')}
                </td>
                <td className="px-2 sm:px-3 py-2 text-right tabular-nums font-medium text-foreground text-xs sm:text-sm">
                  {sellingPrice > 0 ? formatPrice(sellingPrice) : (
                    <span className="text-muted-foreground font-normal">Included</span>
                  )}
                </td>
              </tr>
            );
          })}

          {/* Hardware items (flattened) - use per-item markup for consistency */}
          {filteredHardwareItems.map((item: any, index: number) => {
            // ✅ CRITICAL: Use getItemSellingPrice for consistent per-item markup handling
            // Hardware items should respect item.markupPercentage or item.sellingPrice if provided
            const itemForPricing: QuoteSummaryItem = {
              name: item.name || '',
              price: item.total_cost || item.price || 0,
              category: item.category || 'hardware',
              markupPercentage: item.markupPercentage,
              sellingPrice: item.sellingPrice
            };
            const sellingPrice = getItemSellingPrice(itemForPricing);
            const displayDetails = canViewCosts
              ? (item.quantity && item.unit_price ? `${item.quantity} × ${formatPrice(item.unit_price)}` : '')
              : (item.quantity ? `${item.quantity}` : '');
            
            return (
              <tr 
                key={`hw-${index}`} 
                className="border-b border-border/50"
              >
                <td className="px-2 sm:px-3 py-2 font-medium text-foreground text-xs sm:text-sm">
                  {item.name}
                  {/* Mobile: show details below item name */}
                  {displayDetails && (
                    <span className="sm:hidden block text-muted-foreground font-normal text-xs mt-0.5">
                      {displayDetails}
                    </span>
                  )}
                </td>
                <td className="px-2 sm:px-3 py-2 text-muted-foreground text-xs sm:text-sm hidden sm:table-cell">
                  {displayDetails}
                </td>
                <td className="px-2 sm:px-3 py-2 text-right tabular-nums font-medium text-foreground text-xs sm:text-sm">
                  {sellingPrice > 0 ? formatPrice(sellingPrice) : (
                    <span className="text-muted-foreground font-normal">Included</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          {/* Cost Total - Only for authorized users */}
          {canViewCosts && (
            <tr className="border-t border-border bg-muted/10">
              <td className="px-2 sm:px-3 py-2 text-muted-foreground font-medium text-xs sm:text-sm">Cost Total</td>
              <td className="hidden sm:table-cell"></td>
              <td className="px-2 sm:px-3 py-2 text-right font-semibold text-muted-foreground tabular-nums text-xs sm:text-sm">
                {formatPrice(adjustedTotalCost)}
              </td>
            </tr>
          )}
          {/* Quote Price - Always visible */}
          <tr className="bg-emerald-50 dark:bg-emerald-950/30">
            <td className="px-2 sm:px-3 py-2 sm:py-2.5 font-bold text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm">
              Quote Price
              {canViewMarkup && markupPercentage > 0 && (
                <span className="ml-1 sm:ml-2 text-xs font-normal text-muted-foreground">({markupPercentage}%)</span>
              )}
            </td>
            <td className="hidden sm:table-cell"></td>
            <td className="px-2 sm:px-3 py-2 sm:py-2.5 text-right font-bold text-emerald-700 dark:text-emerald-400 text-sm sm:text-lg tabular-nums">
              {formatPrice(adjustedQuotePrice)}
            </td>
          </tr>
        </tfoot>
        </table>
      </div>
    </div>
  );
};

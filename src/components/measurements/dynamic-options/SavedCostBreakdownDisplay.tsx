/**
 * SavedCostBreakdownDisplay - Unified Spreadsheet-Style Cost Summary
 * ===================================================================
 * Clean table-based layout for ALL treatment types.
 * No icons, just clarity. Professional spreadsheet appearance.
 * 
 * Features:
 * - Per-item markup support (manufacturing uses specific markup)
 * - Clear math display with "= result"
 * - Permission-safe: dealers see selling prices only
 */

import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { getCurrencySymbol } from "@/utils/formatCurrency";
import { applyMarkup, resolveMarkup } from "@/utils/pricing/markupResolver";
import type { MarkupSettings } from "@/hooks/useMarkupSettings";
import { groupHardwareItems, filterMeaningfulHardwareItems } from "@/utils/quotes/groupHardwareItems";
import { isRomanBlindType, isBlindType } from "@/utils/treatmentTypeUtils";

interface CostBreakdownItem {
  id: string;
  name: string;
  total_cost: number;
  category: string;
  quantity?: number;
  unit?: string;
  unit_price?: number;
  pricing_method?: string;
  uses_pricing_grid?: boolean;
  uses_leftover?: boolean;
  horizontal_pieces_needed?: number;
  pieces_charged?: number;
  description?: string;
  // ✅ Markup sources for proper hierarchy resolution
  markup_percentage?: number;      // Product-level markup
  pricing_grid_markup?: number;    // Grid-level markup
  implied_markup?: number;         // Implied from cost_price vs selling_price
  // ✅ CRITICAL: Display data for consistent rendering
  display_formula?: string;        // Pre-built formula string (e.g., "4.51m × £26.50/m = £119.52")
  pricing_method_label?: string;   // e.g., "Per Linear Meter", "Per Square Meter"
  quantity_display?: string;       // e.g., "4.51m", "2.5 sqm", "2 panels"
}

interface SavedCostBreakdownDisplayProps {
  costBreakdown: CostBreakdownItem[];
  totalCost: number;
  templateName?: string;
  treatmentCategory?: string;
  selectedColor?: string;
  canViewCosts?: boolean;
  canViewMarkup?: boolean;
  markupSettings?: MarkupSettings | null;
}

export const SavedCostBreakdownDisplay = ({
  costBreakdown,
  totalCost,
  templateName,
  treatmentCategory,
  selectedColor,
  canViewCosts = true,
  canViewMarkup = true,
  markupSettings
}: SavedCostBreakdownDisplayProps) => {
  const { units } = useMeasurementUnits();
  
  const formatPrice = (price: number) => {
    const symbol = getCurrencySymbol(units.currency);
    return `${symbol}${price.toFixed(2)}`;
  };

  const markupPercentage = markupSettings?.default_markup_percentage || 0;
  const quotePrice = markupPercentage > 0 ? applyMarkup(totalCost, markupPercentage) : totalCost;

  // ✅ RESOLVE CATEGORY-SPECIFIC MARKUPS - Match CostCalculationSummary behavior
  const isRomanTreatment = isRomanBlindType(treatmentCategory) || isRomanBlindType(templateName);
  const isBlindTreatment = isBlindType(treatmentCategory) || isBlindType(templateName);

  // Get fabric item to extract saved markup sources
  const fabricItem = costBreakdown.find(item => item.category === 'fabric');

  // ✅ Fabric markup - CRITICAL: Use saved markup sources for proper hierarchy
  // Hierarchy: Product → Implied (library pricing) → Grid → Category → Global
  const fabricMarkupResult = resolveMarkup({
    productMarkup: fabricItem?.markup_percentage,
    impliedMarkup: fabricItem?.implied_markup,
    gridMarkup: fabricItem?.pricing_grid_markup,
    category: treatmentCategory || 'curtains',
    markupSettings: markupSettings || undefined
  });
  const fabricMarkupPercent = fabricMarkupResult.percentage;

  // Lining markup - specific category
  const liningMarkupResult = resolveMarkup({
    category: 'lining',
    markupSettings: markupSettings || undefined
  });
  const liningMarkupPercent = liningMarkupResult.percentage;

  // Manufacturing markup - treatment-specific making category
  const mfgMarkupKey = isRomanTreatment ? 'roman_making' : isBlindTreatment ? 'blind_making' : 'curtain_making';
  const mfgMarkupResult = resolveMarkup({
    category: mfgMarkupKey,
    markupSettings: markupSettings || undefined
  });
  const mfgMarkupPercent = mfgMarkupResult.percentage;

  // Heading markup - specific category
  const headingMarkupResult = resolveMarkup({
    category: 'heading',
    markupSettings: markupSettings || undefined
  });
  const headingMarkupPercent = headingMarkupResult.percentage;

  // Hardware markup - specific category
  const hardwareMarkupResult = resolveMarkup({
    category: 'hardware',
    markupSettings: markupSettings || undefined
  });
  const hardwareMarkupPercent = hardwareMarkupResult.percentage;

  /**
   * Get selling price for an item based on its category
   * ✅ CRITICAL: Match CostCalculationSummary's per-category markup resolution
   */
  const getSellingPrice = (costPrice: number, category: string) => {
    let markup = markupPercentage; // Default fallback

    switch (category) {
      case 'fabric':
        markup = fabricMarkupPercent;
        break;
      case 'lining':
        markup = liningMarkupPercent;
        break;
      case 'manufacturing':
        markup = mfgMarkupPercent;
        break;
      case 'heading':
        markup = headingMarkupPercent;
        break;
      case 'hardware':
      case 'hardware_accessory':
        markup = hardwareMarkupPercent;
        break;
      default:
        // For options and other categories, resolve dynamically
        const optionMarkupResult = resolveMarkup({
          category: category,
          markupSettings: markupSettings || undefined
        });
        markup = optionMarkupResult.percentage;
    }

    return markup > 0 ? applyMarkup(costPrice, markup) : costPrice;
  };

  /**
   * Extract quantity-only from details for dealers (hide cost prices)
   */
  const extractQuantityOnly = (details: string): string => {
    if (!details) return '';
    const parts = details.split('×');
    if (parts.length >= 2) {
      const left = parts[0].trim();
      const right = parts[1].split('=')[0].trim();
      if (left.match(/^[£$€₹]/)) return right;
      return left;
    }
    if (details.match(/^\d+\.?\d*\s*(sqm|m|cm|drops?|panels?)$/i)) return details;
    return details;
  };

  // Group breakdown by category (fabricItem already defined above for markup resolution)
  const manufacturingItem = costBreakdown.find(item => item.category === 'manufacturing');
  const liningItem = costBreakdown.find(item => item.category === 'lining');
  const headingItem = costBreakdown.find(item => item.category === 'heading');

  // Deduplicate options - saved cost_breakdown can accumulate duplicates over edit cycles
  const seenKeys = new Set<string>();
  const deduplicatedBreakdown = costBreakdown.filter(item => {
    if (item.category !== 'option' && item.category !== 'hardware' && item.category !== 'hardware_accessory') {
      return true; // Keep all non-option/hardware items
    }
    const key = item.name || item.id;
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });

  // Group hardware items
  const allHardwareAndOptions = deduplicatedBreakdown.filter(item =>
    item.category === 'hardware' ||
    item.category === 'hardware_accessory' ||
    item.category === 'option'
  );
  const { hardwareGroup, otherItems: nonHardwareOptions } = groupHardwareItems(allHardwareAndOptions);
  const filteredHardwareItems = hardwareGroup ? filterMeaningfulHardwareItems(hardwareGroup.items) : [];

  // Build rows for display with clear math: "qty × price = total"
  // ✅ CRITICAL: Use saved display_formula if available for consistent rendering
  const buildDetailsString = (item: CostBreakdownItem, showCosts = true): string => {
    // Priority 1: Use saved display_formula (ensures consistency with live view)
    if (item.display_formula && showCosts) {
      return item.display_formula;
    }

    // Priority 2: Use quantity_display if available (for quantity-only display)
    if (item.quantity_display && !showCosts) {
      return item.quantity_display;
    }

    // Fallback: Build from quantity and unit_price
    if (item.quantity && item.unit_price) {
      const unit = item.unit || '';
      const qtyPart = item.quantity_display || `${item.quantity}${unit ? ` ${unit}` : ''}`;
      if (showCosts) {
        return `${qtyPart} × ${formatPrice(item.unit_price)} = ${formatPrice(item.total_cost)}`;
      }
      return qtyPart; // Dealers see quantity only
    }
    if (item.description) {
      return item.description;
    }
    return '';
  };

  // Calculate totals with per-item category-specific markup
  const calculateAdjustedQuotePrice = (): number => {
    let total = 0;
    costBreakdown.forEach(item => {
      total += getSellingPrice(item.total_cost, item.category);
    });
    return total;
  };

  const adjustedQuotePrice = calculateAdjustedQuotePrice();

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-muted/30 px-3 py-2 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Quote Summary</h3>
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead className="bg-muted/20 text-xs text-muted-foreground">
          <tr>
            <th className="text-left px-3 py-2 font-medium">Item</th>
            <th className="text-left px-3 py-2 font-medium">Details</th>
            <th className="text-right px-3 py-2 font-medium">Price</th>
          </tr>
        </thead>
        <tbody>
          {/* Fabric/Material */}
          {fabricItem && (
            <tr className="border-b border-border/50">
              <td className="px-3 py-2 font-medium text-foreground">
                {fabricItem.name}
                {selectedColor && (
                  <span className="ml-2 text-xs text-muted-foreground capitalize">({selectedColor})</span>
                )}
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                {buildDetailsString(fabricItem, canViewCosts)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums font-medium text-foreground">
                {formatPrice(getSellingPrice(fabricItem.total_cost, 'fabric'))}
              </td>
            </tr>
          )}

          {/* Lining */}
          {liningItem && liningItem.total_cost > 0 && (
            <tr className="border-b border-border/50">
              <td className="px-3 py-2 font-medium text-foreground">{liningItem.name}</td>
              <td className="px-3 py-2 text-muted-foreground">
                {buildDetailsString(liningItem, canViewCosts)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums font-medium text-foreground">
                {formatPrice(getSellingPrice(liningItem.total_cost, 'lining'))}
              </td>
            </tr>
          )}

          {/* Manufacturing - with per-item markup */}
          {manufacturingItem && manufacturingItem.total_cost > 0 && (
            <tr className="border-b border-border/50">
              <td className="px-3 py-2 font-medium text-foreground">Manufacturing</td>
              <td className="px-3 py-2 text-muted-foreground">
                {buildDetailsString(manufacturingItem, canViewCosts)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums font-medium text-foreground">
                {formatPrice(getSellingPrice(manufacturingItem.total_cost, 'manufacturing'))}
              </td>
            </tr>
          )}

          {/* Heading */}
          {headingItem && headingItem.total_cost > 0 && (
            <tr className="border-b border-border/50">
              <td className="px-3 py-2 font-medium text-foreground">{headingItem.name}</td>
              <td className="px-3 py-2 text-muted-foreground">
                {buildDetailsString(headingItem, canViewCosts)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums font-medium text-foreground">
                {formatPrice(getSellingPrice(headingItem.total_cost, 'heading'))}
              </td>
            </tr>
          )}

          {/* Hardware items (flattened) */}
          {filteredHardwareItems.map((item: any, index: number) => {
            const details = canViewCosts
              ? (item.quantity && item.unit_price ? `${item.quantity} × ${formatPrice(item.unit_price)}` : '')
              : (item.quantity ? `${item.quantity}` : '');

            return (
              <tr key={`hw-${index}`} className="border-b border-border/50">
                <td className="px-3 py-2 font-medium text-foreground">{item.name}</td>
                <td className="px-3 py-2 text-muted-foreground">{details}</td>
                <td className="px-3 py-2 text-right tabular-nums font-medium text-foreground">
                  {(item.total_cost || 0) > 0 ? formatPrice(getSellingPrice(item.total_cost || 0, item.category || 'hardware')) : (
                    <span className="text-muted-foreground font-normal">Included</span>
                  )}
                </td>
              </tr>
            );
          })}

          {/* Non-hardware options */}
          {nonHardwareOptions
            .filter(item => item.category === 'option')
            .map((option, index) => (
              <tr key={`opt-${index}`} className="border-b border-border/50">
                <td className="px-3 py-2 font-medium text-foreground">{option.name}</td>
                <td className="px-3 py-2 text-muted-foreground">
                  {buildDetailsString(option as CostBreakdownItem, canViewCosts)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums font-medium text-foreground">
                  {(option.total_cost || 0) > 0 ? formatPrice(getSellingPrice(option.total_cost || 0, option.category || 'option')) : (
                    <span className="text-muted-foreground font-normal">Included</span>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
        <tfoot>
          {/* Cost Total - Only for authorized users */}
          {canViewCosts && (
            <tr className="border-t border-border bg-muted/10">
              <td colSpan={2} className="px-3 py-2 text-muted-foreground font-medium">Cost Total</td>
              <td className="px-3 py-2 text-right font-semibold text-muted-foreground tabular-nums">
                {formatPrice(totalCost)}
              </td>
            </tr>
          )}
          {/* Quote Price - Always visible */}
          <tr className="bg-emerald-50 dark:bg-emerald-950/30">
            <td colSpan={2} className="px-3 py-2.5 font-bold text-emerald-700 dark:text-emerald-400">
              Quote Price
              {canViewMarkup && markupPercentage > 0 && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">({markupPercentage}% markup)</span>
              )}
            </td>
            <td className="px-3 py-2.5 text-right font-bold text-emerald-700 dark:text-emerald-400 text-lg tabular-nums">
              {formatPrice(adjustedQuotePrice)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

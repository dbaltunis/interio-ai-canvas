/**
 * SavedCostBreakdownDisplay - Unified Spreadsheet-Style Cost Summary
 * ===================================================================
 * Clean table-based layout for ALL treatment types.
 * No icons, just clarity. Professional spreadsheet appearance.
 */

import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { getCurrencySymbol } from "@/utils/formatCurrency";
import { applyMarkup } from "@/utils/pricing/markupResolver";
import type { MarkupSettings } from "@/hooks/useMarkupSettings";
import { groupHardwareItems, filterMeaningfulHardwareItems, getGroupName } from "@/utils/quotes/groupHardwareItems";

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

  const getSellingPrice = (costPrice: number) => {
    return markupPercentage > 0 ? applyMarkup(costPrice, markupPercentage) : costPrice;
  };

  // Group breakdown by category
  const fabricItem = costBreakdown.find(item => item.category === 'fabric');
  const manufacturingItem = costBreakdown.find(item => item.category === 'manufacturing');
  const liningItem = costBreakdown.find(item => item.category === 'lining');
  const headingItem = costBreakdown.find(item => item.category === 'heading');
  
  // Group hardware items
  const allHardwareAndOptions = costBreakdown.filter(item => 
    item.category === 'hardware' || 
    item.category === 'hardware_accessory' ||
    item.category === 'option'
  );
  const { hardwareGroup, otherItems: nonHardwareOptions } = groupHardwareItems(allHardwareAndOptions);
  const filteredHardwareItems = hardwareGroup ? filterMeaningfulHardwareItems(hardwareGroup.items) : [];

  // Build rows for display
  const buildDetailsString = (item: CostBreakdownItem): string => {
    if (item.quantity && item.unit_price) {
      const unit = item.unit || '';
      return `${item.quantity}${unit ? ` ${unit}` : ''} × ${formatPrice(item.unit_price)}`;
    }
    if (item.description) {
      return item.description;
    }
    return '';
  };

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
              <td className="px-3 py-2 text-muted-foreground">{buildDetailsString(fabricItem)}</td>
              <td className="px-3 py-2 text-right tabular-nums font-medium text-foreground">
                {formatPrice(getSellingPrice(fabricItem.total_cost))}
              </td>
            </tr>
          )}

          {/* Lining */}
          {liningItem && liningItem.total_cost > 0 && (
            <tr className="border-b border-border/50">
              <td className="px-3 py-2 font-medium text-foreground">{liningItem.name}</td>
              <td className="px-3 py-2 text-muted-foreground">{buildDetailsString(liningItem)}</td>
              <td className="px-3 py-2 text-right tabular-nums font-medium text-foreground">
                {formatPrice(getSellingPrice(liningItem.total_cost))}
              </td>
            </tr>
          )}

          {/* Manufacturing */}
          {manufacturingItem && manufacturingItem.total_cost > 0 && (
            <tr className="border-b border-border/50">
              <td className="px-3 py-2 font-medium text-foreground">Manufacturing</td>
              <td className="px-3 py-2 text-muted-foreground">{buildDetailsString(manufacturingItem)}</td>
              <td className="px-3 py-2 text-right tabular-nums font-medium text-foreground">
                {formatPrice(getSellingPrice(manufacturingItem.total_cost))}
              </td>
            </tr>
          )}

          {/* Heading */}
          {headingItem && headingItem.total_cost > 0 && (
            <tr className="border-b border-border/50">
              <td className="px-3 py-2 font-medium text-foreground">{headingItem.name}</td>
              <td className="px-3 py-2 text-muted-foreground">{buildDetailsString(headingItem)}</td>
              <td className="px-3 py-2 text-right tabular-nums font-medium text-foreground">
                {formatPrice(getSellingPrice(headingItem.total_cost))}
              </td>
            </tr>
          )}

          {/* Hardware items (flattened) */}
          {filteredHardwareItems.map((item: any, index: number) => (
            <tr key={`hw-${index}`} className="border-b border-border/50">
              <td className="px-3 py-2 font-medium text-foreground">{item.name}</td>
              <td className="px-3 py-2 text-muted-foreground">
                {item.quantity && item.unit_price ? `${item.quantity} × ${formatPrice(item.unit_price)}` : ''}
              </td>
              <td className="px-3 py-2 text-right tabular-nums font-medium text-foreground">
                {(item.total_cost || 0) > 0 ? formatPrice(getSellingPrice(item.total_cost || 0)) : (
                  <span className="text-muted-foreground font-normal">Included</span>
                )}
              </td>
            </tr>
          ))}

          {/* Non-hardware options */}
          {nonHardwareOptions
            .filter(item => item.category === 'option')
            .map((option, index) => (
              <tr key={`opt-${index}`} className="border-b border-border/50">
                <td className="px-3 py-2 font-medium text-foreground">{option.name}</td>
                <td className="px-3 py-2 text-muted-foreground">{buildDetailsString(option as CostBreakdownItem)}</td>
                <td className="px-3 py-2 text-right tabular-nums font-medium text-foreground">
                  {(option.total_cost || 0) > 0 ? formatPrice(getSellingPrice(option.total_cost || 0)) : (
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
              {formatPrice(quotePrice)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

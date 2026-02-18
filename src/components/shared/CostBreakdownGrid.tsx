import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, getCurrencySymbol } from "@/utils/formatCurrency";
import { getPricingMethodSuffix } from "@/utils/pricingMethodLabels";

export interface CostBreakdownItem {
  id: string;
  name: string;
  description?: string;
  quantity?: number;
  unit?: string;
  unit_price?: number;
  total_cost: number;
  category?: string;
  isIncluded?: boolean;
  // Pricing method metadata for enhanced display
  pricing_method?: string;
  widths_required?: number;
  drops_per_width?: number;
  grid_dimensions?: string;
  uses_pricing_grid?: boolean;
  pricing_method_label?: string;
  quantity_display?: string;
  display_formula?: string;
}

interface CostBreakdownGridProps {
  items: CostBreakdownItem[];
  totalCost: number;
  currency?: string;
  showQuotePrice?: boolean;
  quotePrice?: number;
  markupPercentage?: number;
  title?: string;
  className?: string;
}

export function CostBreakdownGrid({
  items,
  totalCost,
  currency = "USD",
  showQuotePrice = false,
  quotePrice,
  markupPercentage,
  title = "Cost Breakdown",
  className = "",
}: CostBreakdownGridProps) {
  const symbol = getCurrencySymbol(currency);

  const formatPrice = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return "—";
    return `${symbol}${amount.toFixed(2)}`;
  };

  const formatQuantity = (qty?: number, unit?: string) => {
    if (!qty) return "—";
    const formattedQty = Number.isInteger(qty) ? qty.toString() : qty.toFixed(2);
    return unit ? `${formattedQty} ${unit}` : formattedQty;
  };

  /** Build a method-aware unit price string */
  const formatUnitPriceEnhanced = (item: CostBreakdownItem) => {
    const { unit_price, pricing_method, uses_pricing_grid } = item;

    if (uses_pricing_grid) {
      if (!unit_price) return "Grid Price";
      return `${symbol}${unit_price.toFixed(2)} (Grid)`;
    }

    if (!unit_price) return "—";

    // Use the pricing method suffix when available
    if (pricing_method) {
      const suffix = getPricingMethodSuffix(pricing_method);
      if (suffix) return `${symbol}${unit_price.toFixed(2)}${suffix}`;
    }

    // Fallback to unit-based suffix
    const unit = item.unit;
    if (unit) return `${symbol}${unit_price.toFixed(2)}/${unit}`;
    return `${symbol}${unit_price.toFixed(2)}`;
  };

  /** Build a method-aware quantity string with optional sub-detail */
  const renderQuantityCell = (item: CostBreakdownItem) => {
    // Use pre-computed quantity_display if available
    if (item.quantity_display) {
      return (
        <div>
          <div>{item.quantity_display}</div>
          {item.widths_required && item.widths_required > 1 && (
            <div className="text-xs text-muted-foreground">({item.widths_required} widths)</div>
          )}
        </div>
      );
    }

    if (item.uses_pricing_grid) {
      return (
        <div>
          <div>{item.quantity ?? 1} unit{(item.quantity ?? 1) !== 1 ? 's' : ''}</div>
          {item.grid_dimensions && (
            <div className="text-xs text-muted-foreground">{item.grid_dimensions}</div>
          )}
        </div>
      );
    }

    const qty = item.quantity;
    if (!qty) return <div>—</div>;

    const formattedQty = Number.isInteger(qty) ? qty.toString() : qty.toFixed(2);
    const mainText = item.unit ? `${formattedQty} ${item.unit}` : formattedQty;

    return (
      <div>
        <div>{mainText}</div>
        {item.widths_required && item.widths_required > 1 && (
          <div className="text-xs text-muted-foreground">({item.widths_required} widths)</div>
        )}
      </div>
    );
  };

  // Filter out items with 0 cost unless they're marked as "included"
  const visibleItems = items.filter(
    (item) => item.total_cost > 0 || item.isIncluded
  );

  if (visibleItems.length === 0) {
    return (
      <div className={`text-sm text-muted-foreground p-4 ${className}`}>
        No cost items to display.
      </div>
    );
  }

  return (
    <div className={`rounded-lg border bg-card overflow-hidden ${className}`}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold text-foreground">Item</TableHead>
            <TableHead className="font-semibold text-foreground text-right w-24">Qty</TableHead>
            <TableHead className="font-semibold text-foreground text-right w-28">Unit Price</TableHead>
            <TableHead className="font-semibold text-foreground text-right w-28">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleItems.map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/30">
              <TableCell className="py-2.5">
                <div className="font-medium text-foreground">{item.name}</div>
                {item.description && (
                  <div className="text-xs text-muted-foreground mt-0.5 max-w-[200px] truncate">
                    {item.description}
                  </div>
                )}
                {item.pricing_method_label && (
                  <div className="text-xs text-muted-foreground/70 mt-0.5">
                    {item.pricing_method_label}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right text-muted-foreground py-2.5 align-top">
                {renderQuantityCell(item)}
              </TableCell>
              <TableCell className="text-right text-muted-foreground py-2.5 align-top">
                {formatUnitPriceEnhanced(item)}
              </TableCell>
              <TableCell className="text-right font-semibold text-foreground py-2.5 align-top">
                {item.isIncluded && item.total_cost === 0 ? (
                  <span className="text-muted-foreground font-normal">Included</span>
                ) : (
                  formatPrice(item.total_cost)
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableCell colSpan={3} className="font-bold text-foreground">
              Subtotal
            </TableCell>
            <TableCell className="text-right font-bold text-lg text-primary">
              {formatPrice(totalCost)}
            </TableCell>
          </TableRow>
          {showQuotePrice && quotePrice !== undefined && markupPercentage !== undefined && (
            <TableRow className="bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/20">
              <TableCell colSpan={3} className="font-bold text-emerald-700 dark:text-emerald-400">
                <div className="flex items-center gap-2">
                  <span>Quote Price</span>
                  <span className="text-xs font-normal text-emerald-600 dark:text-emerald-500">
                    ({markupPercentage}% markup)
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right font-bold text-lg text-emerald-700 dark:text-emerald-400">
                {formatPrice(quotePrice)}
              </TableCell>
            </TableRow>
          )}
        </TableFooter>
      </Table>
    </div>
  );
}

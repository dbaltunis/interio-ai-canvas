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

export interface CostBreakdownItem {
  id: string;
  name: string;
  description?: string;
  quantity?: number;
  unit?: string;
  unit_price?: number;
  total_cost: number;
  category?: string;
  isIncluded?: boolean; // For "Included" items with $0 price
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

  const formatUnitPrice = (unitPrice?: number, unit?: string) => {
    if (!unitPrice) return "—";
    const priceStr = `${symbol}${unitPrice.toFixed(2)}`;
    return unit ? `${priceStr}/${unit}` : priceStr;
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
              </TableCell>
              <TableCell className="text-right text-muted-foreground py-2.5">
                {formatQuantity(item.quantity, item.unit)}
              </TableCell>
              <TableCell className="text-right text-muted-foreground py-2.5">
                {formatUnitPrice(item.unit_price, item.unit)}
              </TableCell>
              <TableCell className="text-right font-semibold text-foreground py-2.5">
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

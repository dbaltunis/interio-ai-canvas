import React from "react";
import { useFormattedCurrency } from "@/hooks/useFormattedCurrency";
import type { ClientBreakdownItem } from "@/utils/quotes/buildClientBreakdown";

interface QuoteItemBreakdownProps {
  breakdown: ClientBreakdownItem[];
}

const QuoteItemBreakdown: React.FC<QuoteItemBreakdownProps> = ({ breakdown }) => {
  const { formatCurrency } = useFormattedCurrency();

  if (!Array.isArray(breakdown) || breakdown.length === 0) return null;

  return (
    <div className="mt-2 space-y-1">
      {breakdown.map((item, idx) => (
        <div key={item.id || `${item.category || 'row'}-${idx}`} className="flex items-start justify-between text-sm">
          <div className="pr-2">
            <div className="font-medium text-foreground">{item.name || item.category || 'Item'}</div>
            {item.description && (
              <div className="text-xs text-muted-foreground">{item.description}</div>
            )}
            {(item.quantity || item.unit_price) && (
              <div className="text-xs text-muted-foreground">
                {item.quantity ? `${Number(item.quantity).toFixed(2)}${item.unit ? ` ${item.unit}` : ''}` : ''}
                {item.quantity && item.unit_price ? ' × ' : ''}
                {item.unit_price ? formatCurrency(Number(item.unit_price)) : ''}
              </div>
            )}
          </div>
          <div className="text-right font-medium">{formatCurrency(Number(item.total_cost) || 0)}</div>
        </div>
      ))}
    </div>
  );
};

export default QuoteItemBreakdown;

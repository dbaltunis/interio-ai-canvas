import React from "react";
import { useFormattedCurrency } from "@/hooks/useFormattedCurrency";
import { ProductImageWithColorFallback } from "@/components/ui/ProductImageWithColorFallback";
import type { ClientBreakdownItem } from "@/utils/quotes/buildClientBreakdown";

interface QuoteItemBreakdownProps {
  breakdown: ClientBreakdownItem[];
  showImages?: boolean;
}

const QuoteItemBreakdown: React.FC<QuoteItemBreakdownProps> = ({ breakdown, showImages = false }) => {
  const { formatCurrency } = useFormattedCurrency();

  if (!Array.isArray(breakdown) || breakdown.length === 0) return null;

  return (
    <div className="mt-2 space-y-1">
      {breakdown.map((item, idx) => {
        const itemCost = Number(item.total_cost) || 0;
        
        return (
          <div key={item.id || `${item.category || 'row'}-${idx}`} className="flex items-start justify-between text-sm gap-2">
            {/* Optional image/color swatch */}
            {showImages && (
              <ProductImageWithColorFallback
                imageUrl={item.image_url}
                color={item.color}
                productName={item.name || 'Item'}
                category={item.category}
                size={32}
                rounded="sm"
              />
            )}
            <div className="flex-1 pr-2">
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
            <div className="text-right font-medium">
              {itemCost > 0 ? formatCurrency(itemCost) : <span className="text-muted-foreground text-sm">Included</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuoteItemBreakdown;

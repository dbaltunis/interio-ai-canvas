import React from "react";
import { useFormattedCurrency } from "@/hooks/useFormattedCurrency";
import { ProductImageWithColorFallback } from "@/components/ui/ProductImageWithColorFallback";
import type { ClientBreakdownItem } from "@/utils/quotes/buildClientBreakdown";
import { useMarkupSettings } from "@/hooks/useMarkupSettings";
import { resolveMarkup, applyMarkup } from "@/utils/pricing/markupResolver";

interface QuoteItemBreakdownProps {
  breakdown: ClientBreakdownItem[];
  showImages?: boolean;
  treatmentCategory?: string;
}

const QuoteItemBreakdown: React.FC<QuoteItemBreakdownProps> = ({ 
  breakdown, 
  showImages = false,
  treatmentCategory 
}) => {
  const { formatCurrency } = useFormattedCurrency();
  const { data: markupSettings } = useMarkupSettings();

  if (!Array.isArray(breakdown) || breakdown.length === 0) return null;

  // Helper to get selling price (cost + markup) for an item
  const getSellingPrice = (costPrice: number, category?: string) => {
    if (!markupSettings || costPrice <= 0) return costPrice;
    
    const markupResult = resolveMarkup({
      category: treatmentCategory || category,
      subcategory: category,
      markupSettings
    });
    
    return applyMarkup(costPrice, markupResult.percentage);
  };

  return (
    <div className="mt-2 space-y-1">
      {breakdown.map((item, idx) => {
        // CRITICAL: Display SELLING prices (with markup), not cost prices
        const costPrice = Number(item.total_cost) || 0;
        const unitCost = Number(item.unit_price) || 0;
        const sellingPrice = getSellingPrice(costPrice, item.category);
        const sellingUnitPrice = getSellingPrice(unitCost, item.category);
        
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
              {(item.quantity || unitCost > 0) && (
                <div className="text-xs text-muted-foreground">
                  {item.quantity ? `${Number(item.quantity).toFixed(2)}${item.unit ? ` ${item.unit}` : ''}` : ''}
                  {item.quantity && unitCost > 0 ? ' × ' : ''}
                  {unitCost > 0 ? formatCurrency(sellingUnitPrice) : ''}
                </div>
              )}
            </div>
            <div className="text-right font-medium">
              {sellingPrice > 0 ? formatCurrency(sellingPrice) : <span className="text-muted-foreground text-sm">Included</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuoteItemBreakdown;

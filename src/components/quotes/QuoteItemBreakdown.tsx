import React from "react";
import { useFormattedCurrency } from "@/hooks/useFormattedCurrency";
import { ProductImageWithColorFallback } from "@/components/ui/ProductImageWithColorFallback";
import type { ClientBreakdownItem } from "@/utils/quotes/buildClientBreakdown";

interface QuoteItemBreakdownProps {
  breakdown: ClientBreakdownItem[];
  showImages?: boolean;
  treatmentCategory?: string;
}

/**
 * Displays breakdown items with selling prices (markup already applied at source)
 * Enhanced to show hardware accessories as indented sub-items with quantity details
 */
const QuoteItemBreakdown: React.FC<QuoteItemBreakdownProps> = ({ 
  breakdown, 
  showImages = false,
  treatmentCategory 
}) => {
  const { formatCurrency } = useFormattedCurrency();

  if (!Array.isArray(breakdown) || breakdown.length === 0) return null;

  return (
    <div className="mt-2 space-y-1">
      {breakdown.map((item, idx) => {
        // Prices already include markup from buildClientBreakdown/useQuotationSync
        const totalPrice = Number(item.total_cost) || 0;
        const unitPrice = Number(item.unit_price) || 0;
        const quantity = Number(item.quantity) || 0;
        
        // Check if this is a hardware accessory item (indented sub-item)
        const isAccessory = item.category === 'hardware_accessory';
        // Check for pricing details text (e.g., "1 per 10cm")
        const pricingDetails = item.pricingDetails || '';
        
        // For accessories, create detailed description from quantity and unit price
        const accessoryDescription = isAccessory && quantity > 1 && unitPrice > 0
          ? `${quantity} × ${formatCurrency(unitPrice)}${pricingDetails ? ` (${pricingDetails})` : ''}`
          : null;
        
        return (
          <div 
            key={item.id || `${item.category || 'row'}-${idx}`} 
            className={`flex items-start justify-between text-sm gap-2 ${
              isAccessory ? 'ml-4 pl-2 border-l-2 border-muted' : ''
            }`}
          >
            {/* Optional image/color swatch - skip for accessories */}
            {showImages && !isAccessory && (
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
              <div className={`${isAccessory ? 'text-muted-foreground' : 'font-medium text-foreground'}`}>
                {isAccessory ? `└ ${item.name}` : (item.name || item.category || 'Item')}
              </div>
              {/* For accessories: show quantity × unit price with pricing formula */}
              {isAccessory && accessoryDescription && (
                <div className="text-xs text-muted-foreground">
                  {accessoryDescription}
                </div>
              )}
              {/* For non-accessories: show description or pricing details */}
              {!isAccessory && (item.description || pricingDetails) && (
                <div className="text-xs text-muted-foreground">
                  {item.description !== '-' ? item.description : ''}
                  {pricingDetails && item.description !== '-' ? ' • ' : ''}
                  {pricingDetails}
                </div>
              )}
              {/* Show quantity × unit price calculation for non-accessory items with both */}
              {!isAccessory && quantity > 0 && unitPrice > 0 && (
                <div className="text-xs text-muted-foreground">
                  {quantity}{item.unit ? ` ${item.unit}` : ''} × {formatCurrency(unitPrice)}
                </div>
              )}
              {/* For items with only quantity (no unit price), show quantity with unit */}
              {!isAccessory && quantity > 0 && unitPrice === 0 && item.unit && (
                <div className="text-xs text-muted-foreground">
                  {quantity} {item.unit}
                </div>
              )}
            </div>
            <div className={`text-right ${isAccessory ? 'text-muted-foreground' : 'font-medium'}`}>
              {totalPrice > 0 ? formatCurrency(totalPrice) : <span className="text-muted-foreground text-sm">Included</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuoteItemBreakdown;

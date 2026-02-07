import React from "react";
import { useFormattedCurrency } from "@/hooks/useFormattedCurrency";
import { ProductImageWithColorFallback } from "@/components/ui/ProductImageWithColorFallback";
import type { ClientBreakdownItem } from "@/utils/quotes/buildClientBreakdown";
import { groupHardwareItems, filterMeaningfulHardwareItems, getGroupName } from "@/utils/quotes/groupHardwareItems";
import { ChevronDown } from "lucide-react";
import { getHardwareIcon } from "@/components/icons/IndustryIcons";

interface QuoteItemBreakdownProps {
  breakdown: ClientBreakdownItem[];
  showImages?: boolean;
  treatmentCategory?: string;
}

/**
 * Hardware Section Component - uses industry-specific icons
 */
const HardwareSection: React.FC<{
  items: any[];
  total: number;
  formatCurrency: (n: number) => string;
}> = ({ items, total, formatCurrency }) => {
  const groupName = getGroupName(items);
  const HardwareIconComponent = getHardwareIcon(groupName);

  return (
    <details className="py-1 group/hw">
      <summary className="flex items-center justify-between cursor-pointer list-none text-sm">
        <div className="flex items-center gap-2">
          <HardwareIconComponent className="h-3.5 w-3.5 text-primary" />
          <span className="font-medium text-foreground">{groupName || 'Hardware'}</span>
          {items.length > 1 && (
            <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform group-open/hw:rotate-180" />
          )}
        </div>
        <span className="font-medium text-foreground">
          {formatCurrency(total)}
        </span>
      </summary>
      
      {/* Hardware breakdown items - filtered to show only meaningful products */}
      <div className="ml-6 mt-1 space-y-0.5 border-l-2 border-muted pl-3">
        {items.map((item, idx) => {
          const isAccessory = item.category === 'hardware_accessory';
          const totalPrice = Number(item.total_cost) || 0;
          const unitPrice = Number(item.unit_price) || 0;
          const quantity = Number(item.quantity) || 0;
          const pricingDetails = item.pricingDetails || '';
          
          return (
            <div key={item.id || `hw-${idx}`} className="flex items-start justify-between text-xs gap-2">
              <div className="flex-1">
                <span className={isAccessory ? 'text-muted-foreground' : 'text-foreground'}>
                  {isAccessory ? `└ ${item.name}` : item.name}
                </span>
                {quantity > 0 && unitPrice > 0 && (
                  <div className="text-[10px] text-muted-foreground/70">
                    {quantity} × {formatCurrency(unitPrice)}{pricingDetails ? ` (${pricingDetails})` : ''}
                  </div>
                )}
              </div>
              <span className={`tabular-nums ${isAccessory ? 'text-muted-foreground' : 'text-foreground'}`}>
                {totalPrice > 0 ? formatCurrency(totalPrice) : <span className="text-muted-foreground">Included</span>}
              </span>
            </div>
          );
        })}
      </div>
    </details>
  );
};

/**
 * Displays breakdown items with selling prices (markup already applied at source)
 * Enhanced to group hardware into collapsible section for client-friendly display
 */
const QuoteItemBreakdown: React.FC<QuoteItemBreakdownProps> = ({ 
  breakdown, 
  showImages = false,
  treatmentCategory 
}) => {
  const { formatCurrency } = useFormattedCurrency();

  if (!Array.isArray(breakdown) || breakdown.length === 0) return null;
  
  // Group hardware items for client-friendly display
  const { hardwareGroup, otherItems } = groupHardwareItems(breakdown.map(item => ({
    ...item,
    calculatedPrice: item.total_cost
  })));
  
  // Filter out redundant parent category items (e.g., "Hardware To Test: Tracks" at £0)
  // Only show the actual end product the client is receiving
  const filteredHardwareItems = hardwareGroup 
    ? filterMeaningfulHardwareItems(hardwareGroup.items)
    : [];

  return (
    <div className="mt-2 space-y-1">
      {/* Hardware Section - Grouped with collapsible breakdown */}
      {hardwareGroup && filteredHardwareItems.length > 0 && (
        <HardwareSection 
          items={filteredHardwareItems}
          total={hardwareGroup.total}
          formatCurrency={formatCurrency}
        />
      )}
      
      {/* Non-hardware items */}
      {otherItems.map((item, idx) => {
        const totalPrice = Number(item.total_cost) || 0;
        const unitPrice = Number(item.unit_price) || 0;
        const quantity = Number(item.quantity) || 0;
        const pricingDetails = item.pricingDetails || '';
        
        return (
          <div 
            key={item.id || `${item.category || 'row'}-${idx}`} 
            className="flex items-start justify-between text-sm gap-2"
          >
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
              <div className="font-medium text-foreground">
                {item.name || item.category || 'Item'}
              </div>
              {(item.description || pricingDetails) && (
                <div className="text-xs text-muted-foreground">
                  {item.description !== '-' ? item.description : ''}
                  {pricingDetails && item.description !== '-' ? ' • ' : ''}
                  {pricingDetails}
                </div>
              )}
              {quantity > 0 && unitPrice > 0 && (
                <div className="text-xs text-muted-foreground">
                  {quantity}{item.unit ? ` ${item.unit}` : ''} × {formatCurrency(unitPrice)}
                </div>
              )}
              {quantity > 0 && unitPrice === 0 && item.unit && (
                <div className="text-xs text-muted-foreground">
                  {quantity} {item.unit}
                </div>
              )}
            </div>
            <div className="text-right font-medium">
              {totalPrice > 0 ? formatCurrency(totalPrice) : <span className="text-muted-foreground text-sm">Included</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuoteItemBreakdown;

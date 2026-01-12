/**
 * SavedCostBreakdownDisplay - Display-Only Component
 * ===================================================
 * This component ONLY displays pre-calculated values from cost_breakdown.
 * It performs ZERO calculations - all values come from the database.
 * 
 * UNIFIED QUOTE SUMMARY STYLE:
 * - Uses "Quote Summary" header for ALL users
 * - Shows actual prices for authorized users (canViewCosts = true)
 * - Shows "Included" for dealers/restricted users (canViewCosts = false)
 */

import { Calculator, Settings, Info, TrendingUp, Wrench, ChevronDown } from "lucide-react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { getCurrencySymbol } from "@/utils/formatCurrency";
import { applyMarkup } from "@/utils/pricing/markupResolver";
import type { MarkupSettings } from "@/hooks/useMarkupSettings";
import { groupHardwareItems, filterMeaningfulHardwareItems } from "@/utils/quotes/groupHardwareItems";
import { ProductImageWithColorFallback } from "@/components/ui/ProductImageWithColorFallback";

// Simple SVG icons (same as CostCalculationSummary)
const FabricSwatchIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 6 L8 8 L6 10 L8 12 L6 14 L8 16 L6 18 L18 18 L16 16 L18 14 L16 12 L18 10 L16 8 L18 6 Z" />
    <line x1="8" y1="9" x2="16" y2="9" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="8" y1="15" x2="16" y2="15" />
  </svg>
);

const AssemblyIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

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
  /** Permission flag - if false, show "Included" instead of prices */
  canViewCosts?: boolean;
  /** Permission flag - if false, hide markup percentages */
  canViewMarkup?: boolean;
  /** Markup settings for calculating quote price */
  markupSettings?: MarkupSettings | null;
}

export const SavedCostBreakdownDisplay = ({
  costBreakdown,
  totalCost,
  templateName,
  treatmentCategory,
  selectedColor,
  canViewCosts = true, // Default to true for backward compatibility
  canViewMarkup = true,
  markupSettings
}: SavedCostBreakdownDisplayProps) => {
  const { units } = useMeasurementUnits();
  
  const formatPrice = (price: number) => {
    const symbol = getCurrencySymbol(units.currency);
    return `${symbol}${price.toFixed(2)}`;
  };

  // Calculate quote price with markup
  const markupPercentage = markupSettings?.default_markup_percentage || 0;
  const quotePrice = markupPercentage > 0 ? applyMarkup(totalCost, markupPercentage) : totalCost;

  // ✅ SELLING PRICES: Calculate item selling price (cost + markup)
  const getSellingPrice = (costPrice: number) => {
    return markupPercentage > 0 ? applyMarkup(costPrice, markupPercentage) : costPrice;
  };

  // Group breakdown by category
  const fabricItem = costBreakdown.find(item => item.category === 'fabric');
  const manufacturingItem = costBreakdown.find(item => item.category === 'manufacturing');
  const optionItems = costBreakdown.filter(item => item.category === 'option' && item.total_cost > 0);
  const liningItem = costBreakdown.find(item => item.category === 'lining');
  const headingItem = costBreakdown.find(item => item.category === 'heading');
  
  // Group hardware items for client-friendly display
  const allHardwareAndOptions = costBreakdown.filter(item => 
    item.category === 'hardware' || 
    item.category === 'hardware_accessory' ||
    item.category === 'option'
  );
  const { hardwareGroup, otherItems: nonHardwareOptions } = groupHardwareItems(allHardwareAndOptions);

  // Calculate options total from saved breakdown (excluding hardware)
  const optionsTotal = nonHardwareOptions
    .filter(item => item.category === 'option' && (item.total_cost || 0) > 0)
    .reduce((sum, item) => sum + (item.total_cost || 0), 0);

  // =========================================================
  // UNIFIED QUOTE SUMMARY - Same style for ALL users
  // Shows prices for authorized users, "Included" for dealers
  // =========================================================
  return (
    <div className="bg-card border border-border rounded-lg p-3 space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <Calculator className="h-4 w-4 text-primary" />
        <h3 className="text-base font-semibold text-card-foreground">Quote Summary</h3>
      </div>

      <div className="grid gap-2 text-sm">
        {/* Fabric/Material */}
        {fabricItem && (
          <div className="flex items-center justify-between py-1.5 border-b border-border/50">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FabricSwatchIcon className="h-3.5 w-3.5 text-primary shrink-0" />
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-card-foreground font-medium">{fabricItem.name}</span>
                {selectedColor && (
                  <div className="flex items-center gap-1.5">
                    <div 
                      className="w-4 h-4 rounded-full border border-border shadow-sm" 
                      style={{ backgroundColor: selectedColor.startsWith('#') ? selectedColor : selectedColor.toLowerCase() }}
                    />
                    <span className="text-xs text-muted-foreground capitalize">{selectedColor}</span>
                  </div>
                )}
              </div>
            </div>
            <span className="font-semibold text-card-foreground ml-2">
              {formatPrice(getSellingPrice(fabricItem.total_cost))}
            </span>
          </div>
        )}

        {/* Lining */}
        {liningItem && liningItem.total_cost > 0 && (
          <div className="flex items-center justify-between py-1.5 border-b border-border/50">
            <div className="flex items-center gap-2">
              <FabricSwatchIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-card-foreground font-medium">{liningItem.name}</span>
            </div>
            <span className="font-semibold text-card-foreground ml-2">
              {formatPrice(getSellingPrice(liningItem.total_cost))}
            </span>
          </div>
        )}

        {/* Manufacturing */}
        {manufacturingItem && manufacturingItem.total_cost > 0 && (
          <div className="flex items-center justify-between py-1.5 border-b border-border/50">
            <div className="flex items-center gap-2">
              <AssemblyIcon className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-card-foreground font-medium">Manufacturing</span>
            </div>
            <span className="font-semibold text-card-foreground ml-2">
              {formatPrice(getSellingPrice(manufacturingItem.total_cost))}
            </span>
          </div>
        )}

        {/* Heading */}
        {headingItem && headingItem.total_cost > 0 && (
          <div className="flex items-center justify-between py-1.5 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Settings className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-card-foreground font-medium">{headingItem.name}</span>
            </div>
            <span className="font-semibold text-card-foreground ml-2">
              {formatPrice(getSellingPrice(headingItem.total_cost))}
            </span>
          </div>
        )}

        {/* Hardware - Grouped with collapsible breakdown and option image */}
        {hardwareGroup && filterMeaningfulHardwareItems(hardwareGroup.items).length > 0 && (
          <details className="py-1.5 border-b border-border/50 group/hw">
            <summary className="flex items-center justify-between cursor-pointer list-none">
              <div className="flex items-center gap-2">
                {/* Show option image if available (NOT hardcoded emoji) */}
                {hardwareGroup.image_url ? (
                  <ProductImageWithColorFallback
                    imageUrl={hardwareGroup.image_url}
                    productName={hardwareGroup.name}
                    size={16}
                    rounded="sm"
                    category="hardware"
                  />
                ) : (
                  <Wrench className="h-3.5 w-3.5 text-primary shrink-0" />
                )}
                <span className="text-card-foreground font-medium">{hardwareGroup.name}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform group-open/hw:rotate-180" />
              </div>
              <span className="font-semibold text-card-foreground ml-2">
                {formatPrice(getSellingPrice(hardwareGroup.total))}
              </span>
            </summary>
            
            {/* Hardware breakdown items */}
            <div className="ml-6 mt-2 space-y-1 border-l-2 border-muted pl-3">
              {filterMeaningfulHardwareItems(hardwareGroup.items).map((item, index) => {
                const isAccessory = item.category === 'hardware_accessory';
                const itemPrice = item.total_cost || 0;
                
                return (
                  <div key={index} className="flex items-start justify-between text-xs gap-2">
                    <div className="flex flex-col">
                      <span className={isAccessory ? 'text-muted-foreground' : 'text-card-foreground'}>
                        {isAccessory ? `└ ${item.name}` : item.name}
                      </span>
                      {item.quantity && item.unit_price && (
                        <span className="text-[10px] text-muted-foreground/70">
                          {item.quantity} × {formatPrice(item.unit_price)}
                        </span>
                      )}
                    </div>
                    <span className={`tabular-nums ${isAccessory ? 'text-muted-foreground' : 'font-medium text-card-foreground'}`}>
                      {itemPrice > 0 ? formatPrice(getSellingPrice(itemPrice)) : <span className="text-muted-foreground">Included</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </details>
        )}

        {/* Non-hardware Options */}
        {nonHardwareOptions.filter(item => item.category === 'option' && (item.total_cost || 0) > 0).length > 0 && (
          <div className="py-1.5 border-b border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-card-foreground font-medium">Options</span>
            </div>
            <div className="pl-6 space-y-1">
              {nonHardwareOptions
                .filter(item => item.category === 'option' && (item.total_cost || 0) > 0)
                .map((option, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">• {option.name}</span>
                    <span className="font-medium text-card-foreground">
                      {formatPrice(getSellingPrice(option.total_cost))}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Quote Price - Unified footer for all users */}
      <div className="border-t-2 border-primary/20 pt-2.5">
        {/* Cost Total - Only for authorized users */}
        {canViewCosts && (
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/50">
            <span className="text-sm font-medium text-muted-foreground">Cost Total</span>
            <span className="font-semibold text-muted-foreground">{formatPrice(totalCost)}</span>
          </div>
        )}
        
        {/* Quote Price - Always visible */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <span className="text-lg font-bold text-emerald-600">Quote Price</span>
            {canViewMarkup && markupPercentage > 0 && (
              <span className="text-xs text-muted-foreground">({markupPercentage}% markup)</span>
            )}
          </div>
          <span className="text-xl font-bold text-emerald-600">{formatPrice(quotePrice)}</span>
        </div>
      </div>

      {/* Details - Only for authorized users */}
      {canViewCosts && templateName && (
        <details className="text-xs text-muted-foreground group">
          <summary className="cursor-pointer font-medium text-card-foreground flex items-center gap-1.5 py-1.5 hover:text-primary transition-colors border-t border-border/50 pt-2">
            <Info className="h-3.5 w-3.5" />
            <span>Saved Breakdown</span>
            <span className="ml-auto text-xs group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="space-y-2 mt-3 pl-4 border-l-2 border-primary/20">
            <div className="space-y-0.5">
              <div className="text-card-foreground font-medium">Template: {templateName}</div>
              <div>Items in breakdown: {costBreakdown.length}</div>
            </div>
          </div>
        </details>
      )}
    </div>
  );
};
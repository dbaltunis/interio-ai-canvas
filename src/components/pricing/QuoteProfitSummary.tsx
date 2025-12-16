/**
 * Quote Profit Summary Component
 * Displays cost/selling/profit breakdown for authorized users
 * Collapsible with per-treatment breakdown, markup %, and discount impact
 */

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, Eye, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { formatCurrency } from '@/utils/formatCurrency';
import { useMeasurementUnits } from '@/hooks/useMeasurementUnits';
import { calculateGrossMargin, getProfitStatus } from '@/utils/pricing/markupResolver';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface QuoteItem {
  id: string;
  name: string;
  cost_price?: number;
  cost_total?: number;
  unit_price?: number;
  total?: number;
  gross_margin?: number;
}

interface DiscountInfo {
  type: 'percentage' | 'fixed';
  value: number;
  amount: number;
}

interface QuoteProfitSummaryProps {
  costTotal: number;
  sellingTotal: number;
  className?: string;
  variant?: 'card' | 'inline' | 'compact';
  showBreakdown?: boolean;
  items?: QuoteItem[];
  discount?: DiscountInfo;
}

// Calculate Markup %: (Sell - Cost) / Cost × 100
const calculateMarkup = (cost: number, sell: number): number => {
  if (cost <= 0) return sell > 0 ? 100 : 0;
  return ((sell - cost) / cost) * 100;
};

export const QuoteProfitSummary: React.FC<QuoteProfitSummaryProps> = ({
  costTotal,
  sellingTotal,
  className,
  variant = 'card',
  showBreakdown = true,
  items = [],
  discount
}) => {
  const { data: roleData, isLoading: roleLoading } = useUserRole();
  const { units } = useMeasurementUnits();
  const currency = units.currency || 'USD';
  const [isExpanded, setIsExpanded] = useState(false);

  const canViewMarkup = roleData?.canViewMarkup || false;

  // Only show to authorized users
  if (roleLoading || !canViewMarkup) {
    return null;
  }

  // Calculate values before and after discount
  // CRITICAL: sellingTotal IS the original (pre-discount) total
  // We calculate discountedSellingTotal by subtracting the discount
  const hasDiscount = discount && discount.amount > 0;
  const originalSellingTotal = sellingTotal; // This is the PRE-discount total
  const discountedSellingTotal = hasDiscount ? sellingTotal - discount.amount : sellingTotal;
  
  // Profit and margin are calculated on DISCOUNTED totals (what client actually pays)
  const profit = discountedSellingTotal - costTotal;
  const originalProfit = originalSellingTotal - costTotal;
  const profitReduction = hasDiscount ? originalProfit - profit : 0;
  
  // GP% uses discounted selling total (actual revenue received)
  const marginPercentage = calculateGrossMargin(costTotal, discountedSellingTotal);
  const originalMarginPercentage = hasDiscount ? calculateGrossMargin(costTotal, originalSellingTotal) : marginPercentage;
  
  // Markup% uses original selling total (pricing strategy)
  const markupPercentage = calculateMarkup(costTotal, discountedSellingTotal);
  const originalMarkupPercentage = hasDiscount ? calculateMarkup(costTotal, originalSellingTotal) : markupPercentage;
  
  const profitStatus = getProfitStatus(marginPercentage);
  const originalProfitStatus = getProfitStatus(originalMarginPercentage);

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2 text-sm", className)}>
        <span className="text-muted-foreground">↗{markupPercentage.toFixed(0)}% MU</span>
        <Badge 
          variant="outline" 
          className={cn("font-mono", profitStatus.color)}
        >
          {marginPercentage.toFixed(1)}% GP
        </Badge>
        <span className={cn("font-medium", profitStatus.color)}>
          {formatCurrency(profit, currency)}
        </span>
        {hasDiscount && (
          <Badge variant="secondary" className="text-xs">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Discounted
          </Badge>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn("flex items-center justify-between gap-4 p-3 bg-muted/50 rounded-lg", className)}>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Cost:</span>{' '}
            <span className="font-medium">{formatCurrency(costTotal, currency)}</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="text-sm">
            <span className="text-muted-foreground">Sell:</span>{' '}
            <span className="font-medium">{formatCurrency(sellingTotal, currency)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">↗{markupPercentage.toFixed(0)}%</span>
          <Badge 
            variant="secondary" 
            className={cn("font-mono", profitStatus.color)}
          >
            {marginPercentage >= 0 ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {marginPercentage.toFixed(1)}% GP
          </Badge>
          <span className={cn("font-semibold", profitStatus.color)}>
            {formatCurrency(profit, currency)}
          </span>
        </div>
      </div>
    );
  }

  // Card variant (default) - Collapsible with per-treatment breakdown
  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className={cn("border border-dashed rounded-lg", className)}>
        {/* Compact Header - Always Visible */}
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span className="font-medium">Profit Summary</span>
              {hasDiscount && (
                <Badge variant="secondary" className="text-xs bg-amber-500/20 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Discount Applied
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {/* Markup % */}
              <span className="text-xs text-muted-foreground font-mono">
                ↗{markupPercentage.toFixed(0)}% MU
              </span>
              
              {/* GP Badge */}
              <Badge 
                variant="secondary" 
                className={cn("font-mono", profitStatus.color)}
              >
                {marginPercentage >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {marginPercentage.toFixed(1)}% GP
              </Badge>
              
              {/* Profit Amount */}
              <span className={cn("font-semibold text-sm", profitStatus.color)}>
                {formatCurrency(profit, currency)}
              </span>
              
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </button>
        </CollapsibleTrigger>

        {/* Expandable Content */}
        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-3">
            <Separator />
            
            {/* Per-Treatment Breakdown Table with Discounted Sell column */}
            {items.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground text-xs">
                      <th className="text-left py-1.5 font-medium">Treatment</th>
                      <th className="text-right py-1.5 font-medium">Cost</th>
                      <th className="text-right py-1.5 font-medium">Sell</th>
                      {hasDiscount && (
                        <th className="text-right py-1.5 font-medium">Disc. Sell</th>
                      )}
                      <th className="text-right py-1.5 font-medium">Markup%</th>
                      <th className="text-right py-1.5 font-medium">GP%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {items.map((item) => {
                      const itemCost = item.cost_price || item.cost_total || 0;
                      const itemSell = item.unit_price || item.total || 0;
                      
                      // Calculate proportional discount for this item
                      // Discount is applied to RETAIL PRICE (Sell), not Cost
                      const itemDiscountRatio = originalSellingTotal > 0 ? itemSell / originalSellingTotal : 0;
                      const itemDiscountAmount = hasDiscount ? discount.amount * itemDiscountRatio : 0;
                      const itemDiscountedSell = itemSell - itemDiscountAmount;
                      
                      // Markup % is based on original sell price (before discount)
                      const itemMarkup = calculateMarkup(itemCost, itemSell);
                      
                      // GP% is calculated from Discounted Sell (after discount applied to retail)
                      // GP% = (Discounted Sell - Cost) / Discounted Sell × 100
                      const itemMargin = hasDiscount 
                        ? calculateGrossMargin(itemCost, itemDiscountedSell)
                        : (item.gross_margin ?? calculateGrossMargin(itemCost, itemSell));
                      const itemStatus = getProfitStatus(itemMargin);
                      
                      return (
                        <tr key={item.id} className="text-xs">
                          <td className="py-1.5 pr-2 truncate max-w-[140px]" title={item.name}>
                            {item.name}
                          </td>
                          <td className="text-right py-1.5 font-mono text-muted-foreground">
                            {formatCurrency(itemCost, currency)}
                          </td>
                          <td className="text-right py-1.5 font-mono">
                            {formatCurrency(itemSell, currency)}
                          </td>
                          {hasDiscount && (
                            <td className="text-right py-1.5 font-mono text-amber-600 dark:text-amber-400">
                              {formatCurrency(itemDiscountedSell, currency)}
                            </td>
                          )}
                          <td className="text-right py-1.5 font-mono text-muted-foreground">
                            {itemMarkup.toFixed(0)}%
                          </td>
                          <td className={cn("text-right py-1.5 font-mono font-medium", itemStatus.color)}>
                            {itemMargin.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border font-medium">
                      <td className="py-2">Total</td>
                      <td className="text-right py-2 font-mono">
                        {formatCurrency(costTotal, currency)}
                      </td>
                      <td className="text-right py-2 font-mono">
                        {formatCurrency(originalSellingTotal, currency)}
                      </td>
                      {hasDiscount && (
                        <td className="text-right py-2 font-mono text-amber-600 dark:text-amber-400">
                          {formatCurrency(discountedSellingTotal, currency)}
                        </td>
                      )}
                      <td className="text-right py-2 font-mono text-muted-foreground">
                        {(hasDiscount ? originalMarkupPercentage : markupPercentage).toFixed(0)}%
                      </td>
                      <td className={cn("text-right py-2 font-mono", profitStatus.color)}>
                        {marginPercentage.toFixed(1)}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Summary if no items provided */}
            {items.length === 0 && showBreakdown && (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Total Cost</p>
                  <p className="font-semibold">{formatCurrency(costTotal, currency)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Total Selling</p>
                  <p className="font-semibold">{formatCurrency(sellingTotal, currency)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Markup</p>
                  <p className="font-semibold">{markupPercentage.toFixed(0)}%</p>
                </div>
              </div>
            )}

            {/* Profit Status Message */}
            <div className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded text-xs",
              profitStatus.status === 'loss' && "bg-destructive/10",
              profitStatus.status === 'low' && "bg-amber-500/10",
              profitStatus.status === 'normal' && "bg-muted",
              profitStatus.status === 'good' && "bg-emerald-500/10"
            )}>
              {profitStatus.status === 'good' || profitStatus.status === 'normal' ? (
                <TrendingUp className={cn("h-3 w-3", profitStatus.color)} />
              ) : (
                <TrendingDown className={cn("h-3 w-3", profitStatus.color)} />
              )}
              <span className={profitStatus.color}>
                {profitStatus.status === 'loss' && "This quote is at a loss"}
                {profitStatus.status === 'low' && "Low margin - consider adjusting"}
                {profitStatus.status === 'normal' && "Margin within normal range"}
                {profitStatus.status === 'good' && "Good profit margin"}
              </span>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default QuoteProfitSummary;

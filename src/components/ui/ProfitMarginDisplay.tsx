import React from "react";
import { cn } from "@/lib/utils";
import { useMarkupSettings, calculateWithMarkup } from "@/hooks/useMarkupSettings";
import { useUserRole } from "@/hooks/useUserRole";
import { useFormattedCurrency } from "@/hooks/useFormattedCurrency";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProfitMarginDisplayProps {
  costPrice: number;
  sellingPrice: number;
  className?: string;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'inline' | 'card' | 'minimal';
}

/**
 * BlindMatrix-style profit margin display
 * Shows cost vs selling price with margin percentage
 * Only visible to authorized users (owners/admins)
 */
export const ProfitMarginDisplay: React.FC<ProfitMarginDisplayProps> = ({
  costPrice,
  sellingPrice,
  className,
  showDetails = false,
  size = 'md',
  variant = 'inline'
}) => {
  const { data: userRole } = useUserRole();
  const { formatCurrency } = useFormattedCurrency();

  // Calculate profit metrics
  const profit = sellingPrice - costPrice;
  const marginPercentage = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
  const markupPercentage = costPrice > 0 ? (profit / costPrice) * 100 : 0;

  // Determine margin health
  const getMarginStatus = () => {
    if (marginPercentage < 0) return { color: 'text-destructive', bg: 'bg-destructive/10', icon: TrendingDown, label: 'Loss' };
    if (marginPercentage < 15) return { color: 'text-orange-600', bg: 'bg-orange-50', icon: Minus, label: 'Low' };
    if (marginPercentage < 30) return { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: TrendingUp, label: 'Normal' };
    return { color: 'text-green-600', bg: 'bg-green-50', icon: TrendingUp, label: 'Good' };
  };

  const status = getMarginStatus();
  const StatusIcon = status.icon;

  // Only show to authorized users
  if (!userRole?.canViewMarkup) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  if (variant === 'minimal') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded",
              status.bg,
              status.color,
              sizeClasses[size],
              className
            )}>
              <StatusIcon className="h-3 w-3" />
              <span className="font-medium">{marginPercentage.toFixed(1)}%</span>
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <div className="space-y-1">
              <div>Cost: {formatCurrency(costPrice)}</div>
              <div>Sell: {formatCurrency(sellingPrice)}</div>
              <div>Profit: {formatCurrency(profit)}</div>
              <div>Markup: {markupPercentage.toFixed(1)}%</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn(
        "rounded-lg border p-3 space-y-2",
        status.bg,
        className
      )}>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">Profit Margin</span>
          <div className={cn("flex items-center gap-1 font-semibold", status.color)}>
            <StatusIcon className="h-4 w-4" />
            <span>{marginPercentage.toFixed(1)}%</span>
          </div>
        </div>
        {showDetails && (
          <div className="grid grid-cols-2 gap-2 text-xs border-t pt-2">
            <div>
              <span className="text-muted-foreground">Cost</span>
              <div className="font-medium">{formatCurrency(costPrice)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Sell</span>
              <div className="font-medium">{formatCurrency(sellingPrice)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Profit</span>
              <div className={cn("font-medium", status.color)}>{formatCurrency(profit)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Markup</span>
              <div className="font-medium">{markupPercentage.toFixed(1)}%</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default inline variant
  return (
    <div className={cn(
      "flex items-center gap-2",
      sizeClasses[size],
      className
    )}>
      <span className="text-muted-foreground">Cost:</span>
      <span className="font-medium">{formatCurrency(costPrice)}</span>
      <span className="text-muted-foreground mx-1">→</span>
      <span className="text-muted-foreground">Sell:</span>
      <span className="font-medium">{formatCurrency(sellingPrice)}</span>
      <span className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded ml-2",
        status.bg,
        status.color
      )}>
        <StatusIcon className="h-3 w-3" />
        <span className="font-medium">{marginPercentage.toFixed(1)}%</span>
      </span>
    </div>
  );
};

/**
 * Summary component for total profit across multiple items
 */
interface ProfitSummaryProps {
  totalCost: number;
  totalSelling: number;
  className?: string;
}

export const ProfitSummary: React.FC<ProfitSummaryProps> = ({
  totalCost,
  totalSelling,
  className
}) => {
  const { data: userRole } = useUserRole();
  const { formatCurrency } = useFormattedCurrency();

  if (!userRole?.canViewMarkup) {
    return null;
  }

  const profit = totalSelling - totalCost;
  const marginPercentage = totalSelling > 0 ? (profit / totalSelling) * 100 : 0;

  const getMarginColor = () => {
    if (marginPercentage < 0) return 'text-destructive';
    if (marginPercentage < 15) return 'text-orange-600';
    if (marginPercentage < 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg bg-muted/50 border",
      className
    )}>
      <div className="space-y-1">
        <div className="text-xs text-muted-foreground">Total Profit</div>
        <div className={cn("text-lg font-bold", getMarginColor())}>
          {formatCurrency(profit)}
        </div>
      </div>
      <div className="text-right space-y-1">
        <div className="text-xs text-muted-foreground">Margin</div>
        <div className={cn("text-lg font-bold", getMarginColor())}>
          {marginPercentage.toFixed(1)}%
        </div>
      </div>
    </div>
  );
};

/**
 * Line Item Profit Column Component
 * Shows Cost | Sell | GP% for individual quote line items
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useUserRole } from '@/hooks/useUserRole';
import { formatCurrency } from '@/utils/formatCurrency';
import { useMeasurementUnits } from '@/hooks/useMeasurementUnits';
import { calculateGrossMargin, getProfitStatus } from '@/utils/pricing/markupResolver';
import { cn } from '@/lib/utils';

interface LineItemProfitColumnProps {
  costPrice: number;
  sellingPrice: number;
  markupPercentage?: number;
  className?: string;
  variant?: 'full' | 'compact' | 'badge-only';
}

export const LineItemProfitColumn: React.FC<LineItemProfitColumnProps> = ({
  costPrice,
  sellingPrice,
  markupPercentage,
  className,
  variant = 'full'
}) => {
  const { data: roleData, isLoading } = useUserRole();
  const { units } = useMeasurementUnits();
  const currency = units.currency || 'USD';

  const canViewMarkup = roleData?.canViewMarkup || false;

  // Only show to authorized users
  if (isLoading || !canViewMarkup) {
    return null;
  }

  const profit = sellingPrice - costPrice;
  const gpPercent = calculateGrossMargin(costPrice, sellingPrice);
  const profitStatus = getProfitStatus(gpPercent);

  if (variant === 'badge-only') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={cn("font-mono text-xs cursor-help", profitStatus.color, className)}
            >
              {gpPercent.toFixed(0)}%
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-xs">
            <div className="space-y-1">
              <p>Cost: {formatCurrency(costPrice, currency)}</p>
              <p>Sell: {formatCurrency(sellingPrice, currency)}</p>
              <p>Profit: {formatCurrency(profit, currency)}</p>
              <p className="font-semibold">GP: {gpPercent.toFixed(1)}%</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2 text-xs", className)}>
        <span className="text-muted-foreground">
          {formatCurrency(costPrice, currency)}
        </span>
        <span className="text-muted-foreground">→</span>
        <span className="font-medium">
          {formatCurrency(sellingPrice, currency)}
        </span>
        <Badge 
          variant="outline" 
          className={cn("font-mono", profitStatus.color)}
        >
          {gpPercent.toFixed(0)}%
        </Badge>
      </div>
    );
  }

  // Full variant
  return (
    <div className={cn("grid grid-cols-4 gap-2 text-xs items-center", className)}>
      <div className="text-muted-foreground">
        {formatCurrency(costPrice, currency)}
      </div>
      <div className="font-medium">
        {formatCurrency(sellingPrice, currency)}
      </div>
      <div className={cn("font-medium", profitStatus.color)}>
        {formatCurrency(profit, currency)}
      </div>
      <Badge 
        variant="outline" 
        className={cn("font-mono justify-center", profitStatus.color)}
      >
        {gpPercent.toFixed(1)}%
      </Badge>
    </div>
  );
};

/**
 * Header component for profit columns table
 */
export const LineItemProfitHeader: React.FC<{ className?: string }> = ({ className }) => {
  const { data: roleData, isLoading } = useUserRole();
  const canViewMarkup = roleData?.canViewMarkup || false;

  if (isLoading || !canViewMarkup) {
    return null;
  }

  return (
    <div className={cn("grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground", className)}>
      <div>Cost</div>
      <div>Sell</div>
      <div>Profit</div>
      <div className="text-center">GP%</div>
    </div>
  );
};

export default LineItemProfitColumn;

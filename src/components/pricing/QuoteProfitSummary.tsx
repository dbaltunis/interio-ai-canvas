/**
 * Quote Profit Summary Component
 * Displays cost/selling/profit breakdown for authorized users
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, DollarSign, Percent, Eye, EyeOff } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { useMarkupSettings } from '@/hooks/useMarkupSettings';
import { formatCurrency } from '@/utils/formatCurrency';
import { useMeasurementUnits } from '@/hooks/useMeasurementUnits';
import { calculateGrossMargin, getProfitStatus } from '@/utils/pricing/markupResolver';
import { cn } from '@/lib/utils';

interface QuoteProfitSummaryProps {
  costTotal: number;
  sellingTotal: number;
  className?: string;
  variant?: 'card' | 'inline' | 'compact';
  showBreakdown?: boolean;
}

export const QuoteProfitSummary: React.FC<QuoteProfitSummaryProps> = ({
  costTotal,
  sellingTotal,
  className,
  variant = 'card',
  showBreakdown = true
}) => {
  const { data: roleData, isLoading: roleLoading } = useUserRole();
  const { data: markupSettings } = useMarkupSettings();
  const { units } = useMeasurementUnits();
  const currency = units.currency || 'USD';

  const canViewMarkup = roleData?.canViewMarkup || false;

  // Only show to authorized users
  if (roleLoading || !canViewMarkup) {
    return null;
  }

  const profit = sellingTotal - costTotal;
  const marginPercentage = calculateGrossMargin(costTotal, sellingTotal);
  const profitStatus = getProfitStatus(marginPercentage);

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2 text-sm", className)}>
        <span className="text-muted-foreground">GP:</span>
        <Badge 
          variant="outline" 
          className={cn("font-mono", profitStatus.color)}
        >
          {marginPercentage.toFixed(1)}%
        </Badge>
        <span className={cn("font-medium", profitStatus.color)}>
          {formatCurrency(profit, currency)}
        </span>
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

  // Card variant (default)
  return (
    <Card className={cn("border-dashed", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <Eye className="h-4 w-4" />
          Profit Summary
          <Badge variant="outline" className="text-xs ml-auto">
            Internal Only
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {showBreakdown && (
          <>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Cost</p>
                <p className="text-lg font-semibold">{formatCurrency(costTotal, currency)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Selling</p>
                <p className="text-lg font-semibold">{formatCurrency(sellingTotal, currency)}</p>
              </div>
            </div>
            <Separator />
          </>
        )}
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Gross Profit</p>
            <p className={cn("text-xl font-bold", profitStatus.color)}>
              {formatCurrency(profit, currency)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-sm">Margin</p>
            <Badge 
              variant="secondary" 
              className={cn("text-lg font-bold", profitStatus.color)}
            >
              {marginPercentage.toFixed(1)}%
            </Badge>
          </div>
        </div>

        {/* Status indicator */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm",
          profitStatus.status === 'loss' && "bg-destructive/10",
          profitStatus.status === 'low' && "bg-amber-500/10",
          profitStatus.status === 'normal' && "bg-muted",
          profitStatus.status === 'good' && "bg-emerald-500/10"
        )}>
          {profitStatus.status === 'good' ? (
            <TrendingUp className={cn("h-4 w-4", profitStatus.color)} />
          ) : profitStatus.status === 'loss' ? (
            <TrendingDown className={cn("h-4 w-4", profitStatus.color)} />
          ) : (
            <Percent className={cn("h-4 w-4", profitStatus.color)} />
          )}
          <span className={profitStatus.color}>
            {profitStatus.status === 'loss' && "This quote is at a loss"}
            {profitStatus.status === 'low' && "Low margin - consider adjusting pricing"}
            {profitStatus.status === 'normal' && "Margin within normal range"}
            {profitStatus.status === 'good' && "Good profit margin"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteProfitSummary;

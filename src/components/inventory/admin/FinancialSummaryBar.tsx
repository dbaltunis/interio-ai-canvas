import { useMemo } from "react";
import { TrendingUp, Package, AlertTriangle, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface FinancialSummaryBarProps {
  totalCost: number;
  totalRetail: number;
  expectedProfit: number;
  itemCount: number;
  lowStockCount: number;
  currencySymbol: string;
}

export const FinancialSummaryBar = ({
  totalCost,
  totalRetail,
  expectedProfit,
  itemCount,
  lowStockCount,
  currencySymbol
}: FinancialSummaryBarProps) => {
  const marginPercent = useMemo(() => {
    return totalRetail > 0 ? (expectedProfit / totalRetail) * 100 : 0;
  }, [totalRetail, expectedProfit]);

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="bg-gradient-to-r from-card via-card to-muted/30 border rounded-xl p-4 md:p-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
        {/* Cost Value */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cost Value</p>
          <p className="text-xl md:text-2xl font-bold tabular-nums">
            {currencySymbol}{formatValue(totalCost)}
          </p>
          <p className="text-xs text-muted-foreground">Stock at cost</p>
        </div>

        {/* Retail Value */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Retail Value</p>
          <p className="text-xl md:text-2xl font-bold tabular-nums">
            {currencySymbol}{formatValue(totalRetail)}
          </p>
          <p className="text-xs text-muted-foreground">Stock at retail</p>
        </div>

        {/* Expected Profit */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Expected Profit</p>
          <p className="text-xl md:text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {currencySymbol}{formatValue(expectedProfit)}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Potential margin
          </p>
        </div>

        {/* Item Count */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Items</p>
          <p className="text-xl md:text-2xl font-bold tabular-nums flex items-center gap-2">
            {itemCount.toLocaleString()}
            {lowStockCount > 0 && (
              <span className="inline-flex items-center gap-1 text-sm font-normal text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                {lowStockCount}
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Package className="h-3 w-3" />
            Total products
          </p>
        </div>

        {/* GP Margin */}
        <div className="col-span-2 md:col-span-1 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">GP Margin</p>
          <div className="flex items-center gap-3">
            <span className={cn(
              "text-xl md:text-2xl font-bold tabular-nums",
              marginPercent >= 40 ? "text-emerald-600 dark:text-emerald-400" :
              marginPercent >= 25 ? "text-primary" :
              "text-amber-600 dark:text-amber-400"
            )}>
              {marginPercent.toFixed(1)}%
            </span>
            <div className="flex-1 max-w-[100px]">
              <Progress 
                value={Math.min(marginPercent, 100)} 
                className="h-2"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            Overall margin
          </p>
        </div>
      </div>
    </div>
  );
};

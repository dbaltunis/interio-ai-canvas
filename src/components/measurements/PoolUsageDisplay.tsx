import { Card } from "@/components/ui/card";
import { FabricPoolStatusBadge, PoolStatus } from "./FabricPoolStatusBadge";
import { DollarSign, Lightbulb } from "lucide-react";
import { PoolUsage } from "@/hooks/useProjectFabricPool";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface PoolUsageDisplayProps {
  poolUsage: PoolUsage;
  fabricName: string;
  unit: string;
  className?: string;
}

export const PoolUsageDisplay = ({
  poolUsage,
  fabricName,
  unit,
  className,
}: PoolUsageDisplayProps) => {
  const { units } = useMeasurementUnits();

  const getStatus = (): PoolStatus => {
    if (poolUsage.usedFromPool > 0 && poolUsage.needsOrdering > 0) {
      return "mixed_source";
    }
    if (poolUsage.usedFromPool > 0) {
      return "using_pool";
    }
    if (poolUsage.leftoverFromOrder > 0 || poolUsage.addedToPool > 0) {
      return "pool_available";
    }
    return "new_order";
  };

  const formatPrice = (price: number) => {
    const currencySymbols: Record<string, string> = {
      NZD: "NZ$",
      AUD: "A$",
      USD: "$",
      GBP: "£",
      EUR: "€",
      ZAR: "R",
    };
    const symbol = currencySymbols[units.currency] || units.currency;
    return `${symbol}${price.toFixed(2)}`;
  };

  const formatAmount = (amount: number) => {
    return `${amount.toFixed(2)}${unit}`;
  };

  // Using entirely from pool - no new order
  if (poolUsage.usedFromPool > 0 && poolUsage.needsOrdering === 0) {
    return (
      <Card className={`container-level-3 ${className}`}>
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">💡 Fabric Source</h4>
            <FabricPoolStatusBadge status="using_pool" />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2 text-green-600">
              <span className="text-base">✓</span>
              <div className="flex-1">
                <div className="font-medium">
                  Using {formatAmount(poolUsage.usedFromPool)} from project
                  leftover pool
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  No additional fabric order needed
                </div>
              </div>
            </div>

            {poolUsage.costSavings > 0 && (
              <div className="flex items-center gap-1.5 text-sm font-medium text-green-600 pt-2 border-t border-border/50">
                <DollarSign className="h-4 w-4" />
                Cost saving: {formatPrice(poolUsage.costSavings)}
              </div>
            )}

            {poolUsage.availableFromPool - poolUsage.usedFromPool > 0 && (
              <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                Pool remaining after:{" "}
                {formatAmount(
                  poolUsage.availableFromPool - poolUsage.usedFromPool
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Ordering new fabric
  if (poolUsage.needsOrdering > 0 && poolUsage.usedFromPool === 0) {
    return (
      <Card className={`container-level-3 ${className}`}>
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">📦 Fabric Order</h4>
            <FabricPoolStatusBadge status="new_order" />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ordering:</span>
              <span className="font-medium">{formatAmount(poolUsage.needsOrdering)}</span>
            </div>

            {poolUsage.addedToPool > 0 && (
              <>
                <div className="flex justify-between pt-2 border-t border-border/50">
                  <span className="text-muted-foreground">Leftover:</span>
                  <span className="font-medium text-green-600">
                    {formatAmount(poolUsage.addedToPool)} → Added to pool
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm bg-green-50 dark:bg-green-950/20 rounded p-2 mt-2">
                  <Lightbulb className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-green-700 dark:text-green-400 text-xs">
                    Next surface can use this leftover!
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Mixed source - using pool + ordering
  return (
    <Card className={`container-level-3 ${className}`}>
      <div className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm">📦 Fabric Source (Mixed)</h4>
          <FabricPoolStatusBadge status="mixed_source" />
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Using from pool:</span>
            <span className="font-medium text-green-600">
              {formatAmount(poolUsage.usedFromPool)} (FREE)
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Ordering additional:</span>
            <span className="font-medium">{formatAmount(poolUsage.needsOrdering)}</span>
          </div>

          <div className="flex justify-between pt-2 border-t border-border/50 font-medium">
            <span>Total for surface:</span>
            <span>
              {formatAmount(poolUsage.usedFromPool + poolUsage.needsOrdering)}
            </span>
          </div>

          {poolUsage.addedToPool > 0 && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Leftover:</span>
              <span className="text-green-600 font-medium">
                {formatAmount(poolUsage.addedToPool)} → Added to pool
              </span>
            </div>
          )}

          {poolUsage.costSavings > 0 && (
            <div className="flex items-center gap-1.5 text-sm font-medium text-green-600 pt-2 border-t border-border/50">
              <DollarSign className="h-4 w-4" />
              Partial saving: {formatPrice(poolUsage.costSavings)}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

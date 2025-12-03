import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, DollarSign } from "lucide-react";
import { useState } from "react";
import { FabricPoolStatusBadge, PoolStatus } from "./FabricPoolStatusBadge";
import { FabricPools } from "@/hooks/useProjectFabricPool";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { formatFromCM } from "@/utils/measurementFormatters";

interface ProjectFabricPoolSummaryProps {
  fabricPools: FabricPools | null;
  className?: string;
}

export const ProjectFabricPoolSummary = ({
  fabricPools,
  className,
}: ProjectFabricPoolSummaryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { units } = useMeasurementUnits();

  if (!fabricPools || Object.keys(fabricPools).length === 0) {
    return null;
  }

  const totalFabrics = Object.keys(fabricPools).length;
  const totalSavings = Object.values(fabricPools).reduce((sum, pool) => {
    const savedAmount = pool.surfaces.reduce(
      (s, surf) => s + surf.usedFromPool * pool.costPerUnit,
      0
    );
    return sum + savedAmount;
  }, 0);

  const getPoolStatus = (pool: any): PoolStatus => {
    if (pool.availableLeftover > 1) return "pool_available";
    if (pool.availableLeftover > 0) return "low_pool";
    return "new_order";
  };

  const formatAmount = (amount: number) => {
    return `${amount.toFixed(2)}${units.fabric}`;
  };

  const efficiency = Object.values(fabricPools).reduce((sum, pool) => {
    if (pool.totalOrdered === 0) return sum;
    return sum + (pool.totalUsed / pool.totalOrdered) * 100;
  }, 0) / totalFabrics;

  return (
    <Card className={`container-level-3 ${className}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="text-lg font-semibold text-foreground">
                📊 Project Fabric Inventory
              </div>
              <div className="text-sm text-muted-foreground">
                {totalFabrics} fabric{totalFabrics !== 1 ? 's' : ''} tracked
              </div>
            </div>
            <div className="flex items-center gap-3">
              {totalSavings > 0 && (
                <div className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                  <DollarSign className="h-4 w-4" />
                  ${totalSavings.toFixed(2)} saved
                </div>
              )}
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-border/50 p-4 space-y-4">
            {Object.values(fabricPools).map((pool) => {
              const poolSavings = pool.surfaces.reduce(
                (sum, surf) => sum + surf.usedFromPool * pool.costPerUnit,
                0
              );
              const poolEfficiency = pool.totalOrdered > 0 
                ? (pool.totalUsed / pool.totalOrdered) * 100 
                : 0;

              return (
                <div
                  key={pool.fabricId}
                  className="space-y-3 p-3 rounded-lg bg-background/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">
                        {pool.fabricName} ({formatFromCM(pool.fabricWidth, units.length)} wide)
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Total: {formatAmount(pool.totalOrdered)} ordered</span>
                        <span>•</span>
                        <span>{formatAmount(pool.totalUsed)} used</span>
                        <span>•</span>
                        <span className="font-medium text-foreground">
                          {formatAmount(pool.availableLeftover)} available
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <FabricPoolStatusBadge status={getPoolStatus(pool)} />
                      <div className="text-xs text-muted-foreground">
                        Efficiency: {poolEfficiency.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Surface breakdown */}
                  <div className="space-y-2 pl-3 border-l-2 border-border/50">
                    <div className="text-xs font-medium text-muted-foreground uppercase">
                      Surface Usage:
                    </div>
                    {pool.surfaces.map((surface) => (
                      <div
                        key={surface.surfaceId}
                        className="text-sm space-y-1"
                      >
                        <div className="font-medium text-foreground">
                          • {surface.surfaceName}
                        </div>
                        <div className="text-xs text-muted-foreground pl-3">
                          {surface.orderedForThis > 0 ? (
                            <span>
                              Ordered {formatAmount(surface.orderedForThis)} → 
                              Used {formatAmount(surface.usedByThis)} → 
                              Left {formatAmount(surface.leftoverFromThis)}
                            </span>
                          ) : (
                            <span className="text-green-600 font-medium">
                              ♻️ {formatAmount(surface.usedFromPool)} from pool 
                              (saved ${(surface.usedFromPool * pool.costPerUnit).toFixed(2)})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {poolSavings > 0 && (
                    <div className="pt-2 border-t border-border/50">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                        <DollarSign className="h-3.5 w-3.5" />
                        Total Fabric Savings: ${poolSavings.toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Overall summary */}
            <div className="pt-3 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <div className="font-medium text-foreground">
                  Overall Project Efficiency: {efficiency.toFixed(1)}%
                </div>
                {totalSavings > 0 && (
                  <div className="flex items-center gap-1.5 font-semibold text-green-600">
                    <DollarSign className="h-4 w-4" />
                    Total Savings: ${totalSavings.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

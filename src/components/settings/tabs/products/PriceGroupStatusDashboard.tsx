import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, Upload, BarChart3, Package } from 'lucide-react';
import { useEnhancedInventory } from '@/hooks/useEnhancedInventory';

interface PricingGrid {
  id: string;
  price_group?: string | null;
  product_type?: string | null;
}

interface PriceGroupStatusDashboardProps {
  grids: PricingGrid[];
  onUploadClick: (priceGroup: string) => void;
}

export const PriceGroupStatusDashboard = ({ grids, onUploadClick }: PriceGroupStatusDashboardProps) => {
  const { data: inventory = [] } = useEnhancedInventory();

  // Calculate price group distribution from inventory
  const priceGroupStats = useMemo(() => {
    const stats: Record<string, { count: number; hasGrid: boolean; gridName?: string }> = {};
    
    // Count materials per price group
    inventory.forEach(item => {
      if (item.price_group) {
        const groupKey = item.price_group.toUpperCase();
        if (!stats[groupKey]) {
          stats[groupKey] = { count: 0, hasGrid: false };
        }
        stats[groupKey].count++;
      }
    });

    // Check which groups have grids
    grids.forEach(grid => {
      if (grid.price_group) {
        const groupKey = grid.price_group.toUpperCase();
        if (stats[groupKey]) {
          stats[groupKey].hasGrid = true;
          stats[groupKey].gridName = (grid as any).name;
        }
      }
    });

    return stats;
  }, [inventory, grids]);

  const sortedGroups = useMemo(() => {
    return Object.entries(priceGroupStats)
      .sort((a, b) => b[1].count - a[1].count);
  }, [priceGroupStats]);

  const totalMaterials = sortedGroups.reduce((sum, [, stats]) => sum + stats.count, 0);
  const groupsWithGrids = sortedGroups.filter(([, stats]) => stats.hasGrid).length;
  const materialsWithGrids = sortedGroups
    .filter(([, stats]) => stats.hasGrid)
    .reduce((sum, [, stats]) => sum + stats.count, 0);
  
  const coverage = totalMaterials > 0 ? Math.round((materialsWithGrids / totalMaterials) * 100) : 0;

  if (sortedGroups.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Price Group Status</CardTitle>
          </div>
          <Badge variant="outline" className="font-normal">
            {groupsWithGrids}/{sortedGroups.length} groups covered
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Coverage summary */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              <Package className="h-3.5 w-3.5 inline mr-1" />
              {totalMaterials} materials across {sortedGroups.length} price groups
            </span>
            <span className="font-medium">{coverage}% covered</span>
          </div>
          <Progress value={coverage} className="h-2" />
        </div>

        {/* Price group list */}
        <div className="space-y-2 max-h-[240px] overflow-y-auto">
          {sortedGroups.map(([group, stats]) => (
            <div 
              key={group}
              className={`flex items-center justify-between p-2 rounded-lg border ${
                stats.hasGrid 
                  ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' 
                  : 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {stats.hasGrid ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                )}
                <div>
                  <span className="font-medium text-sm">Group {group}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {stats.count} material{stats.count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {stats.hasGrid ? (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    Grid uploaded
                  </Badge>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-xs"
                    onClick={() => onUploadClick(group)}
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Upload Grid
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {groupsWithGrids < sortedGroups.length && (
          <p className="text-xs text-muted-foreground text-center pt-2 border-t">
            Upload pricing grids for missing groups to enable pricing for those materials
          </p>
        )}
      </CardContent>
    </Card>
  );
};

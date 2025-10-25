import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Package, AlertTriangle, DollarSign, BarChart3 } from "lucide-react";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";

interface InventoryStatsProps {
  hasStockTracking?: boolean;
}

export const InventoryStats = ({ hasStockTracking = true }: InventoryStatsProps) => {
  const { data: inventory, isLoading } = useEnhancedInventory();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalItems = inventory?.length || 0;
  const totalValue = inventory?.reduce((sum, item) => sum + (item.selling_price || 0) * (item.quantity || 0), 0) || 0;
  const lowStockItems = inventory?.filter(item => 
    hasStockTracking && item.reorder_point && item.quantity <= item.reorder_point
  ).length || 0;
  const outOfStockItems = inventory?.filter(item => item.quantity <= 0).length || 0;

  const categories = inventory?.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const topCategory = Object.entries(categories).sort(([,a], [,b]) => b - a)[0];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{totalItems.toLocaleString()}</p>
              </div>
              <Package className="h-7 w-7 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-7 w-7 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {hasStockTracking && (
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-bold">{lowStockItems}</p>
                </div>
                <AlertTriangle className="h-7 w-7 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{Object.keys(categories).length}</p>
              </div>
              <BarChart3 className="h-7 w-7 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown - Only if categories exist */}
      {Object.keys(categories).length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Inventory by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(categories).map(([category, count]) => {
                const percentage = (count / totalItems) * 100;
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{category}</span>
                        <Badge variant="secondary" className="text-xs">
                          {count} items
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Alerts - Only if stock tracking is enabled */}
      {hasStockTracking && lowStockItems > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inventory
                ?.filter(item => item.reorder_point && item.quantity <= item.reorder_point)
                .slice(0, 5)
                .map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-amber-200 rounded-lg">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.category} • SKU: {item.sku}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive" className="mb-1">
                        {item.quantity} {item.unit} left
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        Reorder at: {item.reorder_point}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
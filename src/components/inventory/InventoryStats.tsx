import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Package, AlertTriangle, DollarSign, BarChart3 } from "lucide-react";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";

export const InventoryStats = () => {
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
  const totalValue = inventory?.reduce((sum, item) => sum + (item.unit_price || 0) * item.quantity, 0) || 0;
  const lowStockItems = inventory?.filter(item => item.quantity <= (item.reorder_point || 5)).length || 0;
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
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{totalItems.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +12 this week
                </p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +5.2% this month
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold">{lowStockItems}</p>
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                  <AlertTriangle className="h-3 w-3" />
                  Requires attention
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{Object.keys(categories).length}</p>
                <p className="text-xs text-muted-foreground">
                  Top: {topCategory ? topCategory[0] : 'None'}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory by Category</CardTitle>
          <CardDescription>
            Stock distribution across different product categories
          </CardDescription>
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

      {/* Stock Alerts */}
      {lowStockItems > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              Stock Alerts
            </CardTitle>
            <CardDescription>
              Items requiring immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inventory
                ?.filter(item => item.quantity <= (item.reorder_point || 5))
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
                        Reorder at: {item.reorder_point || 5}
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
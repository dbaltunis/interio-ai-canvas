import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { useHasPermission } from "@/hooks/usePermissions";
import { 
  DollarSign, 
  TrendingUp, 
  Package, 
  AlertTriangle,
  BarChart3,
  Clock,
  ShoppingCart,
  Archive
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const BusinessInventoryOverview = () => {
  const { data: allInventory, isLoading } = useEnhancedInventory();
  const canManageInventory = useHasPermission('manage_inventory');
  
  // Filter out treatment options - only show physical inventory
  const inventory = allInventory?.filter(item => item.category !== 'treatment_option') || [];

  // Stock on Hand Calculations (items with quantity > 0)
  const stockedItems = inventory.filter(item => (item.quantity || 0) > 0);
  const totalStockCost = stockedItems.reduce((sum, item) => {
    const cost = item.cost_price || 0;
    const qty = item.quantity || 0;
    return sum + (cost * qty);
  }, 0);

  const totalStockRetail = stockedItems.reduce((sum, item) => {
    const retail = item.selling_price || item.price_per_unit || 0;
    const qty = item.quantity || 0;
    return sum + (retail * qty);
  }, 0);

  // Catalog Value Calculations (all items with prices, regardless of stock)
  const catalogItems = inventory.filter(item => 
    (item.selling_price || item.price_per_unit || 0) > 0
  );
  
  const avgCatalogPrice = catalogItems.length > 0 
    ? catalogItems.reduce((sum, item) => sum + (item.selling_price || item.price_per_unit || 0), 0) / catalogItems.length
    : 0;

  const potentialProfit = totalStockRetail - totalStockCost;
  const profitMargin = totalStockRetail > 0 ? ((potentialProfit / totalStockRetail) * 100) : 0;

  // Inventory Health Metrics
  const lowStockItems = inventory.filter(item => 
    item.reorder_point && (item.quantity || 0) <= item.reorder_point
  );

  const deadStock = inventory.filter(item => {
    if (!item.created_at) return false;
    const daysSinceCreated = Math.floor(
      (new Date().getTime() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceCreated > 90 && (item.quantity || 0) > 0;
  });

  const deadStockValue = deadStock.reduce((sum, item) => {
    const cost = item.cost_price || 0;
    const qty = item.quantity || 0;
    return sum + (cost * qty);
  }, 0);

  // Category Breakdown
  const categoryStats = inventory.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = { count: 0, value: 0, profit: 0 };
    }
    const cost = item.cost_price || 0;
    const retail = item.selling_price || item.price_per_unit || 0;
    const qty = item.quantity || 0;
    acc[category].count += 1;
    acc[category].value += retail * qty;
    acc[category].profit += (retail - cost) * qty;
    return acc;
  }, {} as Record<string, { count: number; value: number; profit: number }>);

  const topCategories = Object.entries(categoryStats)
    .sort((a, b) => b[1].value - a[1].value)
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading business metrics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Primary Financial KPIs - Only visible to users with manage_inventory permission */}
      {canManageInventory && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Financial Overview</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock on Hand (Cost)</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalStockCost)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stockedItems.length} items in stock
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock on Hand (Retail)</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(totalStockRetail)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Potential profit: {formatCurrency(potentialProfit)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Catalog Items</CardTitle>
                <Package className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{catalogItems.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg price: {formatCurrency(avgCatalogPrice)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inventory.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {Object.keys(categoryStats).length} categories
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Inventory Health & Operational Metrics */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Inventory Health</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{lowStockItems.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Items need reordering
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aging Inventory (90+ days)</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{deadStock.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Value: {formatCurrency(deadStockValue)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Efficiency</CardTitle>
              <Archive className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {inventory.length > 0 ? Math.round(((inventory.length - deadStock.length) / inventory.length) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Active inventory utilization
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Category Performance - Only show profit data if user can manage inventory */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Category Performance</h2>
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-base">Top Categories by Value</CardTitle>
            <CardDescription>
              {canManageInventory ? 'Revenue potential by inventory category' : 'Inventory distribution by category'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topCategories.length > 0 ? (
              topCategories.map(([category, stats]) => {
                const maxValue = topCategories[0][1].value;
                const percentage = (stats.value / maxValue) * 100;
                
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{category}</span>
                        <Badge variant="secondary" className="text-xs">
                          {stats.count} items
                        </Badge>
                      </div>
                      {canManageInventory && (
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(stats.value)}</div>
                          <div className="text-xs text-muted-foreground">
                            Profit: {formatCurrency(stats.profit)}
                          </div>
                        </div>
                      )}
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">No category data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Items Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-2 border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 dark:border-orange-900">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Items Requiring Immediate Attention
            </CardTitle>
            <CardDescription>These items are at or below reorder point</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      SKU: {item.sku || 'N/A'} | Supplier: {item.supplier || 'N/A'}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                      {item.quantity} {item.unit || 'units'}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      Reorder at: {item.reorder_point}
                    </div>
                  </div>
                </div>
              ))}
              {lowStockItems.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  + {lowStockItems.length - 5} more items need attention
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

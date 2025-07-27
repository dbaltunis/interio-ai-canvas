import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Package, AlertTriangle, DollarSign, RotateCcw, TrendingUp } from "lucide-react";
import { useEnhancedInventory, useInventoryValuation, useLowStockEnhancedItems } from "@/hooks/useEnhancedInventory";
import { Skeleton } from "@/components/ui/skeleton";

export const InventoryAnalytics = () => {
  const { data: inventory, isLoading: inventoryLoading } = useEnhancedInventory();
  const { data: valuation, isLoading: valuationLoading } = useInventoryValuation();
  const { data: lowStockItems, isLoading: lowStockLoading } = useLowStockEnhancedItems();

  const isLoading = inventoryLoading || valuationLoading || lowStockLoading;

  // Calculate real metrics from inventory data
  const totalItems = inventory?.length || 0;
  const totalValue = valuation?.totalValue || 0;
  const lowStockCount = lowStockItems?.length || 0;
  
  // Calculate items by category
  const categoryStats = inventory?.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = { total: 0, value: 0, lowStock: 0, outOfStock: 0 };
    }
    acc[category].total += 1;
    acc[category].value += (item.quantity || 0) * (item.unit_price || 0);
    
    if ((item.quantity || 0) <= (item.reorder_point || 0)) {
      acc[category].lowStock += 1;
    }
    if ((item.quantity || 0) === 0) {
      acc[category].outOfStock += 1;
    }
    
    return acc;
  }, {} as Record<string, { total: number; value: number; lowStock: number; outOfStock: number }>);

  // Prepare chart data from real inventory
  const stockLevelData = categoryStats ? Object.entries(categoryStats).map(([category, stats]) => ({
    category,
    inStock: stats.total - stats.lowStock - stats.outOfStock,
    lowStock: stats.lowStock - stats.outOfStock,
    outOfStock: stats.outOfStock
  })) : [];

  const categoryValueData = categoryStats ? Object.entries(categoryStats)
    .filter(([_, stats]) => stats.value > 0)
    .map(([category, stats], index) => ({
      name: category,
      value: Math.round(stats.value),
      color: `hsl(${(index * 60) % 360}, 70%, 50%)`
    })) : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Inventory Value</p>
                <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Real-time calculation
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
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{totalItems}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  In inventory
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
                <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold">{lowStockCount}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Need attention
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
                <p className="text-2xl font-bold">{Object.keys(categoryStats || {}).length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Product categories
                </p>
              </div>
              <RotateCcw className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stock Levels by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Levels by Category</CardTitle>
            <CardDescription>
              Current stock distribution across product categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockLevelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="inStock" stackId="a" fill="#10b981" name="In Stock" />
                <Bar dataKey="lowStock" stackId="a" fill="#f59e0b" name="Low Stock" />
                <Bar dataKey="outOfStock" stackId="a" fill="#ef4444" name="Out of Stock" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Low Stock Items List */}
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Items</CardTitle>
            <CardDescription>
              Items that need reordering
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockItems && lowStockItems.length > 0 ? (
              <div className="space-y-3">
                {lowStockItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50/50">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} remaining • Reorder at {item.reorder_point}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      Low Stock
                    </Badge>
                  </div>
                ))}
                {lowStockItems.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    +{lowStockItems.length - 5} more items need attention
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>All items are well stocked</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Inventory Value by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Value Distribution</CardTitle>
            <CardDescription>
              Total value breakdown by product category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryValueData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryValueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Value']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Items */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Items</CardTitle>
            <CardDescription>
              Recently added inventory items
            </CardDescription>
          </CardHeader>
          <CardContent>
            {inventory && inventory.length > 0 ? (
              <div className="space-y-4">
                {inventory
                  .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
                  .slice(0, 5)
                  .map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {item.category || 'Uncategorized'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${((item.quantity || 0) * (item.unit_price || 0)).toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{item.quantity} in stock</div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No inventory items found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
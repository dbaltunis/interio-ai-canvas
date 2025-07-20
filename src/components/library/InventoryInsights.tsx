
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFabricLibrary, mockFabricItems } from "@/hooks/useFabricLibrary";
import { TrendingUp, TrendingDown, AlertTriangle, Package } from "lucide-react";

export const InventoryInsights = () => {
  const { data: fabricItems = mockFabricItems, isLoading } = useFabricLibrary();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-1"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate insights from fabric items
  const totalValue = fabricItems.reduce((sum, item) => sum + (item.cost_per_unit * item.quantity_in_stock), 0);
  const lowStockItems = fabricItems.filter(item => item.quantity_in_stock <= item.reorder_point);
  const totalItems = fabricItems.length;
  const averageValue = totalItems > 0 ? totalValue / totalItems : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Across {totalItems} items
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{lowStockItems.length}</div>
          <p className="text-xs text-muted-foreground">
            Need reordering
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Item Value</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${averageValue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Per fabric item
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          <Package className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalItems}</div>
          <p className="text-xs text-muted-foreground">
            In inventory
          </p>
        </CardContent>
      </Card>

      {lowStockItems.length > 0 && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base">Items Requiring Attention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <Badge variant="outline" className="ml-2">{item.fabric_type}</Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-orange-600">
                      {item.quantity_in_stock} remaining
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Reorder at {item.reorder_point}
                    </div>
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

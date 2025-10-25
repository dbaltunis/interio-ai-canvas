import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const ReorderSuggestions = () => {
  const { data: items, isLoading } = useEnhancedInventory();

  // Calculate items that need reordering - only for items with stock tracking enabled
  const lowStockItems = items?.filter(item => {
    const threshold = item.reorder_point;
    // Only show suggestions for items that have a reorder_point set (indicating they track stock)
    if (!threshold || threshold === 0 || !item.active) return false;
    
    const current = item.quantity || 0;
    return current <= threshold;
  }) || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!lowStockItems || lowStockItems.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">All items are well stocked</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Items Needing Reorder ({lowStockItems.length})
          </CardTitle>
        </CardHeader>
      </Card>

      {lowStockItems.map((item) => {
        const current = item.quantity || 0;
        const threshold = item.reorder_point || 0;
        const suggested = (threshold * 2); // Default to 2x threshold
        
        return (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    SKU: {item.sku || 'N/A'}
                  </p>
                </div>
                <Badge variant="destructive">Low Stock</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Current Stock</p>
                  <p className="font-semibold">{current} {item.unit || 'units'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reorder Threshold</p>
                  <p className="font-semibold">{threshold} {item.unit || 'units'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Suggested Order</p>
                  <p className="font-semibold text-primary">{suggested} {item.unit || 'units'}</p>
                </div>
              </div>

              {item.supplier && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Supplier</p>
                  <p className="font-medium">{item.supplier}</p>
                </div>
              )}

              {item.cost_price && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Estimated Cost</p>
                  <p className="font-semibold">
                    ${(item.cost_price * suggested).toFixed(2)}
                  </p>
                </div>
              )}

              <Button className="w-full" variant="outline">
                Create Purchase Order
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

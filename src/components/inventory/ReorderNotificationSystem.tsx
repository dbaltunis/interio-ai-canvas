import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { AlertTriangle, Package, ShoppingCart, Bell } from "lucide-react";

export const ReorderNotificationSystem = () => {
  const { data: inventory, isLoading } = useEnhancedInventory();
  // Only show alerts for items with stock tracking enabled (have a reorder_point set)
  const lowStockItems = inventory?.filter(item => {
    const threshold = item.reorder_point;
    // Skip items without stock tracking (no reorder point set)
    if (!threshold || threshold === 0 || !item.active) return false;
    
    const current = item.quantity || 0;
    return current <= threshold;
  }) || [];

  // Auto-create notifications for critically low items
  useEffect(() => {
    if (lowStockItems) {
      const criticalItems = lowStockItems.filter(item => 
        item.quantity <= Math.floor((item.reorder_point || 0) / 2)
      );
      
      criticalItems.forEach(item => {
        // Only create alerts for items that are really critical (less than half reorder point)
        if (item.quantity < 3) {
          // This would normally check if alert already exists
          console.log(`Critical stock alert needed for ${item.name}: ${item.quantity} remaining`);
        }
      });
    }
  }, [lowStockItems]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-8 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!lowStockItems || lowStockItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-green-500" />
            Stock Levels Good
          </CardTitle>
          <CardDescription>
            All inventory items are above their reorder points
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No reorder alerts at this time</p>
            <p className="text-sm">System monitoring {lowStockItems?.length || 0} items</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const criticalItems = lowStockItems.filter(item => 
    item.quantity <= Math.floor((item.reorder_point || 0) / 2)
  );
  
  const lowItems = lowStockItems.filter(item => 
    item.quantity > Math.floor((item.reorder_point || 0) / 2) && 
    item.quantity <= (item.reorder_point || 0)
  );

  const handleCreateReorderAlert = async (itemId: string) => {
    try {
      console.log('Creating reorder alert for item:', itemId);
      // TODO: Implement actual reorder alert creation
    } catch (error) {
      console.error('Failed to create reorder alert:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Critical Stock Alerts */}
      {criticalItems.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Stock Alert!</AlertTitle>
          <AlertDescription>
            {criticalItems.length} item(s) are critically low and need immediate reordering
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-yellow-500" />
            Reorder Notifications
          </CardTitle>
          <CardDescription>
            Items below reorder point that need attention
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Critical Items */}
          {criticalItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-red-800">{item.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="destructive" className="text-xs">
                      Critical: {item.quantity} {item.unit} left
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Reorder at: {item.reorder_point}
                    </span>
                  </div>
                  <div className="text-sm text-red-600 mt-1">
                    Suggested order: {item.reorder_point || 10} {item.unit}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleCreateReorderAlert(item.id)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Order Now
                </Button>
              </div>
            </div>
          ))}

          {/* Low Stock Items */}
          {lowItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg bg-yellow-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-800">{item.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs bg-yellow-200">
                      Low Stock: {item.quantity} {item.unit}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Reorder at: {item.reorder_point}
                    </span>
                  </div>
                  <div className="text-sm text-yellow-700 mt-1">
                    Suggested order: {item.reorder_point || 10} {item.unit} from {item.supplier}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleCreateReorderAlert(item.id)}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Alert
                </Button>
                <Button size="sm">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Reorder
                </Button>
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Reorder Summary</h4>
            <div className="grid gap-2 md:grid-cols-3 text-sm">
              <div>
                <span className="font-medium text-red-600">{criticalItems.length}</span> Critical items
              </div>
              <div>
                <span className="font-medium text-yellow-600">{lowItems.length}</span> Low stock items
              </div>
              <div>
                <span className="font-medium">
                  ${lowStockItems.reduce((sum, item) => 
                    sum + ((item.selling_price || 0) * (item.reorder_point || 10)), 0
                  ).toFixed(2)}
                </span> Total reorder value
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
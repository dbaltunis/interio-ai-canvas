
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, AlertTriangle, TrendingUp, Package } from "lucide-react";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { useHasPermission } from "@/hooks/usePermissions";
import { InventoryImportDialog } from "./InventoryImportDialog";
import { ShopifyProductSyncButton } from "../library/shopify/ShopifyProductSyncButton";

export const InventoryManagement = () => {
  // Permission checks
  const canViewInventory = useHasPermission('view_inventory');
  const canManageInventory = useHasPermission('manage_inventory');

  const { data: inventory, isLoading } = useEnhancedInventory();
  
  // Calculate low stock items from enhanced inventory
  const lowStockItems = inventory?.filter(item => 
    item.reorder_point && 
    (item.quantity || 0) <= item.reorder_point
  ) || [];

  // Handle permission loading with proper loading check
  if (canViewInventory === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <div className="text-lg text-muted-foreground">Loading inventory...</div>
        </div>
      </div>
    );
  }

  // If user doesn't have permission to view inventory, show access denied
  if (!canViewInventory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to view inventory.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading inventory...</div>;
  }

  const totalValue = inventory?.reduce((sum, item) => {
    const unitPrice = item.selling_price || item.price_per_unit || item.cost_price || 0;
    return sum + (unitPrice * (item.quantity || 0));
  }, 0) || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Smart inventory tracking with real-time stock levels
          </p>
        </div>
        {canManageInventory && (
          <div className="flex items-center gap-2">
            <ShopifyProductSyncButton />
            <InventoryImportDialog />
            <Button variant="default">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        )}
      </div>

      {/* Inventory Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="modern-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </div>

        <div className="modern-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-company-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-company-warning">{lowStockItems?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Items need restocking
            </p>
          </CardContent>
        </div>

        <div className="modern-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Current stock value
            </p>
          </CardContent>
        </div>

        <div className="modern-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <TrendingUp className="h-4 w-4 text-company-tertiary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-company-tertiary">
              {new Set(inventory?.map(item => item.category)).size || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Different categories
            </p>
          </CardContent>
        </div>
      </div>

      {/* AI Recommendations */}
      {lowStockItems && lowStockItems.length > 0 && (
        <div className="modern-card">
          <CardHeader>
            <CardTitle>Stock Alerts</CardTitle>
            <CardDescription>Items requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {lowStockItems.slice(0, 3).map((item) => (
                <div key={item.id} className="p-3 bg-company-warning/10 rounded-lg border border-company-warning/20">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-company-warning" />
                    <span className="font-medium text-company-warning">Low Stock</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.name} - Only {item.quantity} {item.unit} remaining
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </div>
      )}

      {/* Inventory Table */}
      <div className="modern-card">
        <CardHeader>
          <CardTitle>Current Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {!inventory || inventory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="mx-auto h-12 w-12 mb-4" />
              <p>No inventory items found. Add your first item to get started!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Cost/Unit</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => {
                  const isLowStock = lowStockItems?.some(lowItem => lowItem.id === item.id);
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                        {item.sku && (
                          <div className="text-sm text-muted-foreground">{item.sku}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.quantity} units
                      </TableCell>
                      <TableCell>
                        {(item.selling_price || item.price_per_unit || item.cost_price) 
                          ? formatCurrency(item.selling_price || item.price_per_unit || item.cost_price || 0) 
                          : "N/A"}
                      </TableCell>
                      <TableCell>{item.supplier || "N/A"}</TableCell>
                      <TableCell>
                        {isLowStock ? (
                          <Badge variant="outline" className="bg-company-warning/10 text-company-warning border-company-warning/20">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-company-tertiary/10 text-company-tertiary border-company-tertiary/20">
                            In Stock
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                          {isLowStock && (
                            <Button variant="outline" size="sm">
                              Reorder
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </div>
    </div>
  );
};

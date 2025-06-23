
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, AlertTriangle, TrendingUp, Package } from "lucide-react";

const mockInventory = [
  {
    id: "FAB-001",
    name: "Velvet Navy",
    type: "Fabric",
    supplier: "Prestigious Textiles",
    stock: "5.2m",
    lowStock: true,
    price: "$45.00/m",
    lastOrdered: "2024-01-10"
  },
  {
    id: "LIN-002", 
    name: "Blackout Standard",
    type: "Lining",
    supplier: "Clarke & Clarke",
    stock: "28.5m", 
    lowStock: false,
    price: "$12.00/m",
    lastOrdered: "2024-01-05"
  },
  {
    id: "HAR-003",
    name: "Silent Gliss Track",
    type: "Hardware",
    supplier: "Silent Gliss",
    stock: "3 sets",
    lowStock: true,
    price: "$89.00/set",
    lastOrdered: "2023-12-20"
  }
];

export const InventoryManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
          <p className="text-muted-foreground">
            Smart inventory tracking with AI-powered restocking alerts
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Inventory Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">3</div>
            <p className="text-xs text-muted-foreground">
              Items need restocking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$18,420</div>
            <p className="text-xs text-muted-foreground">
              Current stock value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turnover Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">4.2x</div>
            <p className="text-xs text-muted-foreground">
              Annual turnover
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI Inventory Insights</CardTitle>
          <CardDescription>Smart recommendations based on usage patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-900">Restock Alert</span>
              </div>
              <p className="text-sm text-orange-700 mt-1">
                Velvet Navy is running low - suggest ordering 20m based on usage
              </p>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Trending Item</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Linen textures gaining popularity - consider expanding range
              </p>
            </div>

            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-900">Substitution</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Cotton Navy available as alternative to Velvet Navy
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Last Ordered</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.id}</div>
                  </TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.supplier}</TableCell>
                  <TableCell className="font-medium">{item.stock}</TableCell>
                  <TableCell>{item.price}</TableCell>
                  <TableCell>{item.lastOrdered}</TableCell>
                  <TableCell>
                    {item.lowStock ? (
                      <Badge className="bg-orange-100 text-orange-800">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Low Stock
                      </Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800">
                        In Stock
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        Reorder
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

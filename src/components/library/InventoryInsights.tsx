import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Package,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Download,
  Upload,
  Barcode,
  Calculator,
  Palette,
  Settings
} from 'lucide-react';
import { useInventory } from '@/hooks/useInventoryManagement';
import { useVendors } from '@/hooks/useVendors';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export const InventoryInsights = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: inventory } = useInventory();
  const { data: vendors } = useVendors();

  // Calculate inventory metrics
  const totalItems = inventory?.length || 0;
  const totalValue = inventory?.reduce((sum, item) => sum + (item.quantity * (item.cost_per_unit || 0)), 0) || 0;
  
  const lowStockItems = inventory?.filter(item => 
    item.quantity <= (item.reorder_point || 10)
  ) || [];
  
  const outOfStockItems = inventory?.filter(item => item.quantity <= 0) || [];

  // Category distribution
  const categoryData = inventory?.reduce((acc: any[], item) => {
    const existingCategory = acc.find(cat => cat.name === item.category);
    if (existingCategory) {
      existingCategory.value += 1;
      existingCategory.totalValue += item.quantity * (item.cost_per_unit || 0);
    } else {
      acc.push({
        name: item.category,
        value: 1,
        totalValue: item.quantity * (item.cost_per_unit || 0),
        color: getCategoryColor(item.category)
      });
    }
    return acc;
  }, []) || [];

  // Top vendors by inventory value
  const vendorData = vendors?.map(vendor => {
    const vendorItems = inventory?.filter(item => item.supplier === vendor.name) || [];
    const totalValue = vendorItems.reduce((sum, item) => sum + (item.quantity * (item.cost_per_unit || 0)), 0);
    return {
      name: vendor.name,
      itemCount: vendorItems.length,
      totalValue: totalValue
    };
  }).sort((a, b) => b.totalValue - a.totalValue).slice(0, 5) || [];

  function getCategoryColor(category: string) {
    const colors = {
      'fabric': '#8884d8',
      'hardware': '#82ca9d', 
      'trim': '#ffc658',
      'lining': '#ff7300',
      'cord': '#00c49f',
      'accessory': '#0088fe'
    };
    return colors[category.toLowerCase() as keyof typeof colors] || '#888888';
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inventory Insights</h2>
          <p className="text-gray-600">Stock levels, trends, and inventory analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import Stock
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="text-blue-600">
                +12 new this month
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="text-green-600">
                +8.5% from last month
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockItems.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-4">
              <Badge variant="destructive">
                Needs attention
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockItems.length}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
            <div className="mt-4">
              <Badge variant="destructive">
                Urgent action required
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Stock Alerts</TabsTrigger>
          <TabsTrigger value="vendors">Vendor Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, value}) => `${name}: ${value}`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Value Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((category) => (
                    <div key={category.name} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className="text-sm text-gray-500">
                          ${category.totalValue.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={(category.totalValue / totalValue) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Stock Added</p>
                    <p className="text-xs text-gray-600">50 yards of Silk Damask fabric received</p>
                  </div>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">New Item Added</p>
                    <p className="text-xs text-gray-600">Premium curtain rod hardware set</p>
                  </div>
                  <span className="text-xs text-gray-500">5 hours ago</span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Low Stock Alert</p>
                    <p className="text-xs text-gray-600">Cotton Velvet running low - 3 yards remaining</p>
                  </div>
                  <span className="text-xs text-gray-500">1 day ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Critical - Out of Stock</CardTitle>
              </CardHeader>
              <CardContent>
                {outOfStockItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No items out of stock</p>
                ) : (
                  <div className="space-y-3">
                    {outOfStockItems.slice(0, 5).map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-600">{item.category}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          Reorder
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">Warning - Low Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowStockItems.slice(0, 5).map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-600">
                          {item.quantity} {item.unit} remaining (reorder at {item.reorder_point})
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Add Stock
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Vendors by Inventory Value</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={vendorData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Value']} />
                  <Bar dataKey="totalValue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendorData.slice(0, 5).map((vendor, index) => (
                    <div key={vendor.name} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{vendor.name}</p>
                        <p className="text-sm text-gray-600">{vendor.itemCount} items</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${vendor.totalValue.toLocaleString()}</p>
                        <Badge variant={index < 2 ? "default" : "secondary"}>
                          {index < 2 ? "Top Supplier" : "Regular"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <Calculator className="h-6 w-6" />
                    <span className="text-sm">Calculate Usage</span>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <Barcode className="h-6 w-6" />
                    <span className="text-sm">Scan Item</span>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <Palette className="h-6 w-6" />
                    <span className="text-sm">Color Match</span>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <Settings className="h-6 w-6" />
                    <span className="text-sm">Settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Inventory Trends</h3>
                <p className="text-gray-600">
                  Historical usage patterns, seasonal trends, and forecasting will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
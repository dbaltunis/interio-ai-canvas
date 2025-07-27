import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Package, AlertTriangle, DollarSign, RotateCcw } from "lucide-react";

export const InventoryAnalytics = () => {
  // Mock data for charts
  const stockLevelData = [
    { category: "Curtain Fabrics", inStock: 85, lowStock: 12, outOfStock: 3 },
    { category: "Blind Materials", inStock: 92, lowStock: 6, outOfStock: 2 },
    { category: "Tracks", inStock: 78, lowStock: 18, outOfStock: 4 },
    { category: "Rods", inStock: 88, lowStock: 10, outOfStock: 2 },
    { category: "Motors", inStock: 45, lowStock: 35, outOfStock: 20 },
    { category: "Accessories", inStock: 95, lowStock: 4, outOfStock: 1 },
  ];

  const turnoverData = [
    { month: "Jan", turnover: 2.4 },
    { month: "Feb", turnover: 2.8 },
    { month: "Mar", turnover: 3.2 },
    { month: "Apr", turnover: 2.9 },
    { month: "May", turnover: 3.5 },
    { month: "Jun", turnover: 3.8 },
  ];

  const categoryValueData = [
    { name: "Fabrics", value: 45000, color: "#3b82f6" },
    { name: "Hardware", value: 28000, color: "#10b981" },
    { name: "Motors", value: 15000, color: "#f59e0b" },
    { name: "Accessories", value: 8000, color: "#ef4444" },
  ];

  const topMovingItems = [
    { name: "Luxury Velvet Navy", category: "Fabric", sold: 145, revenue: 7250 },
    { name: "Chrome Track 2m", category: "Hardware", sold: 89, revenue: 4005 },
    { name: "Somfy Motor RTS", category: "Motor", sold: 34, revenue: 9690 },
    { name: "Blackout Roller White", category: "Fabric", sold: 76, revenue: 3800 },
    { name: "Wall Brackets Steel", category: "Hardware", sold: 156, revenue: 1950 },
  ];

  const deadStockItems = [
    { name: "Vintage Lace Pattern", category: "Fabric", daysStagnant: 180, value: 890 },
    { name: "Brass Rod Ornate", category: "Hardware", daysStagnant: 145, value: 450 },
    { name: "Old Motor Model", category: "Motor", daysStagnant: 220, value: 1200 },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Inventory Value</p>
                <p className="text-2xl font-bold">$96,000</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +5.2% from last month
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
                <p className="text-sm font-medium text-muted-foreground">Average Turnover</p>
                <p className="text-2xl font-bold">3.2x</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +0.3x from last quarter
                </p>
              </div>
              <RotateCcw className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold">23</p>
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +8 from last week
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
                <p className="text-sm font-medium text-muted-foreground">Dead Stock Value</p>
                <p className="text-2xl font-bold">$2,540</p>
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3" />
                  Action required
                </p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
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

        {/* Inventory Turnover Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Turnover Trend</CardTitle>
            <CardDescription>
              Monthly inventory turnover rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={turnoverData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="turnover" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
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

        {/* Top Moving Items */}
        <Card>
          <CardHeader>
            <CardTitle>Top Moving Items</CardTitle>
            <CardDescription>
              Best performing products by revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topMovingItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${item.revenue.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{item.sold} sold</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dead Stock Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Dead Stock Analysis
          </CardTitle>
          <CardDescription>
            Items that haven't moved in over 90 days - consider promotions or liquidation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deadStockItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Stagnant for {item.daysStagnant} days
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-red-600">${item.value}</div>
                  <div className="text-xs text-muted-foreground">Value at risk</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Users, FileText, Package } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";

export const Dashboard = () => {
  const { data: stats, isLoading } = useDashboardStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
          <p className="text-muted-foreground">
            Here's what's happening with your window covering business today.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Quote
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : formatCurrency(stats?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              From accepted quotes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats?.totalClients || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total clients in system
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats?.pendingQuotes || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting client response
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats?.lowStockItems || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Needs restocking
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Welcome to InterioApp!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Start by adding your first client or inventory item
                  </p>
                </div>
                <div className="ml-auto font-medium">Now</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Smart recommendations for your business</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  Getting Started
                </p>
                <p className="text-xs text-blue-700">
                  Add your first client to start managing projects
                </p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-900">
                  Inventory Setup
                </p>
                <p className="text-xs text-green-700">
                  Stock your inventory to track materials and costs
                </p>
              </div>
              
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-sm font-medium text-orange-900">
                  Quote Management
                </p>
                <p className="text-xs text-orange-700">
                  Create professional quotes for your clients
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  FileText, 
  Package, 
  TrendingUp,
  Calendar,
  DollarSign,
  LayoutGrid,
  Table
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useUserCurrency, formatCurrency } from "@/components/job-creation/treatment-pricing/window-covering-options/currencyUtils";
import { ProtectedAnalytics } from "./ProtectedAnalytics";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { TeamPresenceCard } from "@/components/team/TeamPresenceCard";
import { EnhancedDashboard } from "./EnhancedDashboard";

const Dashboard = () => {
  const { data: stats, isLoading } = useDashboardStats();
  const userCurrency = useUserCurrency();
  const [viewMode, setViewMode] = useState<'classic' | 'crm'>('crm');

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded-lg w-48 animate-shimmer" />
          <div className="h-4 bg-muted rounded w-96 animate-shimmer" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2 pb-3">
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded-full w-4 ml-auto" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/3 mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show CRM view by default
  if (viewMode === 'crm') {
    return <EnhancedDashboard />;
  }

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-lg">Welcome back! Here's what's happening with your business.</p>
        </div>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-auto">
          <TabsList className="grid w-[240px] grid-cols-2">
            <TabsTrigger value="crm" className="gap-2">
              <Table className="h-4 w-4" />
              CRM View
            </TabsTrigger>
            <TabsTrigger value="classic" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              Classic
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PermissionGuard permission="view_clients">
          <Card className="group hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Clients</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">{stats?.totalClients || 0}</div>
              <p className="text-sm text-muted-foreground">Active clients</p>
            </CardContent>
          </Card>
        </PermissionGuard>

        <PermissionGuard permission="view_jobs">
          <Card className="group hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Quotes</CardTitle>
              <div className="p-2 bg-warning/10 rounded-lg group-hover:bg-warning/20 transition-colors">
                <FileText className="h-4 w-4 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">{stats?.pendingQuotes || 0}</div>
              <p className="text-sm text-muted-foreground">Awaiting response</p>
            </CardContent>
          </Card>
        </PermissionGuard>

        <PermissionGuard permission="view_inventory">
          <Card className="group hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Items</CardTitle>
              <div className="p-2 bg-destructive/10 rounded-lg group-hover:bg-destructive/20 transition-colors">
                <Package className="h-4 w-4 text-destructive" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">{stats?.lowStockItems || 0}</div>
              <p className="text-sm text-muted-foreground">Need reordering</p>
            </CardContent>
          </Card>
        </PermissionGuard>

        <ProtectedAnalytics>
          <Card className="group hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <div className="p-2 bg-success/10 rounded-lg group-hover:bg-success/20 transition-colors">
                <DollarSign className="h-4 w-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">{formatCurrency(stats?.totalRevenue || 0, userCurrency)}</div>
              <p className="text-sm text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </ProtectedAnalytics>
      </div>

      {/* Enhanced Quick Actions Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PermissionGuard permission="view_calendar">
          <Card className="hover:shadow-md transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold">
                <div className="p-2 bg-info/10 rounded-lg mr-3">
                  <Calendar className="h-5 w-5 text-info" />
                </div>
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 space-y-3">
                <div className="p-4 bg-muted/30 rounded-lg inline-block">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No recent activity to display</p>
              </div>
            </CardContent>
          </Card>
        </PermissionGuard>

        <TeamPresenceCard />

        <ProtectedAnalytics>
          <Card className="hover:shadow-md transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold">
                <div className="p-2 bg-success/10 rounded-lg mr-3">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                  <span className="text-sm text-muted-foreground">Conversion Rate</span>
                  <span className="font-semibold text-foreground">--</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                  <span className="text-sm text-muted-foreground">Average Order Value</span>
                  <span className="font-semibold text-foreground">--</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                  <span className="text-sm text-muted-foreground">Customer Satisfaction</span>
                  <span className="font-semibold text-foreground">--</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </ProtectedAnalytics>
      </div>
    </div>
  );
};

export default Dashboard;
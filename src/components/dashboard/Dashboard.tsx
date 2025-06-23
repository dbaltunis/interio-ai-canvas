
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, DollarSign, Users, TrendingUp, Bell, AlertTriangle, Package } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useUnreadNotifications } from "@/hooks/useNotifications";
import { useLowStockItems } from "@/hooks/useInventory";
import { useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: unreadNotifications } = useUnreadNotifications();
  const { data: lowStockItems } = useLowStockItems();
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (statsLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your business.
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex space-x-2">
          {unreadNotifications && unreadNotifications.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => navigate('/notifications')}
              className="relative"
            >
              <Bell className="mr-2 h-4 w-4" />
              Notifications
              <Badge className="ml-2">{unreadNotifications.length}</Badge>
            </Button>
          )}
        </div>
      </div>

      {/* Alert Cards */}
      {lowStockItems && lowStockItems.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <CardTitle className="text-yellow-800">Low Stock Alert</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 mb-3">
              {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} running low on stock
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/inventory')}
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
            >
              <Package className="mr-2 h-4 w-4" />
              Manage Inventory
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalClients || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active client relationships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingQuotes || 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting client response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              From accepted quotes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats?.lowStockItems || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Need reordering
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Notifications */}
      {unreadNotifications && unreadNotifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Recent Notifications
            </CardTitle>
            <CardDescription>
              You have {unreadNotifications.length} unread notification{unreadNotifications.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unreadNotifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className="flex items-center p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  </div>
                  <Badge variant="secondary">New</Badge>
                </div>
              ))}
              {unreadNotifications.length > 3 && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/notifications')}
                  className="w-full"
                >
                  View All Notifications
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/projects')}>
          <CardHeader>
            <CardTitle className="text-lg">Manage Projects</CardTitle>
            <CardDescription>View and update project status</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Go to Projects
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/quotes')}>
          <CardHeader>
            <CardTitle className="text-lg">Create Quote</CardTitle>
            <CardDescription>Generate new project quotes</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              New Quote
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/calendar')}>
          <CardHeader>
            <CardTitle className="text-lg">Schedule Appointment</CardTitle>
            <CardDescription>Book client meetings</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Open Calendar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

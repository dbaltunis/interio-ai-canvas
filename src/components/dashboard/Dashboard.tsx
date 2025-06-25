
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarDays, DollarSign, Users, TrendingUp, Bell, AlertTriangle, Package, Plus } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { useQuotes } from "@/hooks/useQuotes";

export const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: clients } = useClients();
  const { data: quotes } = useQuotes();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Use quotes for recent jobs since that's what shows in the jobs table
  const recentJobs = quotes?.slice(0, 5) || [];

  const getClientName = (clientId: string) => {
    const client = clients?.find(c => c.id === clientId);
    return client?.name || 'Unknown Client';
  };

  if (statsLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your business.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Job
        </Button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotes?.length || 0}</div>
            <p className="text-xs text-gray-500">Active quotes/jobs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Quotes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotes?.filter(q => q.status === 'draft').length || 0}</div>
            <p className="text-xs text-gray-500">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(quotes?.reduce((sum, quote) => sum + (quote.total_amount || 0), 0) || 0)}</div>
            <p className="text-xs text-gray-500">From all quotes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients?.length || 0}</div>
            <p className="text-xs text-gray-500">Client relationships</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Jobs Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Jobs
                <Button variant="outline" size="sm">View All</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectsLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : recentJobs.length > 0 ? (
                    recentJobs.map((quote) => {
                      const project = projects?.find(p => p.id === quote.project_id);
                      return (
                        <TableRow key={quote.id}>
                          <TableCell className="font-medium">{quote.quote_number || 'New Quote'}</TableCell>
                          <TableCell>{getClientName(quote.client_id)}</TableCell>
                          <TableCell>
                            <Badge variant={quote.status === 'completed' ? 'default' : 'secondary'}>
                              {quote.status || 'draft'}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(quote.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">{formatCurrency(quote.total_amount || 0)}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500">No recent jobs</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Emails Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Emails</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Quote Request</p>
                    <p className="text-xs text-gray-500">Sarah Johnson</p>
                  </div>
                  <Badge variant="secondary">New</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Project Update</p>
                    <p className="text-xs text-gray-500">Mike Davis</p>
                  </div>
                  <Badge variant="outline">Read</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Invoice Payment</p>
                    <p className="text-xs text-gray-500">Lisa Chen</p>
                  </div>
                  <Badge variant="outline">Read</Badge>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" size="sm">
                View All Emails
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Jobs This Week</span>
                <span className="font-semibold">{quotes?.filter(q => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return new Date(q.created_at) > weekAgo;
                }).length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Approvals</span>
                <span className="font-semibold">{quotes?.filter(q => q.status === 'draft').length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Projects</span>
                <span className="font-semibold">{projects?.filter(p => p.status !== 'completed').length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed Jobs</span>
                <span className="font-semibold text-green-600">{quotes?.filter(q => q.status === 'completed').length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

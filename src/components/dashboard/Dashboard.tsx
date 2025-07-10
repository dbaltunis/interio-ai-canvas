
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  CalendarDays, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Bell, 
  AlertTriangle, 
  Package, 
  Plus,
  Clock,
  Target,
  Zap,
  BarChart3,
  Mail,
  Eye,
  MousePointer,
  Send
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { useQuotes } from "@/hooks/useQuotes";
import { useEmailKPIs } from "@/hooks/useEmails";
import { useKPIConfig, KPIData } from "@/hooks/useKPIConfig";
import { KPICard } from "./KPICard";
import { DraggableKPISection } from "./DraggableKPISection";
import { KPIConfigDialog } from "./KPIConfigDialog";
import { RevenueChart } from "./RevenueChart";
import { QuickActions } from "./QuickActions";
import { PipelineOverview } from "./PipelineOverview";

export const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: clients } = useClients();
  const { data: quotes } = useQuotes();
  const { data: emailKPIs } = useEmailKPIs();
  const { kpiConfigs, toggleKPI, reorderKPIs, getEnabledKPIs } = useKPIConfig();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculate KPIs
  const totalRevenue = quotes?.reduce((sum, quote) => sum + (quote.total_amount || 0), 0) || 0;
  const pendingQuotes = quotes?.filter(q => q.status === 'draft').length || 0;
  const activeProjects = projects?.filter(p => p.status !== 'completed').length || 0;
  const completedJobs = quotes?.filter(q => q.status === 'completed').length || 0;

  // KPI Data mapping
  const allKPIData: KPIData[] = [
    {
      id: 'total-revenue',
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      subtitle: 'All time revenue',
      icon: DollarSign,
      trend: { value: 12.5, isPositive: true },
      loading: statsLoading,
      category: 'primary'
    },
    {
      id: 'active-projects',
      title: 'Active Projects',
      value: activeProjects,
      subtitle: 'Currently in progress',
      icon: Target,
      trend: { value: 8.3, isPositive: true },
      loading: projectsLoading,
      category: 'primary'
    },
    {
      id: 'pending-quotes',
      title: 'Pending Quotes',
      value: pendingQuotes,
      subtitle: 'Awaiting response',
      icon: Clock,
      trend: { value: -2.1, isPositive: false },
      loading: statsLoading,
      category: 'primary'
    },
    {
      id: 'total-clients',
      title: 'Total Clients',
      value: clients?.length || 0,
      subtitle: 'Active relationships',
      icon: Users,
      trend: { value: 15.7, isPositive: true },
      loading: !clients,
      category: 'primary'
    },
    {
      id: 'emails-sent',
      title: 'Emails Sent',
      value: emailKPIs?.totalSent || 0,
      subtitle: 'Total emails sent',
      icon: Send,
      trend: { value: 23.1, isPositive: true },
      loading: !emailKPIs,
      category: 'email'
    },
    {
      id: 'open-rate',
      title: 'Open Rate',
      value: `${emailKPIs?.openRate || 0}%`,
      subtitle: 'Email open percentage',
      icon: Eye,
      trend: { value: 5.2, isPositive: true },
      loading: !emailKPIs,
      category: 'email'
    },
    {
      id: 'click-rate',
      title: 'Click Rate',
      value: `${emailKPIs?.clickRate || 0}%`,
      subtitle: 'Email click percentage',
      icon: MousePointer,
      trend: { value: 2.8, isPositive: true },
      loading: !emailKPIs,
      category: 'email'
    },
    {
      id: 'avg-time-spent',
      title: 'Avg. Time Spent',
      value: emailKPIs?.avgTimeSpent || "0m 0s",
      subtitle: 'Time spent reading emails',
      icon: Clock,
      trend: { value: 15.3, isPositive: true },
      loading: !emailKPIs,
      category: 'email'
    },
    {
      id: 'conversion-rate',
      title: 'Conversion Rate',
      value: '68%',
      subtitle: 'Quote to project ratio',
      icon: TrendingUp,
      trend: { value: 5.2, isPositive: true },
      category: 'business'
    },
    {
      id: 'avg-quote-value',
      title: 'Avg Quote Value',
      value: formatCurrency(totalRevenue / (quotes?.length || 1)),
      subtitle: 'Per quote average',
      icon: Zap,
      trend: { value: 3.8, isPositive: true },
      category: 'business'
    },
    {
      id: 'completed-jobs',
      title: 'Completed Jobs',
      value: completedJobs,
      subtitle: 'Successfully finished',
      icon: Package,
      trend: { value: 22.1, isPositive: true },
      category: 'business'
    },
    {
      id: 'response-time',
      title: 'Response Time',
      value: '2.4 hrs',
      subtitle: 'Average quote response',
      icon: Clock,
      trend: { value: -15.3, isPositive: true },
      category: 'business'
    }
  ];

  // Get enabled KPIs for each category
  const getKPIsForCategory = (category: 'primary' | 'email' | 'business') => {
    const enabledConfigs = getEnabledKPIs(category);
    return enabledConfigs.map(config => 
      allKPIData.find(kpi => kpi.id === config.id)!
    ).filter(Boolean);
  };

  const primaryKPIs = getKPIsForCategory('primary');
  const emailKPIs_data = getKPIsForCategory('email');
  const businessKPIs = getKPIsForCategory('business');
  
  // Mock data for charts (replace with real data later)
  const revenueData = [
    { month: 'Jan', revenue: 15000, quotes: 12 },
    { month: 'Feb', revenue: 18000, quotes: 15 },
    { month: 'Mar', revenue: 22000, quotes: 18 },
    { month: 'Apr', revenue: 19000, quotes: 14 },
    { month: 'May', revenue: 25000, quotes: 20 },
    { month: 'Jun', revenue: 28000, quotes: 22 },
  ];

  const pipelineData = [
    { stage: 'Draft', count: pendingQuotes, value: 15000, color: '#EF4444' },
    { stage: 'Sent', count: 3, value: 12000, color: '#F59E0B' },
    { stage: 'Under Review', count: 2, value: 8000, color: '#3B82F6' },
    { stage: 'Accepted', count: 1, value: 5000, color: '#10B981' },
  ];

  const recentJobs = quotes?.slice(0, 5) || [];

  const getClientName = (clientId: string) => {
    const client = clients?.find(c => c.id === clientId);
    return client?.name || 'Unknown Client';
  };

  const handleQuickAction = (action: string) => {
    console.log(`Quick action: ${action}`);
    // These will be implemented to navigate to appropriate sections
  };

  if (statsLoading) {
    return <div className="flex items-center justify-center h-64">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">Business Dashboard</h1>
          <p className="text-brand-neutral">Track your business performance and key metrics</p>
        </div>
        <div className="flex gap-2">
          <KPIConfigDialog 
            kpiConfigs={kpiConfigs}
            onToggleKPI={toggleKPI}
          />
          <Button variant="outline" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Export Report
          </Button>
          <Button className="bg-brand-primary hover:bg-brand-accent flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Quote
          </Button>
        </div>
      </div>

      {/* KPI Sections */}
      <DraggableKPISection
        title="Primary KPIs"
        kpis={primaryKPIs}
        onReorder={(activeId, overId) => reorderKPIs('primary', activeId, overId)}
      />

      <DraggableKPISection
        title="Email Performance"
        kpis={emailKPIs_data}
        onReorder={(activeId, overId) => reorderKPIs('email', activeId, overId)}
      />

      <DraggableKPISection
        title="Business Performance"
        kpis={businessKPIs}
        onReorder={(activeId, overId) => reorderKPIs('business', activeId, overId)}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart - Spans 2 columns */}
        <div className="lg:col-span-2">
          <RevenueChart data={revenueData} />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions
            onNewJob={() => handleQuickAction('new-job')}
            onNewClient={() => handleQuickAction('new-client')}
            onCalculator={() => handleQuickAction('calculator')}
            onCalendar={() => handleQuickAction('calendar')}
            onInventory={() => handleQuickAction('inventory')}
          />
        </div>
      </div>

      {/* Pipeline and Recent Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Overview */}
        <PipelineOverview 
          data={pipelineData}
          totalValue={pipelineData.reduce((sum, stage) => sum + stage.value, 0)}
        />

        {/* Recent Jobs Table */}
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
                  <TableHead>Quote #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectsLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : recentJobs.length > 0 ? (
                  recentJobs.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">{quote.quote_number}</TableCell>
                      <TableCell>{getClientName(quote.client_id)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            quote.status === 'completed' ? 'default' : 
                            quote.status === 'sent' ? 'secondary' : 
                            'outline'
                          }
                        >
                          {quote.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(quote.total_amount || 0)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500">No recent jobs</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Business Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div>
                <p className="font-medium text-sm text-orange-900">Low Email Engagement</p>
                <p className="text-xs text-orange-700">Open rate below industry average (25%)</p>
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">Review Templates</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <p className="font-medium text-sm text-blue-900">Quote Follow-up</p>
                <p className="text-xs text-blue-700">5 quotes sent over 3 days ago</p>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">Send Reminder</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div>
                <p className="font-medium text-sm text-green-900">Installation Due</p>
                <p className="text-xs text-green-700">2 projects scheduled this week</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">Upcoming</Badge>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-500" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database Connection</span>
              <Badge className="bg-green-100 text-green-800">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Email Service</span>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Email Delivery Rate</span>
              <Badge className="bg-green-100 text-green-800">{emailKPIs?.deliveryRate || 0}%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">SendGrid Integration</span>
              <Badge variant="secondary">Setup Required</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Last Email Sync</span>
              <span className="text-xs text-gray-500">2 minutes ago</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

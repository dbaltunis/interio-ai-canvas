
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjects } from "@/hooks/useProjects";
import { useQuotes } from "@/hooks/useQuotes";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, Clock, Users, Target, Activity, Calendar, FileText, AlertCircle, CheckCircle } from "lucide-react";

export const JobsDashboard = () => {
  const { data: projects } = useProjects();
  const { data: quotes } = useQuotes();
  const { data: stats } = useDashboardStats();

  // Calculate job metrics
  const totalJobs = projects?.length || 0;
  const activeJobs = projects?.filter(p => p.status === 'in_progress')?.length || 0;
  const completedJobs = projects?.filter(p => p.status === 'completed')?.length || 0;
  const planningJobs = projects?.filter(p => p.status === 'planning')?.length || 0;

  // Calculate quote metrics
  const totalQuotes = quotes?.length || 0;
  const acceptedQuotes = quotes?.filter(q => q.status === 'accepted')?.length || 0;
  const pendingQuotes = quotes?.filter(q => q.status === 'sent')?.length || 0;
  const totalRevenue = quotes?.filter(q => q.status === 'accepted')?.reduce((sum, q) => sum + (q.total_amount || 0), 0) || 0;

  // Job status distribution for pie chart
  const statusData = [
    { name: 'Completed', value: completedJobs, color: '#10B981' },
    { name: 'In Progress', value: activeJobs, color: 'hsl(var(--primary))' },
    { name: 'Planning', value: planningJobs, color: '#F59E0B' },
    { name: 'On Hold', value: projects?.filter(p => p.status === 'on_hold')?.length || 0, color: '#EF4444' }
  ].filter(item => item.value > 0);

  // Recent activity
  const recentProjects = projects?.slice(0, 5) || [];
  const recentQuotes = quotes?.slice(0, 3) || [];

  // Monthly performance (mock data for demo)
  const monthlyData = [
    { month: 'Jan', jobs: 8, revenue: 12500 },
    { month: 'Feb', jobs: 12, revenue: 18200 },
    { month: 'Mar', jobs: 10, revenue: 15800 },
    { month: 'Apr', jobs: 15, revenue: 22100 },
    { month: 'May', jobs: 13, revenue: 19500 },
    { month: 'Jun', jobs: 18, revenue: 25000 }
  ];

  return (
    <div className="panel rounded-xl p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-brand-primary">Jobs Dashboard</h1>
        <p className="text-muted-foreground mt-1">Complete overview of your business performance</p>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="w-4 h-4 mr-2 text-primary" />
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalJobs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeJobs} in progress • {completedJobs} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-green-600" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              From accepted quotes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <FileText className="w-4 h-4 mr-2 text-primary" />
              Quote Versions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalQuotes}</div>
            <p className="text-xs text-gray-500 mt-1">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="w-4 h-4 mr-2 text-orange-600" />
              Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.totalClients || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active customer base
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full overflow-x-auto justify-start gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Job Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Job Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {statusData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      {statusData.map((item) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-sm mr-2" 
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm">{item.name}</span>
                          </div>
                          <Badge variant="outline">{item.value}</Badge>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No jobs data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'revenue' ? `$${Number(value).toLocaleString()}` : value,
                        name === 'revenue' ? 'Revenue' : 'Jobs'
                      ]}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Projects Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <div key={project.id} className="panel flex items-center justify-between p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                    <div className="p-2 bg-muted rounded-lg">
                        <Target className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">{project.name}</h4>
                        <p className="text-sm text-gray-500">
                          {project.job_number} • Created {new Date(project.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      project.status === 'completed' ? 'default' : 
                      project.status === 'in_progress' ? 'secondary' : 'outline'
                    }>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
                
                {recentProjects.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                    No projects found. Create your first project to see it here.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completion Rate</span>
                  <span className="font-medium">
                    {totalJobs > 0 ? `${Math.round((completedJobs / totalJobs) * 100)}%` : '0%'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Quote Acceptance Rate</span>
                  <span className="font-medium">
                    {totalQuotes > 0 ? `${Math.round((acceptedQuotes / totalQuotes) * 100)}%` : '0%'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Project Value</span>
                  <span className="font-medium">
                    ${acceptedQuotes > 0 ? Math.round(totalRevenue / acceptedQuotes).toLocaleString() : '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Projects</span>
                  <span className="font-medium">{activeJobs}</span>
                </div>
              </CardContent>
            </Card>

            {/* Goals & Targets */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Revenue Goal</span>
                    <span className="text-sm">$30,000</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((totalRevenue / 30000) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Jobs Goal</span>
                    <span className="text-sm">25</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((totalJobs / 25) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Quotes Goal</span>
                    <span className="text-sm">40</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${Math.min((totalQuotes / 40) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Quotes */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Quotes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentQuotes.map((quote) => (
                    <div key={quote.id} className="panel flex items-center justify-between p-3 rounded-lg">
                      <div>
                        <h4 className="font-medium">{quote.quote_number}</h4>
                        <p className="text-sm text-gray-500">
                          ${quote.total_amount?.toLocaleString()} • {new Date(quote.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={
                        quote.status === 'accepted' ? 'default' : 
                        quote.status === 'sent' ? 'secondary' : 'outline'
                      }>
                        {quote.status}
                      </Badge>
                    </div>
                  ))}
                  
                  {recentQuotes.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No quotes found. Generate your first quote to see it here.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Target className="w-4 h-4 mr-2" />
                  Create New Project
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Add New Client
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Quote
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Appointment
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

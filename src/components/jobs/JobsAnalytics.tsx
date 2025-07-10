import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Calendar, 
  Clock, 
  Target, 
  Users, 
  CheckCircle,
  AlertTriangle,
  DollarSign,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useQuotes } from '@/hooks/useQuotes';
import { useProjects } from '@/hooks/useProjects';
import { useClients } from '@/hooks/useClients';
import { LineChart, Line, AreaChart, Area, PieChart as RechartsPieChart, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Pie } from 'recharts';

export const JobsAnalytics = () => {
  const { data: quotes } = useQuotes();
  const { data: projects } = useProjects();
  const { data: clients } = useClients();

  // Calculate analytics data
  const totalRevenue = quotes?.reduce((sum, quote) => sum + (quote.total_amount || 0), 0) || 0;
  const averageJobValue = totalRevenue / (quotes?.length || 1);
  const conversionRate = projects?.length && quotes?.length ? (projects.length / quotes.length) * 100 : 0;
  
  const statusDistribution = [
    { name: 'Draft', value: quotes?.filter(q => q.status === 'draft').length || 0, color: '#8884d8' },
    { name: 'Sent', value: quotes?.filter(q => q.status === 'sent').length || 0, color: '#82ca9d' },
    { name: 'Accepted', value: quotes?.filter(q => q.status === 'accepted').length || 0, color: '#ffc658' },
    { name: 'Completed', value: quotes?.filter(q => q.status === 'completed').length || 0, color: '#ff7300' },
  ];

  const monthlyRevenue = [
    { month: 'Jan', revenue: 15000, jobs: 12 },
    { month: 'Feb', revenue: 18000, jobs: 15 },
    { month: 'Mar', revenue: 22000, jobs: 18 },
    { month: 'Apr', revenue: 19000, jobs: 14 },
    { month: 'May', revenue: 25000, jobs: 20 },
    { month: 'Jun', revenue: 28000, jobs: 22 },
  ];

  const clientMetrics = [
    { name: 'Residential', value: 65, count: clients?.filter(c => c.client_type === 'B2C').length || 0 },
    { name: 'Commercial', value: 35, count: clients?.filter(c => c.client_type === 'B2B').length || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Jobs Analytics</h2>
          <p className="text-gray-600">Comprehensive business performance insights</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ${totalRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="text-green-600">
                +12.5% from last month
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {conversionRate.toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <Progress value={conversionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Job Value</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${averageJobValue.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="text-purple-600">
                +8.3% from last month
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold text-orange-600">
                  {clients?.length || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="text-orange-600">
                +5 new this month
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="status">Job Status</TabsTrigger>
          <TabsTrigger value="clients">Client Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Jobs Completed Per Month</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="jobs" stroke="#82ca9d" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Progress Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {statusDistribution.map((status) => (
                  <div key={status.name} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{status.name}</span>
                      <span className="text-sm text-gray-500">{status.value} jobs</span>
                    </div>
                    <Progress 
                      value={(status.value / (quotes?.length || 1)) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientMetrics.map((metric) => (
                    <div key={metric.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: metric.name === 'Residential' ? '#8884d8' : '#82ca9d' }}
                        />
                        <span className="font-medium">{metric.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{metric.count} clients</div>
                        <div className="text-sm text-gray-500">{metric.value}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Active Clients</span>
                  </div>
                  <span className="font-bold text-green-600">{clients?.length || 0}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Scheduled Meetings</span>
                  </div>
                  <span className="font-bold text-blue-600">8</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <span className="font-medium">Follow-ups Due</span>
                  </div>
                  <span className="font-bold text-orange-600">3</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Performance Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Performance Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <p className="font-medium text-sm text-yellow-900">Conversion Rate Below Target</p>
                <p className="text-xs text-yellow-700">Current rate is {conversionRate.toFixed(1)}%, target is 75%</p>
              </div>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Action Needed</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <p className="font-medium text-sm text-blue-900">New Lead Opportunities</p>
                <p className="text-xs text-blue-700">5 leads haven't been followed up in the last 7 days</p>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">Review</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Clock, Users, Target, Activity } from "lucide-react";

export const JobsAnalytics = () => {
  // Mock analytics data
  const monthlyRevenue = [
    { month: 'Jan', revenue: 12500, jobs: 8 },
    { month: 'Feb', revenue: 18200, jobs: 12 },
    { month: 'Mar', revenue: 15800, jobs: 10 },
    { month: 'Apr', revenue: 22100, jobs: 15 },
    { month: 'May', revenue: 19500, jobs: 13 },
    { month: 'Jun', revenue: 25000, jobs: 18 }
  ];

  const jobsByStatus = [
    { status: 'Completed', count: 45, value: 45, color: '#10B981' },
    { status: 'In Progress', count: 18, value: 18, color: '#3B82F6' },
    { status: 'Planning', count: 12, value: 12, color: '#F59E0B' },
    { status: 'On Hold', count: 5, value: 5, color: '#EF4444' }
  ];

  const clientTypes = [
    { type: 'B2B', count: 32, revenue: 125000 },
    { type: 'B2C', count: 48, revenue: 98000 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-brand-primary">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Performance insights and business metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$223,000</div>
            <p className="text-xs text-gray-500 mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +18% from last quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Jobs Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">45</div>
            <p className="text-xs text-gray-500 mt-1">
              80 total jobs this year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Avg. Project Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">14 days</div>
            <p className="text-xs text-gray-500 mt-1">
              -3 days from last quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Active Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">80</div>
            <p className="text-xs text-gray-500 mt-1">
              12 new this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue & Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `$${value.toLocaleString()}` : value,
                    name === 'revenue' ? 'Revenue' : 'Jobs'
                  ]}
                />
                <Bar dataKey="revenue" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Jobs by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Jobs by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={jobsByStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {jobsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {jobsByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-sm mr-2" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.status}</span>
                  </div>
                  <Badge variant="outline">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Client Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {clientTypes.map((client) => (
              <div key={client.type} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{client.type} Clients</h3>
                  <Badge variant={client.type === 'B2B' ? 'default' : 'secondary'}>
                    {client.count} clients
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  ${client.revenue.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500">
                  Avg: ${Math.round(client.revenue / client.count).toLocaleString()} per client
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

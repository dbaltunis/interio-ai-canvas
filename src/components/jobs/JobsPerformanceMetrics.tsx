
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/hooks/useProjects";
import { useQuotes } from "@/hooks/useQuotes";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Clock, DollarSign, Target, AlertTriangle } from "lucide-react";

export const JobsPerformanceMetrics = () => {
  const { data: projects } = useProjects();
  const { data: quotes } = useQuotes();

  // Calculate conversion metrics
  const totalQuotes = quotes?.length || 0;
  const acceptedQuotes = quotes?.filter(q => q.status === 'accepted')?.length || 0;
  const conversionRate = totalQuotes > 0 ? (acceptedQuotes / totalQuotes) * 100 : 0;

  // Calculate average project timeline
  const completedProjects = projects?.filter(p => p.status === 'completed' && p.start_date && p.completion_date) || [];
  const avgDuration = completedProjects.length > 0 
    ? completedProjects.reduce((sum, project) => {
        const start = new Date(project.start_date!);
        const end = new Date(project.completion_date!);
        return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      }, 0) / completedProjects.length
    : 0;

  // Revenue by month
  const revenueByMonth = quotes
    ?.filter(q => q.status === 'accepted' && q.created_at)
    ?.reduce((acc, quote) => {
      const month = new Date(quote.created_at).toLocaleDateString('en-US', { month: 'short' });
      acc[month] = (acc[month] || 0) + (quote.total_amount || 0);
      return acc;
    }, {} as Record<string, number>) || {};

  const monthlyRevenueData = Object.entries(revenueByMonth).map(([month, revenue]) => ({
    month,
    revenue
  }));

  // Project status breakdown
  const statusBreakdown = projects?.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const statusData = Object.entries(statusBreakdown).map(([status, count]) => ({
    name: status.replace('_', ' ').toUpperCase(),
    value: count,
    color: getStatusColor(status)
  }));

  // Performance indicators
  const metrics = [
    {
      title: "Quote Conversion Rate",
      value: `${conversionRate.toFixed(1)}%`,
      change: conversionRate > 50 ? "positive" : "negative",
      icon: Target,
      target: 60,
      current: conversionRate
    },
    {
      title: "Avg. Project Duration",
      value: `${Math.round(avgDuration)} days`,
      change: avgDuration < 30 ? "positive" : "negative",
      icon: Clock,
      target: 21,
      current: avgDuration
    },
    {
      title: "Revenue Growth",
      value: "+12.5%",
      change: "positive",
      icon: DollarSign,
      target: 15,
      current: 12.5
    },
    {
      title: "On-Time Completion",
      value: "87%",
      change: "positive",
      icon: TrendingUp,
      target: 90,
      current: 87
    }
  ];

  return (
    <div className="space-y-6">
      {/* Performance Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span className="flex items-center">
                    <Icon className="w-4 h-4 mr-2" />
                    {metric.title}
                  </span>
                  {metric.change === "positive" ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{metric.value}</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Target: {metric.target}{metric.title.includes('Rate') || metric.title.includes('Growth') || metric.title.includes('Completion') ? '%' : metric.title.includes('Duration') ? ' days' : ''}</span>
                  </div>
                  <Progress 
                    value={Math.min((metric.current / metric.target) * 100, 100)} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyRevenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No revenue data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
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
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {statusData.map((item) => (
                    <div key={item.name} className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-sm mr-2" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No project data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center mb-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                <span className="font-medium text-green-700">Strong Performance</span>
              </div>
              <p className="text-sm text-gray-600">
                Quote conversion rate is above average at {conversionRate.toFixed(1)}%
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center mb-2">
                <Clock className="w-4 h-4 text-blue-500 mr-2" />
                <span className="font-medium text-blue-700">Project Timing</span>
              </div>
              <p className="text-sm text-gray-600">
                Average project duration is {Math.round(avgDuration)} days
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-500 mr-2" />
                <span className="font-medium text-orange-700">Areas to Improve</span>
              </div>
              <p className="text-sm text-gray-600">
                Focus on reducing project timelines and increasing quote volume
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    completed: "#10B981",
    in_progress: "#3B82F6",
    planning: "#F59E0B",
    on_hold: "#EF4444",
    cancelled: "#6B7280"
  };
  return colors[status] || "#6B7280";
}

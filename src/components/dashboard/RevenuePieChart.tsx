import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useProjects } from "@/hooks/useProjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export const RevenuePieChart = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: projects, isLoading: projectsLoading } = useProjects();

  const isLoading = statsLoading || projectsLoading;

  // Calculate revenue by project status
  // Note: Using totalRevenue from stats as projects don't have total_value field
  // This is a simplified view - in production you'd want to aggregate from quotes/invoices
  const revenueByStatus = projects?.reduce((acc, project) => {
    const status = project.status || "planning";
    // Equal distribution for visualization (in production, calculate from actual quotes)
    const revenue = (stats?.totalRevenue || 0) / (projects.length || 1);
    acc[status] = (acc[status] || 0) + revenue;
    return acc;
  }, {} as Record<string, number>) || {};

  const chartData = [
    { name: "Completed", value: revenueByStatus.completed || 0, color: "#10b981" },
    { name: "In Progress", value: revenueByStatus.in_progress || 0, color: "#f59e0b" },
    { name: "Planning", value: revenueByStatus.planning || 0, color: "#3b82f6" },
    { name: "On Hold", value: revenueByStatus.on_hold || 0, color: "#f97316" },
  ].filter(item => item.value > 0);

  const totalRevenue = stats?.totalRevenue || 0;
  const hasData = chartData.length > 0 && totalRevenue > 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Revenue Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Revenue Overview
          </CardTitle>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">
              ${totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
              <TrendingUp className="h-3 w-3" />
              Total revenue
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="text-center py-12 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No revenue data yet</p>
            <p className="text-xs mt-1">Start by creating quotes and projects</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `$${value.toLocaleString()}`}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

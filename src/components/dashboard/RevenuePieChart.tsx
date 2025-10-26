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
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
            Revenue Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 sm:h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/50 bg-card/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <DollarSign className="h-4 w-4" />
            Revenue
          </CardTitle>
          <div className="text-right shrink-0">
            <p className="text-xl font-bold text-foreground">
              ${totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {!hasData ? (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p className="text-xs">No revenue data yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={60}
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
                  fontSize: "12px",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: "11px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

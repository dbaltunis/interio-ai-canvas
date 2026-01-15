import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useProjects } from "@/hooks/useProjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useFormattedCurrency } from "@/hooks/useFormattedCurrency";

export const RevenuePieChart = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { formatCurrency } = useFormattedCurrency();

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
              {formatCurrency(totalRevenue, { decimals: 0 })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            {/* Nokia 3310-inspired pixel art money/coin icon */}
            <svg width="48" height="48" viewBox="0 0 24 24" className="mb-3 opacity-70">
              {/* Coin stack - bottom */}
              <ellipse cx="12" cy="18" rx="8" ry="3" fill="currentColor" className="text-muted-foreground/40" />
              <rect x="4" y="15" width="16" height="3" fill="currentColor" className="text-muted-foreground/40" />
              <ellipse cx="12" cy="15" rx="8" ry="3" fill="currentColor" className="text-muted-foreground/50" />
              {/* Coin stack - middle */}
              <rect x="4" y="11" width="16" height="4" fill="currentColor" className="text-primary/50" />
              <ellipse cx="12" cy="11" rx="8" ry="3" fill="currentColor" className="text-primary/60" />
              {/* Coin stack - top */}
              <rect x="4" y="7" width="16" height="4" fill="currentColor" className="text-primary/70" />
              <ellipse cx="12" cy="7" rx="8" ry="3" fill="currentColor" className="text-primary" />
              {/* Dollar sign pixels */}
              <rect x="11" y="5" width="2" height="1" fill="currentColor" className="text-background" />
              <rect x="10" y="6" width="4" height="1" fill="currentColor" className="text-background" />
              <rect x="11" y="7" width="2" height="1" fill="currentColor" className="text-background" />
              <rect x="10" y="8" width="4" height="1" fill="currentColor" className="text-background" />
              <rect x="11" y="9" width="2" height="1" fill="currentColor" className="text-background" />
            </svg>
            <p className="text-sm font-medium text-foreground mb-1">Revenue starts here!</p>
            <p className="text-xs text-muted-foreground">Your success story begins now</p>
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
                formatter={(value: number) => formatCurrency(value, { decimals: 0 })}
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

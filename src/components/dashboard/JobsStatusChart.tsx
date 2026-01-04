import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useProjects } from "@/hooks/useProjects";
import { useMemo } from "react";

const STATUS_COLORS: Record<string, string> = {
  'in_progress': 'hsl(var(--primary))',
  'active': 'hsl(var(--primary))',
  'pending': 'hsl(38, 92%, 50%)',
  'quote_sent': 'hsl(38, 92%, 50%)',
  'completed': 'hsl(142, 71%, 45%)',
  'on_hold': 'hsl(var(--muted-foreground))',
  'cancelled': 'hsl(0, 84%, 60%)',
};

const STATUS_LABELS: Record<string, string> = {
  'in_progress': 'In Progress',
  'active': 'Active',
  'pending': 'Pending',
  'quote_sent': 'Quote Sent',
  'completed': 'Completed',
  'on_hold': 'On Hold',
  'cancelled': 'Cancelled',
};

export const JobsStatusChart = () => {
  const { data: projects, isLoading } = useProjects();

  const chartData = useMemo(() => {
    if (!projects?.length) return [];
    
    const statusCounts: Record<string, number> = {};
    projects.forEach(project => {
      const status = project.status || 'pending';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return Object.entries(statusCounts)
      .map(([status, count]) => ({
        name: STATUS_LABELS[status] || status,
        value: count,
        status,
        color: STATUS_COLORS[status] || 'hsl(var(--muted-foreground))',
      }))
      .sort((a, b) => b.value - a.value);
  }, [projects]);

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-2 shadow-lg text-xs">
          <p className="font-medium text-foreground">{data.name}</p>
          <p className="text-muted-foreground">
            {data.value} jobs ({((data.value / total) * 100).toFixed(0)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Jobs by Status</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[180px]">
          <div className="animate-pulse h-24 w-24 rounded-full bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (!chartData.length) {
    return (
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Jobs by Status</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[180px]">
          <p className="text-xs text-muted-foreground">No jobs yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Jobs by Status</CardTitle>
          <span className="text-lg font-semibold text-foreground">{total}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4">
          {/* Donut Chart */}
          <div className="h-[140px] w-[140px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-1.5">
            {chartData.slice(0, 4).map((item) => (
              <div key={item.status} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div 
                    className="w-2 h-2 rounded-full shrink-0" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground truncate">{item.name}</span>
                </div>
                <span className="font-medium text-foreground">{item.value}</span>
              </div>
            ))}
            {chartData.length > 4 && (
              <p className="text-xs text-muted-foreground">+{chartData.length - 4} more</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

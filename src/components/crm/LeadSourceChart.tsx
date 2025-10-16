import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useCRMStats } from "@/hooks/useCRMStats";
import { Skeleton } from "@/components/ui/skeleton";

export const LeadSourceChart = () => {
  const { data: stats, isLoading } = useCRMStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lead Source Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = Object.entries(stats?.bySource || {}).map(([source, data]) => ({
    source,
    count: data.count,
    converted: data.converted,
    conversionRate: data.count > 0 ? ((data.converted / data.count) * 100).toFixed(1) : "0",
    avgValue: data.count > 0 ? (data.totalValue / data.count).toFixed(0) : "0",
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Source Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="source" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
            <Bar dataKey="count" fill="hsl(var(--primary))" name="Total Leads" radius={[8, 8, 0, 0]} />
            <Bar dataKey="converted" fill="hsl(142, 71%, 45%)" name="Converted" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
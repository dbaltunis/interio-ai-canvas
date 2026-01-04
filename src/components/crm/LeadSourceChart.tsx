import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useCRMStats } from "@/hooks/useCRMStats";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";

export const LeadSourceChart = () => {
  const { data: stats, isLoading } = useCRMStats();

  if (isLoading) {
    return (
      <Card variant="analytics">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Lead Sources</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <Skeleton className="h-[240px] w-full" />
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
    <Card variant="analytics">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
          </div>
          <CardTitle className="text-sm font-medium text-muted-foreground">Lead Sources</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis 
              dataKey="source" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            <Bar dataKey="count" fill="hsl(var(--primary))" name="Total" radius={[4, 4, 0, 0]} />
            <Bar dataKey="converted" fill="hsl(142, 71%, 45%)" name="Converted" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useCRMStats } from "@/hooks/useCRMStats";
import { Skeleton } from "@/components/ui/skeleton";

const STAGE_COLORS: Record<string, string> = {
  lead: "hsl(var(--muted))",
  contacted: "hsl(var(--primary))",
  measuring_scheduled: "hsl(220, 90%, 56%)",
  quoted: "hsl(48, 96%, 53%)",
  approved: "hsl(142, 71%, 45%)",
  lost: "hsl(0, 84%, 60%)",
};

const STAGE_LABELS: Record<string, string> = {
  lead: "Lead",
  contacted: "Contacted",
  measuring_scheduled: "Measuring",
  quoted: "Quoted",
  approved: "Approved",
  lost: "Lost",
};

export const PipelineChart = () => {
  const { data: stats, isLoading } = useCRMStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = Object.entries(stats?.byStage || {}).map(([stage, data]) => ({
    stage: STAGE_LABELS[stage] || stage,
    stageKey: stage,
    count: data.count,
    value: data.totalValue,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="stage" 
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
              formatter={(value, name) => {
                if (name === "value") return [`$${Number(value).toLocaleString()}`, "Total Value"];
                return [value, "Count"];
              }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={STAGE_COLORS[entry.stageKey] || STAGE_COLORS.lead} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
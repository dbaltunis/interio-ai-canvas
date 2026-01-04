import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useCRMStats } from "@/hooks/useCRMStats";
import { Skeleton } from "@/components/ui/skeleton";
import { Target } from "lucide-react";

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
      <Card variant="analytics">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <Skeleton className="h-[240px] w-full" />
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
    <Card variant="analytics">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Target className="h-3.5 w-3.5 text-primary" />
          </div>
          <CardTitle className="text-sm font-medium text-muted-foreground">Pipeline</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis 
              dataKey="stage" 
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
              formatter={(value, name) => {
                if (name === "value") return [`$${Number(value).toLocaleString()}`, "Value"];
                return [value, "Count"];
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
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
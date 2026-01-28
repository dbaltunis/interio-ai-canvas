import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useStatusReasonsKPI } from "@/hooks/useStatusReasonsKPI";
import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { PixelBriefcaseIcon } from "@/components/icons/PixelArtIcons";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_COLORS = {
  Rejected: 'hsl(0, 84%, 60%)',
  Cancelled: 'hsl(38, 92%, 50%)',
  'On Hold': 'hsl(var(--primary))',
};

export const StatusReasonsWidget = () => {
  const { data, isLoading } = useStatusReasonsKPI();

  const chartData = useMemo(() => {
    if (!data) return [];
    
    return [
      { name: 'Rejected', value: data.currentCounts.Rejected, color: STATUS_COLORS.Rejected },
      { name: 'Cancelled', value: data.currentCounts.Cancelled, color: STATUS_COLORS.Cancelled },
      { name: 'On Hold', value: data.currentCounts['On Hold'], color: STATUS_COLORS['On Hold'] },
    ].filter(d => d.value > 0);
  }, [data]);

  const total = data?.total || 0;
  const changePercent = data?.changePercent || 0;
  const isPositive = changePercent > 0;
  const isNegative = changePercent < 0;
  const isNeutral = changePercent === 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
      return (
        <div className="bg-popover border border-border rounded-lg p-2 shadow-lg text-xs">
          <p className="font-medium text-foreground">{item.name}</p>
          <p className="text-muted-foreground">
            {item.value} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card variant="analytics">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-4">
            <Skeleton className="h-[140px] w-[140px] rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state - motivational message when no rejections/cancellations
  if (chartData.length === 0) {
    return (
      <Card variant="analytics">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Rejections & Cancellations
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[180px] text-center">
          <div className="mb-3">
            <PixelBriefcaseIcon size={48} />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">All projects on track! 🎉</p>
          <p className="text-xs text-muted-foreground">No rejections or cancellations in this period</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="analytics">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Rejections & Cancellations
          </CardTitle>
          <div className="flex items-center gap-1.5 text-xs">
            {isNeutral ? (
              <Minus className="h-3.5 w-3.5 text-muted-foreground" />
            ) : isNegative ? (
              <TrendingDown className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <TrendingUp className="h-3.5 w-3.5 text-red-500" />
            )}
            <span className={isNeutral ? 'text-muted-foreground' : isNegative ? 'text-green-600' : 'text-red-500'}>
              {isNeutral ? '0%' : `${isPositive ? '+' : ''}${changePercent.toFixed(0)}%`}
            </span>
            <span className="text-muted-foreground">vs prev</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4">
          {/* Donut Chart */}
          <div className="h-[140px] w-[140px] shrink-0 relative">
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
                  animationBegin={0}
                  animationDuration={800}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center total */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="text-xl font-bold text-foreground">{total}</span>
                <p className="text-[10px] text-muted-foreground">Total</p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-1.5">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

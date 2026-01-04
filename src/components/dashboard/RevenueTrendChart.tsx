import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, Line } from "recharts";
import { useFormattedCurrency } from "@/hooks/useFormattedCurrency";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useRevenueHistory } from "@/hooks/useRevenueHistory";
import { Skeleton } from "@/components/ui/skeleton";

export const RevenueTrendChart = () => {
  const { formatCurrency } = useFormattedCurrency();
  const { data: revenueData, isLoading } = useRevenueHistory();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-2 shadow-lg text-xs">
          <p className="font-medium text-foreground mb-1">{label}</p>
          <p className="text-primary">
            Current: {formatCurrency(payload[0]?.value || 0, { decimals: 0 })}
          </p>
          <p className="text-muted-foreground">
            Previous: {formatCurrency(payload[1]?.value || 0, { decimals: 0 })}
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
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Skeleton className="h-[180px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const data = revenueData?.data || [];
  const changePercent = revenueData?.changePercent || 0;
  const isPositive = changePercent >= 0;

  // Show empty state if no data
  if (data.length === 0 || (revenueData?.currentTotal === 0 && revenueData?.previousTotal === 0)) {
    return (
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Revenue Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[180px]">
          <p className="text-xs text-muted-foreground">No revenue data for this period</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Revenue Trend
          </CardTitle>
          <div className="flex items-center gap-1.5 text-xs">
            {isPositive ? (
              <TrendingUp className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
            )}
            <span className={isPositive ? 'text-green-600' : 'text-red-500'}>
              {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
            </span>
            <span className="text-muted-foreground">vs prev period</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="current"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#colorCurrent)"
              />
              <Line
                type="monotone"
                dataKey="previous"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-primary rounded" />
            <span>Current period</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-muted-foreground rounded border-dashed" style={{ borderTop: '1.5px dashed' }} />
            <span>Previous period</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useStatusReasonsKPI } from "@/hooks/useStatusReasonsKPI";
import { useMemo, useState } from "react";
import { TrendingUp, TrendingDown, Minus, ChevronRight, Clock, User } from "lucide-react";
import { PixelBriefcaseIcon } from "@/components/icons/PixelArtIcons";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

const STATUS_COLORS = {
  Rejected: 'hsl(0, 84%, 60%)',
  Cancelled: 'hsl(38, 92%, 50%)',
  'On Hold': 'hsl(var(--primary))',
};

const STATUS_BADGE_VARIANTS: Record<string, 'destructive' | 'outline' | 'default'> = {
  Rejected: 'destructive',
  Cancelled: 'outline',
  'On Hold': 'default',
};

export const StatusReasonsWidget = () => {
  const { data, isLoading } = useStatusReasonsKPI();
  const [detailsOpen, setDetailsOpen] = useState(false);

  const chartData = useMemo(() => {
    if (!data) return [];
    
    return [
      { name: 'Rejected', value: data.currentCounts.Rejected, color: STATUS_COLORS.Rejected },
      { name: 'Cancelled', value: data.currentCounts.Cancelled, color: STATUS_COLORS.Cancelled },
      { name: 'On Hold', value: data.currentCounts['On Hold'], color: STATUS_COLORS['On Hold'] },
    ].filter(d => d.value > 0);
  }, [data]);

  // Group reasons by frequency for top reasons display
  const topReasons = useMemo(() => {
    if (!data?.current) return [];
    
    const reasonCounts: Record<string, number> = {};
    data.current.forEach(item => {
      const reason = item.reason || 'No reason provided';
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });
    
    return Object.entries(reasonCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: data.total > 0 ? ((count / data.total) * 100).toFixed(0) : '0'
      }));
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
    <>
      <Card 
        variant="analytics" 
        className="cursor-pointer hover:shadow-md transition-shadow group"
        onClick={() => setDetailsOpen(true)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rejections & Cancellations
              </CardTitle>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              {isNeutral ? (
                <Minus className="h-3.5 w-3.5 text-muted-foreground" />
              ) : isNegative ? (
                <TrendingDown className="h-3.5 w-3.5 text-success" />
              ) : (
                <TrendingUp className="h-3.5 w-3.5 text-destructive" />
              )}
              <span className={isNeutral ? 'text-muted-foreground' : isNegative ? 'text-success' : 'text-destructive'}>
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
              <p className="text-[10px] text-muted-foreground pt-1 group-hover:text-primary transition-colors">
                Click for details →
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Rejection & Cancellation Details
              <Badge variant="secondary" className="ml-2">{total} total</Badge>
            </DialogTitle>
          </DialogHeader>
          
          {/* Top Reasons Section */}
          {topReasons.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Top Reasons</h4>
              <div className="space-y-1.5">
                {topReasons.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/50">
                    <span className="text-foreground truncate max-w-[250px]">"{r.reason}"</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-muted-foreground">{r.count}x</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {r.percentage}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Recent Changes List */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Recent Changes</h4>
            <ScrollArea className="h-[250px] pr-3">
              <div className="space-y-2">
                {data?.current?.map(item => (
                  <div 
                    key={item.id} 
                    className="p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-sm font-medium text-foreground truncate">
                        {item.project_name}
                      </span>
                      <Badge 
                        variant={STATUS_BADGE_VARIANTS[item.new_status_name || 'Rejected']} 
                        className="shrink-0 text-[10px]"
                      >
                        {item.new_status_name}
                      </Badge>
                    </div>
                    
                    {item.reason && (
                      <p className="text-xs text-muted-foreground italic mb-2">
                        "{item.reason}"
                      </p>
                    )}
                    
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{item.user_name || item.user_email || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(item.changed_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useDealerPerformance } from "@/hooks/useDealerPerformance";
import { useHasPermission } from "@/hooks/usePermissions";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { formatCurrency, formatCompactCurrency } from "@/utils/formatCurrency";
import { getAvatarColor, getInitials } from "@/lib/avatar-utils";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Trophy, 
  Users, 
  DollarSign,
  Target
} from "lucide-react";

export const DealerPerformanceWidget = () => {
  const { data, isLoading } = useDealerPerformance();
  const canViewTeamPerformance = useHasPermission("view_team_performance");
  const { units } = useMeasurementUnits();
  const currency = units?.currency || "USD";

  // Only show to users with permission
  if (canViewTeamPerformance === false) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="border border-border/50 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Trophy className="h-4 w-4" />
            Team Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const { dealers, summary } = data || { dealers: [], summary: null };

  if (dealers.length === 0) {
    return (
      <Card className="border border-border/50 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Trophy className="h-4 w-4" />
            Team Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p className="text-xs">No team performance data yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3.5 w-3.5 text-green-500" />;
      case "down":
        return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
      default:
        return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  return (
    <Card className="border border-border/50 bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Trophy className="h-4 w-4 text-amber-500" />
          Team Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-lg p-2.5 border border-amber-500/20">
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-1">
              <Trophy className="h-3.5 w-3.5" />
              <span className="text-[10px] font-medium uppercase tracking-wide">Top</span>
            </div>
            <p className="text-xs font-semibold text-foreground truncate">
              {summary?.topPerformer?.name || "-"}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-lg p-2.5 border border-emerald-500/20">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 mb-1">
              <DollarSign className="h-3.5 w-3.5" />
              <span className="text-[10px] font-medium uppercase tracking-wide">Revenue</span>
            </div>
            <p className="text-xs font-semibold text-foreground">
              {formatCompactCurrency(summary?.totalTeamRevenue || 0, currency)}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-lg p-2.5 border border-blue-500/20">
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 mb-1">
              <Target className="h-3.5 w-3.5" />
              <span className="text-[10px] font-medium uppercase tracking-wide">Conv.</span>
            </div>
            <p className="text-xs font-semibold text-foreground">
              {(summary?.avgConversionRate || 0).toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Leaderboard */}
        <ScrollArea className="h-[280px] pr-2">
          <div className="space-y-2">
            {dealers.map((dealer, index) => {
              const avatarColor = getAvatarColor(dealer.id);
              const isTopThree = index < 3;
              const medalColors = ["text-amber-500", "text-slate-400", "text-amber-700"];

              return (
                <div
                  key={dealer.id}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg bg-background border border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  {/* Rank */}
                  <div className="w-5 text-center shrink-0">
                    {isTopThree ? (
                      <span className={`text-sm font-bold ${medalColors[index]}`}>
                        {index + 1}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">{index + 1}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <Avatar className="h-9 w-9 border-2 border-background ring-2 ring-primary/10">
                      {dealer.avatar_url ? (
                        <AvatarImage src={dealer.avatar_url} alt={dealer.name} />
                      ) : null}
                      <AvatarFallback
                        className={`text-xs font-semibold ${avatarColor} text-white`}
                      >
                        {getInitials(dealer.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-semibold text-xs truncate text-foreground">
                        {dealer.name}
                      </h4>
                      {getTrendIcon(dealer.trend)}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">
                        {dealer.totalQuotes} quotes
                      </span>
                      <span className="text-[10px] text-muted-foreground">•</span>
                      <span className="text-[10px] text-muted-foreground">
                        {dealer.activeProjects} active
                      </span>
                    </div>
                    {/* Conversion Progress */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <Progress 
                        value={dealer.conversionRate} 
                        className="h-1.5 flex-1" 
                      />
                      <span className="text-[10px] font-medium text-muted-foreground w-8 text-right">
                        {dealer.conversionRate.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-foreground">
                      {formatCompactCurrency(dealer.totalValue, currency)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Avg: {formatCompactCurrency(dealer.avgDealSize, currency)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DealerPerformanceWidget;

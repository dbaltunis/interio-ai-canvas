import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, TrendingUp, TrendingDown, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  KPITarget, 
  calculateProgress, 
  getProgressStatus, 
  getProgressBgColor,
  formatProgressDisplay,
  getPeriodLabel,
  parseNumericValue
} from "@/utils/kpiTargetProgress";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
  target?: KPITarget;
}

export const KPICard = ({ title, value, subtitle, icon: Icon, trend, loading, target }: KPICardProps) => {
  if (loading) {
    return (
      <Card variant="elevated" className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2.5">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3.5 w-28" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate progress if target is set and enabled
  const numericValue = parseNumericValue(value);
  const hasTarget = target?.enabled && target?.value > 0;
  const progress = hasTarget ? calculateProgress(numericValue, target.value) : 0;
  const progressStatus = hasTarget ? getProgressStatus(progress) : null;

  return (
    <Card variant="elevated" className="group overflow-hidden transition-all duration-200 hover:shadow-card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Icon className="h-3.5 w-3.5 text-primary" />
          </div>
          {title}
          {hasTarget && (
            <Badge variant="muted" size="sm" className="ml-auto">
              <Target className="h-3 w-3 mr-1" />
              {getPeriodLabel(target.period)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        <div className="flex items-baseline justify-between">
          <div className="text-xl md:text-2xl font-bold text-foreground tracking-tight">{value}</div>
          {trend && (
            <div className="flex items-center gap-1 text-xs">
              {trend.isPositive ? (
                <TrendingUp className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className={cn(
                "font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}>
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
            </div>
          )}
        </div>
        
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
        
        {/* Target Progress Section */}
        {hasTarget && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {formatProgressDisplay(numericValue, target.value, target.unit)}
              </span>
              <span className={cn(
                "font-medium",
                progressStatus === 'exceeded' && "text-green-600",
                progressStatus === 'on-track' && "text-green-600",
                progressStatus === 'warning' && "text-yellow-600",
                progressStatus === 'critical' && "text-red-600"
              )}>
                {progress}%
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div 
                className={cn(
                  "h-full transition-all duration-500 rounded-full",
                  getProgressBgColor(progressStatus!)
                )}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
              {/* Target marker at 100% */}
              <div className="absolute top-0 right-0 w-0.5 h-full bg-foreground/30" />
            </div>
            {progress >= 100 && (
              <p className="text-xs text-green-600 font-medium">
                🎉 Target achieved!
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

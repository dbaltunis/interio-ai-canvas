import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { ModernProgress } from "@/components/ui/modern-progress";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon, RefreshCw, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { KPIConfig } from '@/hooks/useKPIConfig';
import { cn } from '@/lib/utils';
import { useFormattedCurrency } from '@/hooks/useFormattedCurrency';

interface EnhancedKPICardProps {
  config: KPIConfig;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

export const EnhancedKPICard = ({ 
  config, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  loading 
}: EnhancedKPICardProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { formatCurrency } = useFormattedCurrency();

  // Auto refresh based on interval
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshing(true);
      setTimeout(() => {
        setRefreshing(false);
        setLastRefresh(new Date());
      }, 1000);
    }, config.refreshInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [config.refreshInterval]);

  const getCardSize = () => {
    switch (config.size) {
      case 'small': return 'h-20';
      case 'large': return 'h-32';
      default: return 'h-24';
    }
  };

  const getDisplayValue = () => {
    // Format currency for revenue-type KPIs
    if (typeof value === 'number' && (config.id?.includes('revenue') || config.id?.includes('value'))) {
      return formatCurrency(value, { decimals: 0 });
    }
    if (typeof value === 'number' && config.displayFormat === 'gauge') {
      return `${value}%`;
    }
    return value;
  };

  const getAlertStatus = () => {
    if (!config.thresholds || typeof value !== 'number') return null;
    
    if (config.thresholds.critical && value <= config.thresholds.critical) {
      return 'critical';
    }
    if (config.thresholds.warning && value <= config.thresholds.warning) {
      return 'warning';
    }
    return null;
  };

  const alertStatus = getAlertStatus();
  const displayTitle = config.customTitle || config.title;

  if (loading || refreshing) {
    return (
      <Card className={cn("transition-all duration-200", getCardSize())}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {displayTitle}
            <RefreshCw className="h-3 w-3 animate-spin ml-auto" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (config.displayFormat === 'compact') {
    return (
      <Card className={cn("group", getCardSize())}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon 
                className="h-5 w-5" 
                style={{ color: config.color || 'hsl(var(--primary))' }}
              />
              <span className="text-sm font-medium text-foreground">{displayTitle}</span>
            </div>
            <div className="text-right">
              <div 
                className="text-lg font-bold"
                style={{ color: config.color || 'hsl(var(--primary))' }}
              >
                {getDisplayValue()}
              </div>
              {config.showTrend && trend && (
                <div className="flex items-center gap-1 text-xs">
                  {trend.isPositive ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={trend.isPositive ? "text-green-600" : "text-red-600"}>
                    {trend.isPositive ? "+" : ""}{trend.value}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (config.displayFormat === 'gauge') {
    const gaugeValue = typeof value === 'number' ? Math.min(value, 100) : 0;
    
    return (
      <Card className={cn("group", getCardSize())}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Icon 
              className="h-4 w-4" 
              style={{ color: config.color || 'hsl(var(--primary))' }}
            />
            {displayTitle}
            {alertStatus && (
              <StatusIndicator 
                status={alertStatus === 'critical' ? 'error' : 'warning'}
                size="sm"
                variant="minimal"
                icon={AlertTriangle}
              >
                {alertStatus}
              </StatusIndicator>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <span 
                className="text-3xl font-bold"
                style={{ color: config.color || 'hsl(var(--primary))' }}
              >
                {getDisplayValue()}
              </span>
            </div>
            <ModernProgress 
              value={gaugeValue} 
              size="md"
              variant={alertStatus === 'critical' ? 'error' : alertStatus === 'warning' ? 'warning' : 'default'}
            />
            <p className="text-sm text-muted-foreground text-center">{subtitle}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default card format - cleaner, more compact
  return (
    <Card 
      className={cn("group border-border/40", getCardSize())}
    >
      <CardContent className="p-3 h-full flex flex-col justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon 
            className="h-3.5 w-3.5" 
            style={{ color: config.color || 'hsl(var(--primary))' }}
          />
          <span className="text-xs font-medium">{displayTitle}</span>
          {alertStatus && (
            <StatusIndicator 
              status={alertStatus === 'critical' ? 'error' : 'warning'}
              size="sm"
              variant="minimal"
              icon={AlertTriangle}
            >
              {alertStatus}
            </StatusIndicator>
          )}
        </div>
        
        <div className="flex items-baseline justify-between">
          <div 
            className="text-xl font-bold"
            style={{ color: config.color || 'hsl(var(--foreground))' }}
          >
            {getDisplayValue()}
          </div>
          {config.showTrend && trend && (
            <div className="flex items-center gap-1 text-xs">
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={trend.isPositive ? "text-green-600" : "text-red-600"}>
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
            </div>
          )}
        </div>
        
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
};
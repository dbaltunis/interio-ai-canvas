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
      case 'small': return 'h-24';
      case 'large': return 'h-40';
      default: return 'h-32';
    }
  };

  const getDisplayValue = () => {
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
      <Card variant="modern" className={cn("transition-all duration-200", getCardSize())}>
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
      <Card variant="modern" className={cn("group", getCardSize())}>
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
      <Card variant="modern" className={cn("group", getCardSize())}>
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

  // Default card format
  return (
    <Card 
      variant="modern"
      className={cn("group", getCardSize())}
      style={config.color ? { borderLeftColor: config.color, borderLeftWidth: '3px' } : {}}
    >
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
      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div 
            className="text-2xl font-bold"
            style={{ color: config.color || 'hsl(var(--primary))' }}
          >
            {getDisplayValue()}
          </div>
          {config.showTrend && trend && (
            <div className="flex items-center gap-1 text-sm">
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={trend.isPositive ? "text-green-600" : "text-red-600"}>
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
            </div>
          )}
        </div>
        
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Updated: {lastRefresh.toLocaleTimeString()}</span>
          {typeof value === 'number' && value <= 100 && (
            <ModernProgress 
              value={value} 
              size="sm" 
              className="w-16"
              variant={alertStatus === 'critical' ? 'error' : alertStatus === 'warning' ? 'warning' : 'default'}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
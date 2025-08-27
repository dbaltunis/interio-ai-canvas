import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
      <Card className={cn("hover:shadow-md transition-shadow", getCardSize())}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {displayTitle}
            <RefreshCw className="h-3 w-3 animate-spin ml-auto" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (config.displayFormat === 'compact') {
    return (
      <Card className={cn("hover:shadow-md transition-shadow", getCardSize())}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon 
                className="h-4 w-4" 
                style={{ color: config.color || 'hsl(var(--brand-primary))' }}
              />
              <span className="text-sm font-medium">{displayTitle}</span>
            </div>
            <div className="text-right">
              <div 
                className="text-lg font-bold"
                style={{ color: config.color || 'hsl(var(--brand-primary))' }}
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
      <Card className={cn("hover:shadow-md transition-shadow", getCardSize())}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Icon 
              className="h-4 w-4" 
              style={{ color: config.color || 'hsl(var(--brand-primary))' }}
            />
            {displayTitle}
            {alertStatus && (
              <AlertTriangle 
                className={cn("h-4 w-4 ml-auto", {
                  "text-yellow-500": alertStatus === 'warning',
                  "text-red-500": alertStatus === 'critical'
                })}
              />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-center">
              <span 
                className="text-2xl font-bold"
                style={{ color: config.color || 'hsl(var(--brand-primary))' }}
              >
                {getDisplayValue()}
              </span>
            </div>
            <Progress 
              value={gaugeValue} 
              className="h-2"
              style={{ 
                '--progress-background': config.color || 'hsl(var(--brand-primary))'
              } as any}
            />
            <p className="text-xs text-gray-500 text-center">{subtitle}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default card format
  return (
    <Card 
      className={cn("hover:shadow-md transition-shadow", getCardSize())}
      style={config.color ? { borderLeftColor: config.color, borderLeftWidth: '4px' } : {}}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
          <Icon 
            className="h-4 w-4" 
            style={{ color: config.color || 'hsl(var(--brand-primary))' }}
          />
          {displayTitle}
          {alertStatus && (
            <AlertTriangle 
              className={cn("h-4 w-4 ml-auto", {
                "text-yellow-500": alertStatus === 'warning',
                "text-red-500": alertStatus === 'critical'
              })}
            />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="text-2xl font-bold"
          style={{ color: config.color || 'hsl(var(--brand-primary))' }}
        >
          {getDisplayValue()}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
        {config.showTrend && trend && (
          <div className="mt-2">
            <Badge 
              variant={trend.isPositive ? "default" : "destructive"}
              className="text-xs"
            >
              {trend.isPositive ? "+" : ""}{trend.value}%
            </Badge>
          </div>
        )}
        <div className="text-xs text-gray-400 mt-2">
          Updated: {lastRefresh.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};
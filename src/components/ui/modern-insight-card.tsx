import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModernProgress } from "@/components/ui/modern-progress";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, ArrowRight, Sparkles } from 'lucide-react';

interface ModernInsightCardProps {
  title: string;
  description?: string;
  value: string | number;
  trend?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
  status?: 'success' | 'warning' | 'error' | 'info';
  progress?: number;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'compact' | 'detailed' | 'highlight';
  className?: string;
}

export const ModernInsightCard = ({
  title,
  description,
  value,
  trend,
  status,
  progress,
  icon: Icon,
  action,
  variant = 'default',
  className
}: ModernInsightCardProps) => {
  const isCompact = variant === 'compact';
  const isHighlight = variant === 'highlight';
  const isDetailed = variant === 'detailed';

  const TrendIcon = trend?.isPositive ? TrendingUp : TrendingDown;

  return (
    <Card 
      variant="analytics"
      className={cn(
        "group transition-all duration-200",
        isHighlight && "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20",
        action && "cursor-pointer hover:border-primary/30",
        className
      )}
      onClick={action?.onClick}
    >
      <CardHeader className={cn(
        "flex flex-row items-center justify-between space-y-0",
        isCompact ? "pb-1 p-3" : "pb-2 p-4"
      )}>
        <div className="flex items-center gap-2">
          {Icon && (
            <div className={cn(
              "p-1.5 rounded-lg transition-colors",
              isHighlight 
                ? "bg-primary/20" 
                : "bg-primary/10 text-primary group-hover:bg-primary/15"
            )}>
              <Icon className="h-3.5 w-3.5" />
            </div>
          )}
          <div>
            <CardTitle className={cn(
              "text-sm font-medium text-muted-foreground",
              isHighlight && "text-foreground"
            )}>
              {title}
            </CardTitle>
            {description && !isCompact && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>
        {status && (
          <StatusIndicator 
            status={status} 
            size="sm" 
            variant={isHighlight ? "minimal" : "solid"}
          >
            {status}
          </StatusIndicator>
        )}
      </CardHeader>

      <CardContent className={cn(
        "space-y-2",
        isCompact ? "p-3 pt-0" : "p-4 pt-0"
      )}>
        {/* Main Value */}
        <div className="flex items-end justify-between">
          <span className={cn(
            "font-bold",
            isCompact ? "text-xl" : "text-2xl",
            isHighlight ? "text-foreground" : "text-foreground"
          )}>
            {value}
          </span>
          
          {/* Trend */}
          {trend && (
            <div className={cn(
              "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium",
              trend.isPositive 
                ? "bg-green-100 text-green-700" 
                : "bg-red-100 text-red-700"
            )}>
              <TrendIcon className="h-3 w-3" />
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        {/* Progress */}
        {progress !== undefined && (
          <ModernProgress 
            value={progress} 
            size="sm" 
            variant={status === 'success' ? 'success' : 'default'}
          />
        )}

        {/* Additional Details for Detailed Variant */}
        {isDetailed && (
          <div className="pt-1.5 border-t border-border/50">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Updated 2 min ago
              </span>
            </div>
          </div>
        )}

        {/* Action */}
        {action && (
          <div className={cn(
            "flex items-center justify-between pt-2",
            !isCompact && "border-t border-border/50"
          )}>
            <span className={cn(
              "text-sm font-medium",
              isHighlight ? "text-white" : "text-primary"
            )}>
              {action.label}
            </span>
            <ArrowRight className={cn(
              "h-4 w-4 transition-transform group-hover:translate-x-1",
              isHighlight ? "text-white" : "text-primary"
            )} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
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
      className={cn(
        "modern-card group transition-all duration-300",
        isHighlight && "modern-card-elevated company-gradient-soft text-white",
        isCompact && "p-4",
        action && "cursor-pointer hover-lift interactive-bounce",
        className
      )}
      onClick={action?.onClick}
    >
      <CardHeader className={cn(
        "flex flex-row items-center justify-between space-y-0",
        isCompact ? "pb-2" : "pb-3"
      )}>
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={cn(
              "p-2 rounded-lg",
              isHighlight 
                ? "bg-white/20" 
                : "bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors"
            )}>
              <Icon className="h-4 w-4" />
            </div>
          )}
          <div>
            <CardTitle className={cn(
              "font-medium",
              isCompact ? "text-sm" : "text-base",
              isHighlight ? "text-white" : "text-foreground"
            )}>
              {title}
            </CardTitle>
            {description && !isCompact && (
              <p className={cn(
                "text-sm mt-1",
                isHighlight ? "text-white/80" : "text-muted-foreground"
              )}>
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

      <CardContent className={cn("space-y-3", isCompact && "space-y-2")}>
        {/* Main Value */}
        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <span className={cn(
              "font-bold",
              isCompact ? "text-xl" : "text-2xl",
              isHighlight ? "text-white" : "text-foreground"
            )}>
              {value}
            </span>
          </div>
          
          {/* Trend */}
          {trend && (
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
              trend.isPositive 
                ? "bg-green-100 text-green-700" 
                : "bg-red-100 text-red-700",
              isHighlight && "bg-white/20 text-white"
            )}>
              <TrendIcon className="h-3 w-3" />
              <span>{Math.abs(trend.value)}%</span>
              {trend.label && <span className="hidden sm:inline">· {trend.label}</span>}
            </div>
          )}
        </div>

        {/* Progress */}
        {progress !== undefined && (
          <ModernProgress 
            value={progress} 
            size="sm" 
            variant={status === 'success' ? 'success' : 'default'}
            className={isHighlight ? "opacity-80" : ""}
          />
        )}

        {/* Additional Details for Detailed Variant */}
        {isDetailed && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Updated 2 minutes ago
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
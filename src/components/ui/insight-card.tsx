import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { ModernProgress } from "@/components/ui/modern-progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from '@/lib/utils';
import { LucideIcon, ChevronRight, Calendar, Users, TrendingUp } from 'lucide-react';

interface InsightCardProps {
  title: string;
  description: string;
  value?: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  status?: 'success' | 'warning' | 'error' | 'info';
  progress?: number;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

export const InsightCard = ({
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
}: InsightCardProps) => {
  return (
    <Card 
      variant="modern" 
      className={cn(
        "group hover-lift cursor-pointer",
        variant === 'compact' && "p-4",
        className
      )}
    >
      <CardHeader className={cn(
        "pb-3",
        variant === 'compact' && "pb-2"
      )}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={cn(
                "p-2 rounded-lg transition-colors",
                status === 'success' && "bg-green-500/10 text-green-600",
                status === 'warning' && "bg-yellow-500/10 text-yellow-600", 
                status === 'error' && "bg-red-500/10 text-red-600",
                status === 'info' && "bg-blue-500/10 text-blue-600",
                !status && "bg-primary/10 text-primary"
              )}>
                <Icon className="h-4 w-4" />
              </div>
            )}
            <div>
              <CardTitle className={cn(
                "text-base font-medium text-foreground",
                variant === 'compact' && "text-sm"
              )}>
                {title}
              </CardTitle>
              {variant !== 'compact' && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>
          
          {status && (
            <StatusIndicator status={status} size="sm" variant="minimal">
              {status}
            </StatusIndicator>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {variant === 'compact' && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        
        <div className="flex items-center justify-between">
          {value && (
            <div className="text-2xl font-bold text-foreground">{value}</div>
          )}
          
          {trend && (
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className={cn(
                "h-4 w-4",
                trend.isPositive ? "text-green-500" : "text-red-500 rotate-180"
              )} />
              <span className={cn(
                "font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}>
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
              {trend.label && (
                <span className="text-muted-foreground">{trend.label}</span>
              )}
            </div>
          )}
        </div>
        
        {progress !== undefined && (
          <ModernProgress 
            value={progress} 
            size="sm" 
            variant={
              status === 'error' ? 'error' : 
              status === 'warning' ? 'warning' : 
              status === 'success' ? 'success' : 'default'
            }
            showLabel
            label="Progress"
          />
        )}
        
        {action && (
          <button
            onClick={action.onClick}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors group/action"
          >
            <span>{action.label}</span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover/action:translate-x-1" />
          </button>
        )}
      </CardContent>
    </Card>
  );
};
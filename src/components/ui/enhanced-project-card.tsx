import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModernProgress } from "@/components/ui/modern-progress";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from '@/lib/utils';
import { Calendar, Clock, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency } from "@/utils/currency";
import { useCurrency } from "@/hooks/useCurrency";

interface EnhancedProjectCardProps {
  project: {
    id: string;
    name: string;
    description?: string;
    status: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'at_risk';
    progress?: number;
    risk?: 'high' | 'medium' | 'low' | 'none';
    team?: Array<{
      id: string;
      name: string;
      avatar?: string;
      role?: string;
    }>;
    dueDate?: string;
    budget?: number;
    spent?: number;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  };
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

export const EnhancedProjectCard = ({ 
  project, 
  onClick, 
  className,
  variant = 'default'
}: EnhancedProjectCardProps) => {
  const currency = useCurrency();
  
  const statusConfig = {
    planning: { label: 'Planning', status: 'info' as const, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    in_progress: { label: 'In Progress', status: 'warning' as const, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    completed: { label: 'Completed', status: 'success' as const, color: 'bg-green-50 text-green-700 border-green-200' },
    on_hold: { label: 'On Hold', status: 'error' as const, color: 'bg-gray-50 text-gray-700 border-gray-200' },
    at_risk: { label: 'At Risk', status: 'error' as const, color: 'bg-red-50 text-red-700 border-red-200' }
  };

  const priorityConfig = {
    low: { color: 'bg-gray-100 text-gray-700', label: 'Low' },
    medium: { color: 'bg-blue-100 text-blue-700', label: 'Medium' },
    high: { color: 'bg-orange-100 text-orange-700', label: 'High' },
    urgent: { color: 'bg-red-100 text-red-700', label: 'Urgent' }
  };

  const riskConfig = {
    high: { label: 'High Risk', className: 'risk-indicator-high' },
    medium: { label: 'Medium Risk', className: 'risk-indicator-medium' },
    low: { label: 'Low Risk', className: 'risk-indicator-low' },
    none: { label: 'No Risk', className: 'risk-indicator-none' }
  };

  const status = statusConfig[project.status];
  const priority = project.priority ? priorityConfig[project.priority] : null;
  const risk = project.risk ? riskConfig[project.risk] : null;

  const isCompact = variant === 'compact';
  const isDetailed = variant === 'detailed';

  return (
    <Card 
      className={cn(
        "modern-card cursor-pointer group transition-all duration-300 hover-lift interactive-bounce overflow-hidden",
        isCompact && "p-4",
        className
      )}
      onClick={onClick}
    >
      {/* Risk indicator bar */}
      {project.risk && project.risk !== 'none' && (
        <div className="h-1 w-full bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 to-green-500" />
      )}

      <CardHeader className={cn("pb-3", isCompact && "pb-2")}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className={cn(
                "font-semibold text-foreground group-hover:text-primary transition-colors truncate",
                isCompact ? "text-base" : "text-lg"
              )}>
                {project.name}
              </CardTitle>
              {project.risk && project.risk !== 'none' && (
                <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0" />
              )}
            </div>
            {project.description && !isCompact && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {priority && (
              <span className={cn(
                "text-xs px-2 py-1 rounded-full font-medium border",
                priority.color
              )}>
                {priority.label}
              </span>
            )}
            <StatusIndicator status={status.status} size="sm">
              {status.label}
            </StatusIndicator>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={cn("space-y-4", isCompact && "space-y-2")}>
        {/* Progress */}
        {project.progress !== undefined && (
          <div>
            <ModernProgress 
              value={project.progress} 
              size="sm" 
              showLabel 
              label="Progress"
              variant={project.status === 'completed' ? 'success' : 'default'}
            />
          </div>
        )}

        {/* Risk Assessment */}
        {isDetailed && project.risk && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Risk:</span>
            <span className={risk?.className}>
              {risk?.label}
            </span>
          </div>
        )}

        {/* Team Members */}
        {project.team && project.team.length > 0 && !isCompact && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="flex -space-x-2">
              {project.team.slice(0, 3).map((member) => (
                <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="text-xs">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
              {project.team.length > 3 && (
                <div className="h-6 w-6 bg-muted border-2 border-background rounded-full flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    +{project.team.length - 3}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Footer Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            {project.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(project.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          
          {project.budget && project.spent !== undefined && (
            <div className="flex items-center gap-1">
              <TrendingUp className={cn(
                "h-4 w-4",
                project.spent > project.budget * 0.9 ? "text-red-500" : "text-green-500"
              )} />
              <span className={cn(
                project.spent > project.budget ? "text-red-600" : "text-muted-foreground"
              )}>
                {formatCurrency(project.spent, currency)}/{formatCurrency(project.budget, currency)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
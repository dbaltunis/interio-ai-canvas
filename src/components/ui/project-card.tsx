import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModernProgress } from "@/components/ui/modern-progress";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { LucideIcon, Calendar, Clock, User, TrendingUp, AlertCircle } from 'lucide-react';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description?: string;
    status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
    progress?: number;
    client?: {
      name: string;
      avatar?: string;
    };
    dueDate?: string;
    budget?: number;
    spent?: number;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  };
  onClick?: () => void;
  className?: string;
}

export const ProjectCard = ({ project, onClick, className }: ProjectCardProps) => {
  const statusConfig = {
    planning: { label: 'Planning', status: 'info' as const, color: 'bg-blue-500/10 text-blue-600' },
    in_progress: { label: 'In Progress', status: 'warning' as const, color: 'bg-yellow-500/10 text-yellow-600' },
    completed: { label: 'Completed', status: 'success' as const, color: 'bg-green-500/10 text-green-600' },
    on_hold: { label: 'On Hold', status: 'error' as const, color: 'bg-red-500/10 text-red-600' }
  };

  const priorityConfig = {
    low: { color: 'bg-gray-500/10 text-gray-600', label: 'Low' },
    medium: { color: 'bg-blue-500/10 text-blue-600', label: 'Medium' },
    high: { color: 'bg-orange-500/10 text-orange-600', label: 'High' },
    urgent: { color: 'bg-red-500/10 text-red-600', label: 'Urgent' }
  };

  const status = statusConfig[project.status];
  const priority = project.priority ? priorityConfig[project.priority] : null;

  return (
    <Card 
      variant="modern" 
      className={cn(
        "cursor-pointer hover-lift group transition-all duration-300",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {project.name}
            </CardTitle>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {priority && (
              <Badge variant="outline" className={cn("text-xs", priority.color)}>
                {priority.label}
              </Badge>
            )}
            <StatusIndicator status={status.status} size="sm">
              {status.label}
            </StatusIndicator>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
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
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            {project.client && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{project.client.name}</span>
              </div>
            )}
            {project.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(project.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          
          {project.budget && project.spent !== undefined && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>${project.spent}/${project.budget}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
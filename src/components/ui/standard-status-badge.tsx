import React from 'react';
import { cn } from '@/lib/utils';

interface StandardStatusBadgeProps {
  status: 'success' | 'warning' | 'danger' | 'info' | 'pending' | 'neutral';
  children: React.ReactNode;
  variant?: 'default' | 'dot' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StandardStatusBadge = ({ 
  status, 
  children, 
  variant = 'default',
  size = 'md',
  className 
}: StandardStatusBadgeProps) => {
  const statusClasses = {
    success: 'status-success',
    warning: 'status-warning', 
    danger: 'status-error',
    info: 'status-info',
    pending: 'status-info',
    neutral: 'bg-muted text-muted-foreground border-border'
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const variantClasses = {
    default: 'status-indicator',
    dot: 'status-indicator flex items-center gap-2',
    outline: 'status-indicator bg-background'
  };

  return (
    <span className={cn(
      variantClasses[variant],
      statusClasses[status],
      sizeClasses[size],
      className
    )}>
      {variant === 'dot' && (
        <span className="w-2 h-2 rounded-full bg-current opacity-75" />
      )}
      {children}
    </span>
  );
};
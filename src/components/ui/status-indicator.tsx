import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'pending';
  children: React.ReactNode;
  icon?: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'minimal';
}

export const StatusIndicator = ({ 
  status, 
  children, 
  icon: Icon, 
  size = 'md',
  variant = 'solid'
}: StatusIndicatorProps) => {
  const baseClasses = "status-indicator";
  
  const statusClasses = {
    success: "status-success",
    warning: "status-warning", 
    error: "status-error",
    info: "status-info",
    pending: "status-info"
  };

  const sizeClasses = {
    sm: "text-xs py-1 px-2",
    md: "text-sm py-1.5 px-3",
    lg: "text-base py-2 px-4"
  };

  const variantClasses = {
    solid: "",
    outline: "bg-transparent",
    minimal: "border-0 bg-transparent"
  };

  return (
    <span className={cn(
      baseClasses,
      statusClasses[status],
      sizeClasses[size],
      variantClasses[variant]
    )}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </span>
  );
};
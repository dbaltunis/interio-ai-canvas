import React from 'react';
import { cn } from '@/lib/utils';

interface ModernProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export const ModernProgress = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  className
}: ModernProgressProps) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  const variantClasses = {
    default: '[&>.modern-progress-fill]:bg-primary',
    success: '[&>.modern-progress-fill]:bg-green-500',
    warning: '[&>.modern-progress-fill]:bg-yellow-500',
    error: '[&>.modern-progress-fill]:bg-red-500'
  };

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{label}</span>
          <span>{value}{max === 100 ? '%' : `/${max}`}</span>
        </div>
      )}
      <div className={cn(
        'modern-progress w-full',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}>
        <div 
          className="modern-progress-fill h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
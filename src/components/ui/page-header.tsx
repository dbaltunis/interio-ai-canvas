import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, ArrowLeft } from 'lucide-react';
import { Button } from './button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: LucideIcon;
  badge?: {
    text: string;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  };
  backButton?: {
    onClick: () => void;
    label?: string;
  };
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader = ({
  title,
  subtitle,
  description,
  icon: Icon,
  badge,
  backButton,
  actions,
  className
}: PageHeaderProps) => {
  const badgeVariants = {
    default: 'bg-muted text-muted-foreground',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700'
  };

  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4', className)}>
      <div className="flex items-center gap-3">
        {/* Back Button */}
        {backButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={backButton.onClick}
            className="shrink-0 h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Icon */}
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <Icon className="h-5 w-5" />
          </div>
        )}

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-foreground">
              {title}
            </h1>
            {badge && (
              <span className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                badgeVariants[badge.variant || 'default']
              )}>
                {badge.text}
              </span>
            )}
          </div>
          
          {subtitle && (
            <div className="text-sm text-muted-foreground">
              {subtitle}
            </div>
          )}
          
          {description && (
            <p className="text-xs text-muted-foreground max-w-2xl mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
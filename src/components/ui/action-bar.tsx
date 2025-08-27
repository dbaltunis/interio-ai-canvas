import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { LucideIcon } from 'lucide-react';

interface ActionBarAction {
  id: string;
  label: string;
  icon?: LucideIcon;
  variant?: 'default' | 'outline' | 'ghost' | 'brand' | 'brand-outline' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'default' | 'lg';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

interface ActionBarProps {
  actions: ActionBarAction[];
  className?: string;
  variant?: 'default' | 'compact' | 'spaced';
}

export const ActionBar = ({ 
  actions, 
  className,
  variant = 'default'
}: ActionBarProps) => {
  const variantClasses = {
    default: 'gap-3',
    compact: 'gap-2',
    spaced: 'gap-4'
  };

  return (
    <div className={cn(
      'flex items-center justify-end',
      variantClasses[variant],
      className
    )}>
      {actions.map((action) => {
        const Icon = action.icon;
        
        return (
          <Button
            key={action.id}
            variant={action.variant || 'default'}
            size={action.size || 'default'}
            onClick={action.onClick}
            disabled={action.disabled || action.loading}
            className={cn(action.loading && 'cursor-wait')}
          >
            {action.loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
            ) : Icon ? (
              <Icon className="h-4 w-4 mr-2" />
            ) : null}
            {action.label}
          </Button>
        );
      })}
    </div>
  );
};
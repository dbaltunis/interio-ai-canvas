import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface NavTab {
  id: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
  disabled?: boolean;
}

interface NavTabsProps {
  tabs: NavTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline' | 'cards';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const NavTabs = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  variant = 'default',
  size = 'md',
  className 
}: NavTabsProps) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

const variantClasses = {
    default: {
      container: 'border-b border-border',
      tab: 'relative transition-all duration-200 border-b-2 border-transparent hover:border-primary/50',
      activeTab: 'border-primary text-primary font-medium',
      inactiveTab: 'text-muted-foreground hover:text-foreground'
    },
    pills: {
      container: 'bg-muted/50 rounded-lg p-1',
      tab: 'rounded-md transition-all duration-200 hover:bg-background/50',
      activeTab: 'bg-background text-foreground font-medium',
      inactiveTab: 'text-muted-foreground hover:text-foreground'
    },
    underline: {
      container: '',
      tab: 'relative transition-all duration-200 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:scale-x-0 after:transition-transform after:duration-200 hover:after:scale-x-100',
      activeTab: 'text-primary font-medium after:scale-x-100',
      inactiveTab: 'text-muted-foreground hover:text-foreground'
    },
    cards: {
      container: 'flex gap-2',
      tab: 'rounded-lg border border-border transition-all duration-200 hover:border-primary/30',
      activeTab: 'bg-primary text-primary-foreground border-primary',
      inactiveTab: 'bg-background text-muted-foreground hover:text-foreground hover:bg-accent/50'
    }
  };

  const classes = variantClasses[variant];

  return (
    <div className={cn('flex items-center', classes.container, className)}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            disabled={tab.disabled}
            className={cn(
              'inline-flex items-center gap-2 font-medium transition-all duration-200 hover-lift interactive-bounce disabled:opacity-50 disabled:cursor-not-allowed',
              classes.tab,
              sizeClasses[size],
              isActive ? classes.activeTab : classes.inactiveTab
            )}
          >
            {Icon && (
              <Icon className={cn(
                'transition-all duration-200',
                size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5',
                isActive && 'scale-110'
              )} />
            )}
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className={cn(
                'rounded-full text-xs font-semibold min-w-[1.25rem] h-5 flex items-center justify-center',
                isActive 
                  ? 'bg-primary-foreground/20 text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              )}>
                {tab.count > 99 ? '99+' : tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
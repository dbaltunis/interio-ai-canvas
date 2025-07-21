import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
}

interface ThreeDotMenuProps {
  items: MenuItem[];
  className?: string;
  triggerClassName?: string;
}

export const ThreeDotMenu: React.FC<ThreeDotMenuProps> = ({
  items,
  className = '',
  triggerClassName = ''
}) => {
  const getItemClassName = (variant: MenuItem['variant'] = 'default') => {
    const baseClasses = 'flex items-center gap-2 cursor-pointer transition-colors';
    const variants = {
      default: 'text-foreground hover:bg-accent hover:text-accent-foreground',
      destructive: 'text-destructive hover:bg-destructive/10',
      success: 'text-green-600 hover:bg-green-50',
      warning: 'text-orange-600 hover:bg-orange-50',
      info: 'text-blue-600 hover:bg-blue-50',
    };
    return `${baseClasses} ${variants[variant]}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 hover:bg-muted ${triggerClassName}`}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={`min-w-[8rem] ${className}`}
      >
        {items.map((item, index) => (
          <DropdownMenuItem
            key={index}
            onClick={item.onClick}
            className={getItemClassName(item.variant)}
          >
            {item.icon && <span className="w-4 h-4">{item.icon}</span>}
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ResponsiveGridProps {
  children: ReactNode;
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

export const ResponsiveGrid = ({ 
  children, 
  columns = { default: 1, md: 2, lg: 3 },
  gap = 4,
  className 
}: ResponsiveGridProps) => {
  const gridClasses = [
    'grid',
    `gap-${gap}`,
    columns.default && `grid-cols-${columns.default}`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
  ].filter(Boolean).join(' ');

  return (
    <div className={cn(gridClasses, className)}>
      {children}
    </div>
  );
};

export const ResponsiveStack = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('flex flex-col space-y-4 md:space-y-6', className)}>
    {children}
  </div>
);

export const ResponsiveContainer = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('container mx-auto px-4 sm:px-6 lg:px-8', className)}>
    {children}
  </div>
);

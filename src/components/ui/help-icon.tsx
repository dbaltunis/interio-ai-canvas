import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HelpIconProps {
  onClick: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const HelpIcon = ({ onClick, className, size = 'md' }: HelpIconProps) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      className={cn(
        "text-secondary hover:text-primary transition-colors p-1",
        className
      )}
      title="Get help"
    >
      <HelpCircle className={sizeClasses[size]} />
    </Button>
  );
};
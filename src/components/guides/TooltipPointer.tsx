import { cn } from '@/lib/utils';

interface TooltipPointerProps {
  label: string;
  description?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'left' | 'right';
  highlight?: boolean;
  className?: string;
  number?: number;
}

export const TooltipPointer = ({ 
  label, 
  description,
  position, 
  highlight = false,
  className,
  number
}: TooltipPointerProps) => {
  const positionClasses = {
    'top-left': 'bottom-full left-0 mb-2',
    'top-right': 'bottom-full right-0 mb-2',
    'bottom-left': 'top-full left-0 mt-2',
    'bottom-right': 'top-full right-0 mt-2',
    'left': 'right-full top-1/2 -translate-y-1/2 mr-2',
    'right': 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    'top-left': 'top-full left-4 border-t-primary',
    'top-right': 'top-full right-4 border-t-primary',
    'bottom-left': 'bottom-full left-4 border-b-primary',
    'bottom-right': 'bottom-full right-4 border-b-primary',
    'left': 'left-full top-1/2 -translate-y-1/2 border-l-primary',
    'right': 'right-full top-1/2 -translate-y-1/2 border-r-primary',
  };

  return (
    <div className={cn(
      "absolute z-10",
      positionClasses[position],
      className
    )}>
      <div className={cn(
        "relative px-3 py-2 rounded-lg shadow-lg",
        "bg-primary text-primary-foreground",
        "animate-pulse-subtle",
        highlight && "ring-2 ring-primary/50 ring-offset-2 ring-offset-background"
      )}>
        {/* Number badge */}
        {number && (
          <span className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
            {number}
          </span>
        )}
        
        <p className="text-sm font-medium whitespace-nowrap">{label}</p>
        {description && (
          <p className="text-xs opacity-90 mt-0.5 max-w-[200px]">{description}</p>
        )}
        
        {/* Arrow */}
        <div className={cn(
          "absolute w-0 h-0",
          "border-4 border-transparent",
          arrowClasses[position]
        )} />
      </div>
    </div>
  );
};

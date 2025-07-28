import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  variant?: 'spinner' | 'dots' | 'bars';
}

export const LoadingState = ({ 
  size = 'md', 
  text, 
  className,
  variant = 'spinner'
}: LoadingStateProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const containerClasses = {
    sm: 'gap-2 text-sm',
    md: 'gap-3 text-base',
    lg: 'gap-4 text-lg'
  };

  const SpinnerComponent = () => (
    <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
  );

  const DotsComponent = () => (
    <div className="flex space-x-1">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "bg-primary rounded-full animate-bounce",
            size === 'sm' ? 'h-1.5 w-1.5' : 
            size === 'md' ? 'h-2 w-2' : 'h-3 w-3'
          )}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );

  const BarsComponent = () => (
    <div className="flex space-x-1">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "bg-primary animate-[pulse_1.5s_ease-in-out_infinite]",
            size === 'sm' ? 'h-4 w-1' : 
            size === 'md' ? 'h-6 w-1.5' : 'h-8 w-2'
          )}
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );

  const renderVariant = () => {
    switch (variant) {
      case 'dots':
        return <DotsComponent />;
      case 'bars':
        return <BarsComponent />;
      default:
        return <SpinnerComponent />;
    }
  };

  return (
    <div className={cn(
      "flex items-center justify-center text-muted-foreground",
      containerClasses[size],
      className
    )}>
      {renderVariant()}
      {text && <span>{text}</span>}
    </div>
  );
};
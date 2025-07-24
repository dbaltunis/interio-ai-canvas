
import { cn } from '@/lib/utils';

interface UserPresenceIndicatorProps {
  isOnline: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UserPresenceIndicator = ({ 
  isOnline, 
  size = 'md', 
  className 
}: UserPresenceIndicatorProps) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div 
      className={cn(
        'rounded-full border-2 border-white',
        sizeClasses[size],
        isOnline ? 'bg-green-500' : 'bg-gray-400',
        className
      )}
      title={isOnline ? 'Online' : 'Offline'}
    />
  );
};

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';

interface AvatarStackProps {
  users: Array<{
    id: string;
    name: string;
    avatar?: string;
    status?: 'online' | 'offline' | 'away' | 'busy';
  }>;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  className?: string;
}

export const AvatarStack = ({ 
  users, 
  max = 4, 
  size = 'md', 
  showStatus = true,
  className 
}: AvatarStackProps) => {
  const visibleUsers = users.slice(0, max);
  const remainingCount = Math.max(0, users.length - max);
  
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-10 w-10'
  };
  
  const statusClasses = {
    online: 'bg-green-500 border-green-500',
    offline: 'bg-gray-400 border-gray-400',
    away: 'bg-yellow-500 border-yellow-500',
    busy: 'bg-red-500 border-red-500'
  };

  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex -space-x-2">
        {visibleUsers.map((user, index) => (
          <div key={user.id} className="relative">
            <Avatar 
              className={cn(
                sizeClasses[size],
                "border-2 border-background transition-transform hover:scale-110 hover:z-10"
              )}
              style={{ zIndex: visibleUsers.length - index }}
            >
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-xs font-medium">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {showStatus && user.status && (
              <div 
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-background",
                  size === 'sm' ? "h-2 w-2" : size === 'md' ? "h-2.5 w-2.5" : "h-3 w-3",
                  statusClasses[user.status]
                )}
              />
            )}
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div className="relative">
            <Avatar className={cn(sizeClasses[size], "border-2 border-background bg-muted")}>
              <AvatarFallback className="text-xs font-medium text-muted-foreground">
                +{remainingCount}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </div>
  );
};
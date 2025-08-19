import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { Users, MessageCircle, Circle } from 'lucide-react';

export const ActiveUsersDropdown = () => {
  const { activeUsers = [], isLoading } = useUserPresence();
  const { openConversation, totalUnreadCount = 0 } = useDirectMessages();

  const onlineUsers = activeUsers.filter(u => u.status === 'online');
  const awayUsers = activeUsers.filter(u => u.status === 'away' || u.status === 'busy');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'away': return 'text-yellow-500';
      case 'busy': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Users className="h-5 w-5" />
          {totalUnreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Team Members ({activeUsers.length})</span>
          <div className="flex items-center gap-1">
            <Circle className="h-2 w-2 fill-green-500 text-green-500" />
            <span className="text-xs text-muted-foreground">{onlineUsers.length} online</span>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />

        {/* Online Users */}
        {onlineUsers.length > 0 && (
          <>
            <div className="px-2 py-1">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Online ({onlineUsers.length})
              </p>
              {onlineUsers.slice(0, 5).map((user) => (
                <DropdownMenuItem
                  key={user.user_id}
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => openConversation(user.user_id)}
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_profile?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {user.user_profile?.display_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Circle className={`absolute -bottom-1 -right-1 h-3 w-3 fill-current ${getStatusColor(user.status)}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {user.user_profile?.display_name}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {user.user_profile?.role}
                      </Badge>
                    </div>
                    {user.current_activity && (
                      <p className="text-xs text-muted-foreground truncate">
                        {user.current_activity}
                      </p>
                    )}
                  </div>

                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </DropdownMenuItem>
              ))}
              
              {onlineUsers.length > 5 && (
                <p className="text-xs text-muted-foreground text-center py-1">
                  +{onlineUsers.length - 5} more online
                </p>
              )}
            </div>
          </>
        )}

        {/* Away/Busy Users */}
        {awayUsers.length > 0 && onlineUsers.length > 0 && <DropdownMenuSeparator />}
        
        {awayUsers.length > 0 && (
          <div className="px-2 py-1">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Away/Busy ({awayUsers.length})
            </p>
            {awayUsers.slice(0, 3).map((user) => (
              <DropdownMenuItem
                key={user.user_id}
                className="flex items-center gap-3 cursor-pointer opacity-75"
                onClick={() => openConversation(user.user_id)}
              >
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_profile?.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {user.user_profile?.display_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Circle className={`absolute -bottom-1 -right-1 h-3 w-3 fill-current ${getStatusColor(user.status)}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {user.user_profile?.display_name}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {user.status}
                    </Badge>
                  </div>
                </div>

                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuItem>
            ))}
          </div>
        )}

        {activeUsers.length === 0 && !isLoading && (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            No team members online
          </div>
        )}

        {isLoading && (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            Loading team members...
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};